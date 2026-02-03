import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSocket } from "../../../context/socketProvider";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2"
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
    search: ""
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
      toast.error(`Failed to load ${folder}`)
      console.error("Failed to fetch threads:", err);
      setThreads([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters, folder, companyName]);

  // ---------------- Update single thread via API ----------------
  const handleUpdateThread = async (_id, updateData) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/update-thread/${_id}`,
        updateData
      );

      if (data?.success) {
        const updatedThread = data.thread;
        setThreads(prev =>
          prev.map(t => (t._id === updatedThread._id ? updatedThread : t))
        );
      }
    } catch (err) {
      toast.error("Failed to update thread!")
      console.error("Failed to update thread:", err);
    }
  };







    const markAsRead = async (threadId, companyName) => {
  if (!threadId) return;

  try {
    const {data} = await axios.patch(
      `${process.env.REACT_APP_API_URL}/api/v1/gmail/mark-as-read/${threadId}`,
      { companyName: companyName } // pass companyName for Gmail auth
    );

  

    if (data?.success && !data?.alreadyRead) {
        const updatedThread = data.thread;
        setThreads(prev =>
          prev.map(t => (t._id === updatedThread._id ? updatedThread : t))
        );

        toast.success("Marked as read!")
      }
    // Optionally, update local state to reflect unreadCount = 0 if you track it
    // e.g., emailDetail.unreadCount = 0;
  } catch (error) {
    console.error("Failed to mark thread as read:", error);
  }
};




 



const deleteThread = async (threadId, companyName) => {
 if (!threadId) return;
  const {isConfirmed} = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    console.log(threadId, companyName)
    if(!isConfirmed) return;

 
 

  try {
    const { data } = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/v1/gmail/delete/${threadId}`,
      {
        data: { companyName }, // DELETE request body must be inside `data`
      }
    );

    if (data?.success) {
      // Remove the deleted thread from local state
      setThreads(prev => prev.filter(t => t.threadId !== threadId));

      toast.success("Thread deleted successfully!");
    }
  } catch (error) {
    console.error("Failed to delete thread:", error);
    toast.error("Failed to delete thread!");
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

    socket.on(`gmail:thread-delta-${companyName}`, handler);
    return () => socket.off(`gmail:thread-delta-${companyName}`, handler);
  }, [socket, filters, companyName]);

  return {
    threads,
    loading,
    pagination,
    filters,
    setFilters,
    handleUpdateThread,
    fetchThreads,
    markAsRead,
    deleteThread,
    folder, // optional but useful
    companyName
  };
}
