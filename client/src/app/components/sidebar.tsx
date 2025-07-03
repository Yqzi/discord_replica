"use client";
import { useEffect, useState } from "react";
import { FaUser, FaDiscord, FaPlus } from "react-icons/fa";
import { IoIosArrowDown, IoMdVolumeHigh } from "react-icons/io";
import { MdPersonAddAlt1 } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { TbMicrophoneFilled } from "react-icons/tb";
import { HiOutlineHashtag } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";

const buttons = [{ icon: <FaDiscord />, label: "Main" }];

type SidebarProps = {
    selectedChannel: number;
    setSelectedChannel: (index: number) => void;
    joinRoom: () => void;
    webcamButtonOnClick: () => void;
};

export default function Sidebar({
    selectedChannel,
    setSelectedChannel,
    joinRoom,
    webcamButtonOnClick,
}: SidebarProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (selectedChannel === 1) {
            webcamButtonOnClick();
            joinRoom();
        }
    }, [selectedChannel]);

    function handleCloseInviteDialog() {
        setIsClosing(true);
        setTimeout(() => {
            setShowInviteDialog(false);
            setIsClosing(false);
        }, 250); // match your animation duration
    }

    function inviteUser() {}

    return (
        <div className="flex flex-col bg-[#121214]">
            <div className="flex flex-row h-full">
                <div className="flex flex-col w-[70px] h-full bg-[#121214]">
                    {buttons.map((btn, idx) => (
                        <div>
                            <div
                                key={btn.label}
                                className="flex flex-row items-center my-1 text-2xl"
                            >
                                {/* Indicator */}
                                <div
                                    className={`h-10 w-1 rounded-r-full transition-all ${
                                        activeIndex === idx
                                            ? "bg-white"
                                            : "bg-transparent"
                                    }`}
                                />
                                <button
                                    className={`w-10 h-10 ml-2 rounded-xl flex items-center justify-center transition-colors ${
                                        activeIndex === idx
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-800 text-gray-400 hover:bg-blue-700 hover:text-white cursor-pointer"
                                    }`}
                                    onClick={() => setActiveIndex(idx)}
                                >
                                    {btn.icon}
                                </button>
                            </div>
                            {idx === 0 && (
                                <div className="w-8 ml-4 mt-2 mb-1 h-[1px] bg-[#222225] justify-center"></div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="bg-[#222225] w-[1px] h-full"></div>
                <div
                    className="flex flex-col space-y-[15.5px] items-start w-72 min-w-[200px] max-w-[400px] relative resize-x overflow-auto"
                    style={{
                        resize: "horizontal",
                    }}
                >
                    <div className="bg-[#222225] w-full h-[1px]"></div>
                    <span className="text-lg font-semibold text-white pl-3.5 ">
                        SERVER NAME
                    </span>
                    <div className="bg-[#29292d] w-full h-[1px] px-0"></div>
                    <div className="bg-[#121214] h-full flex flex-col space-y-4 items-start px-1.5 w-full">
                        <button
                            onClick={() => setShowInviteDialog(true)}
                            className="flex flex-row w-full items-center text-base font-light text-gray-500 gap-2 group cursor-pointer hover:bg-[#252529a6] rounded-lg transition-colors pl-2 py-1"
                        >
                            <MdPersonAddAlt1 />
                            <span className="text-base font-light text-gray-500 transition-colors group-hover:text-white">
                                Invite
                            </span>
                            <div className="flex-1" />
                            <FaPlus className="text-lg pr-2 invisible group-hover:visible" />
                        </button>
                        {showInviteDialog && (
                            <div
                                className={`fixed inset-0 z-50 flex h-[100vh] items-center justify-center ${
                                    isClosing ? "fadeOutBg" : ""
                                }`}
                                style={{
                                    animation: isClosing
                                        ? "fadeOutBg 0.25s ease"
                                        : "fadeInBg 0.25s ease",
                                }}
                                onClick={handleCloseInviteDialog}
                            >
                                <div
                                    className={`bg-[#242429] rounded-xl pt-2 pb-20 pl-6 pr-3 border-[#3b3b41] border-[1px] shadow-lg min-w-[500px] flex flex-col ${
                                        isClosing ? "shrinkDialog" : ""
                                    }`}
                                    style={{
                                        animation: isClosing
                                            ? "shrinkDialog 0.25s cubic-bezier(0.4,0,0.2,1)"
                                            : "growDialog 0.25s cubic-bezier(0.4,0,0.2,1)",
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row items-center">
                                            <MdPersonAddAlt1 className="mr-3 text-xl text-[#94959c]" />
                                            Invite
                                        </div>
                                        <button
                                            onClick={handleCloseInviteDialog}
                                            className="ml-4 p-1 rounded transition-colors"
                                            aria-label="Close"
                                        >
                                            <IoCloseOutline className="text-[26px] text-[#94959c] hover:text-white cursor-pointer" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 mt-12 mb-2">
                                        <span className="text-white text-xl select-all">
                                            {typeof window !== "undefined"
                                                ? `${window.location.origin}/invite/1212`
                                                : "/invite/1212"}
                                        </span>
                                        <button
                                            className="px-3 py-1 mt-1 bg-[#5865f2] hover:bg-[#4750b3] text-white rounded transition-colors text-sm"
                                            onClick={async () => {
                                                const url =
                                                    typeof window !==
                                                    "undefined"
                                                        ? `${window.location.origin}/invite/1212`
                                                        : "/invite/1212";
                                                await navigator.clipboard.writeText(
                                                    url
                                                );
                                                setCopied(true);
                                                setTimeout(
                                                    () => setCopied(false),
                                                    3000
                                                );
                                            }}
                                            type="button"
                                            disabled={copied}
                                        >
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                </div>
                                <style jsx global>{`
                                    @keyframes growDialog {
                                        from {
                                            transform: scale(0.6);
                                            opacity: 0;
                                        }
                                        to {
                                            transform: scale(1);
                                            opacity: 1;
                                        }
                                    }
                                    @keyframes shrinkDialog {
                                        from {
                                            transform: scale(1);
                                            opacity: 1;
                                        }
                                        to {
                                            transform: scale(0.6);
                                            opacity: 0;
                                        }
                                    }
                                    @keyframes fadeInBg {
                                        from {
                                            background: rgba(0, 0, 0, 0);
                                        }
                                        to {
                                            background: rgba(0, 0, 0, 0.6);
                                        }
                                    }
                                    @keyframes fadeOutBg {
                                        from {
                                            background: rgba(0, 0, 0, 0.6);
                                        }
                                        to {
                                            background: rgba(0, 0, 0, 0);
                                        }
                                    }
                                    .fixed.inset-0.z-50.flex.items-center.justify-center {
                                        background: rgba(0, 0, 0, 0.6);
                                    }
                                `}</style>
                            </div>
                        )}
                        <div className="bg-[#29292d] w-full h-[1px]"></div>
                        <div className="flex flex-col items-start space-y-1 w-full">
                            <div className="flex flex-row gap-2 items-center group cursor-pointer transition-colors pl-2 py-0.5">
                                <span className="text-xs font-light text-gray-500 group-hover:text-white">
                                    Text Channels
                                </span>
                                <IoIosArrowDown className="text-gray-500 text-xs group-hover:text-white" />
                            </div>
                            <div
                                className={`flex flex-row gap-2 w-full items-center group cursor-pointer rounded-lg transition-colors pl-2 py-1
                                ${
                                    selectedChannel === 0
                                        ? "bg-[#252529] text-white"
                                        : "hover:bg-[#252529a6] hover:text-white"
                                }
                            `}
                                onClick={() => setSelectedChannel(0)}
                            >
                                <HiOutlineHashtag
                                    className={`text-xl ${
                                        selectedChannel === 0
                                            ? "text-white"
                                            : "text-gray-500"
                                    } group-hover:text-white`}
                                />
                                <span
                                    className={`text-base font-light ${
                                        selectedChannel === 0
                                            ? "text-white"
                                            : "text-gray-500 group-hover:text-white"
                                    }`}
                                >
                                    general
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start space-y-1 w-full">
                            <div className="flex flex-row gap-2 items-center group cursor-pointer transition-colors pl-2 py-0.5">
                                <span className="text-xs font-light text-gray-500 group-hover:text-white">
                                    Voice Channels
                                </span>
                                <IoIosArrowDown className="text-gray-500 text-xs group-hover:text-white" />
                            </div>
                            <div
                                className={`flex flex-row gap-2 w-full items-center group cursor-pointer rounded-lg transition-colors pl-2 py-1
                                ${
                                    selectedChannel === 1
                                        ? "bg-[#252529] text-white"
                                        : "hover:bg-[#252529a6] hover:text-white"
                                }
                            `}
                                onClick={() => setSelectedChannel(1)}
                            >
                                <IoMdVolumeHigh
                                    className={`text-xl ${
                                        selectedChannel === 1
                                            ? "text-white"
                                            : "text-gray-500"
                                    } group-hover:text-white`}
                                />
                                <span
                                    className={`text-base font-light ${
                                        selectedChannel === 1
                                            ? "text-white"
                                            : "text-gray-500 group-hover:text-white"
                                    }`}
                                >
                                    General
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add mb-20 to see user bottom bar */}
            <div className="flex flex-row items-center justify-between py-2.5 mb-2 rounded-lg bg-[#1e1e1e] mx-2 pl-2 pr-2">
                <div className="flex flex-row items-center">
                    <div className="relative w-10 h-10">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg font-semibold">
                            <FaUser />
                        </div>
                        <span className="absolute bottom-[-4px] right-[-3px] w-5 h-5 bg-[#43a25a] border-[4.5px] border-[#1e1e1e] rounded-full"></span>
                    </div>
                    <div className="flex flex-col items-start pl-2 leading-4">
                        <span className="font-medium text-white">GUEST</span>
                        <span className="font-medium text-gray-500 text-[11px]">
                            Online
                        </span>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <button
                        className="p-1.5 rounded-lg hover:bg-[#2b2b2b] transition-colors cursor-pointer group"
                        aria-label="Microphone"
                    >
                        <TbMicrophoneFilled className="text-gray-400 text-xl tilt-on-hover" />
                    </button>
                    <button
                        className="p-1.5 rounded-lg hover:bg-[#2b2b2b] transition-colors cursor-pointer group"
                        aria-label="Settings"
                    >
                        <IoSettingsSharp className="text-gray-400 text-xl spin-on-hover" />
                    </button>
                </div>
            </div>
        </div>
    );
}
