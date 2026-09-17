import { useState, useRef, useEffect } from "react";
import { FiSend, FiLoader, FiAtSign } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function CommentForm({ conversationId, onAddComment, loading, users = [] }) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef([]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  useEffect(() => {
    if (showMentions && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, showMentions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionFilter]);

  useEffect(() => {
    textareaRef?.current?.focus();
  }, []);

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
      conversationId,
      content,
      mentions: finalMentions,
      isInternal: false,
    });

    setContent("");
    setMentions([]);
  };

  return (
    <div className="relative px-3 py-2.5">
      {/* Mention popover */}
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-3 right-3 mb-1.5 max-w-xs bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              Mention
            </span>
            <FiAtSign className="text-slate-300" size={11} />
          </div>
          <div
            ref={scrollContainerRef}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filteredUsers.map((user, index) => (
              <button
                key={user._id}
                ref={(el) => (itemRefs.current[index] = el)}
                type="button"
                onClick={() => selectUser(user)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] transition-colors outline-none
                  ${
                    index === selectedIndex
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold
                    ${
                      index === selectedIndex
                        ? "bg-slate-300 text-slate-800"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment… (@ to mention)"
          rows={3}
          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-md resize-none text-[13px] leading-snug text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-300 transition-shadow"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={`inline-flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-semibold rounded-md transition-colors
              ${
                loading || !content.trim()
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900"
              }
            `}
          >
            {loading ? (
              <FiLoader className="animate-spin" size={13} />
            ) : (
              <>
                <span>Send</span>
                <FiSend size={12} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}