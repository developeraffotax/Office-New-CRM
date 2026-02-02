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

const NotificationPanel = ({
  visibleNotifications,
  handleNotificationClick,
  handleDismissNotification,
  handleDismissAll,
  handleMarkAllAsRead,
  handleTicketView,
  openTicketId,
  setOpen,
  ticketRef,
}) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.auth);

  return (
    <div className="shadow-xl bg-gray-100 absolute z-[999] top-[2rem] left-[1.6rem] rounded-lg">
      <div className="border-b border-orange-500 px-8 py-3 flex items-center justify-between rounded-t-lg bg-gradient-to-r from-orange-600 to-orange-400 shadow-md">
        <button
          title="Clear all"
          onClick={handleDismissAll}
          disabled={visibleNotifications.length === 0}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <MdDeleteOutline className="text-white w-5 h-5" />
        </button>

        <h5 className="text-[20px] text-white">Notifications</h5>

        <button
          title="Mark all as read"
          onClick={handleMarkAllAsRead}
          disabled={visibleNotifications.length === 0}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LuEye className="text-white w-5 h-5" />
        </button>
      </div>

      <div className="w-[380px] h-[50vh] overflow-y-auto bg-white shadow-lg border border-gray-200 rounded-b-lg">
        {visibleNotifications?.length > 0 ? (
          visibleNotifications.map((item) => {
            const isRead = item.status === "read";

            return (
              <div
                key={item._id}
                className={`group border-b last:border-b-0 transition-all ${
                  isRead ? "bg-gray-50" : "bg-sky-50 hover:bg-sky-100"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between px-4 pt-3">
                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                    )}
                    <p className="text-sm font-semibold text-gray-800">
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
                      className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="block px-4 pb-4 pt-2">
                  <div
                    onClick={() => handleNotificationClick(item)}
                    className="cursor-pointer"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
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

                  <div className="w-full flex justify-between items-center gap-4 mt-2">
                    <p className="text-xs text-gray-400">
                      {format(item.createdAt)}
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        title="Dismiss Notification"
                        onClick={() => handleDismissNotification(item)}
                        className="cursor-pointer text-xl text-red-500 hover:text-red-600"
                      >
                        <MdDeleteOutline />
                      </span>

                      {item.type === "ticket_received" ? (
                        <button
                          className="cursor-pointer text-xl text-sky-500 hover:text-sky-600"
                          onClick={() => handleTicketView(item?.taskId)}
                        >
                          <LuEye />
                        </button>
                      ) : (
                        <Link
                          title="View Details"
                          to={`${item?.redirectLink}?comment_taskId=${item?.taskId}`}
                          onClick={() => {
                            dispatch(setFilterId(item?.taskId));
                            dispatch(
                              updateNotification({
                                id: item._id,
                                userId: auth.user.id,
                                status: item.status,
                              })
                            );
                            setOpen(false);
                          }}
                          className="cursor-pointer text-xl text-sky-500 hover:text-sky-600"
                        >
                          <LuEye />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <span className="text-2xl">🔔</span>
            <p className="text-sm font-medium">You're all caught up 🎉</p>
          </div>
        )}
      </div>

      {/* Email preview popup */}
      {openTicketId && (
        <div
          ref={ticketRef}
          className="absolute left-full top-0 ml-3 w-[520px] h-full bg-white shadow-2xl rounded-2xl overflow-hidden border z-[999999]"
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
