import { FiShield, FiCheckCircle } from "react-icons/fi";

export default function CommentItem({ comment, currentUserId }) {
  const isMe = comment.author?._id === currentUserId;
// Formats to: 12, Jan 2026 • 02:30 PM
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${day}, ${month} ${year} • ${time}`;
  };

  const readers = comment.readBy?.filter(user => user?.userId?._id !== comment.author?._id) || [];
 
  const renderContent = (text) =>
    text.split(/(@\w+(?:\s\w+)?)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className={`font-bold px-1 rounded ${isMe ? "bg-white/20 text-white" : "text-orange-600 bg-orange-50"}`}>
          {part}
        </span>
      ) : part
    );

  return (
    <div className={`flex flex-col mb-6 w-full ${isMe ? "items-end" : "items-start"}`}>
      
      {/* Header: Avatar and Name side-by-side */}
      <div className={`flex items-center gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <div className="flex-shrink-0">
          {comment.author?.avatar ? (
            <img 
              src={comment.author.avatar} 
              alt={comment.author.name} 
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {comment.author?.name?.charAt(0)}
            </div>
          )}
        </div>
        <span className="text-xs font-bold text-slate-700">
          {isMe ? "You" : comment.author?.name}
        </span>
        <span className="text-[10px] text-slate-400 font-normal">
          {formatDateTime(comment.createdAt)}
        </span>
      </div>

      {/* Message Bubble Block */}
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}>
        <div className={`px-4 py-3 rounded-2xl text-[14px] shadow-sm relative transition-all ${
          isMe 
            ? "bg-orange-600 text-white rounded-tr-none" 
            
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
        }`}>
           

          <p className="leading-relaxed whitespace-pre-wrap">
            {renderContent(comment.content)}
          </p>
        </div>

        {/* Footer: Seen By Avatars */}
        {readers.length > 0 && isMe && (
          <div className={`flex items-center gap-2 mt-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            <div className="flex -space-x-1.5 hover:space-x-1 transition-all">
              {readers.map(({ readAt, userId }) => (
                <div 
                  key={userId?._id}
                  className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden"
                  title={`Seen by ${userId?.name} at ${formatDateTime(readAt)}`}
                >
                  {userId?.avatar ? (
                    <img src={userId.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[6px] font-bold text-slate-400 uppercase">{userId?.name?.charAt(0)}</span>
                  )}
                </div>
              ))}
            </div>
            {isMe && <FiCheckCircle size={11} className="text-orange-500" />}
          </div>
        )}
      </div>
    </div>
  );
}