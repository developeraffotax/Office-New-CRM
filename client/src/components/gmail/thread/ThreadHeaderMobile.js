import React, { useState, useRef } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaRegCircleCheck } from "react-icons/fa6";
import { LiaUndoAltSolid } from "react-icons/lia";
import { MdDeleteOutline } from "react-icons/md";
import { FiClock, FiInfo, FiMessageSquare, FiMoreVertical } from "react-icons/fi";
import { useClickOutside } from "../../../utlis/useClickOutside.js";
import AssignUser from "../shared/ui/AssignUser.js";
import AssignCategory from "../shared/ui/AssignCategory.js";
import LeadButton from "../shared/ui/LeadButton.jsx";
import TicketButton from "../shared/ui/TicketButton.jsx";

export default function ThreadHeaderMobile({
  subject,
  company,
  threadId,
  category,
  status,
  userId,
  thread,
  mongoThreadId,
  categories = [],
  users = [],
  unreadComments = 0,
  scope = { edit: false, delete: false },
  onBack,
  onShowSummary,
  onShowActivity,
  onDeleteThread,
  onUpdateStatus,
  handleUpdateThread,
  firstMessageForPrefilling,
  openComments = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2.5 safe-area-top">
      {/* Top row: Back + Subject + Overflow */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-full text-gray-600 active:bg-gray-100"
          aria-label="Back"
        >
          <IoArrowBackOutline className="h-5 w-5" />
        </button>

        <h2 className="flex-1 text-[15px] font-semibold text-gray-900 truncate leading-tight">
          {subject || "No subject"}
        </h2>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full text-gray-600 active:bg-gray-100"
            aria-label="More actions"
          >
            <FiMoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
              <button
                onClick={() => {
                  onShowSummary?.();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
              >
                <FiInfo className="h-4 w-4 text-gray-500" />
                Summary
              </button>

              <button
                onClick={() => {
                  onShowActivity?.();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
              >
                <FiClock className="h-4 w-4 text-gray-500" />
                Activity
              </button>

              <button
                onClick={() => {
                  openComments({
                    threadId: thread?._id,
                    threadSubject: thread?.subject,
                  });
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
              >
                <FiMessageSquare className="h-4 w-4 text-gray-500" />
                Comments
                {unreadComments > 0 && (
                  <span className="ml-auto text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unreadComments}
                  </span>
                )}
              </button>

              <div className="my-1 border-t border-gray-100" />

              {status === "progress" ? (
                <button
                  onClick={() => {
                    onUpdateStatus?.("completed");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                >
                  <FaRegCircleCheck className="h-4 w-4 text-green-600" />
                  Mark Complete
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUpdateStatus?.("progress");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50"
                >
                  <LiaUndoAltSolid className="h-4 w-4 text-orange-500" />
                  Undo Complete
                </button>
              )}

              {scope.delete && (
                <button
                  onClick={() => {
                    onDeleteThread?.();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 active:bg-red-50"
                >
                  <MdDeleteOutline className="h-4 w-4" />
                  Delete Thread
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Second row: Assign + Ticket/Lead (scrollable if needed) */}
      <div className="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <div className="shrink-0">
          <AssignUser
            users={users}
            mongoThreadId={mongoThreadId}
            currentUserId={userId}
            handleUpdateThread={handleUpdateThread}
            showLabel={false}
            compact
          />
        </div>

        <div className="shrink-0">
          <AssignCategory
            categories={categories}
            mongoThreadId={mongoThreadId}
            currentCategory={category}
            handleUpdateThread={handleUpdateThread}
            compact
          />
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0 mx-0.5" />

        <div className="shrink-0">
          <TicketButton
            thread={thread}
            handleUpdateThread={handleUpdateThread}
            compact
          />
        </div>

        <div className="shrink-0">
          <LeadButton
            thread={thread}
            firstMessageForPrefilling={firstMessageForPrefilling}
            handleUpdateThread={handleUpdateThread}
            compact
          />
        </div>
      </div>
    </header>
  );
}