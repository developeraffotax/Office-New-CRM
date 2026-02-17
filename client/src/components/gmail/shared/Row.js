import { useState } from "react";
import { FiPaperclip, FiMoreVertical, FiUserPlus, FiChevronDown, FiMessageSquare } from "react-icons/fi";
import clsx from "clsx";
import AttachmentChip from "./attachments/AttachmentChip";
import { MdDeleteOutline } from "react-icons/md";


function parseEmail(str) {
  if (!str) return "";

  // Match anything that looks like an email
  const emailMatch = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  return emailMatch ? emailMatch[0] : "";
}




 function highlightText(text = "", search = "") {
  if (!search) return text;

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.replace(
    regex,
    `<span class="bg-orange-100 text-orange-600 font-medium rounded px-0.5">$1</span>`
  );
}


export default function Row({ thread, users, handleUpdateThread, setEmailDetail, categories, setCreateTicketModal, setCreateLeadModal, deleteThread, filters, selected, toggleSelect, index, setComment }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

 


  const attachments = thread.attachments || [];
  const visibleAttachments = attachments.slice(0, 2);
  const extraCount = attachments.length - visibleAttachments.length;

  // ----------------------- Sender / Participants -----------------------
  const myCompanyName = thread.companyName; // your company
  const myEmail = myCompanyName === "affotax" ? "info@affotax.com" : "admin@outsourceaccountings.co.uk"; // your email



  let sender = thread.participants.slice(0, 2).map(p => {
    if (p.name === myCompanyName || p.email === myEmail) {
      return "me"
    } else {
      return p.name || p.email
    }
  }).join(", ");



  const assignedUser = users.find((u) => u._id === thread.userId);
  const threadCategory = categories.find((cat) => cat.name === thread?.category);
  const displayCategory = threadCategory?.name
    ? threadCategory.name.charAt(0).toUpperCase() + threadCategory.name.slice(1)
    : "";

  // ---------------- LOCAL UPDATE HANDLERS ----------------
  const updateCategory = async (newCategory) => {
    setUpdating(true);
    await handleUpdateThread(thread._id, { category: newCategory });
    setUpdating(false);
  };

  const updateUser = async (newUserId) => {
    setAssignOpen(false);
    setUpdating(true);
    await handleUpdateThread(thread._id, { userId: newUserId });
    setUpdating(false);
  };


 
//  hover:shadow-[inset_4px_0_0_0_#3b82f6]

  return (
    <div
      className={clsx(
  "group relative border-b border-gray-100 cursor-pointer transition-all duration-150",
  "hover:shadow-[0_1px_2px_rgba(60,60,67,0.18),0_2px_4px_rgba(60,60,67,0.22),0_3px_6px_rgba(60,60,67,0.45)]",
  selected ? "bg-blue-200" : thread.unreadCount > 0 ? "bg-white" : "bg-blue-50/60 "
)}
    >
      {/* Indicator for Unread */}
      {/* {thread.unreadCount > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />} */}

      {/* ================= MAIN ROW ================= */}
      <div className="grid items-center px-4 py-3 grid-cols-[1rem_15rem_1fr_auto_auto_auto_7rem] gap-5 ">

          {/* Select checkbox */}
        <input
  type="checkbox"
  checked={selected}
  onClick={(e) => {
    e.stopPropagation();
    toggleSelect(thread._id, index, e);
  }}
  readOnly
  className={clsx(
    "h-4 w-4 rounded-sm border border-gray-300 accent-blue-500 ",
    
 
    
  )}
/>


        {/* Sender Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center    gap-2">
            <span
              title={sender}
              className={clsx(
                "truncate text-base  font-google ",
                thread.unreadCount > 0 ? "font-medium text-gray-900" : "  text-gray-700"
              )}

              dangerouslySetInnerHTML={{
              __html: highlightText(sender, filters.search),
            }}
            >
             
              
              
            </span>
            {/* {attachments.length > 0 && <FiPaperclip className="text-gray-400 size-3 shrink-0" />} */}
            {thread?.messageCount > 1 && <span className="text-gray-500 text-[12px] shrink-0 font-google" >{thread?.messageCount}</span>}
          </div>

          {/* Sub-labels: Assigned & Category */}
          <div className="flex items-center gap-1.5 mt-1">
            {assignedUser && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {assignedUser.name.split(" ")[0]}
              </span>
            )}
            {thread.category && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wider text-white px-1.5 py-0.5 rounded"
                style={{ backgroundColor: threadCategory?.color }}
              >
                {displayCategory}
              </span>
            )}
          </div>
        </div>

        {/* Subject + Snippet */}
        <div
          className="min-w-0 flex flex-col "
          onClick={() => setEmailDetail({ threadId: thread.threadId, show: true, subject: thread?.subject || "No Subject", participants: thread.participants })}
        >
          <span
            className={clsx(
              "truncate text-base  font-google ",
              thread.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-700   "
            )}

            dangerouslySetInnerHTML={{
              __html: highlightText(thread.subject, filters.search),
            }}
          >
             
          </span>
          <span className="text-sm text-gray-500 truncate font-normal  font-google ">{thread.lastMessageSnippet}</span>
        </div>

        {/* Attachment count/icon spacer (Optional) */}
        <div className="w-4" />

        {/* Actions (hover only) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Quick Category Selector */}
          <div className="relative flex items-center bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden hover:border-gray-300">
            <select
              className="appearance-none text-xs pl-2 pr-6 py-1 bg-transparent cursor-pointer outline-none"
              value={thread.category}
              onChange={(e) => {
                e.stopPropagation();
                updateCategory(e.target.value);
              }}
            >
              <option value="">Select</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name[0].toUpperCase() + category.name.slice(1)}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-1.5 pointer-events-none text-gray-400 size-3" />
          </div>

          {/* Assign User Dropdown */}
          {/* Actions (hover only) */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">



            {/* Assign User Button */}
            <div className="relative">
              <button
                title="Assign User"
                className={clsx(
                  "p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm",
                  assignOpen && "ring-2 ring-blue-500/20 border-blue-500"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignOpen(!assignOpen);
                }}
              >
                <FiUserPlus className="size-4" />
              </button>

              {assignOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-xl z-50 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Assign to...
                  </div>
                  {users.map((user, i) => (
                    <button
                      key={user._id}
                      className={clsx(
                        "w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b last:border-0",
                        thread.userId === user._id ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700"
                      )}
                      disabled={updating}
                      onClick={() => updateUser(user._id)}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create Ticket Button */}
            <button
              title="Create Ticket"
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-white border border-gray-200 text-blue-700 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setCreateTicketModal({
                  _id: thread._id,
                  isOpen: true,
                  form: {
                    subject: thread.subject || "",
                    clientName: thread.participants.find(p => p.email !== parseEmail(myEmail))?.name || "",
                    email: thread.participants.find(p => p.email !== parseEmail(myEmail))?.email || "",
                    mailThreadId: thread.threadId
                  }
                });
              }}
            >
              <span className="size-1.5 rounded-full bg-blue-500" />
              Ticket
            </button>

            {/* Create Lead Button */}
            <button
              title="Create Lead"
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-white border border-gray-200 text-green-700 rounded-md hover:bg-green-50 hover:border-green-200 transition-all shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setCreateLeadModal({
                   _id: thread._id,
                  isOpen: true,
                  form: {
                    clientName: thread.participants.find(p => p.email !== parseEmail(myEmail))?.name || "",
                    email: thread.participants.find(p => p.email !== parseEmail(myEmail))?.email || "",
                  }
                });
              }}
            >
              <span className="size-1.5 rounded-full bg-green-500" />
              Lead
            </button>

  
          </div>

          {/* More Options */}
          <div className="relative">
            <button
              className="p-1 rounded-md hover:bg-gray-200 text-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <FiMoreVertical className="size-4" />
            </button>




            <button
              className="p-1 rounded-md hover:bg-gray-200 text-gray-500  hover:text-red-500"
              title="Delete Thread"
              onClick={(e) => {
                deleteThread(thread?.threadId, thread?.companyName)
              }}
            >
              <MdDeleteOutline className="size-5   " /> 
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  disabled={updating || !thread.userId}
                  onClick={async () => {
                    setMenuOpen(false);
                    await updateUser(null); // remove assigned user
                  }}
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm transition-colors rounded-lg",
                    thread.userId ? "text-red-600 hover:bg-red-50" : "text-gray-300 cursor-not-allowed"
                  )}
                >
                  Remove user
                </button>
              </div>
            )}
          </div>
        </div>



            <div>
                 <button
  onClick={() => {
    setComment({
      show: true,
      threadId: thread._id,
      threadSubject: thread?.subject
    });
  }}
  className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group active:scale-95"
  title="View Comments"
>
  {/* The Icon */}
  <FiMessageSquare size={20} className="group-hover:fill-blue-50/10" />

  {/* The Unread Badge */}
  {thread?.unreadComments > 0 && (
    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
      {thread.unreadComments > 99 ? '99+' : thread.unreadComments}
    </span>
  )}
</button>
            </div>

        {/* Date/Time */}

        <div className="text-[11px] text-right text-gray-500 font-medium tabular-nums">
          {new Date(thread.lastMessageAtInbox).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <div className="text-[10px] opacity-90">
            {new Date(thread.lastMessageAtInbox).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>

      {/* ================= ATTACHMENTS ROW ================= */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 pb-2 pl-[20rem] pr-4">
          <div className="flex gap-2 items-center">
            {visibleAttachments.map((att, idx) => (
              <AttachmentChip key={idx} attachment={att} className="scale-90 origin-left" />
            ))}
            {extraCount > 0 && (
              <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                +{extraCount} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
