// Place this next to ChatRow.jsx (same folder — e.g. whatsapp/shared/ChatRowMobile.jsx)
// Same props, same handlers as ChatRow.jsx — this only changes presentation for mobile.

import { useMemo, useState } from "react";
import { FiMoreVertical, FiMessageSquare } from "react-icons/fi";
import clsx from "clsx";
import { MdDeleteOutline } from "react-icons/md";
import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { PiBell } from "react-icons/pi";
import { hasSubrole } from "../../../utlis/checkPermission";
import AssignUser from "../shared/ui/AssignUser";
import AssignCategory from "../shared/ui/AssignCategory";
import IconButtonWithBadge from "../shared/ui/IconButtonWithBadge";
import { ConversationTime } from "../shared/ui/ConversationTime";
import { useWhatsappModalActions } from "../context/WhatsappModalsContext";
import LeadButton from "../shared/ui/LeadButton";
import TicketButton from "../shared/ui/TicketButton";

export default function ChatRowMobile({
  chat,
  index,
  activeChatId,
  setActiveChatId,
  markAsRead,
  users,
  categories,
  updateConversation,
  deleteConversation,
}) {
  const { openComments, openReminder } = useWhatsappModalActions();
  const { auth } = useSelector((state) => state.auth);
  const user = auth?.user;
  const currentUserId = auth?.user?.id;

  const [menuOpen, setMenuOpen] = useState(false);

  const userReadEntry = chat?.readBy?.find(
    (r) =>
      (r?.userId?._id || r?.userId)?.toString() === currentUserId?.toString(),
  );

  const unreadCount = Math.max(
    0,
    (chat?.totalInboundMessages || 0) - (userReadEntry?.readInboundCount || 0),
  );

  const isUnread = unreadCount > 0;
  const isLastFromMe = chat?.lastMessageBy === "me";
  const isActive = activeChatId === chat?._id;

  const scope = useMemo(() => {
    const hasEditAccess = hasSubrole(user, "Whatsapp", "Edit") || false;
    const hasDeleteAccess = hasSubrole(user, "Whatsapp", "Delete") || false;
    return { edit: hasEditAccess, delete: hasDeleteAccess };
  }, [user]);

  const assignedUser = users?.find((u) => u._id === chat?.userId);
  const chatCategory = categories?.find((cat) => cat.name === chat?.category);
  const displayCategory = chatCategory?.name
    ? chatCategory.name.charAt(0).toUpperCase() + chatCategory.name.slice(1)
    : "";

  const handleOpenChat = () => {
    setActiveChatId(chat?._id);
    if (isUnread) {
      markAsRead(chat?._id);
    }
  };

  const handleToggleStar = (e) => {
    e.stopPropagation();
    if (!scope.edit) return;
    updateConversation(chat?._id, {
      isStarred: !chat?.isStarred,
    });
  };

  const handleStatusToggle = () => {
    if (!scope.edit) return;
    updateConversation(chat?._id, {
      status: chat?.status === "progress" ? "completed" : "progress",
    });
    setMenuOpen(false);
  };

  return (
    <div
      className={clsx(
        "relative border-b border-gray-300 px-3 py-3",
        isActive
          ? "bg-orange-50"
          : isUnread
            ? "bg-white"
            : "bg-blue-50/60",
      )}
    >
      {/* Avatar + name / last message — tapping this area opens the chat */}
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 border mt-0.5",
            chat?.status === "completed"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-orange-50 text-orange-500 border-orange-200",
          )}
        >
          {chat?.profileName?.charAt(0).toUpperCase() || "#"}
        </div>

        {/* A / C badge */}
        <div
          className={clsx(
            "flex items-center justify-center size-4 rounded-full text-[9px] font-bold text-white shrink-0 mt-1",
            isLastFromMe ? "bg-orange-500" : "bg-blue-500",
          )}
        >
          {isLastFromMe ? "A" : "C"}
        </div>

        <div className="flex-1 min-w-0" onClick={handleOpenChat}>
          {/* Name + time */}
          <div className="flex items-center justify-between gap-2">
            <span
              title={`Name: ${chat?.profileName} | Phone: ${chat?.phone}`}
              className={clsx(
                "truncate text-sm font-google",
                isUnread
                  ? "font-semibold text-gray-900"
                  : chat?.status === "completed"
                    ? "text-gray-400"
                    : "text-gray-700",
              )}
            >
              {chat?.profileName || chat?.phone || "Unknown Contact"}
            </span>

            <span className="text-[11px] text-gray-400 shrink-0">
              <ConversationTime
                lastMessageAt={chat?.lastMessageAt}
                index={index}
              />
            </span>
          </div>

          {/* Last message preview */}
          <p
            className={clsx(
              "truncate text-sm font-google mt-0.5",
              isUnread ? "text-gray-900 font-medium" : "text-gray-500",
            )}
          >
            {chat?.lastMessage || "No messages yet"}
          </p>

          {/* Meta badges row */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
            {assignedUser && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {assignedUser.name?.split(" ")[0]}
              </span>
            )}

            {chat?.category && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wider text-white px-1.5 py-0.5 rounded"
                style={{ backgroundColor: chatCategory?.color }}
              >
                {displayCategory}
              </span>
            )}

            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar — always visible on mobile */}
      <div className="flex items-center gap-2 mt-2 pl-12">
        {/* Star */}
        {scope.edit && (
          <button
            title={chat?.isStarred ? "Unstar" : "Star"}
            onClick={handleToggleStar}
            className="p-1.5"
          >
            {chat?.isStarred ? (
              <FaStar className="h-4 w-4 text-yellow-400" />
            ) : (
              <FaRegStar className="h-4 w-4 text-gray-300" />
            )}
          </button>
        )}

        {/* Comments */}
        <IconButtonWithBadge
          icon={FiMessageSquare}
          unreadCount={chat?.unreadComments || 0}
          title="View Comments"
          onClick={(e) => {
            e.stopPropagation();
            openComments({
              conversationId: chat._id,
            });
          }}
        />

        {/* Unread badge (tappable to mark as read) */}
        {isUnread && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(chat?._id);
            }}
            className="flex justify-center items-center tracking-wide px-2 py-0.5 min-h-[18px] text-[10px] font-inter font-semibold text-white bg-orange-500 rounded-tr-lg rounded-bl-lg"
          >
            {unreadCount} UNREAD
          </button>
        )}

        <div className="flex-1" />

        {/* More menu trigger */}
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

      {/* Overflow menu */}
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
                  conversationId={chat._id}
                  currentCategory={chat?.category}
                  updateConversation={updateConversation}
                />
              </div>
            )}

            {scope.edit && (
              <div className="px-3 py-2 text-sm text-gray-700">
                <AssignUser
                  users={users}
                  conversationId={chat?._id}
                  currentUserId={chat?.userId}
                  updateConversation={updateConversation}
                />
              </div>
            )}

            <div className="px-3 py-2 text-sm text-gray-700">
              <TicketButton chat={chat} handleUpdate={updateConversation} />
            </div>

            <div className="px-3 py-2 text-sm text-gray-700">
              <LeadButton chat={chat} handleUpdate={updateConversation} />
            </div>

            <button
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                openReminder?.({
                  conversationId: chat?._id,
                  // adjust link shape if your reminder expects a different payload
                });
                setMenuOpen(false);
              }}
            >
              <PiBell className="size-4" /> Set Reminder
            </button>

            {scope.edit && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={handleStatusToggle}
              >
                {chat?.status === "progress" ? (
                  <FaCheckCircle className="size-4" />
                ) : (
                  <FaUndoAlt className="size-4" />
                )}
                {chat?.status === "progress"
                  ? "Complete Conversation"
                  : "Undo Complete"}
              </button>
            )}

            {scope.delete && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setActiveChatId(null);
                  deleteConversation(chat?._id, chat?.companyName);
                  setMenuOpen(false);
                }}
              >
                <MdDeleteOutline className="size-4" /> Delete Conversation
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}