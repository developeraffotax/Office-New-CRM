import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
// import { MdEmail } from "react-icons/md";
import { format } from "timeago.js";
import { useAuth } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosTimer } from "react-icons/io";
import { MdOutlineTimerOff } from "react-icons/md";
import { FaStopwatch } from "react-icons/fa6";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, "0")}`;
  return color;
};

const formatElapsedTime = (createdAt) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now - createdTime) / (1000 * 60));

  if (diffInMinutes < 1) {
    return "0m";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h`;
  }
};

export default function Header() {
  const [search, setSearch] = useState("");
  const { auth, setAuth, setFilterId } = useAuth();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState([]);
  const [timerStatus, setTimerStatus] = useState([]);
  const [showTimerStatus, setShowTimerStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [audio] = useState(
    typeof window !== "undefined" ? new Audio("/level-up-191997.mp3") : null
  );

  useEffect(() => {
    if (audio) {
      audio.load();
    }
  }, [audio]);

  const handleSearch = async () => {
    try {
    } catch (error) {
      console.log(error);
      toast.error("Error in search!");
    }
  };

  //    Get User Info
  const getUserInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${auth.user.id}`
      );
      setUserInfo(data?.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserInfo();

    // eslint-disable-next-line
  }, [auth.user]);

  // Color
  const userInitials = auth?.user?.name
    ? auth?.user?.name?.slice(0, 1).toUpperCase()
    : "";

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/");
  };

  // -----------Get Timer_Task_Status------
  const getTimerStatus = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/get/timer_task/Status/${auth.user.id}`
      );
      setTimerStatus(data.timerStatus);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimerStatus();
    socketId.on("newTimer", () => {
      getTimerStatus();
    });

    return () => {
      socketId.off("newTimer", getTimerStatus);
    };
    // eslint-disable-next-line
  }, [auth.user, socketId]);

  // Get ALl User Notifications
  const getNotifications = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/get/notification/${auth.user.id}`
      );
      setNotificationData(data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  // Player
  // const notificationPlayer = () => {
  //   if (audio) {
  //     audio.play().catch((error) => {
  //       console.log("Audio play failed: ", error);
  //     });
  //   }
  // };

  // useEffect(() => {
  //   getNotifications();

  //   // eslint-disable-next-line
  // }, []);

  useEffect(() => {
    socketId.on("newNotification", () => {
      getNotifications();
      // notificationPlayer();
    });

    return () => {
      socketId.off("newNotification", getNotifications);
    };
    // eslint-disable-next-line
  }, [socketId]);

  // Update Notification
  const updateNotification = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/update/notification/${id}`
      );
      if (data) {
        getNotifications();
        toast.success("Notification updated!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update All Notifications
  const updateAllNotification = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/marks/all/${id}`
      );
      if (data) {
        getNotifications();
        toast.success("Notification updated!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[3.8rem] bg-gray-200">
      <div className="w-full h-full flex items-center justify-between sm:px-4 px-6 py-2">
        <Link to={"/dashboard"} className="">
          <img src="/logo.png" alt="Logo" className="h-[3.3rem] w-[8rem]" />
        </Link>
        {/* Search */}
        <div className=" hidden sm:flex">
          <form onSubmit={handleSearch} className="relative">
            <span className="absolute top-[.6rem] left-2 z-2">
              <IoSearch className="h-5 w-5 text-orange-500" />
            </span>
            <input
              type="search"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[20rem] h-[2.5rem] rounded-[2.5rem] pl-7 pr-3 outline-none border-[1.5px] border-gray-400 focus:border-orange-600"
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* --------Timer Status------ */}
            <div className="relative">
              <div className="flex items-center">
                <div
                  className="relative cursor-pointer m-2"
                  onClick={() => {
                    setShowTimerStatus(!showTimerStatus);
                    getTimerStatus();
                  }}
                >
                  <FaStopwatch
                    className={`text-2xl container  ${
                      timerStatus ? "text-red-500 animate-pulse" : "text-black "
                    } `}
                  />
                  <span
                    className={`absolute top-[.4rem] right-[3px] bg-black ${
                      timerStatus ? "bg-red-500 animate-pulse" : "bg-black "
                    } rounded-full w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center `}
                  >
                    {timerStatus ? "1" : "0"}
                  </span>
                </div>
                {timerStatus && !loading ? (
                  <span className="text-[12px] font-semibold translate-x-[-.4rem]">
                    {formatElapsedTime(timerStatus?.createdAt)}
                  </span>
                ) : (
                  <span className="text-[12px] font-semibold translate-x-[-.4rem]">
                    0m
                  </span>
                )}
              </div>

              {showTimerStatus && (
                <div className="w-[370px] min-h-[20vh] max-h-[60vh]  overflow-y-auto border border-gray-300  pb-2 shadow-xl  bg-gray-100 absolute z-[999] top-[2rem] right-[1.6rem] rounded">
                  <h5 className="text-[20px] bg-orange-400 text-center font-medium flex items-center justify-center text-white  p-2 font-Poppins">
                    <IoIosTimer
                      className={`h-9 w-9 text-sky-500  ${
                        timerStatus && "animate-spin"
                      }`}
                    />
                    Timer Status
                  </h5>
                  <hr className="h-[1px] w-full bg-gray-400 my-2" />
                  {timerStatus ? (
                    <Link
                      to={timerStatus.taskLink}
                      onClick={() => setFilterId(timerStatus?.taskId)}
                    >
                      <div className="px-2">
                        <div className="  bg-[#00000013] rounded-md  hover:bg-gray-300 font-Poppins border-b  border-b-[#fff]">
                          <div className="w-full flex cursor-pointer items-center justify-between py-2 px-1">
                            <div className="flex items-center gap-1">
                              <b className=" font-semibold text-[16px]">
                                {timerStatus?.pageName}:
                              </b>
                              <p className="py-[2px] px-5 rounded-[2rem] text-[14px] bg-sky-600 shadow-md text-white ">
                                {timerStatus?.taskName}
                              </p>
                            </div>
                          </div>
                          {/* <div className="text-[20px] w-full text-orange-600 font-semibold text-center">
                            {time}
                          </div> */}
                          <div className="w-full flex items-center justify-end">
                            <p className="p-2 text-gray-600 text-[12px] ">
                              {format(timerStatus?.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center w-full h-[4rem] bg-gray-300">
                      <span className=" flex items-center justify-center gap-1 font-medium">
                        <MdOutlineTimerOff className="h-6 w-6 text-red-500" />{" "}
                        Timer is not running!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* --------Notifications------ */}
            <div className="relative">
              <div
                className="relative cursor-pointer m-2"
                onClick={() => {
                  getNotifications();
                  setOpen(!open);
                }}
              >
                <IoNotifications className="text-2xl container text-black " />
                <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                  {notificationData && notificationData.length}
                </span>
              </div>
              {open && (
                <div className="shadow-xl  bg-gray-100 absolute z-[999] top-[2rem] right-[1.6rem] rounded-md overflow-hidden">
                  <h5 className="text-[20px] text-center font-medium text-black bg-orange-400  p-3 font-Poppins">
                    Notifications
                  </h5>
                  <div className="w-[350px] min-h-[40vh] max-h-[60vh]  overflow-y-scroll   ">
                    {notificationData &&
                      notificationData?.map((item, index) => (
                        <div className="dark:bg-[#2d3a4ea1] bg-[#00000013] hover:bg-gray-300 transition-all duration-200 font-Poppins border-b dark:border-b-[#ffffff47] border-b-[#fff]">
                          <div className="w-full flex items-center justify-between p-2">
                            <p className="text-black ">{item?.title}</p>
                            <p
                              className="text-sky-500 hover:text-sky-600 text-[14px] transition-all duration-200  cursor-pointer"
                              onClick={() => updateNotification(item._id)}
                            >
                              Mark as read
                            </p>
                          </div>
                          <Link
                            to={item?.redirectLink}
                            key={item?._id}
                            onClick={() => setFilterId(item?.taskId)}
                            className="cursor-pointer"
                          >
                            <p className="p-2 text-gray-700  text-[14px]">
                              {item?.description}
                            </p>
                            <p className="p-2 text-black  text-[14px] ">
                              {format(item?.createdAt)}
                            </p>
                          </Link>
                        </div>
                      ))}

                    {notificationData.length === 0 && (
                      <div className="w-full h-[30vh] text-black  flex items-center justify-center flex-col gap-2">
                        <span className="text-[19px]">🤯</span>
                        Notifications not available!.
                      </div>
                    )}
                  </div>
                  <div
                    className="w-full  cursor-pointer bg-gray-200    px-2 flex  items-center justify-end"
                    onClick={() => updateAllNotification(auth.user.id)}
                  >
                    <button
                      disabled={notificationData.length === 0}
                      className={`text-[14px] py-2 cursor-pointer text-sky-500 hover:text-sky-600 disabled:cursor-not-allowed  ${
                        notificationData.length === 0 && "cursor-not-allowed"
                      }`}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* ----------Profile Image-------- */}
          <div className="relative">
            <div
              className="w-[2.6rem] h-[2.6rem] cursor-pointer relative rounded-full bg-sky-600 overflow-hidden flex items-center justify-center text-white border-2 border-orange-600"
              onClick={() => setShow(!show)}
            >
              {userInfo?.avatar ? (
                <img
                  src={userInfo?.avatar ? userInfo?.avatar : "/profile1.jpeg"}
                  alt={userInfo?.name?.slice(0, 1)}
                />
              ) : (
                <h3 className="text-[20px] font-medium uppercase">
                  {userInfo?.name?.slice(0, 1)}
                </h3>
              )}
            </div>
            {/* Model */}
            {show && (
              <div className="absolute w-[14rem] top-[2.6rem] right-[1.3rem] z-[999] py-2 px-1 rounded-md rounded-tr-none shadow-sm bg-white border">
                <ul className="flex flex-col gap-2 w-full transition-all duration-200">
                  <Link
                    to={"/profile"}
                    className="font-medium text-[14px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
                  >
                    Profile
                  </Link>
                  <span
                    onClick={handleLogout}
                    className="font-medium text-[14px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
                  >
                    Logout
                  </span>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
