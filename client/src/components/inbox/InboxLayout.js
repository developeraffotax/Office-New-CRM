import { useEffect, useState } from "react";
import axios from "axios";
 
import InboxSidebar from "./InboxSidebar";
import InboxToolbar from "./InboxToolbar";
import InboxFilters from "./InboxFilters";
import InboxList from "./InboxList";
import InboxPagination from "./InboxPagination";

export default function InboxLayout() {




  const [users, setUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    userId: "USER_ID_HERE",
    category: "",
    startDate: "",
    endDate: "",
    unreadOnly: false,
    page: 1,
    limit: 20,
  });




  const fetchInbox = async (params) => {

    try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/gmail/get-inbox`, { params });
        return data;

    } catch (error) {
        console.log("ERROR OCCURED", error)
    }

  }




  const loadInbox = async () => {
    setLoading(true);
    const res = await fetchInbox(filters);
    setThreads(res.data);
    setPagination(res.pagination);
    setLoading(false);
  };





    const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) =>
            item?.permission?.includes("Tickets")
          )
        ) || []
      );

       
    } catch (error) {
      console.log(error);
    }
  };








      // ---------------- SINGLE UPDATE FUNCTION ----------------
    const handleUpdateThread = async (threadId, updateData) => {
      try {
        // setUpdating(true);
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/gmail/update-thread/${threadId}`,
          {...updateData}
        );
  
        if (data?.success) {
          const updatedThread = data.thread; // Assume API returns updated thread
          // Update parent threads array in-place
          setThreads((prevThreads) =>
            prevThreads.map((t) => (t._id === updatedThread._id ? updatedThread : t))
          );
  
          // Update local state for immediate UI feedback
          // if (updateData.userId !== undefined) setUserId(updateData.userId);
          // if (updateData.category !== undefined) setCategory(updateData.category);
          // setAssignOpen(false);
        }
      } catch (err) {
        console.error("Failed to update thread:", err);
      } finally {
        // setUpdating(false);
      }
    };









      useEffect(() => {
    getAllUsers();
  }, []);
    useEffect(() => {
    loadInbox();
  }, [filters]);
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <InboxSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <InboxToolbar />
        <InboxFilters filters={filters} setFilters={setFilters} />
        <InboxList loading={loading} threads={threads} users={users} handleUpdateThread={handleUpdateThread}/>
        <InboxPagination pagination={pagination} setFilters={setFilters} />
      </div>
    </div>
  );
}



 