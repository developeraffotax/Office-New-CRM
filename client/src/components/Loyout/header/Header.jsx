import React, { useRef } from "react";
import { IoSearch, IoNotifications } from "react-icons/io5";
import { Link } from "react-router-dom";
import { TbBellRinging } from "react-icons/tb";
import { CgList } from "react-icons/cg";
import { FaStopwatch } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setSearchValue } from "../../../redux/slices/authSlice";

// Components
import ReminderNotifications from "../ReminderNotificaitons";
import OnlineUsers from "../../../utlis/OnlineUsers";
import Overview from "../overview/Overview";
import UserActivity from "../UserActivity";
import UserWorkedTime from "../UserWorkedTime";
import GlobalTimer from "../../GlobalTimer";
import NotificationPanel from "./NotificationPanel";
import TimerStatusPanel from "./TimerStatusPanel";
import ProfileDropdown from "./ProfileDropdown";

// Hooks
import { useNotifications } from "./useNotifications";
import { useTimerStatus, formatElapsedTime } from "./useTimerStatus";
import { useReminders } from "./useReminders";
import { useUserInfo } from "./useUserInfo";
import { useUserActivity } from "./useUserActivity";
import { useSocketNotifications } from "./useSocketNotifications";
import { useClickOutside } from "./useClickOutside";

export default function Header({
  setShowQuickList,
  showQuickList,
  getQuickList,
}) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.auth);
  const searchValue = useSelector((state) => state.auth.searchValue);

  // Refs
  const notificationRef = useRef(null);
  const reminderNotificationRef = useRef(null);
  const timerStatusRef = useRef(null);
  const ticketRef = useRef(null);

  // Custom hooks
  const {
    open,
    setOpen,
    openTicketId,
    setOpenTicketId,
    visibleNotifications,
    unread_notifications_count,
    handleNotificationClick,
    handleDismissNotification,
    handleDismissAll,
    handleMarkAllAsRead,
 
    isNotificationAllowed,
 
  } = useNotifications();

  const {
    timerStatus,
    showTimerStatus,
    setShowTimerStatus,
    loading,
    getTimerStatus,
  } = useTimerStatus();

  const {
    unread_reminders_count,
    showReminderNotificationPanel,
    setShowReminderNotificationPanel,
  } = useReminders();

  const { userInfo, show, setShow } = useUserInfo();
  const { userActivity } = useUserActivity();

  // Socket notifications
  useSocketNotifications(getTimerStatus, isNotificationAllowed);

  // Click outside handler
  useClickOutside(
    {
      notification: notificationRef,
      timerStatus: timerStatusRef,
      reminderNotification: reminderNotificationRef,
      ticket: ticketRef,
    },
    {
      notification: () => {
        setOpen(false);
        setOpenTicketId(null);
      },
      timerStatus: () => setShowTimerStatus(false),
      reminderNotification: () => setShowReminderNotificationPanel(false),
      ticket: () => setOpenTicketId(null),
    }
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    // Search logic here
  };

  return (
    <div className="w-full h-[3.8rem] bg-gray-200">
      <div className="w-full h-full flex items-center justify-between sm:px-4 px-6 py-2">
        {/* Logo/Notification */}
        <div className="flex items-center gap-4" ref={notificationRef}>
          <Link to={"/dashboard"}>
            <img src="/logo.png" alt="Logo" className="h-[3.3rem] w-[8rem]" />
          </Link>

          {/* Notification */}
          <div className="relative mt-1">
            <div
              className="relative cursor-pointer m-2"
              onClick={() => setOpen(!open)}
            >
              <IoNotifications className="text-2xl container text-black" />
              {unread_notifications_count > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center">
                  {unread_notifications_count}
                </span>
              )}
            </div>

            {open && (
              <NotificationPanel
                visibleNotifications={visibleNotifications}
                handleNotificationClick={handleNotificationClick}
                handleDismissNotification={handleDismissNotification}
                handleDismissAll={handleDismissAll}
                handleMarkAllAsRead={handleMarkAllAsRead}
               
                openTicketId={openTicketId}
                setOpen={setOpen}
                ticketRef={ticketRef}
              />
            )}
          </div>

          {/* Search */}
          <div className="hidden sm:flex ml-[1rem]">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute top-[.6rem] left-2 z-2">
                <IoSearch className="h-5 w-5 text-orange-500" />
              </span>
              <input
                type="search"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => dispatch(setSearchValue(e.target.value))}
                className="w-[20rem] sm:w-[32rem] h-[2.7rem] rounded-[2.5rem] pl-8 pr-3 outline-none border-[1.5px] border-gray-400 focus:border-orange-600"
              />
            </form>
          </div>

          <GlobalTimer />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* User Worked Time */}
            <UserWorkedTime />

            {/* User Activity / Online Users */}
            {auth?.user?.role?.name === "Admin" ? (
              <OnlineUsers />
            ) : (
              <UserActivity />
            )}

            {/* Timer Status */}
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
                    className={`text-2xl container ${
                      timerStatus
                        ? "text-red-500 animate-pulse"
                        : "text-black"
                    }`}
                  />
                  <span
                    className={`absolute top-[.4rem] right-[3px] ${
                      timerStatus ? "bg-red-500 animate-pulse" : "bg-black"
                    } rounded-full w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center`}
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
                <TimerStatusPanel
                  timerStatus={timerStatus}
                  setShowTimerStatus={setShowTimerStatus}
                />
              )}
            </div>

            {/* Quick Lists */}
            <span
              onClick={() => setShowQuickList(!showQuickList)}
              className="cursor-pointer"
            >
              <CgList className="text-2xl container text-black" />
            </span>

            {/* Reminder Notifications */}
            <div className="relative" ref={reminderNotificationRef}>
              <div
                className="relative cursor-pointer m-2"
                onClick={() =>
                  setShowReminderNotificationPanel(
                    !showReminderNotificationPanel
                  )
                }
              >
                <TbBellRinging className="text-2xl container text-black" />
                {unread_reminders_count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center">
                    {unread_reminders_count}
                  </span>
                )}
              </div>
              {showReminderNotificationPanel && (
                <ReminderNotifications
                  setShowReminderNotificationPanel={
                    setShowReminderNotificationPanel
                  }
                />
              )}
            </div>

            <Overview />
          </div>

          {/* Profile */}
          <ProfileDropdown userInfo={userInfo} show={show} setShow={setShow} />
        </div>
      </div>
    </div>
  );
}
