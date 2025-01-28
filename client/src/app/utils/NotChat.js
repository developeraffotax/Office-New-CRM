import Image from "next/image";
import React from "react";
import { FiChevronsRight } from "react-icons/fi";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

export default function NotChat() {
  return (
    <div className="relative col-span-11 custom-md:col-span-8 h-full bg-white 0">
      <div className="w-full h-full flex items-center justify-center flex-col">
        <span className="w-[6rem] h-[6rem] rounded-full bg-sky-100 border border-sky-500 flex items-center justify-center ">
          <IoChatbubbleEllipsesOutline className="text-sky-400 h-[2.5rem] w-[2.5rem]" />
        </span>
        <h3 className={` text-black text-lg font-medium text-center mt-3`}>
          Messages
        </h3>
        <p className="text-[13px] font-normal text-gray-600 text-center max-w-[20rem] mt-2">
          Click on contact to view messages
        </p>
        <button className="flex items-center gap-1 text-white bg-sky-500 rounded-[2rem] px-4 py-2 mt-4">
          <IoChatbubbleEllipsesOutline className="text-white h-[1rem] w-[1rem]" />
          New Message
        </button>
      </div>
    </div>
  );
}
