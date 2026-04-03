import { useState } from "react";
import {
  FiPaperclip,
  FiMoreVertical,
  FiUserPlus,
  FiChevronDown,
  FiMessageSquare,
} from "react-icons/fi";
import clsx from "clsx";
import AttachmentChip from "./attachments/AttachmentChip";
import { MdDeleteOutline, MdOutlineStarBorder, MdStarBorder } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { ReplyPopup } from "../reply/ReplyPopup";
import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import AssignUser from "./ui/AssignUser";
import AssignCategory from "./ui/AssignCategory";
import IconButtonWithBadge from "./ui/IconButtonWithBadge";
import { confirmAlert } from "./ui/Swal";
 import { useSelector } from "react-redux";
import ThreadDateTime from "./ui/ThreadDateTime";


function parseEmail(str) {
  if (!str) return "";

  // Match anything that looks like an email
  const emailMatch = str.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );

  return emailMatch ? emailMatch[0] : "";
}

function highlightText(text = "", search = "") {
  if (!search) return text;

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.replace(
    regex,
    `<span class="bg-orange-100 text-orange-600 font-medium rounded px-0.5">$1</span>`,
  );
}

export default function Row({
  thread,
  users,
  handleUpdateThread,
  setEmailDetail,
  categories,
  setCreateTicketModal,
  setCreateLeadModal,
  deleteThread,
  toggleStar,
 
  filters,
  selected,
  toggleSelect,
  index,
  setComment,
  setReplyThread,
  replyThread
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isRowActive =
  replyThread?.threadId === thread.threadId ||
  assignOpen ||
  menuOpen;


  const attachments = thread.attachments || [];
  const visibleAttachments = attachments.slice(0, 2);
  const extraCount = attachments.length - visibleAttachments.length;

   const [searchParams] = useSearchParams();

const folder = searchParams.get("folder") || "inbox";

  const isLastFromMe = thread?.lastMessageBy === "me";

  // ----------------------- Sender / Participants -----------------------
  const myCompanyName = thread.companyName; // your company
  const myEmail =
    myCompanyName === "affotax"
      ? "info@affotax.com"
      : "admin@outsourceaccountings.co.uk"; // your email

  let sender = thread.participants
    .slice(0, 2)
    .map((p) => {
      if (p.name === myCompanyName || p.email === myEmail) {
        return "me";
      } else {
        return p.name || p.email;
      }
    })
    .join(", ");



 

  const assignedUser = users.find((u) => u._id === thread.userId);
  const threadCategory = categories.find(
    (cat) => cat.name === thread?.category,
  );
  const displayCategory = threadCategory?.name
    ? threadCategory.name.charAt(0).toUpperCase() + threadCategory.name.slice(1)
    : "";

 

  const updateStatus = async (status) => {
  // ✅ Only show Swal if confirmation is required
 
      const { isConfirmed } = await confirmAlert({ type: "warning" });

      if (!isConfirmed) return;
 
    setUpdating(true);
    await handleUpdateThread(thread._id, { status: status }, "status");
    setUpdating(false);
  };
  //  hover:shadow-[inset_4px_0_0_0_#3b82f6]




  const {auth} = useSelector((state) => state.auth);
 
const currentUserId = auth?.user?.id;

// Find read status for current user
const userReadEntry = thread?.readBy?.find(
  (r) => r.userId === currentUserId
);

// Determine unread
// const isUnreadForUser =
//   thread.hasInboxMessage && thread.lastMessageAtInbox && (!userReadEntry?.lastReadAt ||
//   new Date(thread.lastMessageAtInbox) >
//     new Date(userReadEntry.lastReadAt))

const isUnreadForUser = !userReadEntry?.lastReadAt || new Date(thread.lastMessageAtInbox) > new Date(userReadEntry.lastReadAt)


  return (
    <div
      className={clsx(
        "group relative border-b border-gray-100 cursor-pointer transition-all duration-150",
        "hover:shadow-[0_1px_2px_rgba(60,60,67,0.18),0_2px_4px_rgba(60,60,67,0.22),0_3px_6px_rgba(60,60,67,0.45)]",
        selected
          ? "bg-blue-200"
          : isUnreadForUser
          ? "bg-white"
          : "bg-blue-50/60 ",
      )}
    >
      {/* Indicator for Unread */}
      {isUnreadForUser && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}

      {/* ================= MAIN ROW ================= */}
      <div className="grid items-start px-4 py-3 grid-cols-[2rem_15rem_1fr_auto_auto_auto_7rem] gap-5  ">
        {/* Select checkbox */}
<div className="flex justify-start items-start gap-3  ">

          <input
          type="checkbox"
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(thread._id, index, e);
          }}
          readOnly
          className={clsx(
            "h-5 w-5 rounded-sm border border-gray-300 accent-blue-500 ",
          )}
        />



<div className="h-5 w-5 flex items-center  ">


 {isLastFromMe && (<div className="flex items-center justify-center size-4 rounded-full bg-orange-500 text-[9px] font-bold text-white shrink-0"> A </div>)}

</div>
 



</div>

        {/* Sender Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center    gap-2">
            
            <span
              title={sender}
              className={clsx(
                "truncate text-base  font-google ",
                isUnreadForUser
                  ? "font-medium text-gray-900"
                  : "  text-gray-700",
              )}
              dangerouslySetInnerHTML={{
                __html: highlightText(sender, filters.search),
              }}
            ></span>




            {/* {attachments.length > 0 && <FiPaperclip className="text-gray-400 size-3 shrink-0" />} */}
            {thread?.messageCount > 1 && (
              <span className="text-gray-500 text-[12px] shrink-0 font-google">
                {thread?.messageCount}
              </span>
            )}
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
          onClick={() =>
            setEmailDetail({
              threadId: thread.threadId,
              show: true,
              subject: thread?.subject || "No Subject",
              participants: thread.participants,

              mongoThreadId: thread?._id,
              userId: thread?.userId,
              category: thread?.category,
              status: thread?.status

               
            })
          }
        >
        

          <div className="w-full flex items-center gap-2 justify-start ">


            <span
            className={clsx(
              "truncate text-base  font-google ",
              isUnreadForUser
                ? "text-gray-900 font-medium"
                : "text-gray-700   ",
            )}
            dangerouslySetInnerHTML={{
              __html: highlightText(thread.subject, filters.search),
            }}
          ></span>

 
  
          </div>
          <span className="text-sm text-gray-500 truncate font-normal  font-google ">
            {thread.lastMessageSnippet}
          </span>





        </div>

        {/* Attachment count/icon spacer (Optional) */}
        <div className="w-4" />

        {/* Actions (hover only) */}
       <div
  className={clsx(
    "flex items-center gap-1 transition-opacity",
    isRowActive
      ? "opacity-100"
      : "opacity-0 group-hover:opacity-100"
  )}
>

          {/* <button
            onClick={(e) => {
              e.stopPropagation();

              setReplyThread({
                threadId: thread.threadId,
                companyName: thread.companyName,
              });
            }}
            className="px-3 py-1 text-xs bg-orange-500 text-white rounded-md"
          >
            Reply
          </button> */}


          {/* Reply Button Container */}
 
 



























<div className="relative group/reply flex items-center justify-end">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setReplyThread({
        threadId: thread.threadId,
        companyName: thread.companyName,
      });
    }}
    className="px-3 py-1 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-sm"
  >
    Reply
  </button>

{/* --- SMART TOOLTIP --- */}
        <div 
          className={clsx(
            "invisible group-hover/reply:visible opacity-0 group-hover/reply:opacity-100 transition-all duration-200",
            "absolute left-0 w-72 z-[9999]", 
            // FIX 2: If it's the first row (index 0), flip it to show BELOW the button
            index === 0 ? "top-full mt-2.5" : "bottom-full mb-2.5",
            "bg-white p-4 rounded-xl shadow-2xl border border-gray-100 pointer-events-none"
          )}
        >
          <p 
            className="text-gray-700 text-sm leading-relaxed line-clamp-4 font-normal font-google"
            dangerouslySetInnerHTML={{ __html: thread.lastMessageSnippet || "No snippet available" }}
          />
          
          {/* FIX 3: Flip the arrow based on position */}
          <div className={clsx(
            "absolute left-5 size-3 rotate-45 bg-white border-gray-100",
            index === 0 
              ? "bottom-full -mb-1.5 border-t border-l" // Arrow pointing up
              : "top-full -mt-1.5 border-b border-r"    // Arrow pointing down
          )}></div>
        </div>

  {/* Existing ReplyPopup logic */}
  {replyThread?.threadId === thread.threadId && (
    <ReplyPopup
      threadId={replyThread.threadId}
      companyName={replyThread.companyName}
      onClose={() => setReplyThread(null)}
    />
  )}
</div>















 
          <AssignCategory
            categories={categories}
            mongoThreadId={thread._id}
            currentCategory={thread?.category}
            handleUpdateThread={handleUpdateThread}

             onToggle={(isOpen) => setAssignOpen(isOpen)}

          />

           
             <AssignUser
                      users={users}
                      mongoThreadId={thread?._id}
                      currentUserId={thread?.userId}
                      handleUpdateThread={handleUpdateThread}
                      onToggle={(isOpen) => setAssignOpen(isOpen)}
                       
                    />
          {/* Actions (hover only) */}
          <div className="flex items-center gap-1.5   transition-opacity">
            



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
                    clientName:
                      thread.participants.find(
                        (p) => p.email !== parseEmail(myEmail),
                      )?.name || "",
                    email:
                      thread.participants.find(
                        (p) => p.email !== parseEmail(myEmail),
                      )?.email || "",
                    mailThreadId: thread.threadId,
                  },
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
                    clientName:
                      thread.participants.find(
                        (p) => p.email !== parseEmail(myEmail),
                      )?.name || "",
                    email:
                      thread.participants.find(
                        (p) => p.email !== parseEmail(myEmail),
                      )?.email || "",
                  },
                  ticketBindings: {
                      subject: thread.subject || "",
                      mailThreadId: thread.threadId,
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
            {/* <button
              className="p-1 rounded-md hover:bg-gray-200 text-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <FiMoreVertical className="size-4" />
            </button> */}

            <button
              className="p-1 rounded-md hover:bg-gray-200 text-gray-500  hover:text-red-500"
              title="Delete Thread"
              onClick={(e) => {
                deleteThread(thread?.threadId, thread?.companyName);
              }}
            >
              <MdDeleteOutline className="size-5   " />
            </button>


              {
                thread?.status === "progress" ? (
                  <button
              className="p-1 rounded-md   text-gray-500  hover:text-green-500"
              title="Complete Thread"
              onClick={(e) => {
                updateStatus("completed");
              }}
            > 
              <FaCheckCircle className="size-4   " />
            </button>
                ) : (
                   <button
              className="p-1 rounded-md   text-gray-500  hover:text-red-500"
              title="Undo Complete"
              onClick={(e) => {
                updateStatus("progress");
              }}
            > 
              <FaUndoAlt className="size-4   " />
            </button>
                )
              }
             



           

            {/* {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                
              </div>
            )} */}
          </div>
        </div>

        <div className="flex-1 flex justify-start items-center gap-2">
           
          {isUnreadForUser && (
            <span className="flex justify-center items-center tracking-wide  px-1.5 py-0.5 text-[10px] font-inter  font-semibold   text-white bg-blue-500 rounded-tr-lg rounded-bl-lg animate-pop">
              UNREAD
            </span>
          )}
                  <IconButtonWithBadge
          icon={FiMessageSquare}
          unreadCount={thread?.unreadComments || 0}
          title="View Comments"
          onClick={() => {
            setComment({
                show: true,
                threadId: thread._id,
                threadSubject: thread?.subject,
              })
          }
            
          }
        />

          

            


        </div>




 
{/* <div className="text-[11px] text-right text-gray-700 font-medium tabular-nums flex flex-col items-end gap-0.5 font-google">

 
  <div className="flex items-center text-[12px]  text-gray-800 ">
    {new Date(
      folder === "inbox"
        ? thread.lastMessageAtInbox
        : thread.lastMessageAtSent
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}
  </div>

 
<div className="flex items-center gap-1.5 text-[10px]   ">

 
  <button
    title={
      thread.labels.includes("STARRED")
        ? "Unstar Thread"
        : "Star Thread"
    }
    className="flex items-center justify-center    "
    onClick={(e) => {
      toggleStar(
        thread?.threadId,
        thread?.companyName,
        thread?.labels?.includes("STARRED")
      );
    }}
  >
    {thread.labels.includes("STARRED") ? (
      <FaStar className="h-3.5 w-3.5 text-yellow-400 hover:text-yellow-500" />
    ) : (
      <FaRegStar className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
    )}
  </button>





 
  <div className="mt-0.5 ">
    {new Date(folder === "inbox" ? thread.lastMessageAtInbox : thread.lastMessageAtSent).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}
  </div>



</div>

 

</div> */}


{/* Final Column: Star + Date/Time */}
<div className="flex items-center flex-r justify-end gap-3 min-w-[80px]">
  
  {/* Star Button (Now positioned before date) */}
  <button
    title={thread.labels.includes("STARRED") ? "Unstar Thread" : "Star Thread"}
    className="transition-transform active:scale-125 focus:outline-none"
    onClick={(e) => {
      e.stopPropagation();
      toggleStar(
        thread?.threadId,
        thread?.companyName,
        thread?.labels?.includes("STARRED")
      );
    }}
  >
    {thread.labels.includes("STARRED") ? (
      <FaStar className="h-4 w-4 text-yellow-400 drop-shadow-sm" />
    ) : (
      <FaRegStar className="h-4 w-4 text-gray-300 hover:text-gray-400 transition-colors" />
    )}
  </button>

  {/* Date Component */}
  <ThreadDateTime 
    thread={thread} 
    folder={folder} 
    index={index} 
  />
</div>

        
      </div>

      {/* ================= ATTACHMENTS ROW ================= */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 pb-2 pl-[20rem] pr-4">
          <div className="flex gap-2 items-center">
            {visibleAttachments.map((att, idx) => (
              <AttachmentChip
                key={idx}
                attachment={att}
                className="scale-90 origin-left"
              />
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
