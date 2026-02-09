import { useState, useRef } from "react";
import { FiSend, FiPaperclip, FiShield, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";

// Mock users - replace with your actual team data or a prop
const TEAM_MEMBERS = [
  { _id: "1", name: "John Doe" },
  { _id: "2", name: "Alice Smith" },
  { _id: "3", name: "Bob Wilson" }
];

export default function CommentForm({ threadId, onAddComment, loading, users }) {
  const [content, setContent] = useState("");
 const [mentions, setMentions] = useState([]); // [userId]
  
  
    const {
    auth: { user },
  } = useSelector((state) => state.auth);
  // Mention UI State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setContent(value);

    // Logic to detect @
    const lastChar = value.slice(-1);
    const words = value.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      setShowMentions(true);
      setMentionFilter(lastWord.substring(1));
    } else {
      setShowMentions(false);
    }
  };

const selectUser = (user) => {
  const words = content.split(/\s/);
  words.pop();

  const newContent = [...words, `@${user.name} `].join(" ");
  setContent(newContent);

  // 🔥 store ONLY user._id
  setMentions((prev) =>
    prev.includes(user._id) ? prev : [...prev, user._id]
  );

  setShowMentions(false);
  textareaRef.current.focus();
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!content.trim()) return;

  await onAddComment({
    threadId,
    content,
    mentions,       // [ObjectId]
    isInternal: false // or toggle later
  });

  setContent("");
  setMentions([]);
};

  return (
    <div className="relative p-4 bg-white border-t border-slate-100">
      {/* Mention Suggestion Popover */}
      {showMentions && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
          <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
            Mention Team Member
          </div>
          <div className="max-h-40 overflow-y-auto">
            {users.filter(u => u.name.toLowerCase().includes(mentionFilter.toLowerCase())).map(user => (
              <button
                key={user._id}
                type="button"
                onClick={() => selectUser(user)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 text-sm text-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]"><FiUser /></div>
                {user.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder="Type @ to mention someone..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm min-h-[80px]"
        />

        <div className="flex justify-between items-center">
           

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
          >
            Send <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
}