"use client";
import { useEffect, useRef, useState } from "react";
// import Peer from "simple-peer";
// import * as io from "socket.io-client";
// import { TextField, Button, IconButton } from "@mui/material";
// import { Phone, Assignment } from "@mui/icons-material";
// import User from "./user";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../KEYS";
import {
    collection,
    doc,
    addDoc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
} from "firebase/firestore";

export default function Home() {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    // Global State
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    let localStream: MediaStream;
    let remoteStream: MediaStream;

    let userVideo = useRef<HTMLVideoElement>(null);
    let remoteVideo = useRef<HTMLVideoElement>(null);

    const [hasTheWebcamButtonBeenClicked, setHasTheWebcamButtonBeenClicked] =
        useState<boolean>(false);

    const [hasTheCallButtonBeenClicked, setHasTheCallButtonBeenClicked] =
        useState<boolean>(false);

    callButtonOnClick;

    const callInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Initialize RTCPeerConnection only in the browser
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
            setPc(new RTCPeerConnection(servers));
        }
    }, []);

    // 1. Setup media sources

    async function webcamButtonOnClick() {
        if (!pc) return;
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        remoteStream = new MediaStream();

        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        // Pull tracks from remote stream, add to video stream
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };
        if (userVideo.current && remoteVideo.current) {
            userVideo.current!.srcObject = localStream;
            remoteVideo.current!.srcObject = remoteStream;
        }

        setHasTheWebcamButtonBeenClicked(true);
    }

    // 2. Create an offer
    async function callButtonOnClick() {
        if (!pc) return;
        // Reference Firestore collections for signaling
        const callDoc = doc(collection(firestore, "calls"));
        const offerCandidates = collection(callDoc, "offerCandidates");
        const answerCandidates = collection(callDoc, "answerCandidates");

        if (callInputRef.current) {
            callInputRef.current!.value = callDoc.id;
        }

        // Get candidates for caller, save to db
        pc.onicecandidate = (event) => {
            event.candidate &&
                addDoc(offerCandidates, event.candidate.toJSON());
        };
        if (callInputRef.current) {
            callInputRef.current.value = callDoc.id;
        }
        // Create offer
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await setDoc(callDoc, { offer });

        // Listen for remote answer

        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(
                    data.answer
                );
                pc.setRemoteDescription(answerDescription);
            }
        });

        // When answered, add candidate to peer connection
        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });

        setHasTheCallButtonBeenClicked(true);
    }

    // 3. Answer the call with the unique ID
    async function answerButtonOnClick() {
        if (!pc) return;
        let callId = null;
        if (callInputRef.current) {
            callId = callInputRef.current!.value;
        }
        if (!callId) {
            throw new Error("callId is null or undefined");
        }
        const callDoc = doc(collection(firestore, "calls"), callId);
        const answerCandidates = collection(callDoc, "answerCandidates");
        const offerCandidates = collection(callDoc, "offerCandidates");

        pc.onicecandidate = (event) => {
            event.candidate &&
                addDoc(answerCandidates, event.candidate.toJSON());
        };

        const callData = (await getDoc(callDoc)).data();

        if (!callData) {
            throw new Error("Call data is undefined");
        }
        const offerDescription = callData.offer;
        await pc.setRemoteDescription(
            new RTCSessionDescription(offerDescription)
        );

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await updateDoc(callDoc, { answer });

        onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                console.log(change);
                if (change.type === "added") {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    }

    return (
        <>
            <h2>1. Start your Webcam</h2>
            <div className="videos">
                <span>
                    <h3>Local Stream</h3>
                    <video
                        id="webcamVideo"
                        ref={userVideo}
                        autoPlay
                        playsInline
                    ></video>
                </span>
                <span>
                    <h3>Remote Stream</h3>
                    <video
                        id="remoteVideo"
                        ref={remoteVideo}
                        autoPlay
                        playsInline
                    ></video>
                </span>
            </div>

            <button
                id="webcamButton"
                onClick={webcamButtonOnClick}
                disabled={hasTheWebcamButtonBeenClicked}
            >
                Start webcam
            </button>
            <h2>2. Create a new Call</h2>
            <button
                id="callButton"
                disabled={!hasTheWebcamButtonBeenClicked}
                onClick={callButtonOnClick}
            >
                Create Call (offer)
            </button>

            <h2>3. Join a Call</h2>
            <p>Answer the call from a different browser window or device</p>

            <input id="callInput" ref={callInputRef} />
            <button
                id="answerButton"
                disabled={!hasTheWebcamButtonBeenClicked}
                onClick={answerButtonOnClick}
            >
                Answer
            </button>

            <h2>4. Hangup</h2>

            <button id="hangupButton" disabled={!hasTheCallButtonBeenClicked}>
                Hangup
            </button>
        </>
    );
}
