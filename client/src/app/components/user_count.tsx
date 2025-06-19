import { useState } from "react";
import { FaUser, FaCrown } from "react-icons/fa";

export default function UserCount() {
    const [count, setCount] = useState<number>(1);
    return (
        <div className="flex flex-col">
            <div className="bg-[#222225] w-full h-[1px]"></div>
            <div className="flex flex-row mt-[59px] h-full">
                <div className="bg-[#29292d] w-[1px] h-full" />
                <div className="w-[260px] flex flex-col">
                    <div className="bg-[#29292d] w-full h-[1px] mb-6" />
                    <div className="flex flex-col items-start text-gray-500 pl-4 space-y-1">
                        <span className="text-sm">Online - {count}</span>
                        <div className="flex flex-row items-center pl-2">
                            <div className="relative w-8 h-8">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg font-semibold">
                                    <FaUser />
                                </div>
                                <span className="absolute bottom-[-3px] right-[-3px] w-4 h-4 bg-[#43a25a] border-3 border-[#1a1a1e] rounded-full"></span>
                            </div>
                            <span className="font-medium pl-3">GUEST</span>
                            <FaCrown className="pl-1 text-md text-[#c5914d]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
