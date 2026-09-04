import { useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import clsx from "clsx";
import Filters from "../shared/Filters";
import FiltersMobile from "../shared/FiltersMobile";
import List from "../shared/List";
import Pagination from "../shared/Pagination";
import SidebarMobile from "../shared/SidebarMobile";

import CreateTicketModal from "../shared/CreateTicketModal";
import CreateLeadModal from "../shared/CreateLeadModal";

import { SelectionHeader } from "../shared/FloatingSelectionToolbar";

import CommentList from "../comments/CommentList";
import Reminder from "../../../utlis/Reminder";
import ComposeWindow from "../compose/ComposeWindow";

import { useSelector } from "react-redux";
import { useIsMobile } from "../hooks/useIsMobile";
import ComposeMobile from "../compose/ComposeMobile";

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

  const isMobile = useIsMobile();
  const FiltersComponent = isMobile ? FiltersMobile : Filters;
  const Compose = isMobile ? ComposeMobile : Compose;

  /* =========================
     Mobile Sidebar
  ========================= */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  /* =========================
     Compose
  ========================= */
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  /* =========================
     Thread Selection
  ========================= */
  const [selectedThreads, setSelectedThreads] = useState(new Set());
  const lastSelectedIndexRef = useRef(null);

  const selectAllThreads = () => {
    setSelectedThreads(new Set(threads.map((thread) => thread._id)));
  };

  const toggleThread = (threadId, index, event) => {
    setSelectedThreads((prev) => {
      const next = new Set(prev);

      if (event.shiftKey && lastSelectedIndexRef.current !== null) {
        const start = Math.min(lastSelectedIndexRef.current, index);
        const end = Math.max(lastSelectedIndexRef.current, index);

        threads.slice(start, end + 1).forEach((thread) => {
          next.add(thread._id);
        });
      } else {
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
    <div className="relative flex h-full min-w-0 flex-col bg-white">
      {/* =========================
          Mobile Sidebar (drawer)
      ========================= */}
      {isMobile && (
        <>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-30 p-2 rounded-lg bg-white shadow-sm border border-slate-100"
            aria-label="Open menu"
          >
            <FiMenu className="size-5 text-slate-600" />
          </button>

          {/* Backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20"
              onClick={closeSidebar}
            />
          )}

          {/* Drawer */}
          <div
            className={clsx(
              "fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <SidebarMobile onNavigate={closeSidebar} onClose={closeSidebar} />
          </div>
        </>
      )}

      {/* =========================
          Compose
      ========================= */}
      <Compose
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        companyName={companyName}
      />

      {/* =========================
          Filters
      ========================= */}
      <FiltersComponent
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
        selectAllThreads={selectAllThreads}
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
          selectedThreads={selectedThreads}
          toggleThread={toggleThread}
        />
      </div>

      {/* =========================
          Pagination
      ========================= */}
      <Pagination pagination={pagination} setFilters={setFilters} />

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