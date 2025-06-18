"use client";
import Sidebar from "./sidebar";
import TextChannel from "./text_channel";
import UserCount from "./user_count";

export default function Temp() {
    return (
        <div className="flex flex-row w-full h-screen">
            <Sidebar />
            <TextChannel />
            <UserCount />
        </div>
    );
}
