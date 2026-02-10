 
import { useRef, useState } from "react";
import Sidebar from "../shared/Sidebar";
import Filters from "../shared/Filters";
import List from "../shared/List";
import Pagination from "../shared/Pagination";
import Thread from "../thread/Thread";
import CreateTicketModal from "../shared/CreateTicketModal";
import CreateLeadModal from "../shared/CreateLeadModal";
import { HiOutlineMailOpen, HiOutlineTrash } from "react-icons/hi";
 import { IoMdClose } from "react-icons/io";
import { SelectionHeader } from "../shared/FloatingSelectionToolbar";
import CommentList from "../comments/CommentList";
import { useSelector } from "react-redux";
 

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



    const {
    auth: { user },
  } = useSelector((state) => state.auth);
  
 
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



   // Inside your Threads List component
const [comment , setComment] = useState({
  show: false,
  threadId: null,
  threadSubject: ""
});



   const [selectedThreads, setSelectedThreads] = useState(new Set());
const lastSelectedIndexRef = useRef(null);

const toggleThread = (threadId, index, event) => {
  setSelectedThreads((prev) => {
    const next = new Set(prev);

    // SHIFT + CLICK → range select
    if (event.shiftKey && lastSelectedIndexRef.current !== null) {
      const start = Math.min(lastSelectedIndexRef.current, index);
      const end = Math.max(lastSelectedIndexRef.current, index);

      threads.slice(start, end + 1).forEach((t) => {
        next.add(t._id);
      });
    } else {
      // Normal toggle
      next.has(threadId) ? next.delete(threadId) : next.add(threadId);
      lastSelectedIndexRef.current = index; // ✅ sync + reliable
    }

    return next;
  });
};



const clearSelection = () => setSelectedThreads(new Set());





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


        {/* The Selection Component fits here */}
  <SelectionHeader 
    selectedThreads={selectedThreads}
    threads={threads}
    markAsRead={markAsRead}
    deleteThread={deleteThread}
    clearSelection={clearSelection}
  />


        <List
          loading={loading}
          threads={threads}
          users={users}
          categories={categories}
          handleUpdateThread={handleUpdateThread}
          deleteThread={deleteThread}
          filters={filters}

          setEmailDetail={setEmailDetail}
          setCreateTicketModal={setCreateTicketModal}
          setCreateLeadModal={setCreateLeadModal}

          selectedThreads={selectedThreads}
          toggleThread={toggleThread}

          setComment={setComment}
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




      {/* Comments */}
      <CommentList threadSubject={comment.threadSubject} threadId={comment.threadId} users={users} currentUserId={user.id} onClose={() => setComment({
        show: false,
        threadId: null
      })}/>
    </div>
  );
}


// 19c423082427fd80

// 66cc64ce0d25583e212500d1