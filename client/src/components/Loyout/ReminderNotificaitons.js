import { useEffect, useState } from "react";
import moment from "moment";
import { Link} from "react-router-dom";
import { MdDelete, MdEdit, MdOutlineMarkChatRead } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReminders,
  markAsReadReminder,
  setReminderData,
  setShowReminder,
} from "../../redux/slices/reminderSlice";
import UpdateUpcomingReminderModal from "./ReminderCmps/UpdateUpcomingReminderModal";
import DeleteUpcomingReminderModal from "./ReminderCmps/DeleteUpcomingReminderModal";

/* -------------------- DATE HELPERS -------------------- */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
const isToday = (date) => {
  const now = new Date();
  return date >= startOfDay(now) && date <= endOfDay(now);
};
const isTomorrow = (date) => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return date >= startOfDay(t) && date <= endOfDay(t);
};
const isLater = (date) => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return date > endOfDay(t);
};
const isOverdue = (date) => date < startOfDay(new Date());
const getCountdownLabel = (scheduledAt, now) => {
  const date = new Date(scheduledAt);
  const diffMs = date - now;

  if (diffMs <= 0) return "Overdue";

  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `in ${mins} min`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;

  const days = Math.floor(hrs / 24);
  return `in ${days}d`;
};

/* -------------------- COMPONENT -------------------- */
const ReminderNotifications = ({ setShowReminderNotificationPanel }) => {
  const dispatch = useDispatch();
  const reminders = useSelector((state) => state.reminder.reminders);
  const [filter, setFilter] = useState("today");
  const [now, setNow] = useState(new Date());

  console.log("THE REMINDER ARE>>>", reminders);
  const [editReminder, setEditReminder] = useState(null);

  const [deleteReminderData, setDeleteReminderData] = useState(null);

  useEffect(() => {
    dispatch(fetchReminders());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredReminders = reminders.filter((reminder) => {
    const date = new Date(reminder.scheduledAt);
    switch (filter) {
      case "overdue":
        return reminder.status === "due" && isOverdue(date);
      case "today":
        return isToday(date);
      case "tomorrow":
        return reminder.status === "upcoming" && isTomorrow(date);
      case "later":
        return reminder.status === "upcoming" && isLater(date);
      default:
        return true;
    }
  });

  const groupedReminders = filteredReminders.reduce((acc, reminder) => {
    const date = new Date(reminder.scheduledAt);
    let group = "Later";
    if (isOverdue(date)) group = "Overdue";
    else if (isToday(date)) group = "Today";
    else if (isTomorrow(date)) group = "Tomorrow";

    if (!acc[group]) acc[group] = [];
    acc[group].push(reminder);
    return acc;
  }, {});

  const GROUP_ORDER = ["Overdue", "Today", "Tomorrow", "Later"];

  return (
    <div className="absolute z-[999] top-[3rem] right-[2rem] w-[400px] rounded-lg overflow-clip   bg-white shadow-lg ">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-orange-600 to-orange-400  text-white text-lg font-bold text-center   py-3 shadow-md">
        Reminders
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 px-4 py-2 border-b bg-gray-50">
        {[
          { key: "overdue", label: "Overdue" },
          { key: "today", label: "Today" },
          { key: "tomorrow", label: "Tomorrow" },
          { key: "later", label: "Later" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition
              ${
                filter === key
                  ? "bg-orange-500 text-white shadow"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reminder List */}
      <div className="p-4 space-y-4 h-[600px] overflow-y-auto custom-scrollbar">
        {Object.keys(groupedReminders).length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No {filter} reminders
          </p>
        ) : (
          GROUP_ORDER.map(
            (group) =>
              groupedReminders[group] && (
                <div key={group} className="space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase px-1">
                    {group}
                  </div>

                  {groupedReminders[group].map((reminder) => {
                    const date = new Date(reminder.scheduledAt);
                    const isUpcoming =
                      reminder.status === "upcoming" &&
                      (isToday(date) || isTomorrow(date) || isLater(date));
                    const showActions = reminder.status === "due";
                    const countdown = getCountdownLabel(
                      reminder.scheduledAt,
                      now
                    );

                    return (
                      <div
                        key={reminder._id}
                        className={`flex flex-col rounded-xl p-3 space-y-1 transition-all
                          ${
                            reminder.isRead
                              ? "bg-gray-50 border border-gray-200 shadow-sm" // Read reminders
                              : isUpcoming
                              ? "bg-white border border-l-4 border-blue-400 shadow hover:shadow-md" // Upcoming reminders
                              : reminder.status === "due"
                              ? "bg-white border border-l-4 border-orange-400 shadow hover:shadow-md" // Due reminders
                              : "bg-gray-50 border border-gray-200 shadow-sm" // Default/fallback
                          }`}
                      >
                        {/* Title & Actions */}
                        <div className="w-full flex justify-between items-start gap-2">
                          <Link to={reminder.redirectLink} className="text-sm font-semibold text-gray-800 min-w-0 break-words">
                            {reminder.title}
                          </Link>

                         
                          <div className="flex justify-end  items-center gap-2">
                            {showActions && !reminder.isRead && (
                              <button
                                className="text-orange-500 text-lg hover:text-orange-600 transition"
                                onClick={() =>
                                  dispatch(markAsReadReminder(reminder._id))
                                }
                              >
                                <MdOutlineMarkChatRead />
                              </button>
                            )}
                            {showActions && (
                              <button
                                className="text-orange-500 text-xs font-semibold hover:underline"
                                onClick={() => {
                                  dispatch(setReminderData(reminder));
                                  dispatch(setShowReminder(true));
                                  setShowReminderNotificationPanel(false);
                                  if (!reminder.isRead) {
                                    dispatch(markAsReadReminder(reminder._id));
                                  }
                                }}
                              >
                                Open
                              </button>
                            )}{" "}
                            {isUpcoming && (
                              <button
                                onClick={() => setEditReminder(reminder)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                                title="Edit Reminder"
                              >
                                <MdEdit className="h-4 w-4 text-blue-500" />
                              </button>
                            )}
                            {isUpcoming && (
                              <button
                                onClick={() => setDeleteReminderData(reminder)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                                title="Delete Reminder"
                              >
                                <MdDelete className="h-4 w-4 text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {reminder.description && (
                          <div
                            className="text-sm text-gray-600 leading-snug"
                            dangerouslySetInnerHTML={{
                              __html: reminder.description,
                            }}
                          />
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-gray-500">
                            {moment(reminder.scheduledAt).format(
                              "MMM D, h:mm A"
                            )}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-xs
                              ${
                                isUpcoming
                                  ? "bg-blue-50 text-blue-600"
                                  : countdown === "Overdue"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                          >
                            {countdown}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          )
        )}
      </div>

      {editReminder && (
        <UpdateUpcomingReminderModal
          reminder={editReminder}
          onClose={() => setEditReminder(null)}
        />
      )}

      {deleteReminderData && (
        <DeleteUpcomingReminderModal
          reminder={deleteReminderData}
          onClose={() => setDeleteReminderData(null)}
        />
      )}
    </div>
  );
};

export default ReminderNotifications;
