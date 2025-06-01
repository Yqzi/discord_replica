"use client";
import { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../KEYS";
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

export default function Home() {
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
        return () => unsub();
    }, [roomId, clientId, pcs]);

    // 1. Join a room
    async function joinRoom() {
        if (!roomId) return;
        const myId = crypto.randomUUID();
        setClientId(myId);

        // Add self to room
        await setDoc(doc(firestore, "rooms", roomId, "clients", myId), {
            joined: Date.now(),
        });

        // Listen for other clients

        setHasJoined(true);
    }

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
        await deleteDoc(doc(firestore, "rooms", roomId, "clients", clientId));
        Object.values(pcs).forEach((pc) => pc.close());
        setPcs({});
        setRemoteStreams({});
        setHasJoined(false);
    }

    // UI
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
                    onClick={joinRoom}
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
                    <h3>Local Stream</h3>
                    <video
                        ref={userVideo}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: 200, margin: 8 }}
                    />
                </span>
                <span>
                    <h3>Remote Streams</h3>
                    {Object.entries(remoteStreams).map(([id, stream]) =>
                        stream ? (
                            <video
                                key={id}
                                autoPlay
                                playsInline
                                ref={(el) => {
                                    if (el && stream) el.srcObject = stream;
                                }}
                                style={{ width: 200, margin: 8 }}
                            />
                        ) : null
                    )}
                </span>
            </div>
        </>
    );
}
