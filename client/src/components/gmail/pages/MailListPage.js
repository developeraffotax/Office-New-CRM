import { useRef, useState } from "react";
import Filters from "../shared/Filters";
import List from "../shared/List";
import Pagination from "../shared/Pagination";

import CreateTicketModal from "../shared/CreateTicketModal";
import CreateLeadModal from "../shared/CreateLeadModal";

import { SelectionHeader } from "../shared/FloatingSelectionToolbar";

import CommentList from "../comments/CommentList";
import Reminder from "../../../utlis/Reminder";
import ComposeWindow from "../compose/ComposeWindow";

import { useSelector } from "react-redux";

export default function MailListPage({
  users,
  team,
  categories,
  threads,
  loading,
  pagination,
  filters,
  setFilters,
  handleUpdateThread,
  handleBulkUpdateThreads,
  fetchThreads,
  markAsRead,
  markAsUnread,
  deleteThread,
  toggleStar,

  companyName,
  folder,
}) {
  const {
    auth: { user },
  } = useSelector((state) => state.auth);

  /* =========================
     Compose
  ========================= */

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  /* =========================
     Ticket Modal
  ========================= */

  const [createTicketModal, setCreateTicketModal] = useState({
    _id: "",
    isOpen: false,
    form: {},
  });

  /* =========================
     Lead Modal
  ========================= */

  const [createLeadModal, setCreateLeadModal] = useState({
    _id: "",
    isOpen: false,
    form: {},
  });

  /* =========================
     Reminder
  ========================= */

  const [createReminderModal, setCreateReminderModal] = useState({
    isOpen: false,
    threadId: "",
    link: "",
  });

  /* =========================
     Comments
  ========================= */

  const [comment, setComment] = useState({
    show: false,
    threadId: null,
    threadSubject: "",
  });

  /* =========================
     Thread Selection
  ========================= */

  const [selectedThreads, setSelectedThreads] = useState(
    new Set()
  );

  const lastSelectedIndexRef = useRef(null);

  const toggleThread = (threadId, index, event) => {
    setSelectedThreads((prev) => {
      const next = new Set(prev);

      // SHIFT + CLICK
      if (
        event.shiftKey &&
        lastSelectedIndexRef.current !== null
      ) {
        const start = Math.min(
          lastSelectedIndexRef.current,
          index
        );

        const end = Math.max(
          lastSelectedIndexRef.current,
          index
        );

        threads
          .slice(start, end + 1)
          .forEach((thread) => {
            next.add(thread._id);
          });
      }

      // NORMAL CLICK
      else {
        if (next.has(threadId)) {
          next.delete(threadId);
        } else {
          next.add(threadId);
        }

        lastSelectedIndexRef.current = index;
      }

      return next;
    });
  };

  const clearSelection = () => {
    setSelectedThreads(new Set());
    lastSelectedIndexRef.current = null;
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-white">

      {/* =========================
          Compose
      ========================= */}

      <ComposeWindow
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        companyName={companyName}
      />

      {/* =========================
          Filters
      ========================= */}

      <Filters
        filters={filters}
        setFilters={setFilters}
        users={users}
        team={team}
        categories={categories}
        fetchThreads={fetchThreads}
        setIsComposeOpen={setIsComposeOpen}
      />

      {/* =========================
          Selection Toolbar
      ========================= */}

      <SelectionHeader
        selectedThreads={selectedThreads}
        threads={threads}
        users={users}
        categories={categories}
        markAsRead={markAsRead}
        markAsUnread={markAsUnread}
        deleteThread={deleteThread}
        handleBulkUpdateThreads={handleBulkUpdateThreads}
        clearSelection={clearSelection}
      />

      {/* =========================
          Thread List
      ========================= */}

      <div className="flex-1 h-full min-h-0 overflow-hidden">
        <List
          loading={loading}
          threads={threads}
          users={users}
          categories={categories}
          handleUpdateThread={handleUpdateThread}
          deleteThread={deleteThread}
          markAsRead={markAsRead}
          toggleStar={toggleStar}
          filters={filters}

          setCreateTicketModal={
            setCreateTicketModal
          }

          setCreateLeadModal={
            setCreateLeadModal
          }

          selectedThreads={selectedThreads}

          toggleThread={toggleThread}

          setComment={setComment}

          setCreateReminderModal={
            setCreateReminderModal
          }
        />
      </div>

      {/* =========================
          Pagination
      ========================= */}

      <Pagination
        pagination={pagination}
        setFilters={setFilters}
      />

      {/* =========================
          Ticket Modal
      ========================= */}

      {createTicketModal.isOpen && (
        <CreateTicketModal
          createTicketModal={createTicketModal}
          setCreateTicketModal={setCreateTicketModal}
          handleUpdateThread={handleUpdateThread}
          users={users}
          myCompany={companyName}
        />
      )}

      {/* =========================
          Lead Modal
      ========================= */}

      {createLeadModal.isOpen && (
        <CreateLeadModal
          createLeadModal={createLeadModal}
          setCreateLeadModal={setCreateLeadModal}
          handleUpdateThread={handleUpdateThread}
          users={users}
          myCompany={companyName}
        />
      )}

      {/* =========================
          Reminder
      ========================= */}

      {createReminderModal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-300/80">
          <Reminder
            setShowReminder={() => {
              setCreateReminderModal({
                isOpen: false,
                link: "",
                threadId: "",
              });
            }}
            taskId={createReminderModal.threadId}
            link={createReminderModal.link}
          />
        </div>
      )}

      {/* =========================
          Comments
      ========================= */}

      <CommentList
        users={users}
        currentUserId={user.id}
        onClose={() =>
          setComment({
            show: false,
            threadId: null,
            threadSubject: "",
          })
        }
        {...comment}
      />

      {/* =========================
          Deleting Indicator
      ========================= */}

      {loading.deleting && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-lg animate-pulse">

            <div className="h-3 w-3 animate-bounce rounded-full bg-white" />

            Deleting thread...
          </div>
        </div>
      )}

      {/* =========================
          Updating Indicator
      ========================= */}

      {loading.updating && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-lg animate-pulse">

            <div className="h-3 w-3 animate-bounce rounded-full bg-emerald-400" />

            Updating thread...
          </div>
        </div>
      )}

    </div>
  );
}