import { useState, useRef, useEffect } from "react";
import { FiSend, FiUser, FiLoader, FiAtSign } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function CommentForm({ threadId, onAddComment, loading, users = [] }) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null); // Ref for the scrollable list
  const itemRefs = useRef([]); // Ref array for each user button

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  // Auto-scroll logic: Keep the selected item in view
  useEffect(() => {
    if (showMentions && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: "nearest", // Only scrolls if the item is out of view
        behavior: "smooth",
      });
    }
  }, [selectedIndex, showMentions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionFilter]);

  useEffect(() => {
    textareaRef?.current?.focus()
  }, [])

  const handleTextChange = (e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setContent(value);

    const textBeforeCursor = value.substring(0, cursorPosition);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      setShowMentions(true);
      setMentionFilter(lastWord.substring(1));
    } else {
      setShowMentions(false);
    }
  };

  const selectUser = (selectedUser) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBefore = content.substring(0, cursorPosition);
    const textAfter = content.substring(cursorPosition);

    const words = textBefore.split(/\s/);
    words.pop();

    const newContent = [...words, `@${selectedUser.name} `].join(" ") + textAfter;

    setContent(newContent);
    setMentions((prev) => [...new Set([...prev, selectedUser._id])]);
    setShowMentions(false);

    setTimeout(() => textareaRef.current.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectUser(filteredUsers[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    const finalMentions = mentions.filter((id) => {
      const user = users.find((u) => u._id === id);
      return user && content.includes(`@${user.name}`);
    });

    await onAddComment({
      threadId,
      content,
      mentions: finalMentions,
      isInternal: false,
    });

    setContent("");
    setMentions([]);
  };

  return (
    <div className=" ">
      <div className="max-w-4xl mx-auto relative p-4">
        {/* Mention Suggestion Popover */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-4 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mention Team</span>
              <FiAtSign className="text-slate-300" size={12} />
            </div>
            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className="max-h-72 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200"
            >
              {filteredUsers.map((user, index) => (
                <button
                  key={user._id}
                  ref={(el) => (itemRefs.current[index] = el)} // Assign ref to each button
                  type="button"
                  onClick={() => selectUser(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all outline-none
                    ${index === selectedIndex ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"}
                  `}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                    ${index === selectedIndex ? "bg-orange-200 text-orange-700" : "bg-slate-100 text-slate-500"}
                  `}>
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="group relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (use @ to mention)"
            className="w-full p-2   bg-slate-50 border border-slate-200 rounded-lg resize-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all text-sm leading-relaxed min-h-[100px] outline-none"
          />

          <div className="  flex justify-end items-center">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg transition-all active:scale-95
                ${loading || !content.trim()
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-200"
                }
              `}
            >
              {loading ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <>
                  <span>Send</span>
                  <FiSend className="mb-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}