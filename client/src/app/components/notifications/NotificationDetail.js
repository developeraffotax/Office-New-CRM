import React from "react";
import { IoClose } from "react-icons/io5";

export default function NotificationDetail({
  setShowNotification,
  selectedNotification,
  setSelectedNotification,
}) {
  return (
    <div className="bg-white rounded-md shadow-md border border-gray-30`0 max-h-[90%] overflow-y-auto">
      <div className="px-4 py-3 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-black">
          Notification Detail
        </h3>
        <span
          className="p-1 rounded-full bg-gray-200/70 hover:bg-gray-300/70 cursor-pointer transition-all duration-300"
          onClick={() => {
            setShowNotification(false);
            setSelectedNotification([]);
          }}
        >
          <IoClose className="h-5 w-5" />
        </span>
      </div>
      <hr className="w-full h-[1px] bg-gray-300 my-2" />
      <div className="w-full py-2 px-4">
        <div
          dangerouslySetInnerHTML={{ __html: selectedNotification?.context }}
          className="text-[14px] font-normal text-gray-700"
        />
      </div>
    </div>
  );
}
