"use client";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import * as io from "socket.io-client";
import { TextField, Button, IconButton } from "@mui/material";
import { Phone, Assignment } from "@mui/icons-material";

const socket = io.connect("http://localhost:5000");

export default function Home() {
    const [me, setMe] = useState<string>("");
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const [recievingCall, SetRecievingCall] = useState<boolean>(false);
    const [caller, setCaller] = useState<string>("");
    const [callerSignal, setCallerSignal] = useState<any>(undefined);
    const [callAccepted, setCallAccepted] = useState<boolean>(false);
    const [idToCall, setIdToCall] = useState<string>("");
    const [callEnded, setCallEnded] = useState<boolean>(false);
    const [name, setName] = useState<string>("");

    const myVideo = useRef<HTMLVideoElement | null>(null);
    const userVideo = useRef<HTMLVideoElement | null>(null);
    const connectionRef = useRef<any>(null);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true,
            })
            .then((stream) => {
                setStream(stream);
                if (myVideo.current) {
                    myVideo.current.srcObject = stream; // Ensure myVideo.current is not null
                }
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
            });

        if (!me) {
            console.log("No ID found, requesting a new one...");
            getId();
        }

        socket.on("callUser", (data) => {
            SetRecievingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });

        return () => {
            socket.off("me");
            socket.off("callUser");
        };
    }, [me]);

    const getId = () => {
        socket.emit("getId"); // Request a new ID from the server
        socket.on("me", (id) => {
            console.log("Received new ID:", id);
            setMe(id);
        });
    };

    const callUser = (id: string) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: me,
                name: name,
            });
        });

        peer.on("stream", (stream) => {
            // could have null error
            userVideo.current!.srcObject = stream;
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", {
                signal: data,
                to: caller,
            });
        });

        peer.on("stream", (stream) => {
            // can have null error
            userVideo.current!.srcObject = stream;
        });

        peer.signal(callerSignal);

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();
    };

    return (
        <>
            <h1 className="text-center text-white text-4xl font-bold mb-8">
                CALLER TEST
            </h1>
            <div className="flex flex-col items-center">
                <div className="flex flex-row justify-center space-x-4 mb-8">
                    <div className="w-72 h-72 bg-black flex items-center justify-center">
                        {stream && (
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="w-72 h-72 bg-black flex items-center justify-center">
                        {callAccepted && !callEnded ? (
                            <video
                                playsInline
                                ref={userVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <TextField
                        id="filled-basic"
                        label="Name"
                        variant="filled"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-72"
                    />
                    {!me && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={getId}
                            className="w-72"
                        >
                            Get ID
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Assignment fontSize="large" />}
                        onClick={() => {
                            console.log(`meemememememememememe ${me}`);
                            if (navigator.clipboard) {
                                navigator.clipboard
                                    .writeText(me)
                                    .then(() => {})
                                    .catch((err) => {
                                        console.error("Failed to copy:", err);
                                    });
                            } else {
                                // Fallback for unsupported browsers
                                const textArea =
                                    document.createElement("textarea");
                                textArea.value = me;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(textArea);
                                alert("Copied ID to clipboard: " + me);
                            }
                        }}
                        className="w-72"
                    >
                        Copy ID
                    </Button>
                    <TextField
                        id="filled-basic"
                        label="ID to call"
                        variant="filled"
                        value={idToCall}
                        onChange={(e) => setIdToCall(e.target.value)}
                        className="w-72"
                    />
                    <div className="flex flex-row items-center space-x-4">
                        {callAccepted && !callEnded ? (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={leaveCall}
                                className="w-36"
                            >
                                End Call
                            </Button>
                        ) : (
                            <IconButton
                                color="primary"
                                aria-label="call"
                                onClick={() => callUser(idToCall)}
                                className="w-12 h-12"
                            >
                                <Phone fontSize="large" />
                            </IconButton>
                        )}
                    </div>
                </div>
                <div className="mt-8">
                    {recievingCall && !callAccepted ? (
                        <div className="flex flex-col items-center space-y-4">
                            <h1 className="text-xl font-bold">
                                {name} is calling...
                            </h1>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={answerCall}
                                className="w-36"
                            >
                                Answer
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}
