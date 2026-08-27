import React from "react";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaRegCircleCheck } from "react-icons/fa6";
import { LiaUndoAltSolid } from "react-icons/lia";
import { MdDeleteOutline } from "react-icons/md";
import { FiClock, FiInfo, FiMessageSquare } from "react-icons/fi";
import IconButtonWithBadge from "../shared/ui/IconButtonWithBadge.js";
import AssignUser from "../shared/ui/AssignUser.js";
import AssignCategory from "../shared/ui/AssignCategory.js";

export default function ThreadHeader({
  variant = "full", // "full" (Inbox) | "compact" (Ticket/Lead sidebar)
  subject,
  company,
  threadId,
  category,
  status,
  userId,

  mongoThreadId,
  categories,
  users,
  unreadComments,
  scope,
  onBack,
  onShowSummary,
  onShowActivity,
  onShowComments,
  onDeleteThread,
  onUpdateStatus,
  handleUpdateThread,
}) {
  if (variant === "compact") {
    return (
      <header className="sticky top-0 z-10 w-full flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 truncate max-w-[200px] md:max-w-md">
          {subject}
        </h2>
        
        <Link
          to={`/mail?mailThreadId=${threadId}&companyName=${company}`}
          className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline whitespace-nowrap shrink-0"
        >
          Go to full conversation →
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 w-full flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <IoArrowBackOutline className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-800 truncate max-w-[200px] md:max-w-md">
          {subject}
        </h2>
      </div>

      <div className="flex justify-center items-center gap-4">
        <IconButtonWithBadge icon={FiInfo} title="Show Summary" onClick={onShowSummary} />
        <IconButtonWithBadge icon={FiClock} title="View Activity" onClick={onShowActivity} />
        <IconButtonWithBadge
          icon={FiMessageSquare}
          unreadCount={unreadComments}
          title="View Comments"
          onClick={onShowComments}
        />

        <span className="w-[1px] h-8 bg-slate-300 rounded-full"></span>

        {scope.delete && (
          <button
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-red-500"
            title="Delete Thread"
            onClick={onDeleteThread}
          >
            <MdDeleteOutline className="size-5" />
          </button>
        )}

        {status === "progress" ? (
          <button
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-green-500"
            title="Complete Thread"
            onClick={() => onUpdateStatus("completed")}
          >
            <FaRegCircleCheck className="size-5" />
          </button>
        ) : (
          <button
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-red-500"
            title="Undo Complete"
            onClick={() => onUpdateStatus("progress")}
          >
            <LiaUndoAltSolid className="size-5" />
          </button>
        )}

        <AssignUser
          users={users}
          mongoThreadId={mongoThreadId}
          currentUserId={userId}
          handleUpdateThread={handleUpdateThread}
          showLabel
        />

        <AssignCategory
          categories={categories}
          mongoThreadId={mongoThreadId}
          currentCategory={category}
          handleUpdateThread={handleUpdateThread}
        />
      </div>
    </header>
  );
}