"use client";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import * as io from "socket.io-client";
import Peer from "simple-peer";

const Video = (props: any) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        props.peer.on("stream", (stream: any) => {
            try {
                if (ref.current) {
                    ref.current.srcObject = stream;
                }
            } catch (error) {
                console.log("Error setting video stream:", error);
            }
        });
    }, []);

    return <video playsInline autoPlay ref={ref} />;
};

interface RoomProps {
    roomID: string;
}

const Room = ({ roomID }: RoomProps) => {
    const [peers, setPeers] = useState<Peer.Instance[]>([]);
    const socketRef = useRef<io.Socket | null>(null);
    const userVideo = useRef<HTMLVideoElement | null>(null);
    const [videoConstraints, setVideoConstraints] = useState({
        height: 0,
        width: 0,
    });
    const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);

    useEffect(() => {
        socketRef.current = io.connect("/");
        console.log(`ROOMID: ${roomID}`);

        setVideoConstraints({
            height: window.innerHeight / 2,
            width: window.innerWidth / 2,
        });

        navigator.mediaDevices
            .getUserMedia({
                video: videoConstraints,
                audio: true,
            })
            .then((stream) => {
                try {
                    if (userVideo.current) {
                        userVideo.current.srcObject = stream;
                    }
                } catch (error) {
                    console.log("Error setting user video stream:", error);
                }

                try {
                    if (socketRef.current) {
                        socketRef.current.emit("joinRoom", roomID); // Pass roomID to the server
                        socketRef.current.on("allUsers", (users: string[]) => {
                            const peers: Peer.Instance[] = [];
                            users.forEach((userID) => {
                                const peer = createPeer(
                                    userID,
                                    socketRef.current!.id!,
                                    stream
                                );
                                peersRef.current.push({
                                    peerID: userID,
                                    peer,
                                });
                                peers.push(peer);
                            });
                            setPeers(peers);
                        });
                    }
                } catch (error) {
                    console.log("Error handling socket connection:", error);
                }

                try {
                    if (socketRef.current) {
                        socketRef.current.on("userJoined", (payload) => {
                            const peer = addPeer(
                                payload.signal,
                                payload.callerID,
                                stream
                            );
                            peersRef.current.push({
                                peerID: payload.callerID,
                                peer,
                            });

                            setPeers((users) => [...users, peer]);
                        });

                        socketRef.current.on(
                            "receivingReturnedSignal",
                            (payload) => {
                                const item = peersRef.current.find(
                                    (p) => p.peerID === payload.id
                                );
                                try {
                                    item?.peer.signal(payload.signal);
                                } catch (error) {
                                    console.log("Error signaling peer:", error);
                                }
                            }
                        );
                    }
                } catch (error) {
                    console.log("Error handling socket events:", error);
                }
            });
    }, [roomID]);

    function createPeer(
        userToSignal: string,
        callerID: string,
        stream: MediaStream
    ) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (signal) => {
            try {
                if (socketRef.current)
                    socketRef.current.emit("sendingSignal", {
                        userToSignal,
                        callerID,
                        signal,
                    });
            } catch (error) {
                console.log("Error sending signal:", error);
            }
        });

        return peer;
    }

    function addPeer(
        incomingSignal: any,
        callerID: string,
        stream: MediaStream
    ) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (signal) => {
            try {
                if (socketRef.current) {
                    socketRef.current.emit("returningSignal", {
                        signal,
                        callerID,
                    });
                }
            } catch (error) {
                console.log("Error returning signal:", error);
            }
        });

        try {
            peer.signal(incomingSignal);
        } catch (error) {
            console.log("Error signaling peer:", error);
        }

        return peer;
    }

    return (
        <div>
            <video muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return <Video key={index} peer={peer} />;
            })}
        </div>
    );
};

export default Room;
