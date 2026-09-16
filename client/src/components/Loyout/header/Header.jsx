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

    assigningId,
    toggleAssignDropdown,
    handleAssignUser,
    users,

    isNotificationAllowed,

    categorizedNotifications, // NEW — list to render
    activeTab, // NEW
    setActiveTab, // NEW
    tabCounts, // NEW
    tabs, // NEW
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
    },
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    // Search logic here
  };

  return (
    <div className="w-full h-[3.2rem] bg-gray-200 font-inter ">
      <div className="w-full h-full flex items-center justify-between sm:px-4 px-6 py-2 max-md:pl-[4rem]">
        {/* Logo/Notification */}
        <div className="flex items-center gap-4" ref={notificationRef}>
          <div className="max-md:hidden">
            <img src="/logo.png" alt="Logo" className="h-[2.6rem] " />
          </div>

          {/* Notification */}
          <div className="relative mt-1">
            <div
              className="relative cursor-pointer "
              title="Notifications"
              onClick={() => setOpen(!open)}
            >
              <IoNotifications className="text-xl container text-black/80 " />
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
                // ...existing props
                assigningId={assigningId}
                toggleAssignDropdown={toggleAssignDropdown}
                handleAssignUser={handleAssignUser}
                users={users}
                openTicketId={openTicketId}
                setOpen={setOpen}
                ticketRef={ticketRef}
                categorizedNotifications={categorizedNotifications}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabCounts={tabCounts}
                tabs={tabs}
              />
            )}
          </div>

          {/* Search */}
          <div className="hidden md:flex ">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 z-10 pointer-events-none">
                <IoSearch className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="search"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => dispatch(setSearchValue(e.target.value))}
                className="w-[20rem]  h-[2rem] text-sm rounded-full pl-8 pr-4 outline-none border-none  focus:shadow-md     transition duration-200"
              />
            </form>
          </div>

          <GlobalTimer />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 zoom-out">
          <div className="flex items-center gap-2 ">
            {/* User Worked Time */}
            <UserWorkedTime />

            {/* User Activity / Online Users */}
            {auth?.user?.role?.name === "Admin" ? (
              <OnlineUsers />
            ) : (
              <UserActivity />
            )}

            {/* Quick Lists */}
            <span
              onClick={() => setShowQuickList(!showQuickList)}
              className="cursor-pointer max-md:hidden"
            >
              <CgList className="text-2xl container text-black" />
            </span>

            {/* Reminder Notifications */}
            <div
              className="relative max-md:hidden"
              ref={reminderNotificationRef}
            >
              <div
                className="relative cursor-pointer m-2"
                onClick={() =>
                  setShowReminderNotificationPanel(
                    !showReminderNotificationPanel,
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
