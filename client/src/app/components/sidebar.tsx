"use client";
import { useState } from "react";
import { FaSearch, FaUser, FaCog, FaPlus } from "react-icons/fa";
import { IoIosArrowDown, IoMdVolumeHigh } from "react-icons/io";
import { MdPersonAddAlt1 } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { TbMicrophoneFilled } from "react-icons/tb";
import { HiOutlineHashtag } from "react-icons/hi";

const buttons = [
    { icon: <FaSearch />, label: "Search" },
    { icon: <FaUser />, label: "User" },
    { icon: <FaCog />, label: "Settings" },
];

export default function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="flex flex-col w-[351px] h-screen bg-[#121214]">
            <div className="flex flex-row h-full">
                <div className="flex flex-col w-[70px] h-full bg-[#121214]">
                    {buttons.map((btn, idx) => (
                        <div
                            key={btn.label}
                            className="flex items-center h-[70px] cursor-pointer"
                            onClick={() => setActiveIndex(idx)}
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
                                className={`w-10 h-10 ml-2 rounded-full flex items-center justify-center transition-colors ${
                                    activeIndex === idx
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-800 text-gray-400 hover:bg-blue-700 hover:text-white"
                                }`}
                            >
                                {btn.icon}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="bg-[#222225] w-[1px] h-full"></div>
                <div className="bg-[#121214] w-[280px] h-full pt-4 flex flex-col space-y-4 items-start px-1.5">
                    <span className="text-lg font-semibold text-white pl-2">
                        SERVER NAME
                    </span>
                    <div className="bg-[#1a1a1a] w-[274px] h-[1px] px-0"></div>
                    <div className="flex flex-row w-full items-center text-base font-light text-gray-500 gap-2 group cursor-pointer hover:bg-[#252529a6] rounded-lg transition-colors pl-2 py-1">
                        <MdPersonAddAlt1 />
                        <span className="text-base font-light text-gray-500 transition-colors group-hover:text-white">
                            Invite
                        </span>
                        <div className="flex-1" />
                        <FaPlus className="text-lg pr-2 invisible group-hover:visible" />
                    </div>
                    <div className="bg-[#1a1a1a] w-[268px] h-[1px]"></div>
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
                                    activeIndex === 3 || activeIndex === 0
                                        ? "bg-[#252529] text-white"
                                        : "hover:bg-[#252529a6] hover:text-white"
                                }
                            `}
                            onClick={() => setActiveIndex(3)}
                        >
                            <HiOutlineHashtag
                                className={`text-xl ${
                                    activeIndex === 3 || activeIndex === 0
                                        ? "text-white"
                                        : "text-gray-500"
                                } group-hover:text-white`}
                            />
                            <span
                                className={`text-base font-light ${
                                    activeIndex === 3 || activeIndex === 0
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
                                    activeIndex === 4
                                        ? "bg-[#252529] text-white"
                                        : "hover:bg-[#252529a6] hover:text-white"
                                }
                            `}
                            onClick={() => setActiveIndex(4)}
                        >
                            <IoMdVolumeHigh
                                className={`text-xl ${
                                    activeIndex === 4
                                        ? "text-white"
                                        : "text-gray-500"
                                } group-hover:text-white`}
                            />
                            <span
                                className={`text-base font-light ${
                                    activeIndex === 4
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
