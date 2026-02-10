import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { FiX, FiMessageCircle, FiLoader } from "react-icons/fi";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import axios from "axios";
import { useEscapeKey } from "../../../utlis/useEscapeKey";

export default function CommentList({ threadId, threadSubject, currentUserId, onClose, users }) {
  const [comments, setComments] = useState([]);


const [initialLoading, setInitialLoading] = useState(false);
const [sending, setSending] = useState(false);
const [refreshing, setRefreshing] = useState(false);

  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  // Fetch comments when thread changes
useEffect(() => {
  if (threadId) fetchComments("initial");
}, [threadId]);

// Scroll to bottom reliably after comments render
useLayoutEffect(() => {
  if (!shouldAutoScrollRef.current) return;
  const el = scrollContainerRef.current;
  if (!el) return;

  // Use requestAnimationFrame to wait for DOM update
  requestAnimationFrame(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });
}, [comments]);

const fetchComments = async (mode = "initial") => {
  if (mode === "initial") setInitialLoading(true);
  if (mode === "refresh") setRefreshing(true);

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/v1/gmail/comments/${threadId}`
    );

    if (res?.data?.data) {
      setComments(res.data.data);
      shouldAutoScrollRef.current = true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    setInitialLoading(false);
    setRefreshing(false);
  }
};


const handleAddComment = async (data) => {
  if (sending) return;

  setSending(true);
  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/gmail/comments`,
      data
    );

    shouldAutoScrollRef.current = true;
    await fetchComments("refresh");
  } catch (err) {
    console.error(err);
  } finally {
    setSending(false);
  }
};


  // Detect if user scrolls up (disable auto-scroll)
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 40;

    shouldAutoScrollRef.current = isAtBottom;
  };

  useEscapeKey(onClose)

  if (!threadId) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="absolute bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-pop">

        {/* Header */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
 

          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-600 rounded-lg text-white">
              <FiMessageCircle size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex flex-col justify-start items-start  ">
                Thread Comments
                <span title={threadSubject} className="text-xs text-gray-500 font-normal truncate max-w-[220px]">Subject: {threadSubject || ""}</span>
              </h3>
             
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Comments */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar "
        >
{initialLoading ? (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
    <FiLoader className="animate-spin" size={24} />
    <p className="text-xs">Loading discussion…</p>
  </div>
) : comments.length === 0 ? (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
      <FiMessageCircle size={32} />
    </div>
    <h4 className="text-slate-800 font-semibold text-sm">
      No Comments
    </h4>
  </div>
) : (
  <>
    {comments.map((comment) => (
      <CommentItem
        key={comment._id}
        comment={comment}
        currentUserId={currentUserId}
        users={users}
      />
    ))}
    <div ref={bottomRef} />
  </>
)}

        </div>

        {/* Input */}
        <div className="  bg-slate-50 border-t border-slate-100">
          <CommentForm
            threadId={threadId}
            onAddComment={handleAddComment}
            loading={sending}
            users={users}
          />
        </div>
      </div>
    </div>
  );
}
