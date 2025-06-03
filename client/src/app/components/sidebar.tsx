"use client";
import { useState } from "react";
import { FaSearch, FaUser, FaCog, FaCalendarDay } from "react-icons/fa";
import { IoIosArrowDown, IoMdVolumeHigh } from "react-icons/io";

const buttons = [
    { icon: <FaSearch />, label: "Search" },
    { icon: <FaUser />, label: "User" },
    { icon: <FaCog />, label: "Settings" },
];

export default function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="flex flex-row">
            <div className="flex flex-col w-[70px] h-screen bg-[#131313]">
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
            <div className="bg-[#1a1a1a] w-[1px] h-screen"></div>
            <div className="bg-[#131313] w-[280px] h-screen pt-5 flex flex-col space-y-4 items-start pl-1.5 pr-1.5">
                <span className="text-lg font-semibold text-white pl-2">
                    SERVER NAME
                </span>
                <div className="bg-[#1a1a1a] w-[280px] h-[1px]"></div>
                <div className="flex flex-row w-full items-center text-base font-light text-gray-500 gap-2 group cursor-pointer hover:bg-[#1a1919] rounded transition-colors pl-2 py-0.5">
                    <FaCalendarDay />
                    <span className="text-base font-light text-gray-500 transition-colors group-hover:text-white">
                        Events
                    </span>
                </div>
                <div className="bg-[#1a1a1a] w-[280px] h-[1px]"></div>
                <div className="flex flex-col items-start space-y-1  w-full">
                    <div className="flex flex-row gap-2 items-center group cursor-pointer transition-colors pl-2 py-0.5">
                        <span className="text-xs font-light text-gray-500 group-hover:text-white">
                            Voice Channels
                        </span>
                        <IoIosArrowDown className="text-gray-500 text-xs group-hover:text-white" />
                    </div>
                    <div className="flex flex-row gap-2 w-full items-center group cursor-pointer hover:bg-[#1a1919] rounded transition-colors pl-2 py-0.5">
                        <IoMdVolumeHigh className="text-gray-500 text-xl" />
                        <span className="text-base font-light text-gray-500 group-hover:text-white">
                            Lobby
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
