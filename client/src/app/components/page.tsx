"use client";
import Sidebar from "./sidebar";
import UserCount from "./user_count";

export default function Temp() {
    return (
        <div className="flex flex-row w-full">
            <Sidebar />
            <div className="flex-1">
                <div className="bg-[#222225] w-full mt-[60px] h-[1px]" />
            </div>
            <UserCount />
        </div>
    );
}
