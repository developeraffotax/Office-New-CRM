"use client";
import React, { useEffect, useRef, useState } from "react";
import MessageLoader from "../LoadingSkelton/MessageLoader";
import { useAuth } from "@/app/context/authContext";
import { TbFileDownload } from "react-icons/tb";
import { PiImageDuotone } from "react-icons/pi";
import { CgFileDocument } from "react-icons/cg";
import EmojiPicker from "emoji-picker-react";
import { IoDocumentTextOutline, IoSend } from "react-icons/io5";
import { ImSpinner9 } from "react-icons/im";
import { IoIosImages } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { format } from "date-fns";
import { RiDoorClosedLine } from "react-icons/ri";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import NotChat from "@/app/utils/NotChat";
import { BsEmojiSunglasses, BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidPlusCircle } from "react-icons/bi";
import { AiFillLike, AiOutlineDelete, AiTwotoneCamera } from "react-icons/ai";
import Image from "next/image";
import { MdOutlineClosedCaptionDisabled } from "react-icons/md";
import axios from "axios";
import { fileType } from "@/app/utils/CommonFunction";

import socketIO from "socket.io-client";
const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export default function MessagesData({
  selectedChat,
  messageLoad,
  chatMessages,
  setSelectedChat,
  show,
  setShow,
  fetchMessages,
  fetchChats,
  fetchUsers,
  setChats,
}) {
  const { auth } = useAuth();
  const closeUploads = useRef(null);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("text");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const closeDetail = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const closeEmoji = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);

  // Add Emojis
  const onEmojiClick = (event) => {
    console.log("Emoji1", event);

    setMessage((prevContent) => prevContent + event.emoji);
  };

  // Get Chat from Local Storage
  useEffect(() => {
    const localChat = localStorage.getItem("chat");
    if (localChat) {
      setSelectedChat(JSON.parse(localChat));
    }
  }, []);

  //<------------------ Handle Typing----------->
  const typingHandler = (e) => {
    setMessage(e.target.value);

    // Typing Indicator login
    if (!typing) {
      setTyping(true);
      socketId.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLenght = 1500;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLenght && typing) {
        socketId.emit("stopTyping", selectedChat._id);
        setTyping(false);
      }
    }, timerLenght);
  };

  // -------------Handle Message-------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/send`,
        {
          content: message || "👍",
          contentType: type,
          chatId: selectedChat._id,
        }
      );

      if (data) {
        fetchMessages();
        socketId.emit("NewMessageAdded", {
          content: message || "👍",
          contentType: type,
          chatId: selectedChat._id,
          messageId: data._id,
        });
        setMessage("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // Send Like
  const handleSendLike = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/send`,
        {
          content: "👍",
          contentType: "like",
          chatId: selectedChat._id,
        }
      );

      if (data) {
        fetchMessages();
        socketId.emit("NewMessageAdded", {
          content: "👍",
          contentType: "like",
          chatId: selectedChat._id,
          messageId: data._id,
        });
        setMessage("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // ---------UpLoad File Data---------->
  const handleSendfiles = async (content, mediaType) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/send`,
        {
          content: content,
          contentType: mediaType,
          chatId: selectedChat._id,
        }
      );

      if (data) {
        fetchMessages();
        socketId.emit("NewMessageAdded", {
          content: content,
          contentType: mediaType,
          chatId: selectedChat._id,
          messageId: data._id,
        });
        setMessage("");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setLoading(false);
    }
  };

  //<---------------- Delete Chat --------------->
  const handleDeleteConfirmation = (chatId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this post!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteChat(chatId);
        Swal.fire("Deleted!", "chat has been deleted.", "success");
      }
    });
  };
  const deleteChat = async (id) => {
    try {
      const data = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/chat/delete/${id}`
      );
      if (data) {
        fetchChats();
        setChats((prevChats) => prevChats.filter((chat) => chat._id !== id));
        localStorage.removeItem("chat");
        setSelectedChat(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // AutoScroll
  useEffect(() => {
    const messageContainer = document.getElementById("message-Container");

    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  // Close Upload Files
  useEffect(() => {
    const handleClose = (event) => {
      if (
        closeUploads.current &&
        !closeUploads.current.contains(event.target)
      ) {
        setIsShow(false);
      }
    };
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, []);

  // Close Emoji
  useEffect(() => {
    const handleCloseEmoji = (event) => {
      if (closeEmoji.current && !closeEmoji.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleCloseEmoji);

    return () => document.removeEventListener("mousedown", handleCloseEmoji);
  }, []);

  // Close 3Dot Detail
  useEffect(() => {
    const handleClose = (event) => {
      if (closeDetail.current && !closeDetail.current.contains(event.target)) {
        setShowDetail(false);
      }
    };
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, []);

  return (
    <div className="w-full h-full">
      {selectedChat ? (
        <div className="relative col-span-11  custom-md:col-span-8 h-full bg-red-700 ">
          <div className="w-full h-[100%] bg-white flex flex-col">
            {/* Header Section */}
            <div className="h-[3.2rem] flex items-center justify-between bg-gradient-to-r from-sky-400 via-sky-500 to-sky-300 px-2 py-2">
              {/* UserInfo */}
              <div className="flex items-center gap- ml-[1.5rem] 1 sm:ml-0 ">
                <div className="relative w-[2.6rem] h-[2.6rem] rounded-full overflow-hidden">
                  <Image
                    src={
                      selectedChat?.users[1]?._id === auth.user?._id
                        ? selectedChat?.users[0]?.profileImage || "/profile.png"
                        : selectedChat?.users[1]?.profileImage || "/profile.png"
                    }
                    alt={`User`}
                    layout="fill"
                    className="rounded-full ring-2 ring-green-200 "
                  />
                </div>
                <div className="flex flex-col leading-tight ml-1 ">
                  <span className="text-[17px] font-medium text-gray-50">
                    {selectedChat?.users[1]?._id === auth.user?._id
                      ? `${selectedChat?.users[0]?.name} `
                      : `${selectedChat?.users[1]?.name}`}
                  </span>
                  {isTyping && (
                    <span className="text-white text-[13px]">
                      Typing
                      <span className="dot-1 font-bold text-[18px] ">.</span>
                      <span className="dot-2 font-bold text-[18px]">.</span>
                      <span className="dot-3 font-bold text-[18px]">.</span>
                    </span>
                  )}
                </div>
              </div>
              {/* Call Info */}
              <div className=" relative flex items-center gap-4">
                {/* ---- Setting Info---- */}
                <span
                  className="relative p-1 bg-gray-100/80 rounded-full hover:bg-gray-200/70 "
                  onClick={() => setShowDetail(!showDetail)}
                >
                  <BsThreeDotsVertical className="h-5 w-5 text-sky-600 hover:text-sky-700 cursor-pointer" />
                </span>
                {showDetail && (
                  <div
                    ref={closeDetail}
                    className="absolute top-[2rem] right-[1.5rem] w-[14rem] flex flex-col gap-2 rounded-md bg-gray-50 border border-gray-300  py-3 px-3 z-10"
                  >
                    <div
                      onClick={() => {
                        localStorage.removeItem("chat");
                        setSelectedChat(null);
                        setShowDetail(false);
                      }}
                      className="flex items-center gap-1 rounded-sm hover:text-red-600 border py-1 px-2 cursor-pointer hover:border-red-500 transition-all duration-300"
                    >
                      <span>
                        <MdOutlineClosedCaptionDisabled className="h-5 w-5 " />
                      </span>
                      <span className="text-[15px] font-medium">
                        Close Conversation
                      </span>
                    </div>

                    {/*  */}
                    <div
                      onClick={() =>
                        handleDeleteConfirmation(selectedChat?._id)
                      }
                      className="flex items-center gap-1 rounded-sm hover:text-red-600 border py-1 px-2 cursor-pointer hover:border-red-500 transition-all duration-300"
                    >
                      <span>
                        <AiOutlineDelete className="h-5 w-5 " />
                      </span>
                      <span className="text-[15px] font-medium">Delete</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Section shidden */}

            <div
              id="message-Container"
              className="flex-grow overflow-y-auto h-full min-h-[60vh] sm:max-h-[50vh] 3xl:min-h-[90vh]  flex flex-col gap-1 bg-white  px-2 py-2"
            >
              {messageLoad ? (
                <MessageLoader />
              ) : (
                <>
                  {chatMessages?.map((message) => (
                    <div
                      className={`flex items-start gap-1 max-w-[80%] sm:max-w-[50%] ${
                        message?.sender?._id === auth?.user?._id
                          ? "ml-auto flex-row-reverse"
                          : "mr-auto flex-row"
                      }`}
                      key={message?._id}
                    >
                      <div className="w-[2.5rem] h-[2.5rem]">
                        <div className="relative w-[2.2rem] h-[2.2rem] rounded-full overflow-hidden">
                          <Image
                            src={
                              message?.sender?.profileImage
                                ? message?.sender?.profileImage
                                : "/profile.png"
                            }
                            alt={`avatar`}
                            layout="fill"
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {message.contentType === "text" ? (
                          <div
                            className={`  rounded-lg text-[14px] px-3 py-[.5rem] mt-4 ${
                              message?.sender?._id === auth?.user?._id
                                ? "bg-sky-400 text-white rounded-tr-none"
                                : "bg-gray-200 text-black  rounded-tl-none"
                            }`}
                          >
                            <p>{message?.content}</p>
                          </div>
                        ) : message.contentType === "like" ? (
                          <div className="text-4xl">{message?.content}</div>
                        ) : message.contentType === "Image" ? (
                          <a
                            href={message?.content}
                            download
                            target="_blank"
                            className="relative mt-4  w-[13rem] h-[14rem] overflow-hidden cursor-pointer rounded-lg shadow-lg"
                          >
                            <Image
                              src={message?.content}
                              alt="Sent image"
                              layout="fill"
                              className="rounded-lg"
                            />
                          </a>
                        ) : message.contentType === "Video" ? (
                          <div className="relative mt-4 border  w-[14rem] h-fit overflow-hidden rounded-lg shadow-lg">
                            <video controls className="w-full h-fit rounded-lg">
                              <source src={message?.content} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : message.contentType === "Audio" ? (
                          <div className="flex items-center mt-4 w-[14rem] h-[3rem] p-1  rounded-lg">
                            <audio
                              controls
                              className="w-full h-full bg-transparent rounded-lg"
                            >
                              <source
                                src={message?.content}
                                type="audio/mpeg"
                              />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <a
                              href={message?.content}
                              download
                              target="_blank"
                              className="flex items-center gap-2 py-[.5rem] px-2 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-lg shadow-md"
                            >
                              <TbFileDownload className="h-5 w-5 text-white" />
                              <span className=" text-[14px]">
                                Download File
                              </span>
                            </a>
                          </div>
                        )}
                        <span className="text-[10px] text-gray-600  ">
                          {format(new Date(message?.createdAt), "hh:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Send Message Section */}
            <div className=" relative min-h-[3.4rem] max-h-[3.5rem] h-[2.4rem] flex items-center gap-4 bg-gray-100  px-2 py-2 ">
              <div className="relative">
                <span
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Open more options"
                  onClick={() => setIsShow(!isShow)}
                >
                  <BiSolidPlusCircle
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Open more options"
                    className=" w-5 h-5 sm:h-6 sm:w-6 text-sky-500 cursor-pointer"
                  />
                </span>
                {isShow && (
                  <div
                    ref={closeUploads}
                    className="absolute top-[-9rem] right-[-14rem] w-[14rem] flex flex-col gap-2 rounded-md bg-gray-50  border border-gray-300  py-3 px-3 z-10"
                  >
                    <label
                      htmlFor="images"
                      className="flex items-center gap-1 rounded-sm hover:text-sky-600 border py-1 px-2 cursor-pointer hover:border-sky-500 transition-all duration-300"
                    >
                      <span>
                        <PiImageDuotone className="h-5 w-5 " />
                      </span>
                      <span className="text-[15px] font-medium">
                        Upload Images
                      </span>

                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        onChange={(e) => {
                          fileType(
                            e.target.files[0],
                            handleSendfiles,
                            setLoading,
                            setIsShow
                          );
                        }}
                        className="hidden"
                      />
                    </label>

                    {/*  */}
                    <label
                      htmlFor="videos"
                      className="flex items-center gap-1 rounded-sm hover:text-sky-600 border py-1 px-2 cursor-pointer hover:border-sky-500 transition-all duration-300"
                    >
                      <span>
                        <AiTwotoneCamera className="h-5 w-5 " />
                      </span>
                      <span className="text-[15px] font-medium">
                        Upload Videos
                      </span>
                      <input
                        type="file"
                        id="videos"
                        accept="video/*"
                        onChange={(e) => {
                          fileType(
                            e.target.files[0],
                            handleSendfiles,
                            setLoading,
                            setIsShow
                          );
                        }}
                        className="hidden"
                      />
                    </label>
                    {/*  */}
                    <label
                      htmlFor="doucments"
                      className="flex items-center gap-1 rounded-sm hover:text-sky-600 border py-1 px-2 cursor-pointer hover:border-sky-500 transition-all duration-300"
                    >
                      <span>
                        <CgFileDocument className="h-5 w-5 " />
                      </span>
                      <span className="text-[15px] font-medium">
                        Upload Files
                      </span>
                      <input
                        type="file"
                        id="doucments"
                        accept=".pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .txt, .zip"
                        onChange={(e) => {
                          fileType(
                            e.target.files[0],
                            handleSendfiles,
                            setLoading,
                            setIsShow
                          );
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="relative">
                <span
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Select Emoji"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  <BsEmojiSunglasses className=" w-5 h-5  text-sky-500 cursor-pointer" />
                </span>
                {showEmoji && (
                  <div
                    ref={closeEmoji}
                    className="absolute top-[-21rem] right-[-18rem]  flex flex-col gap-2 rounded-md bg-gray-50  border border-gray-300 py-1 px-1 z-20"
                  >
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
              <div className="w-full h-full ">
                <form
                  onSubmit={handleSendMessage}
                  className="w-full h-full rounded-lg flex items-center gap-2"
                >
                  <input
                    type="text"
                    autoFocus
                    disabled={loading}
                    value={message}
                    onChange={typingHandler}
                    placeholder="Type your message here..."
                    className="w-full h-full px-4 rounded-[2rem] border outline-none focus:border-sky-500"
                  />
                  {message.length > 0 ? (
                    <button
                      type="submit"
                      className=""
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content="Press enter to send"
                    >
                      <IoSend
                        className={`h-6 w-6 text-sky-600 cursor-pointer`}
                      />
                    </button>
                  ) : (
                    <>
                      {loading ? (
                        <span className="">
                          <ImSpinner9 className="h-6 w-6 animate-spin text-sky-500" />
                        </span>
                      ) : (
                        <span
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Send a like"
                          onClick={() => {
                            handleSendLike();
                          }}
                        >
                          <AiFillLike
                            className={`h-6 w-6 text-red-600 cursor-pointer`}
                          />
                        </span>
                      )}
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NotChat setShow={setShow} show={show} />
      )}
    </div>
  );
}
