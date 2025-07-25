import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
import { format } from "timeago.js";
import { useAuth } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosTimer } from "react-icons/io";
import { MdOutlineTimerOff } from "react-icons/md";
import { TbBellRinging } from "react-icons/tb";
import { CgList } from "react-icons/cg";
import { FaStopwatch } from "react-icons/fa6";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"], });

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

export default function Header({
  reminderData,
  setShowQuickList,
  showQuickList,
  getQuickList,
}) {
  const { auth, setAuth, setFilterId, time, searchValue, setSearchValue } =
    useAuth();
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
  const notificationRef = useRef(null);
  const timerStatusRef = useRef(null);
  const [showReminder, setShowReminder] = useState(false);


  



  useEffect(() => {
    if (audio) {
      audio.load();
    }
    socketId.emit("notification", {
      title: "New Job Assigned",
    });
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
  const getNotifications = useCallback(async () => {
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/get/notification/${auth.user.id}`
      );
      setNotificationData(data.notifications);
    } catch (error) {
      console.log(error);
    }
  }, []);



  // Player
  // const notificationPlayer = () => {
  //   if (audio) {
  //     audio.play().catch((error) => {
  //       console.log("Audio play failed: ", error);
  //     });
  //   }
  // };

  useEffect(() => {
    getNotifications();
    // eslint-disable-next-line
  }, [auth.user]);

  useEffect(() => {
    if (!socketId) {
      return;
    }

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

        // ✅ Trigger localStorage event so other tabs update too
      localStorage.setItem("notification-sync", Date.now().toString());
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

        // ✅ Trigger localStorage event so other tabs update too
      localStorage.setItem("notification-sync", Date.now().toString());
      }
    } catch (error) {
      console.log(error);
    }
  };










  useEffect(() => {
  const handleStorageEvent = (event) => {
    if (event.key === "notification-sync") {
      console.log("🔁 Notification updated in another tab");
      getNotifications(); // ✅ refresh in this tab
    }
  };

  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("storage", handleStorageEvent);
  };
}, [getNotifications]);






  // Handle Close Notification
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpen(false);
        setShowReminder(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close Timer Status to click anywhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timerStatusRef.current &&
        !timerStatusRef.current.contains(event.target)
      ) {
        setShowTimerStatus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Delete Reminders
  const deleteReminder = async (id) => {
    if (!auth.user) {
      return;
    }
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/delete/reminder/${id}`
      );
    } catch (error) {
      console.log(error);
    }
  };






  //   useEffect(() => {
       
  //     if (!auth?.user?.id) return;
  
  //     const id = auth.user.id;
  //     socketId.emit("userConnected", id);

  
  //     // return () => {
  //     //   socketId.disconnect();
  //     // };
  //   }, [auth]);



  // useEffect(() => {

  //   if (!socketId) {
  //     return;
  //   }


  //     socketId.on('newTicketNotification', (data) => {
  //       console.log("New Ticket Notification:💛🧡💚💚", data);
  //     getNotifications();
      
  //   })

  //   // return () => {
  //   //   socketId.disconnect();
  //   // }
    

  // }, []);


    const userId = auth?.user?.id;


    useEffect(() => {

      console.log("SocketId initialized:", socketId);
      console.log("User ID:", userId);
    // Check if userId and socketId are available
    if (!userId || !socketId) return;

    // Connect and register

      // Connect only if not already connected
      if (!socketId.connected) {
        socketId.connect();
        console.log("🔌 Socket connected");
      }
    socketId.emit("userConnected", userId);
    console.log("✅ SocketId connected with user:", userId);

    const handleNotification = (data) => {
      console.log("📥 New Ticket Notification:", data);
      getNotifications();
    };

    socketId.on("newTicketNotification", handleNotification);

    // Cleanup on unmount or user change
    return () => {
      socketId.off("newTicketNotification", handleNotification);
      //socketId.disconnect();
      console.log("🛑 Socket disconnected");
    };
  }, [userId, getNotifications]);




  return (
    <div className="w-full h-[3.8rem] bg-gray-200">
      <div className="w-full h-full flex items-center justify-between sm:px-4 px-6 py-2">
        {/* Logo/Notification */}
        <div className="flex items-center gap-4" ref={notificationRef}>
          <Link to={"/dashboard"} className="">
            <img src="/logo.png" alt="Logo" className="h-[3.3rem] w-[8rem]" />
          </Link>
          {/* ------------Notification-----> */}
          <div className="relative mt-1">
            <div
              className="relative cursor-pointer m-2"
              onClick={() => {
                getNotifications();
                setOpen(!open);
              }}
            >
              <IoNotifications className="text-2xl container text-black " />
              {notificationData.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                  {notificationData && notificationData.length}
                </span>
              )}
            </div>
            {open && (
              <div className="shadow-xl  bg-gray-100 absolute z-[999] top-[2rem] left-[1.6rem] rounded-md overflow-hidden">
                <h5 className="text-[20px] text-center font-medium text-black bg-orange-400  p-3 font-Poppins">
                  Notifications
                </h5>
                <div className="w-[350px] min-h-[40vh] max-h-[60vh]  overflow-y-scroll   ">
                  {notificationData &&
                    notificationData?.map((item, index) => (
                      <div
                        key={index}
                        className="dark:bg-[#2d3a4ea1] bg-[#00000013] hover:bg-gray-300 transition-all duration-200 font-Poppins border-b dark:border-b-[#ffffff47] border-b-[#fff]"
                      >
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
                          to={`${item?.redirectLink}?comment_taskId=${item?.taskId}`}
                          key={item?._id}
                          onClick={() => {
                            setFilterId(item?.taskId);
                            updateNotification(item._id);
                          }}
                          className="cursor-pointer"
                        >
                          <p className="p-2 text-gray-700  text-[14px] whitespace-pre-line">
                            {item?.description}
                          </p>

                          {/* {item?.companyName && ( <p className="px-2 text-gray-800 text-[13px]"> <span className="font-medium">Company Name:</span> {item.companyName} </p> )} */}

          {item?.clientName && ( <p className="px-2 text-gray-800 text-[13px]"> <span className="font-medium">Client Name:</span> {item.clientName} </p> )}


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

          <div className=" hidden sm:flex ml-[1rem]">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute top-[.6rem] left-2 z-2">
                <IoSearch className="h-5 w-5 text-orange-500" />
              </span>
              <input
                type="search"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-[20rem] sm:w-[32rem]  h-[2.7rem] rounded-[2.5rem] pl-8 pr-3 outline-none border-[1.5px] border-gray-400 focus:border-orange-600"
              />
            </form>
          </div>
        </div>

        {/* Search */}

        {/* end */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* --------Timer Status------ */}
            <div className="relative" ref={timerStatusRef}>
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
                  <h5 className="text-[20px] bg-orange-600 text-center font-medium flex items-center justify-center text-white  p-2 font-Poppins">
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
            {/* --------Quick Lists------ */}
            <span
              onClick={() => {
                // getQuickList();
                setShowQuickList(!showQuickList);
              }}
            >
              <CgList className="text-2xl container text-black " />
            </span>
            {/* --------Notifications------ */}
            <div className="relative">
              <div
                className="relative cursor-pointer m-2"
                onClick={() => {
                  setShowReminder(!showReminder);
                }}
              >
                <TbBellRinging className="text-2xl container text-black " />
                {reminderData.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                    {reminderData && reminderData.length}
                  </span>
                )}
              </div>
              {showReminder && (
                <div
                  ref={notificationRef}
                  className="shadow-xl  bg-gray-100 absolute z-[999] top-[2rem] right-[1.6rem] rounded-md "
                >
                  <h5 className=" relative text-[20px] text-center font-medium rounded-tl-md text-white bg-orange-600  p-3 font-Poppins">
                    Reminders
                    <div className="absolute right-[.5rem] top-[-1rem] animate-shake z-10">
                      <img
                        src="/reminder.png"
                        alt="reminder"
                        className="h-[5rem] w-[5rem]"
                      />
                    </div>
                  </h5>
                  <div className="w-[350px] flex flex-col gap-2 p-1 min-h-[30vh] max-h-[60vh]  overflow-y-auto   ">
                    {reminderData &&
                      reminderData?.map((item, index) => (
                        <div
                          key={index}
                          className="dark:bg-[#2d3a4ea1] rounded-sm hover:shadow-md bg-[#00000013] hover:bg-gray-300 transition-all duration-200 font-Poppins border-b dark:border-b-[#ffffff47] border-b-[#fff]"
                        >
                          <div className="w-full relative flex items-center justify-between p-2">
                            <p className="text-black text-[15px] font-medium ">
                              {item?.title}
                            </p>
                            {/* <p
                              className="text-red-500 absolute top-2 right-1 hover:text-red-600 transition-all duration-200  cursor-pointer"
                              onClick={() => deleteReminder(item._id)}
                            >
                              <BiSolidBellMinus className="h-6 w-6 cursor-pointer " />
                            </p> */}
                          </div>
                          <Link
                            to={item?.redirectLink}
                            key={item?._id}
                            onClick={() => setFilterId(item?.taskId)}
                            className="cursor-pointer"
                          >
                            <p className="p-2 text-gray-700  text-[14px]">
                              <strong className="text-black font-medium text-[15px]">
                                Description:
                              </strong>
                              {item?.description}
                            </p>
                          </Link>
                        </div>
                      ))}

                    {reminderData.length === 0 && (
                      <div className="w-full h-[30vh] text-[14px] text-black  flex items-center justify-center flex-col">
                        <img
                          src="/rb_616.png"
                          alt="notfound"
                          className="h-[8rem] w-[8rem] animate-pulse"
                        />
                        Reminder not available!.
                      </div>
                    )}
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
                    to={"/employee/dashboard"}
                    className="font-medium text-[16px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={"/profile"}
                    className="font-medium text-[16px]  w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
                  >
                    Profile
                  </Link>
                  <span
                    onClick={handleLogout}
                    className="font-medium text-[16px]  w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
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
