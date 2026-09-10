
import React, { useEffect, useState } from "react";
import {
  IoClose,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAlarmOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  completeReminder,
  setReminderData,
  setShowReminder,
  snoozeReminder,
} from "../redux/slices/reminderSlice";

function formatScheduledAt(input) {
  if (!input) return "";

  const d = new Date(input);
  if (isNaN(d.getTime())) return "";

  // ---- date: "23 Aug 2026" ----
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();

  // ---- time: "02:23pm" ----
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "pm" : "am";
  hours = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${String(hours).padStart(2, "0")}:${minutes}${suffix}`;

  return `${time} . ${day} ${month} ${year}`;
}

const ReminderModal = () => {
  const showReminder = useSelector((state) => state.reminder.showReminder);
  const reminderData = useSelector((state) => state.reminder.reminderData);
  const dispatch = useDispatch();

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDateTime, setCustomDateTime] = useState("");

  const handleCloseModal = () => {
    dispatch(setShowReminder(false));
    dispatch(setReminderData(null));
    setShowCustomPicker(false);
    setCustomDateTime("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!showReminder) return null;

  // Local "now" formatted for datetime-local's min attr, so past times can't be picked
  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

  const handleCustomSnooze = () => {
    if (!customDateTime) return;
    dispatch(
      snoozeReminder({
        reminderId: reminderData?._id,
        customDate: customDateTime,
      }),
    );
    setShowCustomPicker(false);
    setCustomDateTime("");
  };

  return (
    <div
      id="myModal"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-800/50 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-lg animate-slide-down font-inter">
        {/* Animated gradient border glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-orange-400 via-rose-400 to-purple-400 opacity-70 blur-sm" />
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-orange-400 via-rose-400 to-purple-400 opacity-50" />

        {/* Main card */}
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl shadow-slate-300/50">
          {/* Subtle radial glow inside */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            title="Press ESC to Close"
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200/70 transition-all duration-200 active:scale-90 backdrop-blur-sm"
          >
            <IoClose size={18} />
          </button>

          <div className="relative p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-orange-400 blur-xl opacity-50 animate-pulse" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg shadow-orange-400/40">
                  <IoAlarmOutline size={24} className="text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Reminder
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Don't miss this one
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            {/* Reminder Content */}
            <div className="mt-5">
              <Link
                onClick={handleCloseModal}
                to={reminderData?.redirectLink || "#"}
                className="inline-block text-lg font-semibold text-slate-900 hover:text-orange-600 transition-colors duration-200 leading-snug"
              >
                {reminderData?.title}
              </Link>
              {reminderData?.description && (
                <div
                  className="text-sm text-slate-600 mt-2 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: reminderData?.description,
                  }}
                />
              )}
            </div>

            {/* Snooze Section */}
            <div className="mt-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                <IoTimeOutline size={13} />
                Snooze for
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[2, 5, 10, 20, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() =>
                      dispatch(
                        snoozeReminder({
                          reminderId: reminderData?._id,
                          minutes: min,
                        }),
                      )
                    }
                    className="relative group bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 text-sm font-medium py-2.5 rounded-xl border border-slate-200 hover:border-orange-400 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 overflow-hidden shadow-sm hover:shadow-md hover:shadow-orange-500/10"
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-rose-400/0 group-hover:from-orange-400/10 group-hover:to-rose-400/10 transition-all duration-300" />
                    <span className="relative">
                      {min === 60 ? "1 hr" : `${min} min`}
                    </span>
                  </button>
                ))}

                {/* Custom date/time snooze toggle */}
                <button
                  onClick={() => setShowCustomPicker((prev) => !prev)}
                  className={`flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 rounded-xl border transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${
                    showCustomPicker
                      ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white border-transparent shadow-lg shadow-orange-500/30"
                      : "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 hover:border-orange-300"
                  }`}
                >
                  <IoCalendarOutline size={14} />
                  Custom
                </button>
              </div>
            </div>

            {/* Custom Date & Time Picker */}
            {showCustomPicker && (
              <div className="mt-3 p-3 rounded-2xl bg-orange-50/70 border border-orange-100 animate-slide-down">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                  <input
                    type="datetime-local"
                    value={customDateTime}
                    min={minDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="flex-1 border border-orange-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-transparent transition"
                  />
                  <button
                    onClick={handleCustomSnooze}
                    disabled={!customDateTime}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    Set Snooze
                  </button>
                </div>
              </div>
            )}

            {/* Complete Button */}
            <button
              onClick={() => dispatch(completeReminder(reminderData?._id))}
              className="group relative mt-6 w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-2xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 group-hover:from-emerald-400 group-hover:to-green-500 transition-all duration-300" />
              <span className="relative flex items-center gap-2">
                <IoCheckmarkCircle
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                Mark as Completed
              </span>
            </button>

            {/* Scheduled At */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <span>Scheduled at:</span>
              <span className="font-medium text-slate-500">
                {formatScheduledAt(reminderData?.scheduledAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
