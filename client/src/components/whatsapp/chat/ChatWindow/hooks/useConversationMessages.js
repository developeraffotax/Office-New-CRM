import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function useConversationMessages(chat, socket, setReplyingTo) {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesContainerRef = useRef(null);
  const loadMoreSentinelRef = useRef(null);

  useEffect(() => {
    if (!chat?._id || !socket) return;
    socket.emit("whatsapp:join-conversation", { conversationId: chat._id });
    return () => {
      socket.emit("whatsapp:leave-conversation", { conversationId: chat._id });
    };
  }, [chat?._id, socket]);

  useEffect(() => {
    if (!chat?._id || !socket) return;

    const handleMessage = ({ conversationId, message }) => {
      if (conversationId !== chat?._id) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const handleStatus = ({ messageId, status, statusUpdatedAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status, statusUpdatedAt } : msg
        )
      );
    };

    const handleReaction = ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== messageId) return msg;
          const existingReactions = msg.reactions || [];
          const filtered = existingReactions.filter((r) => r.from !== reaction.from);
          return { ...msg, reactions: [...filtered, reaction] };
        })
      );
    };

    socket.on("whatsapp:message-created", handleMessage);
    socket.on("whatsapp:message-status-updated", handleStatus);
    socket.on("whatsapp:reaction-updated", handleReaction);

    return () => {
      socket.off("whatsapp:message-created", handleMessage);
      socket.off("whatsapp:message-status-updated", handleStatus);
      socket.off("whatsapp:reaction-updated", handleReaction);
    };
  }, [chat?._id, socket]);

  useEffect(() => {
    if (!chat?._id) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          { params: { limit: 50 } }
        );
        setMessages(data.messages || []);
        setPagination({
          hasMore: data.pagination?.hasMore || false,
          nextCursor: data.pagination?.nextCursor || null,
        });
        setReplyingTo(null);
      } catch (err) {
        console.error("Failed to fetch messages", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to fetch messages");
      }
    };

    fetchMessages();
  }, [chat?._id]);

  const loadMoreMessages = async () => {
    if (loadingMore || !pagination.hasMore || !pagination.nextCursor || !chat?._id) return;

    setLoadingMore(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
        {
          params: {
            limit: 50,
            cursorTimestamp: pagination.nextCursor.timestamp,
            cursorId: pagination.nextCursor.id,
          },
        }
      );

      setMessages((prev) => [...(data.messages || []), ...prev]);
      setPagination({
        hasMore: data.pagination?.hasMore || false,
        nextCursor: data.pagination?.nextCursor || null,
      });
    } catch (err) {
      console.error("Failed to load older messages", err);
      toast.error("Failed to load older messages");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!pagination.hasMore) return;
    const sentinel = loadMoreSentinelRef.current;
    const container = messagesContainerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreMessages();
      },
      { root: container, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.hasMore, pagination.nextCursor, chat?._id]);

  return {
    messages,
    setMessages,
    pagination,
    loadingMore,
    messagesContainerRef,
    loadMoreSentinelRef,
  };
}