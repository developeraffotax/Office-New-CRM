
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGlobalTimer, stopTimer, tick } from "../redux/slices/globalTimerSlice";
import { LuClock3 } from "react-icons/lu";
import { RiStopFill } from "react-icons/ri";
import { MdKeyboardReturn } from "react-icons/md";
import { useKeyboardShortcut } from "../utlis/useKeyboardShortcut";
import { useEscapeKey } from "../utlis/useEscapeKey";
import { useClickOutside } from "../utlis/useClickOutside";
import toast from "react-hot-toast";
import { openModal } from "../redux/slices/globalModalSlice";
import { stopCountdown } from "../redux/slices/timerSlice";
import axios from "axios";

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

  const popupRef = useRef();
  const noteInputRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [stopNote, setStopNote] = useState("");
  const [stopActivity, setStopActivity] = useState("Chargeable");

  useEffect(() => { dispatch(fetchGlobalTimer()); }, [dispatch]);

  useEffect(() => {
    if (!timer?.isRunning) return;
    const interval = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(interval);
  }, [dispatch, timer?.isRunning]);

  useEffect(() => {
    if (showPopup) {
      const t = setTimeout(() => noteInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [showPopup]);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => {
    setShowPopup(false);
    setStopNote("");
    setStopActivity("Chargeable");
  };

 
  // useKeyboardShortcut({ shift: true, key: "s" }, () => setShowPopup(true), !!timer);
  useEscapeKey(() => { if (showPopup) closePopup(); });
  useClickOutside(popupRef, () => setShowPopup(false));




const updateConsumedTime = async () => {
  try {
    const jobId = timer?.entityType === "subtask" ? timer?.metadata?.parentTaskId : timer?.jobId;

    await axios.put(
      `${process.env.REACT_APP_API_URL}/api/v1/timer/total_time/${timer?._id}`,
      {},
      { params: { jobId } }
    );
  } catch (error) {
    console.log(error);
  }
};








  const handleConfirmStop = async () => {
    try {
      setStopping(true);
      await dispatch(stopTimer({ timerId: timer?._id, note: stopNote, activity: stopActivity })).unwrap();
      dispatch(stopCountdown());
      updateConsumedTime();
      toast.success("Timer stopped successfully");
    } catch (err) {
      toast.error(err || "Failed to stop timer");
    } finally {
      setStopping(false);
      closePopup();
    }
  };

  if (loading || !timer) return null;

  const dateObj = new Date(timer.startTime);
const startedAtFormatted = `${dateObj.toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  // second: "2-digit",
  hour12: true,
})} | ${dateObj.toLocaleDateString("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}`;

const handleTaskClick = () => {

  if(timer?.entityType === "subtask") {
     dispatch(
        openModal({
          modal: "task",
          data: { taskId: timer?.metadata?.parentTaskId   }, 
        })
      );

  } 
  
  if(timer?.entityType === "task") {
     dispatch(
        openModal({
          modal: "task",
          data: { taskId: timer.jobId   }, 
        })
      );
  } 

  if(timer?.entityType === "job") {
     dispatch(
        openModal({
          modal: "job",
          data: { clientId: timer.jobId   }, 
        })
      );
  } 
 
}

  return (
    <div className="relative font-google">
      {/* Pill */}
      <div className="bg-gray-50 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-100 hover:shadow-sm flex items-center gap-2 px-2.5 py-1">
        <div 
          onClick={() => setShowPopup(!showPopup)} 
        className="flex items-center gap-2 cursor-pointer">
          <LuClock3 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="w-[60px] text-center text-[13px] font-semibold text-gray-600 leading-none tabular-nums shrink-0">
            {formatTime(elapsed)}
          </span>
          {timer?.isRunning && (
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
          )}
        </div>
        <span className="w-px h-3.5 bg-gray-200 shrink-0" />
        <button
          onClick={openPopup}
          disabled={stopping}
          className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full bg-gray-100 text-gray-300 hover:text-red-500 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
        >
          <RiStopFill className="h-[15px] w-[15px]" />
        </button>
      </div>

      {/* Unified Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute top-full right-0 mt-3 w-96 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.25)] z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Running</span>
            </div>
            <button onClick={closePopup} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Timer info */}
          <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
            {/* Big live timer */}
            <div className="text-[36px] font-semibold text-gray-800 tabular-nums tracking-tight leading-none">
              {formatTime(elapsed)}
            </div>

            {/* Task / Client */}
            <div className="grid grid-cols-1 gap-2">
              {timer?.task ? (
                <div className="bg-gray-50 rounded-lg px-3 py-2 " >
                  <div className="w-full flex justify-between items-center gap-2 ">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Task</p>
                  <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wide mb-1  cursor-pointer" onClick={handleTaskClick}>View</p>
                  </div>
                  <p className="text-[13px] text-gray-800 font-semibold">{timer.task}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg px-3 py-2  ">
                   <div className="w-full flex justify-between items-center gap-2 ">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Client</p>
                  <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wide mb-1 cursor-pointer" onClick={handleTaskClick}>View</p>
                  </div>
                  <p className="text-[13px] text-gray-800 font-semibold">{timer?.clientName || "N/A"}</p>
                </div>
              )}
            </div>

            {/* Company + Department */}
            {(timer?.companyName || timer?.department) && (
              <div className="grid grid-cols-2 gap-2">
                {timer?.companyName && (
                  <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Company</p>
                    <p className="text-[12px] text-gray-700 font-semibold">{timer.companyName}</p>
                  </div>
                )}
                {timer?.department && (
                  <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Department</p>
                    <p className="text-[12px] text-gray-700 font-semibold">{timer.department}</p>
                  </div>
                )}
              </div>
            )}

            {/* Started at */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-[11px] text-gray-400">Started at</span>
              <span className="text-[11px] text-gray-600 font-mono">{startedAtFormatted}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-4" />

          {/* Stop section */}
          <div className="p-4 flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Note</label>
              <textarea
                ref={noteInputRef}
                value={stopNote}
                onChange={(e) => setStopNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (stopNote?.trim()) handleConfirmStop(); }
                }}
                placeholder="Add a note before stopping..."
                rows={3}
                className="w-full text-[13px] text-gray-700 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none outline-none focus:border-blue-400 focus:bg-white transition-colors duration-150"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Activity type</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
                {["Chargeable", "Non-Chargeable"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setStopActivity(option)}
                    className={`flex-1 text-[12px] font-medium py-1.5 rounded-md transition-all duration-150 ${
                      stopActivity === option ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closePopup}
                className="flex-1 text-[12px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStop}
                disabled={stopping}
                title="Press Enter to Stop"
                className="flex-1 text-[12px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {stopping ? "Stopping..." : (<>Stop <MdKeyboardReturn className="h-3.5 w-3.5 opacity-80" /></>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





































































































// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchGlobalTimer,
//   stopTimer,
//   tick,
// } from "../redux/slices/globalTimerSlice";
// import { LuClock3 } from "react-icons/lu";
// import { RiStopFill } from "react-icons/ri";
// import { useKeyboardShortcut } from "../utlis/useKeyboardShortcut";
// import { useEscapeKey } from "../utlis/useEscapeKey";
// import { useClickOutside } from "../utlis/useClickOutside";
// import toast from "react-hot-toast";
// import { MdKeyboardReturn } from "react-icons/md";

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

//   const showTooltipRef = useRef();
//   const [showTooltip, setShowTooltip] = useState(false);

//   // Stop popup state
//   const showStopPopupRef = useRef();
//   const showStopInputRef = useRef();
//   const [showStopPopup, setShowStopPopup] = useState(false);
//   const [stopping, setStopping] = useState(false);
//   const [stopNote, setStopNote] = useState("");
//   const [stopActivity, setStopActivity] = useState("Chargeable");

//   useEffect(() => {
//     dispatch(fetchGlobalTimer());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!timer?.isRunning) return;
//     const interval = setInterval(() => dispatch(tick()), 1000);
//     return () => clearInterval(interval);
//   }, [dispatch, timer?.isRunning]);

//   useEffect(() => {
//     if (showStopPopup) {
//       // Small timeout ensures the DOM has painted
//       const t = setTimeout(() => showStopInputRef.current?.focus(), 50);
//       return () => clearTimeout(t);
//     }
//   }, [showStopPopup]);

//   const handleStopClick = () => {
//     setShowStopPopup(true);

//     setShowTooltip(false);
//   };

//   // Shift + A
//   useKeyboardShortcut(
//     { shift: true, key: "a" },
//     () => setShowTooltip((prev) => !prev),
//     !!timer,
//   );

//   // Shift + S
//   useKeyboardShortcut(
//     { shift: true, key: "s" },
//     () => setShowStopPopup((prev) => !prev),
//     !!timer,
//   );

//   useEscapeKey(() => {
//     if (showStopPopup) {
//       setShowStopPopup(false);
//     }
//     if (showTooltip) {
//       setShowTooltip(false);
//     }
//   });

//   useClickOutside(showTooltipRef, () => {
//     setShowTooltip(false);
//   });

//   useClickOutside(showStopPopupRef, () => {
//     setShowStopPopup(false);
//   });

//   const handleConfirmStop = async () => {
//     try {
//       setStopping(true);

//       await dispatch(
//         stopTimer({
//           timerId: timer?._id,
//           note: stopNote,
//           activity: stopActivity,
//         }),
//       ).unwrap();

//       toast.success("Timer stopped successfully");
//     } catch (err) {
//       toast.error(err || "Failed to stop timer");
//     } finally {
//       setStopping(false);
//       setShowStopPopup(false);
//       setStopNote("");
//       setStopActivity("Chargeable");
//     }
//   };

//   const handleCancelStop = () => {
//     setShowStopPopup(false);
//     setStopNote("");
//     setStopActivity("Chargeable");
//   };

//   if (loading || !timer) return null;

//   const dateObj = new Date(timer.startTime);
//   const timeStr = dateObj.toLocaleTimeString("en-US");
//   const dateStr = dateObj.toLocaleDateString("en-US", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
//   const startedAtFormatted = `${timeStr} | ${dateStr}`;

//   return (
//     <div className="relative font-google bg-gray-50 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-100 hover:shadow-sm cursor-pointer">
//       <div className="w-full flex items-center gap-2 px-2.5 py-1">
//         <div
//           onClick={() => setShowTooltip(!showTooltip)}
//           className="w-full flex items-center gap-2"
//         >
//           <LuClock3 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
//           <span className="w-[60px] text-center text-[13px] font-semibold text-gray-600 leading-none tabular-nums shrink-0">
//             {formatTime(elapsed)}
//           </span>
//           {timer?.isRunning && (
//             <span className="relative flex h-1.5 w-1.5 shrink-0">
//               <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40 animate-ping" />
//               <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
//             </span>
//           )}
//         </div>

//         <span className="w-px h-3.5 bg-gray-200 shrink-0" />

//         <button
//           onClick={handleStopClick}
//           disabled={stopping}
//           className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full bg-gray-100 text-gray-300 hover:text-red-500 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
//         >
//           <RiStopFill className="h-[15px] w-[15px]" />
//         </button>
//       </div>






























//       {/* Tooltip */}
//       {showTooltip && (
//         <div
//           ref={showTooltipRef}
//           className="absolute top-full right-0 mt-3 w-72 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden p-4"
//         >
//           <div className="flex flex-col gap-3">
//             {/* Header */}
//             <div className="flex items-center justify-between">
//               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
//                 Running Timer
//               </span>
//               <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
//             </div>

//             {/* Task or Client */}
//             {timer?.task ? (
//               <div>
//                 <h4 className="text-[11px] text-gray-400 font-medium leading-none mb-1">
//                   Task
//                 </h4>
//                 <p className="text-[13px] text-gray-800 font-semibold  ">
//                   {timer?.task || "N/A"}
//                 </p>
//               </div>
//             ) : (
//               <div>
//                 <h4 className="text-[11px] text-gray-400 font-medium leading-none mb-1">
//                   Client
//                 </h4>
//                 <p className="text-[13px] text-gray-800 font-semibold ">
//                   {timer?.clientName || "N/A"}
//                 </p>
//               </div>
//             )}

//             {/* Company + Department */}
//             <div className="grid grid-cols-2 gap-2">
//               {timer?.companyName && (
//                 <div className="bg-gray-50 rounded-lg px-2.5 py-2">
//                   <h4 className="text-[10px] text-gray-400 font-medium leading-none mb-1">
//                     Company
//                   </h4>
//                   <p className="text-[12px] text-gray-700 font-semibold ">
//                     {timer.companyName}
//                   </p>
//                 </div>
//               )}
//               {timer?.department && (
//                 <div className="bg-gray-50 rounded-lg px-2.5 py-2">
//                   <h4 className="text-[10px] text-gray-400 font-medium leading-none mb-1">
//                     Department
//                   </h4>
//                   <p className="text-[12px] text-gray-700 font-semibold ">
//                     {timer.department}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Started at */}
//             <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
//               <span className="text-[11px] text-gray-500">Started at</span>
//               <span className="text-[11px] text-gray-700 font-mono">
//                 {startedAtFormatted.split("|")[0]}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}









































//       {/* Stop Confirmation Popup */}
//       {showStopPopup && (
//         <div
//           ref={showStopPopupRef}
//           className="absolute top-full right-0 mt-3 w-96 rounded-xl bg-white border border-gray-100   shadow-[0_8px_30px_rgb(0,0,0,0.20)] z-50 overflow-hidden"
//         >
//           {/* Header */}
//           <div className="px-4 pt-4 pb-3 border-b border-gray-100">
//             <div className="flex items-center gap-2">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
//                 <RiStopFill className="h-3.5 w-3.5 text-red-500" />
//               </div>
//               <span className="text-[13px] font-semibold text-gray-800">
//                 Stop Timer
//               </span>
//             </div>
//           </div>

//           <div className="p-4 flex flex-col gap-3">
//             {/* Note Input */}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
//                 Note
//               </label>
//               <textarea
//                 ref={showStopInputRef}
//                 value={stopNote}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault(); // prevent newline
//                     if (stopNote?.trim()?.length > 0) {
//                       handleConfirmStop();
//                     }
//                   }
//                 }}
//                 onChange={(e) => setStopNote(e.target.value)}
//                 placeholder="Add a note..."
//                 rows={4}
//                 className="w-full text-[13px] text-gray-700 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none outline-none focus:border-blue-400 focus:bg-white transition-colors duration-150"
//               />
//             </div>

//             {/* Activity Toggle */}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
//                 Activity Type
//               </label>
//               <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
//                 {["Chargeable", "Non-Chargeable"].map((option) => (
//                   <button
//                     key={option}
//                     onClick={() => setStopActivity(option)}
//                     className={`flex-1 text-[12px] font-medium py-1.5 rounded-md transition-all duration-150 ${
//                       stopActivity === option
//                         ? "bg-white text-gray-800 shadow-sm"
//                         : "text-gray-400 hover:text-gray-600"
//                     }`}
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex gap-2 pt-1">
//               <button
//                 onClick={handleCancelStop}
//                 className="flex-1 text-[12px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors duration-150"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmStop}
//                 title="Press Enter to Stop"
//                 disabled={stopping}
//                 className="flex-1 text-[12px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-1"
//               >
//                 {stopping ? (
//                   "Stopping..."
//                 ) : (
//                   <>
//                     Stop
//                     <span className="flex items-center gap-1 text-[10px] opacity-80 ml-1">
//                       <MdKeyboardReturn className="h-3.5 w-3.5" />
//                     </span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
