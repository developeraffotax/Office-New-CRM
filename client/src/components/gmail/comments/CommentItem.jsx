import { FiShield } from "react-icons/fi";

export default function CommentItem({ comment, currentUserId }) {
  const isMe = comment.author?._id === currentUserId;

  const renderContent = (text) =>
    text.split(/(@\w+(?:\s\w+)?)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-blue-500 font-bold">{part}</span>
      ) : part
    );

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13.5px] ${
        comment.isInternal
          ? "bg-amber-50 border border-amber-100"
          : "bg-white border border-slate-100"
      }`}>
        {comment.isInternal && (
          <div className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 mb-1">
            <FiShield size={10} /> Internal Note
          </div>
        )}

        <p className="text-slate-700 leading-relaxed">
          {renderContent(comment.content)}
        </p>
      </div>

      <div className="text-[10px] text-slate-400 mt-1">
        {comment.author?.name} ·{" "}
        {new Date(comment.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
