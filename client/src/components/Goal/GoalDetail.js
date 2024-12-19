import React from "react";
import { IoClose } from "react-icons/io5";

export default function GoalDetail({ note, setShowGoalDetail }) {
  return (
    <div className=" w-[21rem] sm:w-[42rem] max-h-[105vh] mt-[3rem]  rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">Goal Note</h1>
        <span
          onClick={() => {
            setShowGoalDetail(false);
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: note }}
        className="w-full min-h-[12rem] py-4 px-4  text-justify text-[14px] "
      ></div>
    </div>
  );
}
