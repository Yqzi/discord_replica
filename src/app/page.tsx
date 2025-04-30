"use client";
import { useEffect, useRef, useState } from "react";
import { WebRTCManager } from "./models/webrtc";
import io from "socket.io-client";

export default function Home() {
    const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
    const [micId, setMicId] = useState<string>("");
    const [rtc, setRtc] = useState<WebRTCManager | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        "Disconnected" | "Connected"
    >("Disconnected");
    const [userCount, setUserCount] = useState(0);

    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    // Only establish the socket connection when the user presses "Start Call"
    const socketInstance = useRef<any>(null);

    useEffect(() => {
        const getMics = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                await navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices) => {
                        const mics = devices.filter(
                            (device) => device.kind == "audioinput"
                        );
                        setMicDevices(mics);
                        if (mics.length > 0 && !micId) {
                            setMicId(mics[0].deviceId);
                        }
                    });
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        };
        getMics();

        // Do NOT initialize socket here, we will initialize it only on button press
        socketInstance.current = io("http://localhost:4000");

        // Cleanup socket on component unmount
        return () => {
            if (socketInstance.current) {
                socketInstance.current.disconnect();
            }
        };
    }, [micId]);

    const handleStartCall = async () => {
        if (connectionStatus == "Disconnected") {
            // Create socket connection only if it hasn't been initialized
            socketInstance.current = io("http://localhost:4000");

            socketInstance.current.on("connect", () => {
                console.log("Socket connected");
                setConnectionStatus("Connected");
                socketInstance.current.emit("join"); // Join room on button press
            });

            socketInstance.current.on("user-count", (count: number) => {
                setUserCount(count); // Set user count
            });

            socketInstance.current.on("peer-list", (peers: string[]) => {
                if (peers.length > 0) {
                    setConnectionStatus("Connected");
                } else {
                    setConnectionStatus("Disconnected");
                }
            });

            socketInstance.current.on("disconnect", () => {
                setConnectionStatus("Disconnected");
                console.log("Socket disconnected");
                setUserCount(0);
            });
        }

        const newRtc = new WebRTCManager(
            (remoteStream) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = remoteStream;
                    remoteAudioRef.current.play();
                }
            },
            (data) => {
                socketInstance.current.emit("signal", data);
            },
            () => {
                setConnectionStatus("Connected");
            }
        );

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: micId ? { exact: micId } : undefined },
        });

        newRtc["localStream"] = stream;
        await newRtc.createPeerConnection();
        await newRtc.createOffer();

        setRtc(newRtc);
    };

    const handleHangUp = () => {
        if (socketInstance.current) {
            // Emit a disconnect event to the server
            socketInstance.current.emit("disconnect-call"); // Custom event name for clarity
        }

        rtc?.closeConnection();
        setRtc(null);
        setConnectionStatus("Disconnected");
    };

    return (
        <div>
            <h1>Audio Call Setup</h1>
            {micDevices.length > 0 && (
                <div>
                    <label>Select Microphone:</label>
                    <select
                        value={micId}
                        onChange={(e) => setMicId(e.target.value)}
                    >
                        {micDevices.map((device) => (
                            <option
                                key={device.deviceId}
                                value={device.deviceId}
                            >
                                {device.label ||
                                    `Mic (${device.deviceId.slice(-5)})`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <button onClick={handleStartCall}>Start Call</button>
            <button onClick={handleHangUp} disabled={!rtc}>
                Hang Up
            </button>
            <p>Status: {connectionStatus}</p> {/* Display connection status */}
            <p>Connected Users: {userCount}</p> {/* Display user count */}
            <audio ref={remoteAudioRef} autoPlay hidden />
        </div>
    );
}
