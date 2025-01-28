import React from "react";

export default function ChatLoader() {
  return (
    <div className="space-y-4 p-2">
      {/* Skeleton Loader for a chat item */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          {/* Avatar Loader */}
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          {/* Name and message loader */}
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        {/* Timestamp loader */}
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>

      {/* Repeat the skeleton for multiple chats */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
      {/*  */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
      {/*  */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
      {/*  */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
      {/*  */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
      {/*  */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
      {/*  */}
      <div className="px-2 py-[.4rem] overflow-hidden flex items-center justify-between gap-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center gap-[3px]">
          <div className="relative w-[2.5rem] h-[2.5rem] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 dark:bg-slate-600 h-4 w-[8rem] rounded"></div>
            <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[10rem] rounded"></div>
          </div>
        </div>
        <div className="bg-gray-300 dark:bg-slate-600 h-3 w-[4rem] rounded"></div>
      </div>
    </div>
  );
}
