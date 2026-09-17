import { FiCheckCircle } from "react-icons/fi";

export default function CommentItem({ comment, currentUserId }) {
  const isMe = comment.author?._id === currentUserId;

  // Formats to: 12 Jan 2026 · 02:30 PM
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${day} ${month} ${year} · ${time}`;
  };

  const readers =
    comment.readBy?.filter((user) => user?.userId?._id !== comment.author?._id) || [];

  const renderContent = (text) =>
    text.split(/(@\w+(?:\s\w+)?)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span
          key={i}
          className={`font-semibold px-0.5 rounded ${
            isMe ? "bg-slate-700/20 text-slate-800" : "text-slate-800 bg-slate-100"
          }`}
        >
          {part}
        </span>
      ) : (
        part
      )
    );

  return (
    <div className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}>
      {/* Meta row */}
      <div className={`flex items-center gap-1.5 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <div className="flex-shrink-0">
          {comment.author?.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-600">
              {comment.author?.name?.charAt(0)}
            </div>
          )}
        </div>
        <span className="text-[11px] font-semibold text-slate-700">
          {isMe ? "You" : comment.author?.name}
        </span>
        <span className="text-[10px] text-slate-400 tabular-nums">
          {formatDateTime(comment.createdAt)}
        </span>
      </div>

      {/* Bubble */}
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}>
        <div
          className={`px-3 py-2 text-[13px] leading-snug rounded-md ${
            isMe
              ? "bg-slate-800 text-white rounded-br-sm"
              : "bg-slate-100 text-slate-800 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{renderContent(comment.content)}</p>
        </div>

        {/* Read receipts */}
        {readers.length > 0 && isMe && (
          <div className="flex items-center gap-1 mt-1 px-0.5">
            <div className="flex -space-x-1">
              {readers.map(({ readAt, userId }) => (
                <div
                  key={userId?._id}
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-white bg-slate-200 overflow-hidden flex items-center justify-center"
                  title={`Seen by ${userId?.name} at ${formatDateTime(readAt)}`}
                >
                  {userId?.avatar ? (
                    <img src={userId.avatar} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <span className="text-[6px] font-bold text-slate-500 uppercase">
                      {userId?.name?.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <FiCheckCircle size={10} className="text-emerald-500" />
          </div>
        )}
      </div>
    </div>
  );
}