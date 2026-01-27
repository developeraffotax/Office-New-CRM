 
import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import Filters from "../shared/Filters";
import List from "../shared/List";
import Pagination from "../shared/Pagination";
 
import InboxDetailNew from "../../../pages/Tickets/InboxDetailNew";

export default function MailLayout({
  users,
  categories,
  threads,
  loading,
  pagination,
  filters,
  setFilters,
  handleUpdateThread,
}) {
  const [emailDetail, setEmailDetail] = useState({
    threadId: "",
    show: false,
  });

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Filters
          filters={filters}
          setFilters={setFilters}
          users={users}
          categories={categories}
        />

        <List
          loading={loading}
          threads={threads}
          users={users}
          categories={categories}
          handleUpdateThread={handleUpdateThread}
          setEmailDetail={setEmailDetail}
        />

        <Pagination pagination={pagination} setFilters={setFilters} />
      </div>

      {emailDetail.show && (
        <InboxDetailNew
          company="Affotax"
          threadId={emailDetail.threadId}
          setShowEmailDetail={() =>
            setEmailDetail({ threadId: "", show: false })
          }
        />
      )}
    </div>
  );
}
