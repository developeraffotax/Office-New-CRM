import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export function useMailThread({ threadId, companyName}) {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState({
    fetching: false,
    updating: false,
    deleting: false,
  });

  // ---------------- Fetch the single thread ----------------
  const fetchThread = useCallback(async () => {
    if (!threadId) return;
    setLoading((prev) => ({ ...prev, fetching: true }));
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/get-thread/${threadId}`,
        { params: { companyName: companyName } },
      );
      if (data?.success) {
        setThread(data.thread);
      }
    } catch (err) {
      toast.error("Failed to load thread!");
      console.error("Failed to fetch thread:", err);
      setThread(null);
    } finally {
      setLoading((prev) => ({ ...prev, fetching: false }));
    }
  }, [threadId, companyName]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  // ---------------- Update single thread via API ----------------
  const handleUpdateThread = async (_id, updateData, type = "default") => {
    try {
      setLoading((prev) => ({ ...prev, updating: true }));
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/update-thread/${_id}`,
        updateData,
      );

      if (!data?.success || !data?.thread) {
        toast.error("Thread update failed!");
        return;
      }

      const updatedThread = data.thread;

      setThread((prev) => ({ ...prev, ...updatedThread }));
    } catch (err) {
      toast.error("Failed to update thread!");
      console.error("Failed to update thread:", err);
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  // ---------------- Mark as read (same route/signature as useMailThreads) ----------------
  const markAsRead = async (gmailThreadId, companyName) => {
    if (!gmailThreadId) return;
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/mark-as-read/${gmailThreadId}`,
        { companyName },
      );
      if (data?.success && !data?.alreadyRead && data?.thread) {
        setThread((prev) => ({ ...prev, ...data.thread }));
      }
    } catch (err) {
      console.error("Failed to mark thread as read:", err);
    }
  };

  // ---------------- Delete thread — returns true/false so the caller can decide what to do next ----------------
  const deleteThread = async (
    gmailThreadId,
    companyName,
    includeConfirmation = true,
  ) => {
    if (!gmailThreadId) return false;

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
      if (!isConfirmed) return false;
    }

    try {
      setLoading((prev) => ({ ...prev, deleting: true }));
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/delete/${gmailThreadId}`,
        { data: { companyName } },
      );
      if (data?.success) {
        toast.success("Thread deleted successfully!");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete thread:", err);
      toast.error("Failed to delete thread!");
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, deleting: false }));
    }
  };

  return {
    thread,
    loading,
    fetchThread,
    setThread,
    handleUpdateThread,
    markAsRead,
    deleteThread,
  };
}
