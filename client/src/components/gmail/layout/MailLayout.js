 
import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import Filters from "../shared/Filters";
import List from "../shared/List";
import Pagination from "../shared/Pagination";
import Thread from "../thread/Thread";
import CreateTicketModal from "../shared/CreateTicketModal";
 
 

export default function MailLayout({
  users,
  categories,
  threads,
  loading,
  pagination,
  filters,
  setFilters,
  handleUpdateThread,
  markAsRead,
  companyName,
  folder
}) {
  const [emailDetail, setEmailDetail] = useState({
    threadId: "",
    show: false,
    subject: "",
    participants: []
  });

 
   const [createTicketModal, setCreateTicketModal] = useState({
    isOpen: false,
    form: {}
   });

  return (
    <div className="flex h-[105vh] bg-white overflow-hidden">
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
          setCreateTicketModal={setCreateTicketModal}
        />

        <Pagination pagination={pagination} setFilters={setFilters} />
      </div>

      {emailDetail.show && (
        <Thread
          
          company={companyName}
          threadId={emailDetail.threadId}
          subject={emailDetail.subject}
          setShowEmailDetail={() =>
            setEmailDetail({ threadId: "", show: false, subject: "" })
          }

          markAsRead={markAsRead}
        />
      )}




      {/* Ticket Modal */}
      {createTicketModal.isOpen && (
        <CreateTicketModal
          createTicketModal={createTicketModal}
          setCreateTicketModal={setCreateTicketModal}
          users={users}
          myCompany={companyName}
        />
      )}
    </div>
  );
}
