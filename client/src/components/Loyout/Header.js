// import React, { useCallback, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import { IoArrowBackOutline, IoSearch } from "react-icons/io5";
// import { IoNotifications } from "react-icons/io5";
// import { format } from "timeago.js";

// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { IoIosTimer } from "react-icons/io";
// import { MdDelete, MdDeleteOutline, MdOutlineTimerOff } from "react-icons/md";
// import { TbBellRinging } from "react-icons/tb";
// import { CgList } from "react-icons/cg";
// import { FaStopwatch } from "react-icons/fa6";

// import ReminderNotifications from "./ReminderNotificaitons";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setAuth,
//   setFilterId,
//   setSearchValue,
// } from "../../redux/slices/authSlice";

// import {
//   getRemindersCount,
//   setShowReminder,
// } from "../../redux/slices/reminderSlice";
// import { useSocket } from "../../context/socketProvider";
// import {
//   dismissAllNotification,
//   dismissNotification,
//   getNotifications,
//   updateAllNotification,
//   updateNotification,
// } from "../../redux/slices/notificationSlice";
// import OnlineUsers from "../../utlis/OnlineUsers";

// import Overview from "./overview/Overview";
// import UserActivity from "./UserActivity";
// import UserWorkedTime from "./UserWorkedTime";
// import EmailDetailDrawer from "../../pages/Tickets/EmailDetailDrawer";
// import { LuEye } from "react-icons/lu";
// import { generateUrl } from "../../utlis/generateUrl";
// import GlobalTimer from "../GlobalTimer";
 
// import { openTicketModal } from "../../redux/slices/ticketModalSlice";

// const formatElapsedTime = (createdAt) => {
//   const now = new Date();
//   const createdTime = new Date(createdAt);
//   const diffInMinutes = Math.floor((now - createdTime) / (1000 * 60));

//   if (diffInMinutes < 1) {
//     return "0m";
//   } else if (diffInMinutes < 60) {
//     return `${diffInMinutes}m`;
//   } else {
//     const diffInHours = Math.floor(diffInMinutes / 60);
//     return `${diffInHours}h`;
//   }
// };

// export default function Header({
//   setShowQuickList,
//   showQuickList,
//   getQuickList,
// }) {
//   const socket = useSocket();

//   const navigate = useNavigate();

//   const notificationRef = useRef(null);
//   const reminderNotificationRef = useRef(null);
//   const timerStatusRef = useRef(null);

//   const dispatch = useDispatch();

//   const auth = useSelector((state) => state.auth.auth);
//   const { settings } = useSelector((state) => state.settings);

//   const { showCrmNotifications = true, showEmailNotifications = true } =
//     settings || {};

//   const isNotificationAllowed = (notificationType) => {
//     if (notificationType === "ticket_received") {
//       return showEmailNotifications;
//     }
//     return showCrmNotifications;
//   };
//   const searchValue = useSelector((state) => state.auth.searchValue);
//   const unread_reminders_count = useSelector(
//     (state) => state.reminder.unread_reminders_count
//   );

//   const [open, setOpen] = useState(false);
//   const [show, setShow] = useState(false);
//   const [userInfo, setUserInfo] = useState([]);
//   const [timerStatus, setTimerStatus] = useState([]);
//   const [showTimerStatus, setShowTimerStatus] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // const [notificationData, setNotificationData] = useState([]);
//   const ticketRef = useRef(null);
//   const [openTicketId, setOpenTicketId] = useState(null);

//   const handleNotificationClick = (item) => {
//     // mark as read
//     dispatch(
//       updateNotification({
//         id: item._id,
//         userId: auth.user.id,
//         status: item.status,
//       })
//     );

//     // 🎫 Ticket received → open drawer
//     if (item.type === "ticket_received") {
//       setOpenTicketId(item.taskId); // whichever you use

//       return;
//     }

//     // 🔗 default navigation
//     navigate(`${item.redirectLink}?comment_taskId=${item.taskId}`);
//     dispatch(setFilterId(item.taskId));
//     setOpen(false);
//   };

//   const handleDismissNotification = (item) => {
//     // mark as read
//     dispatch(
//       dismissNotification({
//         id: item._id,
//         userId: auth.user.id,
//       })
//     );
//   };

//   const notificationData = useSelector(
//     (state) => state.notifications.notificationData
//   );
//   const [showReminderNotificationPanel, setShowReminderNotificationPanel] =
//     useState(false);

//   const [userActivity, setUserActivity] = useState(null);

//   useEffect(() => {
//     const getUserActivity = async () => {
//       try {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/agent/activity`
//         );
//         setUserActivity(data?.user);
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     getUserActivity();
//   }, []);

//   const handleSearch = async () => {
//     try {
//     } catch (error) {
//       console.log(error);
//       toast.error("Error in search!");
//     }
//   };

//   //    Get User Info
//   const getUserInfo = async () => {
//     try {
//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${auth.user.id}`
//       );
//       setUserInfo(data?.user);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getUserInfo();

//     // eslint-disable-next-line
//   }, [auth.user]);

//   // Color
//   const userInitials = auth?.user?.name
//     ? auth?.user?.name?.slice(0, 1).toUpperCase()
//     : "";

//   const handleLogout = () => {
//     dispatch(setAuth({ ...auth, user: null, token: "" }));
//     localStorage.removeItem("auth");
//     navigate("/");
//   };

//   // -----------Get Timer_Task_Status------
//   const getTimerStatus = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/timer/get/timer_task/Status/${auth.user.id}`
//       );
//       setTimerStatus(data.timerStatus);
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (auth?.user?.id) {
//       dispatch(getNotifications(auth.user.id));
//     }

//     dispatch(getRemindersCount());

//     getTimerStatus();
//   }, [auth.user, dispatch, settings]);

//    // 🧠 Leader election
//   const leaderChannelRef = useRef(null);
//   const isLeaderRef = useRef(false);
  
// const notificationSound = useRef(null);
// const reminderSound = useRef(null);

// useEffect(() => {
//   notificationSound.current = new Audio("/noti.mp3");
//   reminderSound.current = new Audio("/reminder.wav");
// }, []);


//   /* ---------------- Leader Election ---------------- */
//   useEffect(() => {
//     leaderChannelRef.current = new BroadcastChannel("notification-leader");

//     const becomeLeader = () => {
//       isLeaderRef.current = true;
//       leaderChannelRef.current.postMessage({ type: "LEADER_ACTIVE" });
//     };

//     const timer = setTimeout(becomeLeader, 300);

//     leaderChannelRef.current.onmessage = (e) => {
//       if (e.data?.type === "LEADER_ACTIVE") {
//         isLeaderRef.current = false;
//         clearTimeout(timer);
//       }
//     };

//     return () => {
//       leaderChannelRef.current.close();
//       clearTimeout(timer);
//     };
//   }, []);
//     /* ---------------- Notification Permission ---------------- */
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission();
//     }
//   }, []);


// useEffect(() => {
//   if (!socket || !auth?.user?.id) return;

//   const handleNewTimer = () => getTimerStatus();

//   const handleNewNotification = (payload) => {
//     const notification = payload?.notification;
//     if (!notification) return;

//     if (!isNotificationAllowed(notification.type)) return;

//     // 🔄 Always sync redux in ALL tabs
//     dispatch(getNotifications(auth.user.id));

//     // 🔕 Non-leader tabs stop here
//     if (!isLeaderRef.current) return;

//     // 🔊 Sound (SAFE)
//     if (notificationSound.current) {
//       notificationSound.current.currentTime = 0;
//       notificationSound.current.play().catch(() => {});
//     }

//     // 🖥 Browser notification
//     if (Notification.permission === "granted") {
//       new Notification("New Notification", {
//         body: notification.title || "You have a new update",
//         icon: "/logo.png",
//         badge: "/logo.png",
//       });
//     }
//   };

//   const handleNewReminder = () => {
//     dispatch(getRemindersCount());

//     if (!isLeaderRef.current) return;

//     if (reminderSound.current) {
//       reminderSound.current.currentTime = 0;
//       reminderSound.current.play().catch(() => {});
//     }
//   };

//   socket.on("newTimer", handleNewTimer);
//   socket.on("newNotification", handleNewNotification);
//   socket.on("reminder:refresh", handleNewReminder);

//   return () => {
//     socket.off("newTimer", handleNewTimer);
//     socket.off("newNotification", handleNewNotification);
//     socket.off("reminder:refresh", handleNewReminder);
//   };
// }, [socket, settings, auth?.user?.id]);


 

//   const showReminder = useSelector((state) => state.reminder.showReminder);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (event.target.closest("#myModal")) {
//         return; // Clicked inside modal
//       }

//       // Close Notification
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(event.target)
//       ) {
//         setOpen(false);
//         // dispatch(setShowReminder(false));
//         setOpenTicketId(null);
//       }

//       if (ticketRef.current && !ticketRef.current.contains(event.target)) {
//         // dispatch(setShowReminder(false));
//         setOpenTicketId(null);
//       }

//       // Close Timer Status
//       if (
//         timerStatusRef.current &&
//         !timerStatusRef.current.contains(event.target)
//       ) {
//         setShowTimerStatus(false);
//       }

//       // Close Reminder Notification Panel
//       if (
//         reminderNotificationRef.current &&
//         !reminderNotificationRef.current.contains(event.target)
//       ) {
//         setShowReminderNotificationPanel(false);
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setOpen(false); // Close Notification
//         setOpenTicketId(null);

//         setShowTimerStatus(false);
//         setShowReminderNotificationPanel(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [dispatch]);

//   const unread_notifications_count = useSelector(
//     (state) =>
//       state.notifications.notificationData.filter(
//         (n) => n.status === "unread" && isNotificationAllowed(n.type)
//       ).length
//   );

//   const visibleNotifications = notificationData.filter((item) =>
//     isNotificationAllowed(item.type)
//   );





 


//   return (
//     <>
//       <div className="w-full h-[3.8rem] bg-gray-200">
//         <div className="w-full h-full flex items-center justify-between sm:px-4 px-6 py-2">
//           {/* Logo/Notification */}
//           <div className="flex items-center gap-4" ref={notificationRef}>
//             <Link to={"/dashboard"} className="">
//               <img src="/logo.png" alt="Logo" className="h-[3.3rem] w-[8rem]" />
//             </Link>
//             {/* ------------Notification-----> */}

//             <div className="relative mt-1 ">
//               <div
//                 className="relative cursor-pointer m-2"
//                 onClick={() => {
//                   getNotifications();
//                   setOpen(!open);
//                 }}
//               >
//                 <IoNotifications className="text-2xl container text-black " />
//                 {unread_notifications_count > 0 && (
//                   <span className="absolute -top-2 -right-2 bg-teal-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
//                     {unread_notifications_count}
//                   </span>
//                 )}
//               </div>
//               {open && (
//                 <div className="shadow-xl bg-gray-100 absolute z-[999] top-[2rem] left-[1.6rem] rounded-lg    ">
//                   <div
//                     className="border-b border-orange-500 px-8 py-3 flex items-center justify-between rounded-t-lg 
//                 bg-gradient-to-r from-orange-600 to-orange-400 shadow-md"
//                   >
//                     <button
//                       title="Clear all"
//                       onClick={() =>
//                         dispatch(dismissAllNotification(auth.user.id))
//                       }
//                       disabled={notificationData.length === 0}
//                       className="flex items-center justify-center w-9 h-9 rounded-lg 
//                bg-white/20 hover:bg-white/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
//                     >
//                       <MdDeleteOutline className="text-white w-5 h-5" />
//                     </button>

//                     <h5 className="text-[20px]   text-white ">Notifications</h5>

//                     <button
//                       title="Mark all as read"
//                       onClick={() =>
//                         dispatch(updateAllNotification(auth.user.id))
//                       }
//                       disabled={notificationData.length === 0}
//                       className="flex items-center justify-center w-9 h-9 rounded-lg 
//                bg-white/20 hover:bg-white/30 transition disabled:opacity-60 disabled:cursor-not-allowed "
//                     >
//                       <LuEye className="text-white w-5 h-5" />
//                     </button>
//                   </div>

//                   <div className="w-[380px]  h-[50vh] overflow-y-auto bg-white  shadow-lg border border-gray-200 rounded-b-lg">
//                     {visibleNotifications?.length > 0 ? (
//                       visibleNotifications.map((item) => {
//                         const isRead = item.status === "read";

//                         return (
//                           <div
//                             key={item._id}
//                             className={`group border-b last:border-b-0 transition-all
//                                   ${
//                                     isRead
//                                       ? "bg-gray-50"
//                                       : "bg-sky-50 hover:bg-sky-100"
//                                   }
//                                 `}
//                           >
//                             {/* Header */}
//                             <div className="flex items-start justify-between px-4 pt-3">
//                               <div className="flex items-center gap-2">
//                                 {!isRead && (
//                                   <span className="h-2 w-2 rounded-full bg-sky-500  " />
//                                 )}
//                                 <p className="text-sm font-semibold text-gray-800">
//                                   {item.title}
//                                 </p>
//                               </div>

//                               {!isRead && (
//                                 <button
//                                   onClick={() =>
//                                     dispatch(
//                                       updateNotification({
//                                         id: item._id,
//                                         userId: auth.user.id,
//                                       })
//                                     )
//                                   }
//                                   className="text-xs text-sky-600 hover:text-sky-700 font-medium"
//                                 >
//                                   Mark as read
//                                 </button>
//                               )}
//                             </div>

//                             {/* Content */}
//                             <div className="block px-4 pb-4 pt-2 ">
//                               <div
//                                 onClick={() => handleNotificationClick(item)}
//                                 className="cursor-pointer"
//                               >
//                                 <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
//                                   {item.description}
//                                 </p>

//                                 {item.clientName && (
//                                   <p className="mt-2 text-xs text-gray-500">
//                                     <span className="font-medium text-gray-700">
//                                       Client:
//                                     </span>{" "}
//                                     {item.clientName}
//                                   </p>
//                                 )}
//                               </div>

//                               <div className="w-full flex justify-between items-center gap-4 mt-2">
//                                 <p className="text-xs text-gray-400">
//                                   {format(item.createdAt)}
//                                 </p>

//                                 <div className="flex items-center gap-2">
//                                   <span
//                                     title="Dismiss Notification"
//                                     onClick={() =>
//                                       handleDismissNotification(item)
//                                     }
//                                     className="cursor-pointer text-xl text-red-500 hover:text-red-600 "
//                                   >
//                                     <MdDeleteOutline />
//                                   </span>

//                                   {
//                                     item.type === "ticket_received" ? 
//                                     <button  className="cursor-pointer text-xl text-sky-500 hover:text-sky-600 "  onClick={() => {dispatch(openTicketModal(item?.taskId)); setOpen(false)}}> <LuEye /></button>
//                                     :
//                                     <Link title="View Details" to={`${item?.redirectLink}?comment_taskId=${item?.taskId}`} key={item?._id} onClick={() => { dispatch(setFilterId(item?.taskId)); dispatch( updateNotification({ id: item._id, userId: auth.user.id, status: item.status, }) ); setOpen(false); }} className="cursor-pointer text-xl text-sky-500 hover:text-sky-600 " > <LuEye /> </Link>

//                                   }


//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className=" h-full  flex flex-col items-center justify-center text-gray-500 gap-2">
//                         <span className="text-2xl">🔔</span>
//                         <p className="text-sm font-medium">
//                           You're all caught up 🎉
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                   {/* 
//                   <div
//                     className="w-full   bg-gray-100    px-4 flex  items-center justify-between"
                    
//                   >

//                     <button

//                     onClick={() =>
//                       dispatch(dismissAllNotification(auth.user.id))
//                     }
//                       disabled={notificationData.length === 0}
//                       className={`text-[14px] py-2 cursor-pointer text-red-500 hover:text-red-600 disabled:cursor-not-allowed  ${
//                         notificationData.length === 0 && "cursor-not-allowed"
//                       }`}
//                     >
//                       Clear All
//                     </button>


//                     <button

//                     onClick={() =>
//                       dispatch(updateAllNotification(auth.user.id))
//                     }
//                       disabled={notificationData.length === 0}
//                       className={`text-[14px] py-2 cursor-pointer text-sky-500 hover:text-sky-600 disabled:cursor-not-allowed  ${
//                         notificationData.length === 0 && "cursor-not-allowed"
//                       }`}
//                     >
//                       Mark all as read
//                     </button>
//                   </div> */}

//                   {/* 🎫 Email preview popup */}
//                   {openTicketId && (
//                     <div
//                       ref={ticketRef}
//                       className="
//         absolute
//         left-full
//         top-0
//         ml-3
//         w-[520px]
//         h-full
//         bg-white
//         shadow-2xl
//         rounded-2xl
//         overflow-hidden
//         border
//         z-[999999]
//       "
//                     >
//                       <EmailDetailDrawer
//                         id={openTicketId}
//                         setTicketSubject={() => {}}
//                         isReplyModalOpenCb={() => {}}
//                         setEmailData={() => {}}
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className=" hidden sm:flex ml-[1rem]">
//               <form onSubmit={handleSearch} className="relative">
//                 <span className="absolute top-[.6rem] left-2 z-2">
//                   <IoSearch className="h-5 w-5 text-orange-500" />
//                 </span>
//                 <input
//                   type="search"
//                   placeholder="Search"
//                   value={searchValue}
//                   onChange={(e) => dispatch(setSearchValue(e.target.value))}
//                   className="w-[20rem] sm:w-[32rem]  h-[2.7rem] rounded-[2.5rem] pl-8 pr-3 outline-none border-[1.5px] border-gray-400 focus:border-orange-600"
//                 />
//               </form>
//             </div>

//             <GlobalTimer />
//           </div>

//           {/* Search */}

//           {/* end */}
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               {/* --------Timer Status------ */}

//               <UserWorkedTime />

//               {auth?.user?.role?.name === "Admin" ? (
//                 <OnlineUsers />
//               ) : (
//                 <UserActivity />
//               )}

//               <div className="relative" ref={timerStatusRef}>
//                 <div className="flex items-center">
//                   <div
//                     className="relative cursor-pointer m-2"
//                     onClick={() => {
//                       setShowTimerStatus(!showTimerStatus);
//                       getTimerStatus();
//                     }}
//                   >
//                     <FaStopwatch
//                       className={`text-2xl container  ${
//                         timerStatus
//                           ? "text-red-500 animate-pulse"
//                           : "text-black "
//                       } `}
//                     />
//                     <span
//                       className={`absolute top-[.4rem] right-[3px] bg-black ${
//                         timerStatus ? "bg-red-500 animate-pulse" : "bg-black "
//                       } rounded-full w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center `}
//                     >
//                       {timerStatus ? "1" : "0"}
//                     </span>
//                   </div>
//                   {timerStatus && !loading ? (
//                     <span className="text-[12px] font-semibold translate-x-[-.4rem]">
//                       {formatElapsedTime(timerStatus?.createdAt)}
//                     </span>
//                   ) : (
//                     <span className="text-[12px] font-semibold translate-x-[-.4rem]">
//                       0m
//                     </span>
//                   )}
//                 </div>

//                 {showTimerStatus && (
//                   <div className="w-[370px] min-h-[20vh] max-h-[60vh]  overflow-y-auto border border-gray-300  pb-2 shadow-xl  bg-gray-100 absolute z-[999] top-[2rem] right-[1.6rem] rounded">
//                     <h5 className="text-[20px] bg-orange-600 text-center font-medium flex items-center justify-center text-white  p-2 font-Poppins">
//                       <IoIosTimer
//                         className={`h-9 w-9 text-sky-500  ${
//                           timerStatus && "animate-spin"
//                         }`}
//                       />
//                       Timer Status
//                     </h5>
//                     <hr className="h-[1px] w-full bg-gray-400 my-2" />
//                     {timerStatus ? (
//                       <Link
//                         to={timerStatus.taskLink}
//                         onClick={() => setFilterId(timerStatus?.taskId)}
//                       >
//                         <div className="px-2">
//                           <div className="  bg-[#00000013] rounded-md  hover:bg-gray-300 font-Poppins border-b  border-b-[#fff]">
//                             <div className="w-full flex cursor-pointer items-center justify-between py-2 px-1">
//                               <div className="flex items-center gap-1">
//                                 <b className=" font-semibold text-[16px]">
//                                   {timerStatus?.pageName}:
//                                 </b>
//                                 <p className="py-[2px] px-5 rounded-[2rem] text-[14px] bg-sky-600 shadow-md text-white ">
//                                   {timerStatus?.taskName}
//                                 </p>
//                               </div>
//                             </div>
//                             {/* <div className="text-[20px] w-full text-orange-600 font-semibold text-center">
//                             {time}
//                           </div> */}
//                             <div className="w-full flex items-center justify-end">
//                               <p className="p-2 text-gray-600 text-[12px] ">
//                                 {format(timerStatus?.createdAt)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </Link>
//                     ) : (
//                       <div className="flex items-center justify-center w-full h-[4rem] bg-gray-300">
//                         <span className=" flex items-center justify-center gap-1 font-medium">
//                           <MdOutlineTimerOff className="h-6 w-6 text-red-500" />{" "}
//                           Timer is not running!
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//               {/* --------Quick Lists------ */}
//               <span
//                 onClick={() => {
//                   // getQuickList();
//                   setShowQuickList(!showQuickList);
//                 }}
//               >
//                 <CgList className="text-2xl container text-black " />
//               </span>
//               {/* --------Notifications------ */}
//               <div className="relative" ref={reminderNotificationRef}>
//                 <div
//                   className="relative cursor-pointer m-2"
//                   onClick={() => {
//                     setShowReminderNotificationPanel(
//                       !showReminderNotificationPanel
//                     );
//                   }}
//                 >
//                   <TbBellRinging className="text-2xl container text-black " />
//                   {unread_reminders_count > 0 && (
//                     <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
//                       {unread_reminders_count}
//                     </span>
//                   )}
//                 </div>
//                 {showReminderNotificationPanel && (
//                   <ReminderNotifications
//                     setShowReminderNotificationPanel={
//                       setShowReminderNotificationPanel
//                     }
//                   />
//                 )}
//               </div>

//               <Overview />
//             </div>

//             {/* ----------Profile Image-------- */}
//             <div className="relative">
//               <div
//                 // title={`${settings?.showNotifications ? "Active" : "Away"}`}
//                 className="w-[2.6rem] h-[2.6rem] cursor-pointer relative rounded-full bg-sky-600 overflow-hidden flex items-center justify-center text-white border-2 border-orange-600"
//                 onClick={() => setShow(!show)}
//               >
//                 {userInfo?.avatar ? (
//                   <img
//                     src={userInfo?.avatar ? userInfo?.avatar : "/profile1.jpeg"}
//                     alt={userInfo?.name?.slice(0, 1)}
//                   />
//                 ) : (
//                   <h3 className="text-[20px] font-medium uppercase">
//                     {userInfo?.name?.slice(0, 1)}
//                   </h3>
//                 )}
//               </div>
//               {/* <span
//                 className={`w-2 h-2 shadow inline-block ${
//                   settings?.showNotifications ? "bg-green-600" : "bg-gray-600"
//                 } rounded-full animate-pulse absolute right-[2px] bottom-[2px]`}
//               >
//                 {" "}
//               </span> */}
//               {/* Model */}
//               {show && (
//                 <div className="absolute w-[14rem] top-[2.6rem] right-[1.3rem] z-[999] py-2 px-1 rounded-md rounded-tr-none shadow-sm bg-white border">
//                   <ul className="flex flex-col gap-2 w-full transition-all duration-200">
//                     <Link
//                       to={"/employee/dashboard"}
//                       className="font-medium text-[16px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
//                     >
//                       Dashboard
//                     </Link>
//                     <Link
//                       to={"/profile"}
//                       className="font-medium text-[16px]  w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
//                     >
//                       Profile
//                     </Link>
//                     <span
//                       onClick={handleLogout}
//                       className="font-medium text-[16px]  w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
//                     >
//                       Logout
//                     </span>
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
