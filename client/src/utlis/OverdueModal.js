import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { setAnyTimerRunning } from "../redux/slices/authSlice";
import { setShowModal, snooze, stopCountdown } from "../redux/slices/timerSlice";

const OverdueModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth.auth);
  const { showModal, taskId, task, timerId } = useSelector((state) => state.timer);

  const [isNote, setIsNote] = useState(false);
  const [note, setNote] = useState("");

  // --------Remove Timer Status-------
  const removeTimerStatus = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/remove/timer_task/Status/${auth.user.id}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  // --------------Stop Timer----------->
  const stopTimer = async () => {
    if (!timerId) return;

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timerId}`,
        {
          note: note || "Auto stop due to inactivity!",
          activity: task.trim() === "Training" ? "Non-Chargeable" : "Chargeable",
        }
      );

      if (data) {
        dispatch(setShowModal(false));
        setIsNote(false);
        setNote("");

        dispatch(stopCountdown());

        removeTimerStatus();
        localStorage.removeItem("timer_Id");
        dispatch(setAnyTimerRunning(false));
        localStorage.removeItem("jobId");

        toast.success("Timer stopped successfully!");

        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      toast.error(error.response?.data?.message);
    }
  };

  // Play sound when modal shows
  useEffect(() => {
    if (showModal) {
      const audio = new Audio("/beep.mp3");
      audio.play().catch((err) => console.log("Audio play failed:", err));
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-red-600 animate-bounce">
          ⏰ Time's Up!
        </h2>
        <p>Your task has exceeded its allocated time.</p>
        <p className="text-lg font-medium">Task: {task}</p>

        <div className="w-full grid grid-cols-3 justify-center gap-4">
          {[2, 5, 10, 20, 60].map((min) => (
            <button
              key={min}
              onClick={() => dispatch(snooze(min))}
              className="bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 text-sm font-semibold px-4 py-1.5 rounded-full shadow-md hover:shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200"
            >
              {min === 60 ? "Snooze 1 hr" : `Snooze ${min} min`}
            </button>
          ))}

          <button
            onClick={() => setIsNote(true)}
            className="bg-gradient-to-br from-red-400 to-red-500 text-gray-100 text-sm font-semibold px-4 py-1.5 rounded-full shadow-md hover:shadow-lg hover:from-red-500 hover:to-red-600 transition-all duration-200"
          >
            Stop Timer
          </button>
        </div>

        {/* 📝 Note Section Appears Below Buttons */}
        {isNote && (
          <div className="mt-6 text-left space-y-4">
            <h2 className="text-xl font-semibold">Add Note</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-24 p-2 border rounded"
              placeholder="Enter your note here..."
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsNote(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={stopTimer}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueModal;
