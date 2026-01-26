import { useEffect, useState } from "react";
import axios from "axios";

import InboxSidebar from "./InboxSidebar";
import InboxToolbar from "./InboxToolbar";
import InboxFilters from "./InboxFilters";
import InboxList from "./InboxList";
import InboxPagination from "./InboxPagination";
import InboxDetail from "../../pages/Tickets/InboxDetailNew";
import InboxDetailNew from "../../pages/Tickets/InboxDetailNew";

export default function InboxLayout() {


  const [showEmailDetail, setShowEmailDetail] = useState(false)
  const [showEmailDetailThreadId, setShowEmailDetailThreadId] = useState("")


  const [users, setUsers] = useState([]);
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




  const fetchInbox = async () => {
    setLoading(true);

    try {
      const { data: { threads, pagination }, status } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/gmail/get-inbox`, { params: filters });

      if (status === 200) {

        setThreads(threads);
        setPagination(pagination);

      }

    } catch (error) {
      console.log("ERROR OCCURED", error)
    } finally {
      setLoading(false);
    }

  }






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
    getAllUsers();
  }, []);
  useEffect(() => {
    fetchInbox();
  }, [filters]);
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <InboxSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* <InboxToolbar /> */}
        <InboxFilters filters={filters} setFilters={setFilters} users={users} />
        <InboxList loading={loading} threads={threads} users={users} handleUpdateThread={handleUpdateThread} />
        <InboxPagination pagination={pagination} setFilters={setFilters} />
      </div>


      {
        showEmailDetail && <InboxDetailNew company={"Affotax"} threadId={showEmailDetailThreadId} setShowEmailDetail={setShowEmailDetail} />
      }
    </div>
  );
}



