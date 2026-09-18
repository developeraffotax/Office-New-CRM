import React from "react";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { setFilterId } from "../../../redux/slices/authSlice";
import { updateNotification } from "../../../redux/slices/notificationSlice";
// import { openTicketModal } from "../../redux/slices/ticketModalSlice";
import EmailDetailDrawer from "../../../pages/Tickets/EmailDetailDrawer";
import { hasPermission, isAdmin } from "../../../utlis/checkPermission";
import { getNotificationCategory } from "./getNotificationCategory";
import { UsersList } from "./UsersList";

const NotificationPanel = ({
  visibleNotifications,
  categorizedNotifications, // NEW — list to render
  activeTab, // NEW
  setActiveTab, // NEW
  tabCounts, // NEW
  tabs, // NEW
  handleNotificationClick,
  handleDismissNotification,
  handleDismissAll,
  handleMarkAllAsRead,

  assigningId,
  toggleAssignDropdown,
  handleAssignUser,
  assignableUsers,
  users,

  openTicketId,
  setOpen,
  ticketRef,
}) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.auth);

  return (
    <div className="zoom-out shadow-xl bg-gray-100 fixed inset-x-2 top-14 sm:absolute sm:inset-auto sm:top-[2rem] sm:left-[1.6rem] z-[999] rounded-lg max-w-[380px] mx-auto sm:mx-0 w-[calc(100vw-1rem)] sm:w-[380px]">
      {/* Header */}
      <div className="border-b border-orange-500 px-4 sm:px-8 py-3 flex items-center justify-between rounded-t-lg bg-gradient-to-r from-orange-600 to-orange-400 shadow-md">
        <button
          title="Clear all"
          onClick={handleDismissAll}
          disabled={visibleNotifications.length === 0}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <MdDeleteOutline className="text-white w-5 h-5" />
        </button>

        <h5 className="text-[18px] sm:text-[20px] font-semibold text-white">
          Notifications
        </h5>

        <button
          title="Mark all as read"
          onClick={handleMarkAllAsRead}
          disabled={visibleNotifications.length === 0}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LuEye className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Category tabs */}
      {(hasPermission(auth.user, "Inbox") ||
        hasPermission(auth.user, "Whatsapp")) && (
        <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
          {tabs?.map((tab) => {
            const isActive = activeTab === tab.key;
            const unread = tabCounts?.[tab.key]?.unread || 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {unread > 0 && (
                  <span
                    className={`text-[10px] leading-none px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Notifications List Container */}
      <div className="w-full max-h-[70vh] sm:max-h-none sm:h-[50vh] overflow-y-auto bg-white shadow-lg border border-gray-200 rounded-b-lg">
        {categorizedNotifications?.length > 0 ? (
          categorizedNotifications.map((item) => {
            const isRead = item.status === "read";

            return (
              <div
                key={item._id}
                className={`group border-b last:border-b-0 transition-all ${
                  isRead ? "bg-gray-50" : "bg-sky-50 hover:bg-sky-100"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between px-3 sm:px-4 pt-3">
                  <div className="flex items-center gap-2 pr-2">
                    {!isRead && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-sky-500" />
                    )}
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                      {item.title}
                    </p>
                  </div>

                  {!isRead && (
                    <button
                      onClick={() =>
                        dispatch(
                          updateNotification({
                            id: item._id,
                            userId: auth.user.id,
                          })
                        )
                      }
                      className="text-[11px] sm:text-xs text-sky-600 hover:text-sky-700 font-medium whitespace-nowrap"
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="block px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
                  <div
                    onClick={(e) => handleNotificationClick(e, item)}
                    className="cursor-pointer"
                  >
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line break-words">
                      {item.description}
                    </p>

                    {item.clientName && (
                      <p className="mt-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          Client:
                        </span>{" "}
                        {item.clientName}
                      </p>
                    )}
                  </div>

                  <div className="w-full flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 mt-3 pt-1">
                    <p className="text-[11px] sm:text-xs text-gray-400">
                      {format(item.createdAt)}
                    </p>

                    <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                      {item?.entityId && isAdmin(auth.user) && (
                        <div className="relative font-google">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // critical — parent div navigates on click
                              toggleAssignDropdown(item._id);
                            }}
                            className={`text-[11px] sm:text-xs px-2 py-1 rounded-full transition max-w-[150px] sm:max-w-none truncate ${
                              item.currentAssignee
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}
                          >
                            {item.currentAssignee
                              ? `Assigned: ${
                                  users.find(
                                    (u) => u._id === item.currentAssignee
                                  )?.name
                                }`
                              : "Unassigned — Assign"}
                          </button>

                          {assigningId === item._id && (
                            <UsersList
                              handleAssignUser={handleAssignUser}
                              notification={item}
                              users={users}
                              onClose={() => toggleAssignDropdown(item._id)}
                            />
                          )}
                        </div>
                      )}

                      <span
                        title="Dismiss Notification"
                        onClick={() => handleDismissNotification(item)}
                        className="cursor-pointer text-lg sm:text-xl text-red-500 hover:text-red-600 p-1"
                      >
                        <MdDeleteOutline />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-48 sm:h-full flex flex-col items-center justify-center text-gray-500 gap-2 p-4">
            <span className="text-2xl">🔔</span>
            <p className="text-xs sm:text-sm font-medium">
              You're all caught up 🎉
            </p>
          </div>
        )}
      </div>

      {/* Email preview popup */}
      {openTicketId && (
        <div
          ref={ticketRef}
          className="fixed inset-2 sm:inset-auto sm:left-full sm:top-0 sm:ml-3 w-[calc(100vw-1rem)] sm:w-[520px] max-w-full h-[90vh] sm:h-full bg-white shadow-2xl rounded-2xl overflow-hidden border z-[999999]"
        >
          <EmailDetailDrawer
            id={openTicketId}
            setTicketSubject={() => {}}
            isReplyModalOpenCb={() => {}}
            setEmailData={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;