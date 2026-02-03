 
import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import Filters from "../shared/Filters";
import List from "../shared/List";
import Pagination from "../shared/Pagination";
import Thread from "../thread/Thread";
import CreateTicketModal from "../shared/CreateTicketModal";
import CreateLeadModal from "../shared/CreateLeadModal";
 
 

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
  deleteThread,
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
    _id: "",
    isOpen: false,
    form: {}
   });


   const [createLeadModal, setCreateLeadModal] = useState({
    _id: "",
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
          deleteThread={deleteThread}


          setEmailDetail={setEmailDetail}
          setCreateTicketModal={setCreateTicketModal}
          setCreateLeadModal={setCreateLeadModal}
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
          
          handleUpdateThread={handleUpdateThread}
          users={users}
          myCompany={companyName}
        />
      )}



        {/* Lead Modal */}
      {createLeadModal.isOpen && (
        <CreateLeadModal
          createLeadModal={createLeadModal}
          setCreateLeadModal={setCreateLeadModal}
          handleUpdateThread={handleUpdateThread}
           
          users={users}
          myCompany={companyName}
        />
      )}
    </div>
  );
}
