import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useSocket } from "../../../context/socketProvider";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
// ----------------- Filter matcher -----------------
function matchesFilters(thread, filters, user) {
  if (!thread || !filters) return false;

  const { label, unreadOnly, startDate, endDate, category, userId } = filters;

    console.log("THE FILTERS", filters)

  if (label && !thread.labels?.includes(label)) return false;
  if (unreadOnly && thread.unreadCount <= 0) return false;

  if (startDate && new Date(thread.lastMessageAt) < new Date(startDate))
    return false;
  if (endDate && new Date(thread.lastMessageAt) > new Date(endDate))
    return false;

   // ✅ Category filter
  if (category) {
    if (category === "unassigned") {
      if (thread.category) return false; // has category → reject
    } else {
      if (thread.category !== category) return false;
    }
  }

  // ✅ User filter
  if (userId) {
    if (userId === "unassigned") {
      if (thread.userId) return false; // has user → reject
    } else {
      if (thread.userId !== userId) return false;
    }
  }


    // User filter – only apply if not admin
      const isAdmin = user?.role?.name === "Admin";
  if (!isAdmin &&  thread.userId !== user?.id) return false;


  return true;
}

// ----------------- Hook -----------------
export function useMailThreads({ endpoint }) {
  const socket = useSocket();
 const [searchParams, setSearchParams] = useSearchParams();

const folder = searchParams.get("folder") || "inbox";
const companyName = searchParams.get("companyName") || "affotax";



  const {
    auth: { user },
  } = useSelector((state) => state.auth);

  const isAdmin = user?.role?.name === "Admin";
 

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  // const [filters, setFilters] = useState({
  //   userId: isAdmin ? "unassigned" : "",
  //   category: isAdmin ? "unassigned" : "",
  //   label: "INBOX", // default
  //   startDate: "",
  //   endDate: "",
  //   unreadOnly: false,
  //   page: 1,
  //   limit: 20,
  //   search: "",
  // });

  // 🔁 Keep label in sync with folder
  // useEffect(() => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     label: folder === "sent" ? "SENT" : "INBOX",
  //     page: 1, // reset pagination on folder switch
  //   }));
  // }, [folder]);


  
const filters = useMemo(() => {
  return {
    userId: searchParams.get("userId") || "",
    category: searchParams.get("category") || "",
    // userId: searchParams.get("userId") ?? (isAdmin ? "unassigned" : ""),
    // category: searchParams.get("category") ?? (isAdmin ? "unassigned" : ""),
    // label:
    //   folder === "sent"
    //     ? "SENT"
    //     : searchParams.get("label") || "INBOX",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    unreadOnly: searchParams.get("unreadOnly") === "true",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 20),
    search: searchParams.get("search") || "",
  };
}, [searchParams, folder, isAdmin]);




  const updateFilters = (newFilters) => {
  const params = new URLSearchParams(searchParams);

  Object.entries(newFilters).forEach(([key, value]) => {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === false
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  // Reset page when filters change
  if (!newFilters.page) {
    params.set("page", 1);
  }

  setSearchParams(params);
};


  // useEffect(() => {
  //   if(isAdmin) {
  //     updateFilters({
  //       category: "unassigned",
  //       userId: "unassigned"
  //     })
  //   }

  // }, []);

  // ---------------- Fetch threads from API ----------------
  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(endpoint, {
        params: {
          folder, // 👈 injected from URL
          companyName,
          ...filters,
        },
      });

      setThreads(data.threads);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(`Failed to load ${folder}`);
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
        updateData,
      );

      if (data?.success) {
        const updatedThread = data.thread;
        setThreads((prev) =>
          prev.map((t) => (t._id === updatedThread._id ? updatedThread : t)),
        );
      }
    } catch (err) {
      toast.error("Failed to update thread!");
      console.error("Failed to update thread:", err);
    }
  };

  const markAsRead = async (threadId, companyName) => {
    if (!threadId) return;

    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/mark-as-read/${threadId}`,
        { companyName: companyName }, // pass companyName for Gmail auth
      );

      if (data?.success && !data?.alreadyRead) {
        const updatedThread = data.thread;
        setThreads((prev) =>
          prev.map((t) => (t._id === updatedThread._id ? updatedThread : t)),
        );

        toast.success("Marked as read!");
      }
      // Optionally, update local state to reflect unreadCount = 0 if you track it
      // e.g., emailDetail.unreadCount = 0;
    } catch (error) {
      console.error("Failed to mark thread as read:", error);
    }
  };

  const deleteThread = async (
    threadId,
    companyName,
    includeConfirmation = true,
  ) => {
    if (!threadId) return;

    // ✅ Only show Swal if confirmation is required
    if (includeConfirmation) {
      const { isConfirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!isConfirmed) return;
    }

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/delete/${threadId}`,
        {
          data: { companyName },
        },
      );

      if (data?.success) {
         setThreads((prev) => prev.filter((t) => t.threadId !== threadId));

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


    // ---------------- Socket listener for meta updates ----------------
  useEffect(() => {
    if (!socket) return;

    const metadataUpdateHandler = () => fetchThreads();
    socket.on(`metadata:updated-${companyName}`, metadataUpdateHandler);
    return () => socket.off(`metadata:updated-${companyName}`, metadataUpdateHandler);

  }, [socket, companyName, fetchThreads]);



  // ---------------- Socket listener for delta updates ----------------
  useEffect(() => {
    if (!socket ) return;

    const handler = ({ action, thread }) => {

        console.log("SOCKET CALLED ❤️❤️❤️❤️🌹🌹🌹", action, thread)
 
      setThreads((prev) => {
        let newThreads;

        switch (action) {
          case "updated": {
            const exists = prev.find((t) => t._id === thread._id);

            if (exists) {
              newThreads = prev
                .map((t) => (t._id === thread._id ? { ...t, ...thread } : t))
                .filter((t) => matchesFilters(t, filters, user));
            } else if (matchesFilters(thread, filters, user)) {
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
          const dateA = new Date(
            a.lastMessageAtInbox || a.lastMessageAtSent || 0,
          );
          const dateB = new Date(
            b.lastMessageAtInbox || b.lastMessageAtSent || 0,
          );
          return dateB - dateA;
        });
      });
    };

    socket.on(`gmail:thread-delta-${companyName}`, handler);

    return () => socket.off(`gmail:thread-delta-${companyName}`, handler);

  }, [socket, filters, companyName, isAdmin]);


















  // ---------------- Fetch unread counts separately ----------------
const fetchUnreadCounts = useCallback(async (threadIds) => {
  if (!threadIds || threadIds.length === 0) return;

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/gmail/comments/unread`,
      { threadIds }
    );

    setThreads(prev =>
      prev.map(t =>
        threadIds.includes(t._id)
          ? { ...t, unreadComments: data.unreadCounts[t._id] || 0 }
          : t
      )
    );
  } catch (err) {
    console.error("Failed to fetch unread counts:", err);
  }
}, []);

  // ---------------- Fetch unread counts when threads are loaded ----------------
  useEffect(() => {
    if (threads.length > 0) {
      const threadIds = threads.map((t) => t._id);
      fetchUnreadCounts(threadIds);
    }
  }, [threads.map((t) => t._id).join(","), fetchUnreadCounts]); // stable dependency





      // ---------------- Socket listener for meta updates ----------------
useEffect(() => {
  if (!socket) return;

  const handleCommentsUpdated = ({ threadIds }) => {

    
    if (!threadIds || threadIds.length === 0) return;
    fetchUnreadCounts(threadIds);
  };

  socket.on(`comments:updated-${companyName}`, handleCommentsUpdated);
  return () => socket.off(`comments:updated-${companyName}`, handleCommentsUpdated);
}, [socket, companyName, fetchUnreadCounts]);


  return {
    threads,
    loading,
    pagination,
    filters,
    setFilters: updateFilters, // 👈 use this
    handleUpdateThread,
    fetchThreads,
    markAsRead,
    deleteThread,
    folder, // optional but useful
    companyName,
  };
}
