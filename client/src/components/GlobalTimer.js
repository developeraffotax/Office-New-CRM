
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGlobalTimer, stopTimer, tick } from "../redux/slices/globalTimerSlice";
import { setAnyTimerRunning } from "../redux/slices/authSlice";
import { stopCountdown } from "../redux/slices/timerSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { LuClock3 } from "react-icons/lu";
import { RiStopFill } from "react-icons/ri";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function GlobalTimer() {
  const dispatch = useDispatch();
  const { timer, elapsed, loading } = useSelector((state) => state.globalTimer);
  const [showTooltip, setShowTooltip] = useState(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    dispatch(fetchGlobalTimer());
  }, [dispatch]);

  useEffect(() => {
    if (!timer?.isRunning) return;
    const interval = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(interval);
  }, [dispatch, timer?.isRunning]);



  
  const stop = () => {

    dispatch(stopTimer({
      timerId: timer?._id,
      note: "TEST",
      activity: "Chargeable",

    }))




  }










  
  if (loading || !timer) return null;



  const dateObj = new Date(timer.startTime);
  const timeStr = dateObj.toLocaleTimeString("en-US");
  const dateStr = dateObj.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const startedAtFormatted = `${timeStr} | ${dateStr}`;




  return (
    <div
      className="  relative font-google  bg-gray-50 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-100 hover:shadow-sm cursor-pointer"
     
    >

      <div   className="w-full flex items-center gap-2 px-2.5 py-1">

         <div  onClick={() => setShowTooltip(!showTooltip)} className="w-full flex items-center gap-2">

    
         {/* Clock Icon */}
      <LuClock3 className="h-3.5 w-3.5 text-gray-400 shrink-0" />

      {/* Time */}
      <span className="w-[60px] text-center text-[13px] font-semibold text-gray-600 leading-none tabular-nums   shrink-0">
  {formatTime(elapsed)}
</span>
      {/* Running Indicator */}
      {timer?.isRunning && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
        </span>
      )}


        </div>


      {/* Divider */}
      <span className="w-px h-3.5 bg-gray-200 shrink-0" />

      {/* Stop Button */}
      <button
        onClick={stop}
        disabled={stopping}
        className="flex items-center justify-center w-[22px] h-[22px] rounded-full text-gray-300 hover:text-red-500 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
      >
        <RiStopFill className="h-[15px] w-[15px]" />
      </button>









      </div>
     
      {showTooltip && (
  <div className="absolute top-full right-0 mt-3 w-64 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden p-4">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Running Timer</span>
        <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
      </div>
      

      {
        timer?.task ? (
          <div>
        <h4 className="text-[11px] text-gray-400 font-medium leading-none mb-1.5">Task</h4>
        <p className="text-[13px] text-gray-800 font-semibold truncate">
          {timer?.task ||   "N/A"}
        </p>
      </div>
        ) : (
<div>
        <h4 className="text-[11px] text-gray-400 font-medium leading-none mb-1.5">Client</h4>
        <p className="text-[13px] text-gray-800 font-semibold truncate">
          { timer?.clientName || "N/A"}
        </p>
      </div>
        )


      }
      

      

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-500">Started at</span>
        <span className="text-[11px] text-gray-700 font-mono">{startedAtFormatted.split('|')[0]}</span>
      </div>
    </div>
  </div>
)}
    </div>
  );
}



























































































// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchGlobalTimer, tick } from "../redux/slices/globalTimerSlice";
// import { setAnyTimerRunning } from "../redux/slices/authSlice";
// import { stopCountdown } from "../redux/slices/timerSlice";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { LuClock3 } from "react-icons/lu";
// import { RiStopFill } from "react-icons/ri";

// function formatTime(ms) {
//   const totalSeconds = Math.floor(ms / 1000);
//   const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
//   const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
//   const s = String(totalSeconds % 60).padStart(2, "0");
//   return `${h}:${m}:${s}`;
// }

// export default function GlobalTimer() {
//   const dispatch = useDispatch();
//   const { timer, elapsed, loading } = useSelector((state) => state.globalTimer);
//   const [hovered, setHovered] = useState(false);
//   const [stopping, setStopping] = useState(false);

//   useEffect(() => {
//     dispatch(fetchGlobalTimer());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!timer?.isRunning) return;
//     const interval = setInterval(() => dispatch(tick()), 1000);
//     return () => clearInterval(interval);
//   }, [dispatch, timer?.isRunning]);

//   if (loading || !timer) return null;

//   const stopTimer = async () => {
//     try {
//       setStopping(true);
//       await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timer._id}`,
//         { note: "Stopped from global timer", activity: timer?.activity || "Chargeable" }
//       );
//       dispatch(setAnyTimerRunning(false));
//       dispatch(stopCountdown());
//       localStorage.removeItem("timer_Id");
//       localStorage.removeItem("jobId");
//       dispatch(fetchGlobalTimer());
//       toast.success("Timer stopped successfully!");
//     } catch (error) {
//       console.error(error);
//       toast.error(error?.response?.data?.message || "Failed to stop timer");
//     } finally {
//       setStopping(false);
//     }
//   };

//   const dateObj = new Date(timer.startTime);
//   const timeStr = dateObj.toLocaleTimeString("en-US");
//   const dateStr = dateObj.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
//   const startedAtFormatted = `${timeStr} | ${dateStr}`;

//   return (
//     <div
//       className="relative font-google flex items-center gap-2 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {/* Clock Icon */}
//       <LuClock3 className="h-3.5 w-3.5 text-gray-400 shrink-0" />

//       {/* Time */}
//       <span className=" text-[13px] font-semibold text-gray-700 tracking-[0.3px] leading-none">
//         {formatTime(elapsed)}
//       </span>

//       {/* Running Indicator */}
//       {timer?.isRunning && (
//         <span className="relative flex h-1.5 w-1.5 shrink-0">
//           <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
//           <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
//         </span>
//       )}

//       {/* Divider */}
//       <span className="w-px h-3.5 bg-gray-200 shrink-0" />

//       {/* Stop Button */}
//       <button
//         onClick={stopTimer}
//         disabled={stopping}
//         className="flex items-center justify-center w-[22px] h-[22px] rounded-full text-gray-300 hover:text-red-500 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
//       >
//         <RiStopFill className="h-[15px] w-[15px]" />
//       </button>

//       {/* Tooltip */}
//       {hovered && (
//         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max rounded-lg bg-gray-900 text-white text-[11.5px] px-3 py-2 shadow-xl z-50 whitespace-nowrap leading-relaxed">
//           {/* Caret */}
//           <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-900" />

//           {timer?.task ? (
//             <div className="flex gap-1.5">
//               <span className="text-gray-500 font-medium">Task:</span>
//               <span>{timer.task || "N/A"}</span>
//             </div>
//           ) : (
//             <div className="flex gap-1.5">
//               <span className="text-gray-500 font-medium">Client:</span>
//               <span>{timer.clientName || "N/A"}</span>
//             </div>
//           )}
//           <div className="flex gap-1.5">
//             <span className="text-gray-500 font-medium">Started:</span>
//             <span>{startedAtFormatted}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }































































































// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchGlobalTimer,
//   tick,
// } from "../redux/slices/globalTimerSlice";

// import {
//   setAnyTimerRunning,
// } from "../redux/slices/authSlice";

// import {
//   stopCountdown,
// } from "../redux/slices/timerSlice";

// import axios from "axios";
// import toast from "react-hot-toast";

// import { IoStopCircle } from "react-icons/io5";

// function formatTime(ms) {
//   const totalSeconds = Math.floor(ms / 1000);

//   const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
//   const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
//   const s = String(totalSeconds % 60).padStart(2, "0");

//   return `${h}:${m}:${s}`;
// }

// export default function GlobalTimer() {
//   const dispatch = useDispatch();

//   const { timer, elapsed, loading } = useSelector(
//     (state) => state.globalTimer
//   );

//   const [hovered, setHovered] = useState(false);
//   const [stopping, setStopping] = useState(false);

//   // Fetch timer on mount
//   useEffect(() => {
//     dispatch(fetchGlobalTimer());
//   }, [dispatch]);

//   // Tick every second only when running
//   useEffect(() => {
//     if (!timer?.isRunning) return;

//     const interval = setInterval(() => {
//       dispatch(tick());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [dispatch, timer?.isRunning]);

//   if (loading || !timer) return null;

//   const stopTimer = async () => {
//     try {
//       setStopping(true);

//       await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timer._id}`,
//         {
//           note: "Stopped from global timer",
//           activity: timer?.activity || "Chargeable",
//         }
//       );

//       dispatch(setAnyTimerRunning(false));

//       dispatch(stopCountdown());

//       localStorage.removeItem("timer_Id");
//       localStorage.removeItem("jobId");

//       dispatch(fetchGlobalTimer());

//       toast.success("Timer stopped successfully!");
//     } catch (error) {
//       console.error(error);

//       toast.error(
//         error?.response?.data?.message ||
//           "Failed to stop timer"
//       );
//     } finally {
//       setStopping(false);
//     }
//   };

//   const dateObj = new Date(timer.startTime);

//   const timeStr = dateObj.toLocaleTimeString("en-US");

//   const dateStr = dateObj.toLocaleDateString("en-US", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const startedAtFormatted = `${timeStr} | ${dateStr}`;

//   return (
//     <div
//       className="relative flex items-center gap-3 px-3 py-1 border-l border-gray-300"
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {/* Clock Icon */}
//       <svg
//         className="h-4 w-4 text-gray-500"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         viewBox="0 0 24 24"
//       >
//         <circle cx="12" cy="12" r="10" />
//         <path d="M12 6v6l4 2" />
//       </svg>

//       {/* Time */}
//       <span className="font-mono text-base font-semibold text-gray-900 tracking-tight">
//         {formatTime(elapsed)}
//       </span>

//       {/* Running Indicator */}
//       {timer?.isRunning && (
//         <span className="relative flex h-2 w-2">
//           <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />

//           <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
//         </span>
//       )}

//       {/* Stop Button */}
//       <button
//         onClick={stopTimer}
//         disabled={stopping}
//         className="flex items-center justify-center"
//       >
//         <IoStopCircle className="h-5 w-5 text-red-500 hover:text-red-600 transition-colors" />
//       </button>

//       {/* Tooltip */}
//       {hovered && (
//         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow-lg z-10 whitespace-nowrap">
//           {timer?.task ? (
//             <div>
//               <span className="font-semibold">Task:</span>{" "}
//               {timer.task || "N/A"}
//             </div>
//           ) : (
//             <div>
//               <span className="font-semibold">Client:</span>{" "}
//               {timer.clientName || "N/A"}
//             </div>
//           )}

//           <div>
//             <span className="font-semibold">
//               Started at:
//             </span>{" "}
//             {startedAtFormatted}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }