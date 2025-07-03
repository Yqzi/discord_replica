"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaDiscord } from "react-icons/fa";
import Sidebar from "./sidebar";
import TextChannel from "./text_channel";
import UserCount from "./user_count";
import VoiceChannel from "./voice_channel";
import { useAuth } from "../auth_provider";

export default function Temp() {
    const [selectedChannel, setSelectedChannel] = useState(0);
    const voiceChannelRef = useRef<{
        joinRoom: () => void;
        webcamButtonOnClick: () => void;
    }>(null);

    // Invite dialog state
    const searchParams = useSearchParams();
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [inviteRoomId, setInviteRoomId] = useState<string | null>(null);

    const [channels, setChannels] = useState([
        { icon: <FaDiscord />, label: "Main", id: "main" },
    ]);

    useEffect(() => {
        const roomId = searchParams.get("inviteRoomId");
        if (roomId) {
            setInviteRoomId(roomId);
            setShowInviteDialog(true);
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col w-full h-screen">
            {/* Invite dialog */}
            {showInviteDialog && (
                <div className="fixed inset-0 z-50 flex h-[100vh] items-center justify-center backdrop-brightness-40">
                    <div className="bg-[#242429] rounded-xl p-8 shadow-lg min-w-[300px] flex flex-col items-center">
                        <h2 className="text-white text-xl mb-4">Invite Link</h2>
                        <p className="text-gray-400 mb-6">
                            You were invited to join room:{" "}
                            <span className="font-bold">{inviteRoomId}</span>
                        </p>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => {
                                if (
                                    inviteRoomId &&
                                    !channels.some((c) => c.id === inviteRoomId)
                                ) {
                                    setChannels([
                                        ...channels,
                                        {
                                            icon: (
                                                <span className="text-lg font-bold">
                                                    {inviteRoomId}
                                                </span>
                                            ),
                                            label: inviteRoomId,
                                            id: inviteRoomId,
                                        },
                                    ]);
                                }
                                setShowInviteDialog(false);
                            }}
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}
            <div className="min-h-7 max-h-7 flex bg-[#121214] text-xs justify-center items-center flex-row">
                <div className="rounded bg-[#1a1a1e] px-[7px] py-1 mr-2 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px] leading-tight">
                        S
                    </span>
                </div>
                SERVER NAME
            </div>
            <div className="flex flex-row flex-1 h-[calc(100vh-1.75rem)] ">
                <Sidebar
                    selectedChannel={selectedChannel}
                    setSelectedChannel={setSelectedChannel}
                    joinRoom={() => voiceChannelRef.current?.joinRoom()}
                    webcamButtonOnClick={() =>
                        voiceChannelRef.current?.webcamButtonOnClick()
                    }
                    channels={channels}
                />
                <div className="relative flex-1">
                    {/* TextChannel and UserCount stack */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 flex flex-row flex-1 h-[calc(100vh-1.75rem)]  ${
                            selectedChannel === 0
                                ? "opacity-100 z-10"
                                : "opacity-0 z-0 pointer-events-none"
                        }`}
                    >
                        <TextChannel />
                        <UserCount />
                    </div>
                    {/* VoiceChannel stack */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                            selectedChannel === 1
                                ? "opacity-100 z-10"
                                : "opacity-0 z-0 pointer-events-none"
                        }`}
                    >
                        <VoiceChannel ref={voiceChannelRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
