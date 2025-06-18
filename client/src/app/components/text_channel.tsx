import { PiMailbox } from "react-icons/pi";
import { IoIosArrowForward } from "react-icons/io";

export default function TextChannel() {
    return (
        <div className="flex-1 flex flex-col justify-between h-full items-center pb-5">
            <div className="bg-[#222225] mt-[60px] h-[1px]" />
            <div className="flex flex-col w-11/12 md:w-2/3 lg:w-1/3 gap-3">
                <span className="text-3xl">
                    Welcome to <br />
                    Server Name
                </span>
                <span className="text-sm leading-tight tracking-tighter">
                    This is your brand new, shiny server. Here are some steps to
                    help you get started.
                </span>
                <button className="border border-[#2e2e32] text-sm flex flex-row items-center pl-5 py-4 rounded-lg gap-3 bg-[#1f1f23] mb-4">
                    <PiMailbox className="text-lg text-[#a960fa]" />
                    Invite your friends
                    <IoIosArrowForward className="ml-auto mr-3 text-lg text-[#4f505a}" />
                </button>
            </div>
            <input
                type="text"
                className="w-full mx-2 px-3 py-2 rounded-md border border-[#27282b] bg-[#18181b] text-sm focus:outline-none focus:border-[#2e2e32]"
                placeholder="Type your message..."
            />
        </div>
    );
}
