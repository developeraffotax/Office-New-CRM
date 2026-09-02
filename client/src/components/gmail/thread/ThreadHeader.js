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
import { useSelector } from "react-redux";
import LeadButton from "../shared/ui/LeadButton.jsx";
import TicketButton from "../shared/ui/TicketButton.jsx";

export default function ThreadHeader({
  variant = "full", // "full" (Inbox) | "compact" (Ticket/Lead sidebar)
  subject,
  company,
  threadId,
  category,
  status,
  userId,
  thread,

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

  firstMessageForPrefilling
}) {

const auth = useSelector((state) => state.auth.auth);
  const user = auth?.user;

  
 



if (variant === "compact") {
    const assignedUser = users?.find((u) => u._id === userId);
    const assignedUserName = assignedUser?.name || "Unassigned";
    const categoryName = typeof category === "object" ? category?.name : category;
    return (
      <header className="sticky top-0 z-10 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm font-google">
        <div className="flex flex-col gap-1.5 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[15px] font-semibold text-slate-900 leading-tight truncate md:max-w-2xl">
              {subject}
            </h2>
            {user?.id === userId && (
              <Link
                to={`/mail?mailThreadId=${threadId}&companyName=${company}`}
                className="group inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Full conversation
                <span className="transition-transform duration-150 group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
            {categoryName && (
              <>
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 ring-1 ring-inset ring-blue-700/10 shrink-0">
                  {categoryName}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
              </>
            )}

            
            {assignedUserName && <span className="font-medium text-slate-800">{assignedUserName}</span>}
          </div>
        </div>
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

                    <TicketButton
                      thread={thread}
 
                      handleUpdateThread={handleUpdateThread}
                      onViewTicket={(ticket) => {
                        console.log("View ticket:", ticket);
        
                        // Example:
                        // navigate(`/tickets/${lead._id}`);
                      }}
                    />
        
                    <LeadButton
                      thread={thread}

                      firstMessageForPrefilling={firstMessageForPrefilling}
                      handleUpdateThread={handleUpdateThread}
                      onViewLead={(lead) => {
                        console.log("View lead:", lead);
        
                        // Example:
                        // navigate(`/leads/${lead._id}`);
                      }}
                    />



         <span className="w-[1px] h-8 bg-slate-300 rounded-full"></span>



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