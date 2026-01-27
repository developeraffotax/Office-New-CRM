import { useEffect, useState } from "react";
import axios from "axios";

export function useMailThreads({ endpoint }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    userId: "",
    category: "",
    startDate: "",
    endDate: "",
    unreadOnly: false,
    page: 1,
    limit: 20,
  });

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(endpoint, { params: filters });
      setThreads(data.threads);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 

    // ---------------- SINGLE UPDATE FUNCTION ----------------
  const handleUpdateThread = async (threadId, updateData) => {
    try {
      // setUpdating(true);
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/update-thread/${threadId}`,
        { ...updateData }
      );

      if (data?.success) {
        const updatedThread = data.thread;

        setThreads((prevThreads) =>
          prevThreads.map((t) => (t._id === updatedThread._id ? updatedThread : t))
        );

        // fetchInbox()

      }
    } catch (err) {
      console.error("Failed to update thread:", err);
    } finally {
      // setUpdating(false);
    }
  };

  

  useEffect(() => {
    fetchThreads();
  }, [filters, endpoint]);

  return {
    threads,
    loading,
    pagination,
    filters,
    setFilters,
    handleUpdateThread,
  };
}
