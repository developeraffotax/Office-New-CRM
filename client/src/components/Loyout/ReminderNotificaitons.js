import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useReminder } from "../../context/reminderContext";
import { Link } from "react-router-dom";
import { CgEye } from "react-icons/cg";
import { MdOutlineMarkChatRead } from "react-icons/md";

const ReminderNotifications = () => {
  //take it one above
  // const [reminders, setReminders] = useState([]);

  const { showReminder, setShowReminder, reminderData, setReminderData, snoozeReminder, markAsReadReminder, completeReminder, reminders, setReminders, set_unread_reminders_count, getRemindersCount, fetchReminders, loadingReminders } = useReminder();






  useEffect(() => {
    

    fetchReminders();
  }, []);

  return (
    <div className="absolute z-[999] top-[2.5rem] right-[2rem] w-[380px] rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="relative bg-orange-600 text-white text-lg font-semibold text-center rounded-t-xl py-3 px-4 shadow-sm">
        Reminders
        <div className="absolute -top-5 right-3 animate-shake z-10">
          <img
            src="/reminder.png"
            alt="reminder"
            className="h-[3.2rem] w-[3.2rem]"
          />
        </div>
      </div>

      {/* Reminder List */}
      <div className="p-4 space-y-3 max-h-[60vh] min-h-[30vh] overflow-y-auto custom-scrollbar">
        {reminders.length === 0 ? (
          <p className="text-center text-gray-800 text-sm font-medium">
            No due reminders
          </p>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder?._id}
              className={`rounded-lg border border-gray-200  ${
                reminder?.isRead ? "bg-gray-300" : "bg-gray-100"
              }   p-3 space-y-2 transition-all hover:shadow-sm`}
            >
              <div className="flex justify-between items-center gap-2  text-[16px] font-semibold text-gray-800 leading-snug">
                <Link
                  // onClick={() => setShowReminder(false)}
                  to={reminder?.redirectLink || "#"}
                  className="block text-sm text-gray-800 "
                >
                  {reminder?.title}
                </Link>

                 
                  <button
                    className="text-orange-500 hover:underline font-medium text-lg"
                    onClick={() => {
                      setReminderData(reminder);
                      setShowReminder(true);

                      if(!reminder?.isRead) {
                        markAsReadReminder(reminder?._id)
                      }
                    }}
                  >
                    Open
                  </button>
                 
              </div>

              <div className="block text-sm text-gray-800 ">
                {/* <span className="font-medium text-gray-800 ">
                  Description:{" "}
                </span> */}
                {reminder?.description}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600  pt-1">
                <span>
                  Due: {moment(reminder?.scheduledAt).format("MMM D, h:mm A")}
                </span>

                <div className="flex justify-end items-center gap-2 ">
                  {!reminder?.isRead && (
                    <button
                      className="text-blue-500 hover:underline font-medium text-lg"
                      title="Mark as Read"
                      onClick={() => {
                        markAsReadReminder(reminder?._id);
                        
                      }}
                    >
                      <MdOutlineMarkChatRead />
                    </button>
                  )}

                  <span
                    className={`h-2.5 w-2.5 rounded-full inline-block ${
                      reminder?.isRead ? "bg-gray-400" : "bg-orange-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReminderNotifications;
