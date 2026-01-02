import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGlobalTimer, tick } from "../redux/slices/globalTimerSlice";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function GlobalTimer() {
  const dispatch = useDispatch();
  const { timer, elapsed, loading } = useSelector(
    (state) => state.globalTimer
  );
  const [hovered, setHovered] = useState(false);

  // Fetch timer on mount
  useEffect(() => {
    dispatch(fetchGlobalTimer());
  }, [dispatch]);

  // Tick every second only when running
  useEffect(() => {
    if (!timer?.isRunning) return;

    const interval = setInterval(() => {
      dispatch(tick());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, timer?.isRunning]);

  if (loading || !timer) return null;

const startedAt = new Date(timer.startTime).toLocaleString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,        // AM/PM
  day: "2-digit",
  month: "short",
  year: "numeric",
});

// Swap time & date manually:
const dateObj = new Date(timer.startTime);
const timeStr = dateObj.toLocaleTimeString("en-US"); // "04:12:06 PM"
const dateStr = dateObj.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }); // "Jan 02, 2026"
const startedAtFormatted = `${timeStr} | ${dateStr}`;

  return (
    <div
      className="relative flex items-center gap-2 px-3 py-1 border-l border-gray-300 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clock Icon */}
      <svg
        className="h-4 w-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>

      {/* Time */}
      <span className="font-mono text-base font-semibold text-gray-900 tracking-tight">
        {formatTime(elapsed)}
      </span>

      {/* Running Indicator */}
      {timer?.isRunning && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      )}

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow-lg z-10 whitespace-nowrap">
         {timer?.task ?  <div><span className="font-semibold">Task:</span> {timer.task || "N/A"}</div> : 
          <div><span className="font-semibold">Client:</span> {timer.clientName || "N/A"}</div>}
          <div><span className="font-semibold">Started at:</span> {startedAtFormatted}</div>
        </div>
      )}
    </div>
  );
}
