
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export function useWhatsAppConversations({ endpoint }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState({ fetching: false, updating: false });
  const [pagination, setPagination] = useState({});

  const filters = useMemo(() => ({
    status: searchParams.get("status") || "",
    userId: searchParams.get("userId") || "",
    search: searchParams.get("search") || "",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 20),
  }), [searchParams]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (!newFilters.page) params.set("page", 1);
    setSearchParams(params);
  };

  const fetchConversations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, fetching: true }));
    try {
      const { data } = await axios.get(endpoint, { params: filters });

      console.log("Fetched conversations:", data);
      setConversations(data.conversations || data);
      setPagination(data.pagination || {});
    } catch (err) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading((prev) => ({ ...prev, fetching: false }));
    }
  }, [endpoint, filters]);

  useEffect(() => {
    fetchConversations();
    // Socket listeners for real-time updates would go here
  }, [fetchConversations]);





  // const handleUpdateStatus = async (id, action) => {
  //   try {
  //     setLoading(prev => ({ ...prev, updating: true }));
  //     await axios.put(`${endpoint}/${id}/${action}`);
  //     toast.success(`Conversation ${action}d`);
  //     fetchConversations();
  //   } catch (err) {
  //     toast.error(`Failed to ${action} conversation`);
  //   } finally {
  //     setLoading(prev => ({ ...prev, updating: false }));
  //   }
  // };



  
// ---------------- Update single thread via API ----------------
const updateConversation = async (_id, updateData) => {
  try {
    setLoading(prev => ({...prev, updating: true}))
    const { data } = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/update-conversation/${_id}`,
      updateData
    );

    if (!data?.success || !data?.thread) {
      toast.error("Conversation update failed!");
      return;
    }

    

    fetchConversations();

  } catch (err) {
    toast.error("Failed to update Conversation!");
    console.error("Failed to update Conversation:", err);
  } finally {
    setLoading(prev => ({...prev, updating: false}))
  }
};

















  const deleteConversation = async (
    _id,
    companyName,
    includeConfirmation = true,
  ) => {
    if (!_id) return;

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
 
    setLoading((prev) => ({ ...prev, deleting: true }));
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/delete/${_id}`,
        {
          data: { companyName },
        },
      );

      fetchConversations();
       
    } catch (error) {
      console.error("Failed to delete thread:", error);
      toast.error("Failed to delete thread!");
    } finally {
      setLoading((prev) => ({ ...prev, deleting: false }));
    }
  };





  const markAsRead = async (id) => {
    try {
      await axios.patch(`${endpoint}/${id}/read`);
      setConversations(prev => prev.map(c => c._id === id ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return {
    conversations,
    loading,
    pagination,
    filters,
    setFilters: updateFilters,
    updateConversation,
    markAsRead,
    fetchConversations,
    deleteConversation
  };
}