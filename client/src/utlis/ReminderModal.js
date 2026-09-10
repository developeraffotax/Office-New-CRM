import React, { useEffect, useState } from "react";
import { IoClose, IoCalendarOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { completeReminder, setReminderData, setShowReminder, snoozeReminder } from "../redux/slices/reminderSlice";

const ReminderModal = () => {

  const showReminder = useSelector(state => state.reminder.showReminder)
  const reminderData = useSelector(state => state.reminder.reminderData)
  const dispatch = useDispatch()

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDateTime, setCustomDateTime] = useState("");

  const handleCloseModal = () => {
    dispatch(setShowReminder(false))
    dispatch(setReminderData(null))
    setShowCustomPicker(false)
    setCustomDateTime("")
  }

  useEffect(() => {

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);

  }, [])

  if (!showReminder) return null;

  // Local "now" formatted for datetime-local's min attr, so past times can't be picked
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleCustomSnooze = () => {
    if (!customDateTime) return;
    dispatch(snoozeReminder({ reminderId: reminderData?._id, customDate: customDateTime }));
    setShowCustomPicker(false);
    setCustomDateTime("");
  }

  return (
    <div id="myModal" className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-300/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 border border-gray-200 animate-slide-down font-inter">
        {/* Close Button */}
        <button
          title="Press ESC to Close"
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <IoClose size={22} />
        </button>
       
        {/* Header */}
        <div className="flex items-center justify-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 animate-pulse">🔔</span>
          <h2 className="text-3xl font-bold text-red-600">Reminder</h2>
        </div>
        <hr className="bg-gray-300 mt-2" />
        {/* Reminder Content */}
       <div className="mt-4 space-y-1 text-left">
  <Link
    onClick={handleCloseModal}
    to={reminderData?.redirectLink || "#"}
    className="inline-block text-lg font-semibold text-gray-800 cursor-pointer hover:text-orange-600"
  >
    {reminderData?.title}
  </Link>
  {reminderData?.description && (
    <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: reminderData?.description }}></div>
  )}
</div>

        {/* Snooze Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[2, 5, 10, 20, 60].map((min) => (
            <button
              key={min}
              onClick={() => dispatch(snoozeReminder({ reminderId: reminderData?._id, minutes: min }))}
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 text-sm font-medium py-1.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              {min === 60 ? "Snooze 1 hr" : `Snooze ${min} min`}
            </button>
          ))}

          {/* Custom date/time snooze toggle */}
          <button
            onClick={() => setShowCustomPicker((prev) => !prev)}
            className="flex items-center justify-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium py-1.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <IoCalendarOutline size={14} />
            Custom
          </button>
        </div>

        {/* Custom Date & Time Picker */}
        {showCustomPicker && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2 items-stretch">
            <input
              type="datetime-local"
              value={customDateTime}
              min={minDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleCustomSnooze}
              disabled={!customDateTime}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 px-4 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              Set Snooze
            </button>
          </div>
        )}

        {/* Complete Button */}
        <button
          onClick={() => dispatch(completeReminder(reminderData?._id))}
          className="my-5 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-full shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        >
          Mark as Completed
        </button>


         <p className="text-xs text-gray-500 text-end flex items-center justify-end gap-1">
           <IoCalendarOutline size={12} />
           Scheduled At:{" "} {new Date(reminderData?.scheduledAt).toLocaleString()}
         </p>
      </div>
    </div>
  );
};

export default ReminderModal;