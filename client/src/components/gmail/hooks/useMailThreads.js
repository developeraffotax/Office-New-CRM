import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSocket } from "../../../context/socketProvider";
import { useSearchParams } from "react-router-dom";

// ----------------- Filter matcher -----------------
function matchesFilters(thread, filters) {
  if (!thread || !filters) return false;

  const { label, unreadOnly, startDate, endDate, category } = filters;

  if (label && !thread.labels?.includes(label)) return false;
  if (unreadOnly && thread.unreadCount <= 0) return false;

  if (startDate && new Date(thread.lastMessageAt) < new Date(startDate)) return false;
  if (endDate && new Date(thread.lastMessageAt) > new Date(endDate)) return false;

  if (category && thread.category !== category) return false;

  return true;
}

// ----------------- Hook -----------------
export function useMailThreads({ endpoint }) {
  const socket = useSocket();
  const [searchParams] = useSearchParams();

  // ✅ folder comes ONLY from query params
  const folder = searchParams.get("folder") || "inbox";
  const companyName = searchParams.get("companyName") || "affotax";

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    userId: "",
    category: "",
    label: "INBOX", // default
    startDate: "",
    endDate: "",
    unreadOnly: false,
    page: 1,
    limit: 20,
  });

  // 🔁 Keep label in sync with folder
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      label: folder === "sent" ? "SENT" : "INBOX",
      page: 1, // reset pagination on folder switch
    }));
  }, [folder]);

  // ---------------- Fetch threads from API ----------------
  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(endpoint, {
        params: {
          folder,   // 👈 injected from URL
          companyName,
          ...filters,
        },
      });

      setThreads(data.threads);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters, folder, companyName]);

  // ---------------- Update single thread via API ----------------
  const handleUpdateThread = async (threadId, updateData) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/update-thread/${threadId}`,
        updateData
      );

      if (data?.success) {
        const updatedThread = data.thread;
        setThreads(prev =>
          prev.map(t => (t._id === updatedThread._id ? updatedThread : t))
        );
      }
    } catch (err) {
      console.error("Failed to update thread:", err);
    }
  };

  // ---------------- Initial fetch & filter change ----------------
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // ---------------- Socket listener for delta updates ----------------
  useEffect(() => {
    if (!socket) return;

    const handler = ({ action, thread }) => {
      setThreads(prev => {
        let newThreads;

        switch (action) {
          case "updated": {
            const exists = prev.find(t => t._id === thread._id);

            if (exists) {
              newThreads = prev
                .map(t => (t._id === thread._id ? { ...t, ...thread } : t))
                .filter(t => matchesFilters(t, filters));
            } else if (matchesFilters(thread, filters)) {
              newThreads = [thread, ...prev];
            } else {
              newThreads = prev;
            }
            break;
          }

          default:
            newThreads = prev;
        }

        return newThreads.sort((a, b) => {
          const dateA = new Date(a.lastMessageAtInbox || a.lastMessageAtSent || 0);
          const dateB = new Date(b.lastMessageAtInbox || b.lastMessageAtSent || 0);
          return dateB - dateA;
        });
      });
    };

    socket.on("gmail:thread-delta", handler);
    return () => socket.off("gmail:thread-delta", handler);
  }, [socket, filters]);

  return {
    threads,
    loading,
    pagination,
    filters,
    setFilters,
    handleUpdateThread,
    fetchThreads,
    folder, // optional but useful
    companyName
  };
}
