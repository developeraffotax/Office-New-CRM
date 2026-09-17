import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { FiX, FiMessageCircle, FiLoader } from "react-icons/fi";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import axios from "axios";
import { useEscapeKey } from "../../../utlis/useEscapeKey";
import { useIsMobile } from "../hooks/useIsMobile";
import { useSwipeToClose } from "../hooks/useSwipeToClose";

export default function CommentList({
  conversationId,
  threadSubject,
  currentUserId,
  onClose,
  users,
  anchored = false,
  maxHeight = 480,
}) {
  const isMobile = useIsMobile();

  const [comments, setComments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const { offset, isDragging, handlers } = useSwipeToClose({
    onClose,
    enabled: isMobile && !anchored,
    threshold: 110,
  });

  useEscapeKey(() => conversationId && onClose());

  useEffect(() => {
    if (conversationId) fetchComments("initial");
  }, [conversationId]);

  useLayoutEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [comments]);

  const fetchComments = async (mode = "initial") => {
    if (mode === "initial") setInitialLoading(true);
    if (mode === "refresh") setRefreshing(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/comments/${conversationId}`,
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/comments`, data);
      shouldAutoScrollRef.current = true;
      await fetchComments("refresh");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    shouldAutoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  if (!conversationId) return null;

  const panelBody = (
    <>
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-white flex-shrink-0">
            <FiMessageCircle size={15} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-slate-900 leading-none">Comments</h3>
            {/* {threadSubject && (
              <p title={threadSubject} className="mt-0.5 text-[11px] text-slate-500 truncate max-w-[200px]">
                {threadSubject}
              </p>
            )} */}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <FiX size={15} />
        </button>
      </div>

      {/* Comments list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5 bg-white custom-scrollbar overscroll-contain"
      >
        {initialLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 py-10">
            <FiLoader className="animate-spin" size={18} />
            <p className="text-[11px] font-medium">Loading…</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <FiMessageCircle size={18} />
            </div>
            <p className="text-[12px] font-medium text-slate-600">No comments yet</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Start the conversation below</p>
          </div>
        ) : (
          <>
            {comments.map((c) => (
              <CommentItem key={c._id} comment={c} currentUserId={currentUserId} users={users} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80">
        <CommentForm conversationId={conversationId} onAddComment={handleAddComment} loading={sending} users={users} />
      </div>
    </>
  );

  // ---- Anchored popover (desktop) ----
  if (anchored && !isMobile) {
    return (
      <div
        style={{ width: 340, maxHeight }}
        className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-400/60 font-inter"
      >
        {panelBody}
      </div>
    );
  }

  // ---- Fixed / bottom-sheet fallback (mobile) ----
  return (
    <div className="fixed inset-0 font-inter z-50 pointer-events-none">
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px] pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={
          isMobile
            ? {
                transform: `translateY(${offset}px)`,
                transition: isDragging ? "none" : "transform 0.25s ease-out",
              }
            : undefined
        }
        className={`absolute bg-white border border-slate-200 flex flex-col overflow-hidden pointer-events-auto ${
          isMobile
            ? "inset-x-0 bottom-0 max-h-[92dvh] min-h-[80dvh] rounded-t-xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            : "bottom-4 right-4 w-[400px] h-[540px] rounded-lg shadow-xl shadow-slate-300/40 animate-pop"
        }`}
      >
        {isMobile && (
          <div
            {...handlers}
            className="flex justify-center pt-2.5 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
          >
            <div className="w-9 h-1 rounded-full bg-slate-300" />
          </div>
        )}
        {panelBody}
      </div>
    </div>
  );
}