// Place this next to Row.jsx (same folder — e.g. mail/shared/RowMobile.jsx)
// Same props, same handlers as Row.jsx — this only changes presentation.

import { useMemo, useState } from "react";
import { FiMoreVertical, FiMessageSquare } from "react-icons/fi";
import clsx from "clsx";
import AttachmentChip from "./attachments/AttachmentChip";
import { MdDeleteOutline } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { ReplyPopup } from "../reply/ReplyPopup";
import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
import AssignUser from "./ui/AssignUser";
import AssignCategory from "./ui/AssignCategory";
import IconButtonWithBadge from "./ui/IconButtonWithBadge";
import { confirmAlert } from "./ui/Swal";
import { useSelector } from "react-redux";
import ThreadDateTime from "./ui/ThreadDateTime";
import { PiBell } from "react-icons/pi";
import { hasSubrole } from "../../../utlis/checkPermission";
import RefBadge from "./ui/RefBadge";
import LeadButton from "./ui/LeadButton";
import TicketButton from "./ui/TicketButton";
import { useMailModalActions } from "../context/MailModalsContext";

function highlightText(text = "", search = "") {
  if (!search) return text;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(
    regex,
    `<span class="bg-orange-100 text-orange-600 font-medium rounded px-0.5">$1</span>`,
  );
}

export default function RowMobile({
  thread,
  users,
  handleUpdateThread,
  openThread,
  categories,
  deleteThread,
  markAsRead,
  toggleStar,
  filters,
  selected,
  toggleSelect,
  index,
  setReplyThread,
  replyThread,
}) {
  const { auth } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState({ markAsRead: false });

  const attachments = thread.attachments || [];
  const visibleAttachments = attachments.slice(0, 2);
  const extraCount = attachments.length - visibleAttachments.length;

  const [searchParams] = useSearchParams();
  const { openComments, openReminder } = useMailModalActions();
  const folder = searchParams.get("folder") || "inbox";
  const isLastFromMe = thread?.lastMessageBy === "me";

  const scope = useMemo(() => {
    const hasEditAccess = hasSubrole(auth.user, "Inbox", "Edit") || false;
    const hasDeleteAccess = hasSubrole(auth.user, "Inbox", "Delete") || false;
    return { edit: hasEditAccess, delete: hasDeleteAccess };
  }, [auth]);

  const myCompanyName = thread.companyName;
  const myEmail =
    myCompanyName === "affotax"
      ? "info@affotax.com"
      : "admin@outsourceaccountings.co.uk";

  let sender = thread.participants
    .slice(0, 2)
    .map((p) => {
      if (p.name === myCompanyName || p.email === myEmail) return "me";
      return p.name || p.email;
    })
    .join(", ");

  const assignedUser = users.find((u) => u._id === thread.userId);
  const threadCategory = categories.find(
    (cat) => cat.name === thread?.category,
  );
  const displayCategory = threadCategory?.name
    ? threadCategory.name.charAt(0).toUpperCase() + threadCategory.name.slice(1)
    : "";

  const currentUserId = auth?.user?.id;
  const userReadEntry = thread?.readBy?.find((r) => r.userId === currentUserId);
  const isUnreadForUser =
    thread?.hasInboxMessage &&
    (!userReadEntry?.lastReadAt ||
      new Date(thread.lastMessageAtInbox) > new Date(userReadEntry.lastReadAt));

  const updateStatus = async (status) => {
    const { isConfirmed } = await confirmAlert({ type: "warning" });
    if (!isConfirmed) return;
    setUpdating(true);
    await handleUpdateThread(thread._id, { status: status }, "status");
    setUpdating(false);
    setMenuOpen(false);
  };

  const handleMarkAsRead = async (threadId, companyName) => {
    setIsLoading((prev) => ({ ...prev, markAsRead: true }));
    await markAsRead(threadId, companyName);
    setIsLoading((prev) => ({ ...prev, markAsRead: false }));
  };

  return (
    <div
      className={clsx(
        "relative border-b border-gray-300 px-3 py-3 ",
        selected
          ? "bg-blue-200"
          : isUnreadForUser
          ? "bg-white"
          : "bg-blue-50/60",
      )}
    >
      {/* {isUnreadForUser && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )} */}

      {/* Checkbox + sender/subject/snippet — tapping this area opens the thread */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(thread._id, index, e);
          }}
          readOnly
          className="h-5 w-5 mt-0.5 rounded-sm border border-gray-300 accent-blue-500 shrink-0"
        />

        <div
          className={clsx(
            "flex items-center justify-center size-4 rounded-full text-[9px] font-bold text-white shrink-0 mt-0.5",
            isLastFromMe ? "bg-orange-500" : "bg-blue-500",
          )}
        >
          {isLastFromMe ? "A" : "C"}
        </div>

        <div
          className="flex-1 min-w-0"
          onClick={() => openThread(thread.threadId)}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              title={sender}
              className={clsx(
                "truncate text-sm font-google",
                isUnreadForUser
                  ? "font-semibold text-gray-900"
                  : "text-gray-700",
              )}
              dangerouslySetInnerHTML={{
                __html: highlightText(sender, filters.search),
              }}
            />
            <span className="text-[11px] text-gray-400 shrink-0">
              <ThreadDateTime thread={thread} folder={folder} index={index} />
            </span>
          </div>

          <div
            className={clsx(
              "truncate text-sm font-google mt-0.5",
              isUnreadForUser ? "text-gray-900 font-medium" : "text-gray-700",
            )}
            dangerouslySetInnerHTML={{
              __html: highlightText(thread.subject, filters.search),
            }}
          />

          <p className="text-xs text-gray-500 truncate font-google mt-0.5">
            {thread.lastMessageSnippet}
          </p>

          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
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
            {thread?.messageCount > 1 && (
              <span className="text-[10px] text-gray-500 font-google">
                {thread.messageCount} msgs
              </span>
            )}
            <RefBadge number={thread?.ref} />
          </div>

          {attachments.length > 0 && (
            <div className={`flex items-center gap-1.5 mt-2 -mx-1 px-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory`} >
              {visibleAttachments.map((att, idx) => (
                <div key={idx} className="snap-start shrink-0">
                  <AttachmentChip attachment={att} compact />
                </div>
              ))}

              {extraCount > 0 && (
                <span className={`snap-start shrink-0 text-[11px] font-semibold text-gray-500 bg-gray-100 active:bg-gray-200 px-2.5 py-1 rounded-full border border-gray-200 whitespace-nowrap`} >
                  +{extraCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar — always visible, no hover state on mobile */}
      <div className="flex items-center gap-2 mt-2 pl-9">
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            setReplyThread({
              threadId: thread.threadId,
              companyName: thread.companyName,
            });
          }}
          className="px-3 py-1 text-xs bg-orange-500 text-white rounded-md active:bg-orange-600 transition-colors shadow-sm"
        >
          Reply
        </button> */}

        <button
          title={
            thread.labels.includes("STARRED") ? "Unstar Thread" : "Star Thread"
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(
              thread?.threadId,
              thread?.companyName,
              thread?.labels?.includes("STARRED"),
            );
          }}
          className="p-1.5"
        >
          {thread.labels.includes("STARRED") ? (
            <FaStar className="h-4 w-4 text-yellow-400" />
          ) : (
            <FaRegStar className="h-4 w-4 text-gray-300" />
          )}
        </button>

        <IconButtonWithBadge
          icon={FiMessageSquare}
          unreadCount={thread?.unreadComments || 0}
          title="View Comments"
          onClick={() => {
            openComments({
              threadId: thread._id,
              threadSubject: thread?.subject,
            });
          }}
        />

        {isUnreadForUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(thread?.threadId, thread?.companyName);
            }}
            disabled={isLoading.markAsRead}
            className="flex justify-center items-center tracking-wide px-2 py-0.5 min-h-[18px] text-[10px] font-inter font-semibold text-white bg-blue-500 rounded-tr-lg rounded-bl-lg disabled:opacity-80"
          >
            {isLoading.markAsRead ? "..." : "UNREAD"}
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="p-1.5 rounded-md active:bg-gray-200 text-gray-500"
          title="More"
        >
          <FiMoreVertical className="size-5" />
        </button>
      </div>

      {/* Overflow menu — holds the actions that don't fit in the action bar */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />
          <div
            className="absolute right-3 top-full mt-1 z-50 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {scope.edit && (
              <div className="px-3 py-2 text-sm text-gray-700">
                <AssignCategory
                  categories={categories}
                  mongoThreadId={thread._id}
                  currentCategory={thread?.category}
                  handleUpdateThread={handleUpdateThread}
                />
              </div>
            )}
            {scope.edit && (
              <div className="px-3 py-2 text-sm text-gray-700">
                <AssignUser
                  users={users}
                  mongoThreadId={thread?._id}
                  currentUserId={thread?.userId}
                  handleUpdateThread={handleUpdateThread}
                />
              </div>
            )}
            <div className="px-3 py-2 text-sm text-gray-700">
              <TicketButton
                thread={thread}
                handleUpdateThread={handleUpdateThread}
              />
            </div>
            <div className="px-3 py-2 text-sm text-gray-700">
              <LeadButton
                thread={thread}
                handleUpdateThread={handleUpdateThread}
              />
            </div>
            <button
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                openReminder({
                  threadId: thread?.threadId,
                  link: `/mail?folder=${folder}&companyName=${myCompanyName}&mailThreadId=${thread?.threadId}`,
                });
                setMenuOpen(false);
              }}
            >
              <PiBell className="size-4" /> Set Reminder
            </button>
            {scope.edit && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() =>
                  updateStatus(
                    thread?.status === "progress" ? "completed" : "progress",
                  )
                }
              >
                {thread?.status === "progress" ? (
                  <FaCheckCircle className="size-4" />
                ) : (
                  <FaUndoAlt className="size-4" />
                )}
                {thread?.status === "progress"
                  ? "Complete Thread"
                  : "Undo Complete"}
              </button>
            )}
            {scope.delete && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  deleteThread(thread?.threadId, thread?.companyName);
                  setMenuOpen(false);
                }}
              >
                <MdDeleteOutline className="size-4" /> Delete Thread
              </button>
            )}
          </div>
        </>
      )}

      {replyThread?.threadId === thread.threadId && (
        <ReplyPopup
          threadId={replyThread.threadId}
          companyName={replyThread.companyName}
          onClose={() => setReplyThread(null)}
        />
      )}
    </div>
  );
}
