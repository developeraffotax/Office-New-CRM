import { useState } from "react";
import { FiPaperclip, FiMoreVertical, FiUserPlus, FiChevronDown } from "react-icons/fi";
import clsx from "clsx";
import AttachmentChip from "./attachments/AttachmentChip";

export default function  Row({ thread, users, handleUpdateThread, setEmailDetail, categories  }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);


  const attachments = thread.attachments || [];
  const visibleAttachments = attachments.slice(0, 2);
  const extraCount = attachments.length - visibleAttachments.length;

  const sender =
    thread.participants?.[0]?.name ||
    thread.participants?.[0]?.email ||
    "Unknown";

  const assignedUser = users.find((u) => u._id === thread.userId);
  const displayCategory = thread.category.charAt(0).toUpperCase() + thread.category.slice(1);

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

  return (
    <div
      className={clsx(
        "group relative border-b border-gray-100 cursor-pointer transition-all duration-150",
        "hover:bg-slate-50/80 hover:shadow-[inset_4px_0_0_0_#3b82f6]", // Professional blue hover accent
        thread.unreadCount > 0 ? "bg-blue-50/40" : "bg-white"
      )}
    >
      {/* Indicator for Unread */}
      {thread.unreadCount > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )}

      {/* ================= MAIN ROW ================= */}
      <div className="grid items-center px-4 py-3 grid-cols-[14rem_1fr_auto_auto_7rem] gap-4" >
        
        {/* Sender Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className={clsx("truncate text-sm", thread.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
              {sender}
            </span>
            {attachments.length > 0 && <FiPaperclip className="text-gray-400 size-3 shrink-0" />}
          </div>
          
          {/* Sub-labels: Assigned & Category */}
          <div className="flex items-center gap-1.5 mt-1" >
            {assignedUser && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {assignedUser.name.split(' ')[0]}
              </span>
            )}
            {thread.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                {displayCategory}
              </span>
            )}
          </div>
        </div>

        {/* Subject + Snippet */}
        <div className="min-w-0 flex flex-col" onClick={() => setEmailDetail({threadId: thread.threadId, show: true})}>
          <span className={clsx("truncate text-sm", thread.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-700 font-medium")}>
            {thread.subject}
          </span>
          <span className="text-sm text-gray-400 truncate font-normal">
            {thread.lastMessageSnippet}
          </span>
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

              {
                categories.map((category) => {
                  return (
                  <option value={category.name}>{category.name[0].toUpperCase() + category.name.slice(1)}</option>
                  )
                })
              }
             
              
            </select>
            <FiChevronDown className="absolute right-1.5 pointer-events-none text-gray-400 size-3" />
          </div>

          {/* Assign User Dropdown */}
          <div className="relative">
            <button
              className={clsx(
                "p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600",
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
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign to...</div>
                {users.map((user, i) => (
                  <button
                    key={user._id}
                    className={clsx(
                      "w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b",
                      thread.userId === user._id ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-700"
                    )}
                    disabled={updating}
                    onClick={() => updateUser(user._id)}
                  >
                    {i+1}. {user.name}
                    {/* <div className="text-xs text-gray-400 font-normal">{user.email}</div> */}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
  <button
    className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500"
    onClick={(e) => {
      e.stopPropagation();
      setMenuOpen((prev) => !prev);
    }}
  >
    <FiMoreVertical className="size-4" />
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
          await updateUser(null); // 👈 remove assigned user
        }}
        className={clsx(
          "w-full px-3 py-2 text-left text-sm transition-colors rounded-lg",
          thread.userId
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-300 cursor-not-allowed"
        )}
      >
        Remove user
      </button>
    </div>
  )}
</div>

        </div>

        {/* Date/Time */}
        <div className="text-[11px] text-right text-gray-500 font-medium tabular-nums">
          {new Date(thread.lastMessageAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <div className="text-[10px] opacity-90 ">
            {new Date(thread.lastMessageAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>

      {/* ================= ATTACHMENTS ROW ================= */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 pb-3 pl-[15rem] pr-4">
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