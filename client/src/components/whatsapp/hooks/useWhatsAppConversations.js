
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { buildConversationQuery } from "../utils/buildConversationQuery";
import { useSocket } from "../../../context/socketProvider";

export function useWhatsAppConversations({ endpoint }) {
    const socket = useSocket();


  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState({ fetching: false, updating: false });
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState({});


// 1. Extract the primitives from searchParams first
const companyNameParam = searchParams.get("companyName") || "";
const statusParam = searchParams.get("status") || "";
const userIdParam = searchParams.get("userId") || "";
const categoryParam = searchParams.get("category") || "";
const searchParam = searchParams.get("search") || "";
const lastMessageByParam = searchParams.get("lastMessageBy") || "";
const unreadOnlyParam = searchParams.get("unreadOnly") || "";
const starredParam = searchParams.get("starred") || "";
const startDateParam = searchParams.get("startDate") || "";
const endDateParam = searchParams.get("endDate") || "";
const pageParam = searchParams.get("page") || "1";
const limitParam = searchParams.get("limit") || "20";

// 2. Only depend on those specific string/number primitives
const filters = useMemo(() => ({
  companyName: companyNameParam,
  status: statusParam,
  userId: userIdParam,
  category: categoryParam,
  search: searchParam,
  lastMessageBy: lastMessageByParam,
  unreadOnly: unreadOnlyParam,
  starred: starredParam,
  startDate: startDateParam,
  endDate: endDateParam,
  page: Number(pageParam),
  limit: Number(limitParam),
}), [
  companyNameParam,
  statusParam,
  userIdParam,
  categoryParam,
  searchParam,
  lastMessageByParam,
  unreadOnlyParam,
  starredParam,
  startDateParam,
  endDateParam,
  pageParam,
  limitParam
]);




  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (!newFilters.page) params.set("page", 1);
    setSearchParams(params);
  };



  const fetchConversations = useCallback(async ({withLoading = true} = {}) => {
    if (withLoading) {
      setLoading((prev) => ({ ...prev, fetching: true }));
    }
    try {
      const { data } = await axios.get(endpoint, { params: buildConversationQuery(filters) });

 
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



    // ---------------- Socket listener for meta updates ----------------
  useEffect(() => {
    if (!socket) return;

    const metadataUpdateHandler = () => fetchConversations({ withLoading: false });
    //const metadataUpdateHandler = (d) => console.log("Metadata updated:", d);
    socket.on(`whatsapp:conversation-update-${filters.companyName}`, metadataUpdateHandler);
    return () => socket.off(`whatsapp:conversation-update-${filters.companyName}`, metadataUpdateHandler);

  }, [socket, filters.companyName, fetchConversations]);

 

  
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

    

    fetchConversations({ withLoading: false });

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

      fetchConversations({ withLoading: false });
       
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
      //setConversations(prev => prev.map(c => c._id === id ? { ...c, unreadCount: 0 } : c));
      fetchConversations({ withLoading: false });
      toast.success("Conversation marked as read");
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };
















  






  // ---------------- Fetch unread counts separately ----------------
const fetchUnreadCounts = useCallback(async (conversationIds) => {
  if (!conversationIds || conversationIds.length === 0) return;

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/comments/unread`,
      { conversationIds }
    );

    setConversations(prev =>
      prev.map(t =>
        conversationIds.includes(t._id)
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
    if (conversations.length > 0) {
      const threadIds = conversations.map((t) => t._id);
      fetchUnreadCounts(threadIds);
    }
  }, [conversations.map((t) => t._id).join(","), fetchUnreadCounts]); // stable dependency





      // ---------------- Socket listener for meta updates ----------------
useEffect(() => {
  if (!socket) return;

  const handleCommentsUpdated = ({ conversationIds }) => {

    
    if (!conversationIds || conversationIds.length === 0) return;
    fetchUnreadCounts(conversationIds);
  };

  socket.on(`wa-comments:updated-${filters.companyName}`, handleCommentsUpdated);
  return () => socket.off(`wa-comments:updated-${filters.companyName}`, handleCommentsUpdated);
}, [socket, filters.companyName, fetchUnreadCounts]);



// Inside useWhatsAppConversations hook:

const commentState = useMemo(() => ({
  show: searchParams.get("comments") === "true",
  conversationId: searchParams.get("commentId") || null,
}), [searchParams]);

const setComment = useCallback(({ show, conversationId }) => {
  // Always read fresh params to ensure filters aren't wiped out
  setSearchParams((prevParams) => {
    const nextParams = new URLSearchParams(prevParams);
    if (show) {
      nextParams.set("comments", "true");
      if (conversationId) nextParams.set("commentId", conversationId);
    } else {
      nextParams.delete("comments");
      nextParams.delete("commentId");
    }
    return nextParams; // React Router updates this atomically
  });
}, [setSearchParams]);


  return {
    conversations,
    loading,
    pagination,
    filters,
    setFilters: updateFilters,
    updateConversation,
    markAsRead,
    fetchConversations,
    deleteConversation,

    setComment,
    commentState
  };
}