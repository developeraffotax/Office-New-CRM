import toast from "react-hot-toast";
import { stopCountdown } from "../redux/slices/timerSlice";
import { fetchGlobalTimer } from "../redux/slices/globalTimerSlice";
import { formatTo12Hour } from "../utlis/formatTo12Hour";
 
export const showShiftEndToast = (data) => {
  toast.custom((t) => (
    <div
      className={`
        max-w-md w-full font-inter
        bg-white/95 backdrop-blur-md
        border border-slate-200/60
        shadow-[0_8px_30px_rgb(0,0,0,0.08)]
        rounded-2xl
        pointer-events-auto
        flex gap-4 p-4
        transition-all duration-300 hover:scale-[1.01]
        relative overflow-hidden
        ${t.visible
          ? "animate-in fade-in slide-in-from-right-5"
          : "animate-out fade-out slide-out-to-right-5"
        }
      `}
    >
      {/* Decorative Gradient Background Blur */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />

      {/* Icon Container */}
      <div className="
        flex items-center justify-center
        w-11 h-11
        rounded-xl
        bg-orange-50
        text-orange-600
        ring-1 ring-orange-200/50
        flex-shrink-0
        text-xl
      ">
        ⏰
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-col">
          <p className="text-[15px] font-bold text-slate-900 tracking-tight">
            Shift Ended | {formatTo12Hour(data?.endTime)}
          </p>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mt-0.5">
            {data?.message || "Timer stopped automatically."}
          </p>
        </div>

        {/* Badges Container */}
        {(data?.task || data?.clientName) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data?.task && (
              <span className="
                inline-flex items-center gap-1.5
                px-2.5 py-1
                text-[11px] font-bold uppercase tracking-wider
                rounded-md
                bg-slate-100 text-slate-600
                border border-slate-200/50
              ">
                <span className="opacity-70">Task:</span> {data.task}
              </span>
            )}
            {data?.clientName && (
              <span className="
                inline-flex items-center gap-1.5
                px-2.5 py-1
                text-[11px] font-bold uppercase tracking-wider
                rounded-md
                bg-blue-50 text-blue-700
                border border-blue-100
              ">
                <span className="opacity-70">Client:</span> {data.clientName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="
          h-8 w-8
          inline-flex items-center justify-center
          rounded-lg
          text-slate-400
          hover:text-slate-600
          hover:bg-slate-100
          transition-colors
          flex-shrink-0
        "
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  ), {
    duration: Infinity,
    position: "top-center",
  });
};



export const registerShiftEndListener = (socket, dispatch) => {
  if (!socket) return;
  
  socket.on("timer:autoStopped", (data) => {
    console.log("Shift end timer received:", data);

    dispatch(stopCountdown());
    dispatch(fetchGlobalTimer());
    
    showShiftEndToast(data); // ✅ modern toast


    const audio = new Audio("/beep.mp3");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  });

  return () => {
    socket.off("timer:autoStopped");
  };
};











 
