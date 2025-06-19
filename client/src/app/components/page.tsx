"use client";
import Sidebar from "./sidebar";
import TextChannel from "./text_channel";
import UserCount from "./user_count";

export default function Temp() {
    return (
        <div className="flex flex-col w-full h-screen">
            <div className="min-h-7 max-h-7 flex bg-[#121214] text-xs justify-center items-center flex-row">
                <div className="rounded bg-[#1a1a1e] px-[7px] py-1 mr-2 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px] leading-tight">
                        S
                    </span>
                </div>
                SERVER NAME
            </div>
            <div className="flex flex-row flex-1 h-[calc(100vh-1.75rem)] ">
                <Sidebar />
                <TextChannel />
                <UserCount />
            </div>
        </div>
    );
}
