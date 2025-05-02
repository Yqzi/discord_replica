import { useEffect, useRef, useState } from "react";
import * as io from "socket.io-client";
import Peer from "simple-peer";

const Video = (props: any) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        props.peer.on("stream", (stream: any) => {
            ref.current.srcObject = stream;
        });
    }, []);

    return <video playsInline autoPlay ref={ref} />;
};

const videoContstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2,
};

const Room = (props: any) => {
    const [peers, setPeers] = useState<[]>([]);
    const socketRef = useRef<any>(null);
    const userVideo = useRef<any>(null);
    const peersRef = useRef<any>(null);
    const roomID = props.match.params.roomID;

    useEffect(() => {
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({
            video: videoContstraints,
            audio: true,
        });
    }, []);

    function createPeer(userToSignal: any, callerID: any, stream: any) {}

    function addPeer(incomingSignal: any, callerID: any, stream: any) {}

    return (
        <div>
            <video muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return <Video key={index} peer={peer} />;
            })}
        </div>
    );
};
