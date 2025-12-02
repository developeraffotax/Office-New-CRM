import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { FiClock } from "react-icons/fi";

const UserWorkedTime = () => {
  const [totalWorkedTimeInMins, setTotalWorkedTimeInMins] = useState(0);
  const [timers, setTimers] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const {
    user: { id },
  } = useSelector((state) => state.auth.auth);

  const fetchTimers = async () => {
    if (!id) return;

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/agent/timers/${id}`,
        { params: { includeRunning: true } }
      );

      if (data.success) {
        setTotalWorkedTimeInMins(parseInt(data.totalWorkedTimeInMins || 0));
        setTimers((prev) => {

            const timers =   data?.timers || [];
            return timers.reverse();
            
        });
      }
    } catch (err) {
      console.error("❌ Failed to load timers:", err);
    }
  };

  useEffect(() => {
    fetchTimers();
    const interval = setInterval(fetchTimers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(totalWorkedTimeInMins / 60);
  const minutes = totalWorkedTimeInMins % 60;

  // ⏳ Calculate timer duration
  const getDuration = (timer) => {
    const start = new Date(timer.startTime).getTime();
    const end = timer.isRunning
      ? Date.now()
      : new Date(timer.endTime).getTime();

    const totalMins = Math.floor((end - start) / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  const formatTime12 = (iso) => {
    if (!iso) return "N/A";

    const d = new Date(iso);
    return d
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .toLowerCase(); // -> "01:29 pm"
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Main badge */}
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer px-4 py-[2px] bg-gray-100 text-black rounded-xl font-semibold shadow-sm hover:shadow-md transition flex justify-center items-center gap-2 w-fit "
      >
        <FiClock size={20} className="text-orange-500" />
        <p className="text-lg font-bold text-gray-600">
          {hours}h {minutes}m
        </p>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute mt-2 w-[320px] max-h-[460px] overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-100 p-4 z-50">
          {/* Header */}
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 tracking-wide text-sm">
            <FiClock className="text-orange-500" /> Completed Tasks — Today
          </h3>

          {/* 🔥 Today's Progress */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1">
              Today's Progress ({hours}h {minutes}m / 8h)
            </p>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                style={{
                  width: `${Math.min((hours * 60 + minutes) / 480, 1) * 100}%`,
                }}
              />
            </div>

            <p className="text-[11px] text-gray-500 mt-1">
              {Math.min(((hours * 60 + minutes) / 480) * 100, 100).toFixed(1)}%
              of daily goal
            </p>
          </div>

          {/* Timers List */}
          {timers.length === 0 ? (
            <p className="text-gray-500 text-sm">No timers found</p>
          ) : (
            timers.map((timer) => (
              <div
                key={timer._id}
                className="mb-2 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm transition"
              >
                <p className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  {timer.task || "Untitled task"}

                  {timer?.isRunning && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </p>

                <p className="text-xs text-gray-600">
                  {getDuration(timer)} • {timer.activity}
                </p>

                {/* 🕒 start & end time */}
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                  <span>⏳ {formatTime12(timer.startTime)}</span>
                  <span>→</span>
                  <span>
                    {timer.isRunning ? "Now" : formatTime12(timer.endTime)}
                  </span>
                </div>

                {timer.note && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {timer.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserWorkedTime;
