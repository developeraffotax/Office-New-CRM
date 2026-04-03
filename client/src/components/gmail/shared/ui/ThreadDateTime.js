import clsx from "clsx";

export default function ThreadDateTime({
  thread,
  folder,
  index,
}) {
  const messageAt = folder === "inbox" ? thread.lastMessageAtInbox : thread.lastMessageAtSent;
  const messageDate = new Date(messageAt);

  const isToday = messageDate.toDateString() === new Date().toDateString();

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
    <div className="relative group/time flex flex-col items-end text-right font-google">
      {/* Time Display */}
      <div className="text-[12px] text-gray-800 font-medium tabular-nums cursor-default">
        {display}
      </div>

      {/* --- PREMIUM POPUP --- */}
      <div
        className={clsx(
          "invisible group-hover/time:visible opacity-0 group-hover/time:opacity-100 transition-all duration-200 ease-out",
          "absolute right-0 w-max min-w-[210px] z-[9999] pointer-events-none",
          index === 0 ? "top-full mt-2.5" : "bottom-full mb-2.5"
        )}
      >
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/10">
          <p className="text-[12px] font-semibold whitespace-nowrap tracking-tight">
            {fullDisplay}
          </p>
          <div className="flex items-center gap-2 mt-1.5 opacity-70">
            <div className="size-1.5 rounded-full bg-orange-400" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              {folder === "inbox" ? "Last Received" : "Last Sent"}
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