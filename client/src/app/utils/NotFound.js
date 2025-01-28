import Image from "next/image";
import React from "react";

export default function Notfound() {
  return (
    <div className="w-full h-[15rem] flex flex-col items-center justify-center text-gray-600 ">
      <Image
        src="/notfound.png"
        alt={`Not found`}
        width={80}
        height={80}
        className="rounded-full inline-block mr-2 animate-pulse"
      />
      <span className="text-[14px]">User not found.</span>
    </div>
  );
}
