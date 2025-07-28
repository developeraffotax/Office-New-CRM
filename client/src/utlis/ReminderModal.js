import React, { useEffect } from "react";
import { useReminder } from "../context/reminderContext";
import { IoClose } from "react-icons/io5"; // Close icon
import { Link } from "react-router-dom";

const ReminderModal = () => {
  const {
    showReminder,
    setShowReminder,
    reminderData,
    setReminderData,
    snoozeReminder,
    completeReminder,
  } = useReminder();




  // useEffect(() => {
    
  // }, [showReminder]);



   const handleCloseModal = () => {
      setShowReminder(false);
      setReminderData(null);
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

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-300/50 backdrop-blur-sm  ">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 border border-gray-200">
        {/* Close Button */}
        <button
          title="Press ESC to Close"
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <IoClose size={22} />
        </button>
       
        {/* Header */}
        <h2 className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2 animate-pulse">
          🔔 Reminder
        </h2>
        <hr className="bg-gray-300 mt-2" />
        {/* Reminder Content */}
        <div className="mt-4 space-y-1 text-left">
         <Link onClick={handleCloseModal} to={reminderData?.redirectLink || "#"}  className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-orange-600">
          <p>
            {reminderData?.title}
          </p></Link>
          {reminderData?.description && (
            <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{__html: reminderData?.description}}></div>
          )}
          
        </div>

        {/* Snooze Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[2, 5, 10, 20, 60].map((min) => (
            <button
              key={min}
              onClick={() => snoozeReminder(reminderData?._id, min)}
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 text-sm font-medium py-1.5 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              {min === 60 ? "Snooze 1 hr" : `Snooze ${min} min`}
            </button>
          ))}
        </div>

        {/* Complete Button */}
        <button
          onClick={() => completeReminder(reminderData?._id)}
          className="my-5 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-full shadow-md transition-all"
        >
          Mark as Completed
        </button>


         <p className="text-xs text-gray-500 text-end"> Scheduled At:{" "} {new Date(reminderData?.scheduledAt).toLocaleString()} </p>
      </div>
    </div>
  );
};

export default ReminderModal;
