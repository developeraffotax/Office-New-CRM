import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { setAnyTimerRunning } from "../redux/slices/authSlice";
import { setShowModal, snooze, stopCountdown } from "../redux/slices/timerSlice";
import { hasPermission, hasSubrole } from "./checkPermission"; // adjust path if needed

/* ---------- puzzle helper ---------- */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makePuzzle = () => {
  const a = rand(10, 49);
  const b = rand(3, 9);
  const c = rand(2, 9);
  return { question: `${a} + ${b} × ${c}`, answer: a + b * c };
};

const OverdueModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth.auth);
  const { showModal, taskId, task, timerId } = useSelector((state) => state.timer);

  const [isNote, setIsNote] = useState(false);
  const [note, setNote] = useState("");

  /* ---------- puzzle state ---------- */
  // Use whatever permission name you add to your roles
 const requiresPuzzle = hasSubrole(auth?.user, "Misc" , "Timer Puzzle");
  // const requiresPuzzle = 1;
  const [puzzle, setPuzzle] = useState(makePuzzle);
  const [answer, setAnswer] = useState("");
  const [solved, setSolved] = useState(false);

  const locked = requiresPuzzle && !solved;

  // New puzzle every time the modal opens (also covers reload / snooze expiry)
  useEffect(() => {
    if (showModal) {
      setPuzzle(makePuzzle());
      setAnswer("");
      setSolved(false);
    }
  }, [showModal]);

  const verifyPuzzle = (e) => {
    e.preventDefault();
    if (Number(answer) === puzzle.answer) {
      setSolved(true);
      toast.success("Correct! You can continue.");
    } else {
      toast.error("Wrong answer, try this one.");
      setPuzzle(makePuzzle());
      setAnswer("");
    }
  };

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
    if (!timerId || locked) return;

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

  const handleSnooze = (min) => {
    if (locked) return;
    dispatch(snooze(min));
  };

  // Play sound when modal shows
  useEffect(() => {
    if (showModal) {
      const audio = new Audio("/beep.mp3");
      audio.play().catch((err) => console.log("Audio play failed:", err));
    }
  }, [showModal]);

  if (!showModal) return null;

  const disabledCls = "disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-[9999]  ">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-red-600 animate-bounce">
          ⏰ Time's Up!
        </h2>
        <p>Your task has exceeded its allocated time.</p>
        <p className="text-lg font-medium">Task: {task}</p>

        {/* 🧩 Puzzle */}
        {requiresPuzzle && !solved && (
          <form
            onSubmit={verifyPuzzle}
            className="border border-dashed border-red-300 bg-red-50 rounded-lg p-4 space-y-3"
          >
            <p className="text-sm text-gray-600">
              Solve this to continue working or snooze:
            </p>
            <p className="text-2xl font-bold tracking-wide">{puzzle.question} = ?</p>
            <div className="flex justify-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
                className="w-28 p-2 border rounded text-center"
                placeholder="Answer"
              />
              <button
                type="submit"
                disabled={!answer}
                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${disabledCls}`}
              >
                Verify
              </button>
            </div>
          </form>
        )}

        <div className="w-full grid grid-cols-3 justify-center gap-4">
          {[2, 5, 10, 20, 60].map((min) => (
            <button
              key={min}
              disabled={locked}
              onClick={() => handleSnooze(min)}
              className={`bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 text-sm font-semibold px-4 py-1.5 rounded-full shadow-md hover:shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200 ${disabledCls}`}
            >
              {min === 60 ? "Snooze 1 hr" : `Snooze ${min} min`}
            </button>
          ))}

          <button
            disabled={locked}
            onClick={() => setIsNote(true)}
            className={`bg-gradient-to-br from-red-400 to-red-500 text-gray-100 text-sm font-semibold px-4 py-1.5 rounded-full shadow-md hover:shadow-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 ${disabledCls}`}
          >
            Stop Timer
          </button>
        </div>

        {isNote && !locked && (
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