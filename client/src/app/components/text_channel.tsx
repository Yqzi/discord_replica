import { PiMailbox } from "react-icons/pi";
import { IoIosArrowForward } from "react-icons/io";
import { BsPlusCircleFill } from "react-icons/bs";
import { AiFillGift } from "react-icons/ai";

export default function TextChannel() {
    return (
        <div className="flex flex-col flex-1">
            <div className="bg-[#222225] w-full h-[1px]"></div>
            <div className="flex flex-col justify-between h-full items-center pb-5">
                <div className="bg-[#29292d] mt-[59px] h-[1px] w-full" />
                <div className="flex flex-col w-full gap-3 items-center">
                    <span className="text-3xl  w-11/12 md:w-2/3 lg:w-1/3">
                        Welcome to <br />
                        Server Name
                    </span>
                    <span className="text-sm leading-tight tracking-tighter  w-11/12 md:w-2/3 lg:w-1/3">
                        This is your brand new, shiny server. Here are some
                        steps to help you get started.
                    </span>
                    <button className="w-11/12 md:w-2/3 lg:w-1/3 border border-[#2e2e32] text-sm flex flex-row items-center pl-5 py-4 rounded-lg gap-3 bg-[#1f1f23] mb-4">
                        <PiMailbox className="text-lg text-[#a960fa]" />
                        Invite your friends
                        <IoIosArrowForward className="ml-auto mr-3 text-lg text-[#4f505a}" />
                    </button>
                    <div className="flex flex-row items-center gap-7 px-5 py-4 w-[99%] rounded-md border border-[#27282b] focus-within:border-[#2e2e32] bg-[#222327] text-[#aaaab1]">
                        <BsPlusCircleFill className="text-lg" />
                        <input
                            type="text"
                            className="flex-1 text-sm bg-transparent focus:outline-none text-white placeholder:text-[#6d6e77]"
                            placeholder="Message #general"
                        />
                        <div className="flex flex-row items-center gap-5 ml-auto">
                            <AiFillGift className="text-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
