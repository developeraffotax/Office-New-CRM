
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

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

  const handleUpdateStatus = async (id, action) => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      await axios.patch(`${endpoint}/${id}/${action}`);
      toast.success(`Conversation ${action}d`);
      fetchConversations();
    } catch (err) {
      toast.error(`Failed to ${action} conversation`);
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
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
    handleUpdateStatus,
    markAsRead,
    fetchConversations
  };
}