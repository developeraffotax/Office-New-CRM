import { useAuth } from "@/app/context/authContext";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import ChatLoader from "../LoadingSkelton/ChatLoader";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { LuFileAudio } from "react-icons/lu";
import { IoIosImages } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";

export default function Chats({
  chats,
  selectedChat,
  setSelectedChat,
  chatLoad,
  setShow,
}) {
  const { auth } = useAuth();
  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            className="w-4 h-4 accent-sky-600 cursor-pointer"
            // onChange={(e) => handleSelectAll(e.target.checked)}
            // checked={selectedNotificationId.length === notificationData.length}
          />
          <span className="text-[13px]  sm:text-[14px] font-medium text-gray-700">
            Select All
          </span>
        </div>
        <span className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-100/70 text-gray-800 text-[13px] ">
          {chats.length}
        </span>
      </div>
      <hr />
      {/*-----Chat Users---- */}
      <div className="flex flex-col w-full h-full  overflow-y-scroll pb-5 shidden">
        {chatLoad ? (
          <ChatLoader />
        ) : (
          <div className="flex flex-col gap-2 w-full h-full">
            {chats?.map((chat, i) => {
              const unreadCount = chat.unreadMessageCount[auth?.user?._id] || 0;
              return (
                <div
                  key={chat?._id}
                  onClick={() => {
                    setSelectedChat(chat);
                    localStorage.setItem("chat", JSON.stringify(chat));
                    setShow(false);
                  }}
                  className={`px-2 py-[.4rem] ${
                    selectedChat?._id === chat?._id
                      ? "bg-sky-100 border-sky-300"
                      : "bg-gray-50"
                  } cursor-pointer overflow-hidden flex items-center justify-between gap-1  hover:bg-sky-50  rounded-md hover:shadow-md border border-gray-200 `}
                >
                  <div className="flex items-center gap-[3px]">
                    <div className="relative w-[2.3rem] h-[2.3rem] rounded-lg shadow-md  ">
                      <Image
                        src={
                          chat?.users[1]?._id === auth.user?._id
                            ? chat?.users[0]?.avatar || "/profile.png"
                            : chat?.users[1]?.avatar || "/profile.png"
                        }
                        alt={
                          chat?.users[1]?._id === auth.user?._id
                            ? `${chat?.users[0]?.name}`
                            : `${chat?.users[1]?.name}`
                        }
                        layout="fill"
                        className="rounded-md border"
                      />

                      <span
                        className={`absolute top-[-2px] right-[-2px] w-[.5rem] h-[.5rem] rounded-full ${
                          chat?.users[1]?._id === auth.user?._id
                            ? chat?.users[0]?.isOnline
                              ? "bg-green-500"
                              : "bg-red-500"
                            : chat?.users[1]?.isOnline
                            ? "bg-green-500"
                            : "bg-red-500"
                        } ring-1 ring-gray-100  z-10`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-semibold text-[14px] ">
                        {chat?.users[1]?._id === auth.user?._id
                          ? `${chat?.users[0]?.name} `
                          : `${chat?.users[1]?.name} `}
                      </span>
                      <span className="text-gray-600 text-[12px]  truncate max-w-[10rem]">
                        {chat?.latestMessage?.contentType === "text" ? (
                          chat?.latestMessage?.content
                        ) : chat?.latestMessage?.contentType === "Image" ? (
                          <span className="flex items-center gap-1">
                            <IoIosImages className="h-4 w-4" /> Image
                          </span>
                        ) : chat?.latestMessage?.contentType === "Video" ? (
                          <span className="flex items-center gap-1">
                            <MdOutlineSlowMotionVideo className="h-4 w-4" />{" "}
                            Video
                          </span>
                        ) : chat?.latestMessage?.contentType === "Audio" ? (
                          <span className="flex items-center gap-1">
                            <LuFileAudio className="h-4 w-4" /> Audio
                          </span>
                        ) : chat?.latestMessage?.contentType === "like" ? (
                          "👍"
                        ) : chat?.latestMessage?.contentType === "File" ? (
                          <span className="flex items-center gap-1">
                            <IoDocumentTextOutline className="h-4 w-4" />{" "}
                            Document file
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {unreadCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] bg-pink-200 text-gray-700 rounded-md px-2 py-[2px] ">
                          New
                        </span>
                        <span className="h-[1.1rem] w-[1.1rem] flex items-center justify-center rounded-full bg-sky-500 text-white text-[11px] ">
                          {unreadCount}
                        </span>
                      </div>
                    )}
                    {chat?.latestMessage && (
                      <span className="text-[11px] text-gray-600  ">
                        {format(
                          new Date(chat?.latestMessage?.createdAt),
                          "hh:mm a"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
