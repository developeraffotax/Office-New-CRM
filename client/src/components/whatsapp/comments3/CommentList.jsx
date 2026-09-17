import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { FiX, FiMessageCircle, FiLoader } from "react-icons/fi";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import axios from "axios";
import { useOverlayStack } from "../hooks/useOverlayStack";
import { useIsMobile } from "../hooks/useIsMobile"; 
import { useSwipeToClose } from "../hooks/useSwipeToClose";  

export default function CommentList({
  conversationId,
  threadSubject,
  currentUserId,
  onClose,
  users,
  show,
}) {
  const isMobile = useIsMobile();

  const [comments, setComments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const commentRef = useRef(null);

  // Swipe-to-close (mobile only, from the drag handle)
  const { offset, isDragging, handlers } = useSwipeToClose({
    onClose,
    enabled: isMobile,
    threshold: 110,
  });

  useOverlayStack({
    ref: commentRef,
    onClose: () => onClose(),
    isOpen: show,
  });

  // Fetch comments when conversation changes
  useEffect(() => {
    if (conversationId) fetchComments("initial");
  }, [conversationId]);

  // Scroll to bottom after comments render
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
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/comments`,
        data,
      );

      shouldAutoScrollRef.current = true;
      await fetchComments("refresh");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Disable auto-scroll when user scrolls up
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    shouldAutoScrollRef.current = isAtBottom;
  };

  if (!conversationId) return null;

  return (
    <div
      className="fixed inset-0 font-inter z-[99999] pointer-events-none"
      ref={commentRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Panel / Bottom sheet */}
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
        className={`
          absolute bg-gray-50 border border-slate-200 flex flex-col overflow-hidden pointer-events-auto
          ${
            isMobile
              ? "inset-x-0 bottom-0 max-h-[92dvh] min-h-[80dvh] rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)]"
              : "bottom-4 right-4 w-[480px] h-[700px] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-pop"
          }
        `}
      >
        {/* Drag handle – mobile only */}
        {isMobile && (
          <div
            {...handlers}
            className="flex justify-center pt-3 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-1.5 rounded-full bg-slate-300" />
          </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-orange-600 rounded-lg text-white flex-shrink-0">
              <FiMessageCircle size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 flex flex-col">
                Comments
                {threadSubject && (
                  <span
                    title={threadSubject}
                    className="text-xs text-gray-500 font-normal truncate max-w-[200px] sm:max-w-[240px]"
                  >
                    {threadSubject}
                  </span>
                )}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 flex-shrink-0"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Comments list */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-white custom-scrollbar overscroll-contain"
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
        <div className="flex-shrink-0 bg-slate-50 border-t border-slate-100">
          <CommentForm
            conversationId={conversationId}
            onAddComment={handleAddComment}
            loading={sending}
            users={users}
          />
        </div>
      </div>
    </div>
  );
}