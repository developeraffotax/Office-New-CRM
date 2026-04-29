import toast from "react-hot-toast";
import { stopCountdown } from "../redux/slices/timerSlice";
import { fetchGlobalTimer } from "../redux/slices/globalTimerSlice";
import { formatLocalTimeTo12Hour } from "../utlis/formatTo12Hour";

export const showShiftEndToast = (data) => {
  toast.custom((t) => (
    <div
      className={`
        max-w-md w-full font-inter
        bg-zinc-950 border border-zinc-800
        shadow-2xl rounded-2xl
        pointer-events-auto
        flex gap-4 p-4
        transition-all duration-300 hover:border-zinc-700
        relative overflow-hidden
        ${t.visible
          ? "animate-pop"
          : "animate-pop"
        }
      `}
    >
      {/* Subtle Glow Effect for better depth */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Container - Higher contrast orange */}
      <div className="
        flex items-center justify-center
        w-12 h-12
        rounded-xl
        bg-orange-500/20
        text-orange-400
        border border-orange-500/30
        flex-shrink-0
        text-2xl
      ">
        ⏰
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-col">
          <p className="text-[16px] font-semibold text-white tracking-tight leading-tight">
            {data?.reasonToStop || "Timer stopped"} 
            <span className="mx-2 text-zinc-500 font-normal">|</span>
            <span className="text-orange-400">{formatLocalTimeTo12Hour(data?.stopTime)}</span>
          </p>
          <p className="text-[14px] text-zinc-300 font-medium leading-relaxed mt-1">
            {data?.message || "Timer stopped automatically."}
          </p>
        </div>

        {/* Badges Container - Improved legibility */}
        {(data?.task || data?.clientName) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data?.task && (
              <span className="
                inline-flex items-center gap-1.5
                px-2.5 py-1
                text-[10px] font-bold uppercase tracking-widest
                rounded-md
                bg-zinc-800 text-zinc-100
                border border-zinc-700
              ">
                <span className="text-zinc-500">Task:</span> {data.task}
              </span>
            )}
            {data?.clientName && (
              <span className="
                inline-flex items-center gap-1.5
                px-2.5 py-1
                text-[10px] font-bold uppercase tracking-widest
                rounded-md
                bg-blue-900/40 text-blue-300
                border border-blue-800/50
              ">
                <span className="text-blue-400/60">Client:</span> {data.clientName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Close Button - Larger tap target and clearer hover */}
      <button
        onClick={() => toast.remove(t.id)}
        className="
          h-8 w-8
          inline-flex items-center justify-center
          rounded-full
          text-zinc-500
          hover:text-white
          hover:bg-zinc-800
          transition-all
          flex-shrink-0
        "
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    dispatch(stopCountdown());
    dispatch(fetchGlobalTimer());
    showShiftEndToast(data);

    const audio = new Audio("/beep.mp3");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  });

  return () => {
    socket.off("timer:autoStopped");
  };
};