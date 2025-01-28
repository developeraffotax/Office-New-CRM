"use client";
import MainLayout from "@/app/components/layout/MainLayout";
import Chats from "@/app/components/messages/Chats";
import MessagesData from "@/app/components/messages/Messages";
import Search from "@/app/components/messages/Search";
import { useAuth } from "@/app/context/authContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiFillDelete } from "react-icons/ai";
import { IoAddOutline, IoSearch } from "react-icons/io5";
import { BsChatLeftText } from "react-icons/bs";
import { BsChatLeftTextFill } from "react-icons/bs";

import socketIO from "socket.io-client";
const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const types = ["Response", "Unread"];

export default function Messages() {
  const { auth } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [active, setActive] = useState("All");
  const [rowSelection, setRowSelection] = useState({});
  const [chats, setChats] = useState([]);
  const [filterChat, setFilterChat] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const initialChatLoad = useRef(true);
  const [chatLoad, setChatLoad] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageLoad, setMessageLoad] = useState(false);
  const initialMessagesLoad = useRef(true);
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [isChat, setIsChat] = useState(window.innerWidth <= 770);

  useEffect(() => {
    const handleResize = () => {
      if (window?.innerWidth > 770) {
        setIsChat(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //---------- Fetch Chat Users--------->
  const fetchChats = async () => {
    if (initialChatLoad.current) {
      setChatLoad(true);
    }
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/chat/fetch/${auth?.user?._id}`
      );
      if (data) {
        setChats(data.results);
      }
    } catch (error) {
      console.error("Error fetching chats:", error?.response?.data?.message);
    } finally {
      if (initialChatLoad.current) {
        setChatLoad(false);
        initialChatLoad.current = false;
      }
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [auth.user]);

  useEffect(() => {
    // Listen for user online status updates
    socketId.emit("newUserData", (userData) => {
      console.log("newUserData", userData);
      if (userData.isOnline) {
        // Fetch chats whenever a new user comes online
        fetchChats();
      }
    });

    return () => {
      socketId.off("newUserData");
    };
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/all`
      );
      if (data) {
        setUsers(data.users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Handle Search
  const handleSearch = (value) => {
    setSearchValue(value);
    filterData(value, active);
  };

  useEffect(() => {
    setFilterChat(chats);
  }, [chats]);

  // -------------Handle filtering by tabs and search---------------
  const filterData = (search = searchValue, statusFilter = active) => {
    console.log("search:", search, "statusFilter:", statusFilter);
    let filtered = chats;

    if (statusFilter === "All" && !search) {
      setFilterChat(chats);
      return;
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((chat) => {
        const unreadCount = chat.unreadMessageCount[auth.user._id] || 0;
        return statusFilter === "Unread" ? unreadCount > 0 : unreadCount === 0;
      });
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();

      filtered = filtered.filter((chat) => {
        const { chatName = "", users = [] } = chat;
        const userNames = users
          .map((user) => user.name.toLowerCase())
          .join(" ");
        return (
          chatName.toLowerCase().includes(lowercasedSearch) ||
          userNames.includes(lowercasedSearch)
        );
      });
    }

    setFilterChat(filtered);
  };

  // Handle Tab Click
  const handleTabClick = (tab) => {
    setActive(tab);
    filterData(searchValue, tab);
  };

  // -------------------------Message-------------->
  const fetchMessages = async (e) => {
    if (!selectedChat) {
      return;
    }

    if (initialMessagesLoad.current) {
      setMessageLoad(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/all/${selectedChat?._id}/${auth?.user?._id}`
      );
      setChatMessages(data.messages);

      socketId.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      if (initialMessagesLoad.current) {
        setMessageLoad(false);
        initialMessagesLoad.current = false;
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    const handleFetchMessages = () => {
      fetchMessages();
    };

    socketId.on("fetchMessages", handleFetchMessages);

    return () => {
      socketId.off("fetchMessages", handleFetchMessages);
    };
    // eslint-disable-next-line
  }, [selectedChat]);

  return (
    <MainLayout title="Message - Sync AI">
      <div className="w-full h-[100%] relative rounded-md flex flex-col gap-2 sm:gap-4 pt-3 pb-1 px-2 sm:px-4 bg-[#fff] overflow-hidden overflow-y-auto shidden">
        {/* Search Bar */}
        <div className="flex items-start sm:items-end justify-between flex-col md:flex-row gap-4 ">
          <div className="flex items-center gap-4 md:gap-[5rem]">
            <h1 className="text-lg sm:text-2xl 3xl:text-3xl font-semibold text-texth1 uppercase">
              Messages
            </h1>
            <div className="relative w-[12rem] sm:w-[15rem] rounded-lg h-[2.2rem] sm:h-[2.4rem] bg-gray-100 ">
              <span className="absolute right-2 top-[5px] z-30 text-gray-400 hover:text-customBrown p-1 hover:bg-gray-200 rounded-lg ">
                <IoSearch className="h-5 w-5 cursor-pointer" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-full border-none bg-transparent active:outline outline-customBrown rounded-lg pl-2 pr-5 text-[14px]"
              />
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="w-full flex items-start justify-between flex-col md:flex-row gap-2 sm:gap-4">
          <div className="w-full overflow-x-auto py-1 px-1 sm:px-0 sm:py-0 shidden">
            <div className=" relative flex items-center gap-3 sm:gap-4 w-full overflow-x-auto shidden ">
              {/* All Users Button */}
              <button
                className={`min-w-[6rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[13px] 2xl:text-[15px] rounded-lg transition-all duration-300 ease-in-out ${
                  active === "All"
                    ? "bg-customBrown text-white"
                    : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                }`}
                onClick={() => handleTabClick("All")}
              >
                All Messages
              </button>

              {/* Dynamic User Types Buttons */}
              {types?.map((type, index) => (
                <button
                  key={index}
                  className={`min-w-[6.5rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[14px] 2xl:text-[16px] rounded-lg transition-all duration-300 ease-in-out ${
                    active === type
                      ? "bg-customBrown text-white"
                      : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabClick(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/*  */}
          <div className="flex items-center w-full md:w-fit justify-end gap-5 ">
            <span className="block cursor-pointer md:hidden">
              {isChat ? (
                <BsChatLeftTextFill
                  className={`h-5 w-5 cursor-pointer transition-all duration-300 ease-in-out text-customBrown `}
                  onClick={() => setIsChat(false)}
                />
              ) : (
                <BsChatLeftText
                  className={`h-5 w-5 cursor-pointer transition-all duration-300 ease-in-out text-customBrown }`}
                  onClick={() => setIsChat(true)}
                />
              )}
            </span>
            <span
            // disabled={Object.keys(rowSelection).length === 0}
            // onClick={() => handleDeleteAllConfirmation()}
            >
              <AiFillDelete
                className={`h-5 w-5 cursor-pointer transition-all duration-300 ease-in-out ${
                  Object.keys(rowSelection).length > 0
                    ? "text-red-500 hover:text-red-600"
                    : "text-customBrown cursor-not-allowed"
                }`}
              />
            </span>
            <button
              onClick={() => setIsShow(true)}
              className={`w-[6.3rem] sm:w-[7.5rem] flex items-center justify-center h-[2rem] sm:h-[2.3rem] text-[14px] 2xl:text-[16px] rounded-lg transition-all duration-300 ease-in-out bg-customBrown text-white gap-1 `}
            >
              <IoAddOutline className="h-4 w-4" /> Add New
            </button>
          </div>
        </div>
        {/* ---------------------Chats List------------------------ */}
        <div className="relative w-full h-full rounded-lg grid grid-cols-6 gap-2">
          <div
            className={` ${
              isChat
                ? "absolute top-[0rem] left-0 z-[99] min-w-[18rem] min-h-[20rem] max-[26rem] "
                : "hidden"
            } md:block col-span-2 bg-white overflow-x-auto rounded-lg shadow-md border drop-shadow-md shadow-gray-200 py-2 px-3 `}
          >
            <Chats
              chats={filterChat}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              chatLoad={chatLoad}
              setShow={setShow}
            />
          </div>

          <div className="col-span-6 md:col-span-4 bg-white rounded-lg  shadow-md border drop-shadow-md shadow-gray-200 overflow-hidden">
            <MessagesData
              messageLoad={messageLoad}
              chatMessages={chatMessages}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              setShow={setShow}
              show={show}
              fetchMessages={fetchMessages}
              fetchChats={fetchChats}
              fetchUsers={fetchUsers}
              setChats={setChats}
            />
          </div>
        </div>
        {/* --------------Add User------------- */}
        {isShow && (
          <div className="fixed w-full h-full top-0 left-0 bg-white/80 bg-opacity-50 z-[99] flex items-center justify-center">
            <div className="w-[28rem]">
              <Search
                friends={users}
                getAllChats={fetchChats}
                setIsShow={setIsShow}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
