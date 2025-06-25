"use client";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { initializeApp } from "firebase/app";
import { getDocs, getFirestore } from "firebase/firestore";
import firebaseConfig from "../../../KEYS";
import {
    collection,
    doc,
    setDoc,
    addDoc,
    onSnapshot,
    getDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../auth_provider";

function getChunkSize(length: number) {
    // Try to fit all items in 3 rows, but never exceed 5 per row
    return Math.min(5, Math.ceil(length / 3));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

const VoiceChannel = forwardRef<{ joinRoom: () => void }, {}>((props, ref) => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    const [roomId, setRoomId] = useState("");
    const [clientId, setClientId] = useState("");
    const [pcs, setPcs] = useState<{ [id: string]: RTCPeerConnection }>({});
    const [remoteStreams, setRemoteStreams] = useState<{
        [id: string]: MediaStream;
    }>({});
    const [hasJoined, setHasJoined] = useState(false);

    const userVideo = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const candidateQueues = useRef<{ [id: string]: RTCIceCandidateInit[] }>({});

    const unsubRef = useRef<(() => void) | null>(null);

    const user = useAuth();

    useEffect(() => {
        if (!roomId || !clientId) return;
        const unsub = onSnapshot(
            collection(firestore, "rooms", roomId, "clients"),
            (snapshot) => {
                snapshot.docs.forEach(async (docSnap) => {
                    const otherId = docSnap.id;
                    if (otherId === clientId) return;
                    if (!pcs[otherId]) {
                        await setupConnection(otherId, clientId);
                    }
                });
            }
        );
        unsubRef.current = unsub;
        return () => unsub();
    }, [roomId, clientId, pcs]);

    // 1. Join a room
    async function joinRoom() {
        if (!roomId) {
            console.log("CREATING ROOM");
            setRoomId("1212");
        }

        const myId = user.user?.uid ?? "";
        setClientId(myId);

        // Add self to room
        await setDoc(doc(firestore, "rooms", roomId, "clients", myId), {
            joined: Date.now(),
        });

        // Listen for other clients

        setHasJoined(true);
    }

    async function joinRoomd() {
        if (!roomId) return;
        const myId = user.user!.uid;
        setClientId(myId);

        // Add self to room
        await setDoc(doc(firestore, "rooms", roomId, "clients", myId), {
            joined: Date.now(),
        });

        console.log("JOINED");
        console.log(roomId);
        console.log(clientId);
        console.log("JOINED");

        // Listen for other clients

        setHasJoined(true);
    }

    useImperativeHandle(ref, () => ({
        joinRoom,
    }));

    // 2. Setup peer connection and signaling for each other client
    async function setupConnection(otherId: string, myId: string) {
        const servers = {
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                    ],
                },
            ],
            iceCandidatePoolSize: 10,
        };
        const pc = new RTCPeerConnection(servers);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle remote tracks
        pc.ontrack = (event) => {
            const newRemoteStream = new window.MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                newRemoteStream.addTrack(track);
            });
            setRemoteStreams((prev) => ({
                ...prev,
                [otherId]: newRemoteStream,
            }));
        };

        // ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                addDoc(
                    collection(
                        firestore,
                        "rooms",
                        roomId,
                        "signals",
                        `${myId}_to_${otherId}`,
                        "candidates"
                    ),
                    event.candidate.toJSON()
                );
            }
        };

        // In setupConnection, after creating pc:
        candidateQueues.current[otherId] = [];

        // Replace your onSnapshot for ICE candidates with:
        onSnapshot(
            collection(
                firestore,
                "rooms",
                roomId,
                "signals",
                `${otherId}_to_${myId}`,
                "candidates"
            ),
            (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const data = change.doc.data();
                        const candidate = new RTCIceCandidate(data);
                        if (pc.remoteDescription && pc.remoteDescription.type) {
                            pc.addIceCandidate(candidate);
                        } else {
                            // Buffer until remote description is set
                            candidateQueues.current[otherId].push(candidate);
                        }
                    }
                });
            }
        );

        // After every setRemoteDescription (both offer and answer), flush the queue:
        async function flushCandidateQueue(
            pc: RTCPeerConnection,
            otherId: string
        ) {
            const queue = candidateQueues.current[otherId] || [];
            for (const candidate of queue) {
                await pc.addIceCandidate(candidate);
            }
            candidateQueues.current[otherId] = [];
        }

        // After every await pc.setRemoteDescription(...), call:
        await flushCandidateQueue(pc, otherId);

        // Offer/Answer logic
        // Only the client with the "greater" id creates the offer (to avoid double-offer)
        if (myId > otherId) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await setDoc(
                doc(
                    firestore,
                    "rooms",
                    roomId,
                    "signals",
                    `${myId}_to_${otherId}`
                ),
                {
                    offer: {
                        type: offer.type,
                        sdp: offer.sdp,
                    },
                }
            );

            // Listen for answer
            onSnapshot(
                doc(
                    firestore,
                    "rooms",
                    roomId,
                    "signals",
                    `${otherId}_to_${myId}`
                ),
                (docSnap) => {
                    const data = docSnap.data();
                    if (data?.answer && !pc.currentRemoteDescription) {
                        pc.setRemoteDescription(
                            new RTCSessionDescription(data.answer)
                        );
                    }
                }
            );
        } else {
            // Listen for offer, then answer
            onSnapshot(
                doc(
                    firestore,
                    "rooms",
                    roomId,
                    "signals",
                    `${otherId}_to_${myId}`
                ),
                async (docSnap) => {
                    const data = docSnap.data();
                    if (data?.offer && !pc.currentRemoteDescription) {
                        await pc.setRemoteDescription(
                            new RTCSessionDescription(data.offer)
                        );
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        await setDoc(
                            doc(
                                firestore,
                                "rooms",
                                roomId,
                                "signals",
                                `${myId}_to_${otherId}`
                            ),
                            {
                                answer: {
                                    type: answer.type,
                                    sdp: answer.sdp,
                                },
                            }
                        );
                    }
                }
            );
        }

        setPcs((prev) => ({ ...prev, [otherId]: pc }));
    }

    // 3. Start webcam and store local stream
    async function webcamButtonOnClick() {
        const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        localStreamRef.current = localStream;
        if (userVideo.current) {
            userVideo.current.srcObject = localStream;
        }
    }

    // 4. Cleanup on leave (optional)
    async function leaveRoom() {
        if (!roomId || !clientId) return;
        if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
        }
        console.log("LEFT");
        console.log(roomId);
        console.log(clientId);
        console.log("LEFT");
        await deleteDoc(doc(firestore, "rooms", roomId, "clients", clientId));

        // Clean up all signals involving this client
        const signalsCol = collection(firestore, "rooms", roomId, "signals");
        const signalsSnap = await getDocs(signalsCol);
        for (const signalDoc of signalsSnap.docs) {
            if (signalDoc.id.includes(clientId)) {
                // Delete all candidates in this signal
                const candidatesCol = collection(
                    signalsCol,
                    signalDoc.id,
                    "candidates"
                );
                const candidatesSnap = await getDocs(candidatesCol);
                for (const candDoc of candidatesSnap.docs) {
                    await deleteDoc(candDoc.ref);
                }
                // Delete the signal doc itself
                await deleteDoc(signalDoc.ref);
            }
        }

        Object.values(pcs).forEach((pc) => pc.close());
        setPcs({});
        setRemoteStreams({});
        setHasJoined(false);
    }

    const videoItems = [
        {
            key: "local",
            element: (
                <video
                    ref={userVideo}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded"
                />
            ),
        },
        ...Object.entries(remoteStreams).map(([id, stream]) => ({
            key: id,
            element: (
                <video
                    key={id}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded"
                    ref={(el) => {
                        if (el && stream) el.srcObject = stream;
                    }}
                />
            ),
        })),
    ];

    const chunkSize = getChunkSize(videoItems.length);
    const chunked = chunkArray(videoItems, chunkSize);

    return (
        <>
            <h2>Room-based Group Call (2 or 3 people)</h2>
            <div>
                <input
                    type="text"
                    placeholder="Room name"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    style={{ padding: "10px", margin: "10px 0" }}
                    disabled={hasJoined}
                />
                <button
                    onClick={joinRoomd}
                    disabled={hasJoined || !roomId}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    Join Room
                </button>
                <button
                    onClick={leaveRoom}
                    disabled={!hasJoined}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 ml-2"
                >
                    Leave Room
                </button>
                <button
                    onClick={() => setRoomId("1212")}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-red-600 ml-2"
                >
                    ROM
                </button>
            </div>
            <button
                id="webcamButton"
                onClick={webcamButtonOnClick}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                Start webcam
            </button>
            <div className="videos">
                <span>
                    <video ref={userVideo} autoPlay playsInline muted />
                </span>
                <span>
                    {Object.entries(remoteStreams).map(([id, stream]) =>
                        stream ? (
                            <video
                                key={id}
                                autoPlay
                                playsInline
                                ref={(el) => {
                                    if (el && stream) el.srcObject = stream;
                                }}
                            />
                        ) : null
                    )}
                </span>
            </div>
        </>
    );
});

export default VoiceChannel;
