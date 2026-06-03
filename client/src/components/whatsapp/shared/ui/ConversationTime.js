import { IoMdSearch, IoMdOptions } from "react-icons/io";
import clsx from "clsx";

// Helper component to handle the dynamic time and premium tooltip
export function ConversationTime({ lastMessageAt, index }) {
  if (!lastMessageAt) return null;

  const messageDate = new Date(lastMessageAt);
  const isToday = messageDate.toDateString() === new Date().toDateString();

  // Short display for the list item
  const display = isToday
    ? messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: messageDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      });

  // Long display for the hover popup
  const fullDisplay = messageDate.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="relative group/time flex flex-col items-end text-right font-google flex-shrink-0 ml-2">
      {/* Time Display */}
      <div className="text-xs text-gray-500 font-medium tabular-nums cursor-default">
        {display}
      </div>

      {/* --- PREMIUM POPUP --- */}
      <div
        className={clsx(
          "invisible group-hover/time:visible opacity-0 group-hover/time:opacity-100 transition-all duration-200 ease-out",
          "absolute right-0 w-max min-w-[210px] z-[9999] pointer-events-none text-left",
          index === 0 ? "top-full mt-2.5" : "bottom-full mb-2.5" // Adjusts popup direction for the first item
        )}
      >
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/10 relative">
          <p className="text-[12px] font-semibold whitespace-nowrap tracking-tight">
            {fullDisplay}
          </p>
          <div className="flex items-center gap-2 mt-1.5 opacity-70">
            <div className="size-1.5 rounded-full bg-orange-400" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Last Message
            </p>
          </div>
        </div>

        {/* Arrow pointer */}
        <div
          className={clsx(
            "absolute right-4 size-2.5 rotate-45 bg-gray-900/95 border-white/10",
            index === 0 ? "bottom-full -mb-1.5 border-t border-l" : "top-full -mt-1.5 border-b border-r"
          )}
        />
      </div>
    </div>
  );
}