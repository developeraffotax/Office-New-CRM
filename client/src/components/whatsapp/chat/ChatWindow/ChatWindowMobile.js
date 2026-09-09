// MobileChatWindow.js
// Mobile-optimized version of ChatWindow — same hooks, same data flow.
// Designed for full-screen chat experience (replaces list on mobile).

import React, { useEffect, useRef, useState } from "react";
import {
  IoMdSend,
  IoMdAttach,
  IoMdCheckmark,
  IoMdClose,
  IoMdArrowBack,
} from "react-icons/io";
import { BsReplyFill, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineInsertEmoticon } from "react-icons/md";
import { format, isToday, isYesterday } from "date-fns";
import { useSocket } from "../../../../context/socketProvider";
import { getSenderLabel } from "../../utils/getSenderLabel";
import { renderMessageContent, renderReplyPreview } from "../utils";
import { SubmitLogo } from "../ui";
import Select from "react-select";
import { style } from "../../../../utlis/CommonStyle";
import {
  filterOption,
  HighlightedOption,
  sortOptions,
} from "../HighlightedOption";

import { useConversationMessages } from "./hooks/useConversationMessages";
import { useReplyContext } from "./hooks/useReplyContext";
import {
  useMessageReactions,
  COMMON_EMOJIS,
} from "./hooks/useMessageReactions";
import { useFileAttachments } from "./hooks/useFileAttachments";
import { useTemplates } from "./hooks/useTemplates";
import { useWaTemplates } from "./hooks/useWaTemplates";
import { useMessageComposer } from "./hooks/useMessageComposer";
import { getTemplateBodyText, interpolateTemplate } from "../../utils/chat";

export default function ChatWindowMobile({
  users,
  chat,
  team,
  updateConversation,
  onBack = () => {}, // called when user taps back
}) {
  const socket = useSocket();
  const textareaRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { replyingTo, setReplyingTo, highlightedMessageId, scrollToMessage } =
    useReplyContext();

  const {
    messages,
    setMessages,
    pagination,
    loadingMore,
    messagesContainerRef,
    loadMoreSentinelRef,
  } = useConversationMessages(chat, socket, setReplyingTo);

  const {
    selectedFiles,
    filePreviews,
    fileInputRef,
    handleFileChange,
    removeSelectedFile,
    clearAllSelectedFiles,
  } = useFileAttachments();

  const { inputMsg, setInputMsg, loadingMsg, setLoadingMsg, handleSend } =
    useMessageComposer({
      chat,
      replyingTo,
      setReplyingTo,
      setMessages,
      selectedFiles,
      clearAllSelectedFiles,
      textareaRef,
    });

  const {
    activeReactionMenuId,
    setActiveReactionMenuId,
    handleSelectReaction,
  } = useMessageReactions(chat, setMessages);

  const {
    inputValue,
    setInputValue,
    templateOptions,
    selectedTemplateOption,
    handleTemplateChange,
    handleClearSelect,
  } = useTemplates(setInputMsg, textareaRef);

  const {
    waTemplateOptions,
    selectedWaTemplate,
    setSelectedWaTemplate,
    waTemplateVars,
    setWaTemplateVars,
    handleWaTemplateChange,
    handleSendWaTemplate,
  } = useWaTemplates(chat, setMessages, setLoadingMsg);

  // Reset composer when conversation changes
  useEffect(() => {
    if (!chat?._id) return;

    setInputMsg("");
    setReplyingTo(null);
    clearAllSelectedFiles();
    handleClearSelect();
    setMenuOpen(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [chat?._id]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "none",
      boxShadow: "none",
      width: "100%",
      minHeight: "36px",
    }),
    menu: (provided) => ({ ...provided, border: "1px solid #ccc", zIndex: 50 }),
    menuList: (provided) => ({ ...provided, padding: 0 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f0f0f0"
        : state.isFocused
          ? "#e6f0ff"
          : "white",
      color: "black",
      cursor: "pointer",
      fontSize: "13px",
    }),
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#efeae2]">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full z-10 font-inter bg-[#efeae2]">
      {/* ──────────── Mobile Header ──────────── */}
      <div className="h-14 px-3 bg-white border-b border-gray-200 flex items-center gap-2 shadow-sm z-30 shrink-0">
        {/* Back */}
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-full active:bg-gray-100 text-gray-600"
          title="Back"
        >
          <IoMdArrowBack size={22} />
        </button>

        {/* Avatar + Name */}
        <div className="flex items-center flex-1 min-w-0 gap-2.5">
          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200 shrink-0">
            {chat?.profileName?.charAt(0).toUpperCase() || "#"}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-gray-900 truncate leading-tight">
              {chat?.profileName || chat?.phone || "Unknown"}
            </h2>
            <p className="text-[11px] text-gray-500 truncate">
              {chat?.status === "progress" ? "In Progress" : "Completed"}
              {chat?.phone ? ` • ${chat.phone}` : ""}
            </p>
          </div>
        </div>

        {/* More menu */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-full active:bg-gray-100 text-gray-500"
        >
          <BsThreeDotsVertical size={18} />
        </button>

        {/* Overflow menu (templates live here on mobile to save header space) */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-3 top-14 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
              <div className="px-3 py-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Template
                </p>
                <Select
                  className="text-sm"
                  value={selectedTemplateOption}
                  onChange={(opt) => {
                    handleTemplateChange(opt);
                    setMenuOpen(false);
                  }}
                  options={sortOptions(templateOptions, inputValue)}
                  placeholder="Select template..."
                  components={{ Option: HighlightedOption }}
                  filterOption={filterOption}
                  isClearable
                  styles={customStyles}
                  onInputChange={(val) => setInputValue(val)}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ──────────── Messages ──────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col-reverse gap-3 custom-scrollbar relative"
      >
        {(() => {
          const reversedMessages = [...messages].reverse();

          return reversedMessages.map((msg, idx) => {
            const isOutgoing = msg.direction === "outbound" || msg.userId;
            const isSticker = msg.type === "sticker";
            const isHighlighted = highlightedMessageId === msg._id;

            const msgDate = new Date(msg.timestamp || msg.createdAt);
            const dateString = format(msgDate, "yyyy-MM-dd");

            const olderMsg = reversedMessages[idx + 1];
            const olderMsgDate = olderMsg
              ? new Date(olderMsg.timestamp || olderMsg.createdAt)
              : null;
            const olderMsgDateString = olderMsgDate
              ? format(olderMsgDate, "yyyy-MM-dd")
              : null;
            const isFirstOfDay = dateString !== olderMsgDateString;

            let dateLabel = "";
            if (isFirstOfDay) {
              if (isToday(msgDate)) dateLabel = "Today";
              else if (isYesterday(msgDate)) dateLabel = "Yesterday";
              else dateLabel = format(msgDate, "MMMM d, yyyy");
            }

            const parentContextMessage = msg?.context?.messageId;

            return (
              <React.Fragment key={msg._id || idx}>
                <div
                  id={`msg-${msg._id}`}
                  className={`flex flex-col relative transition-all duration-300 ${
                    isOutgoing ? "items-end" : "items-start"
                  } ${
                    isHighlighted
                      ? "bg-orange-500/10 scale-[1.01] rounded-lg p-1"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-end gap-1.5 max-w-[88%] ${
                      isOutgoing ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Bubble */}
                    <div
                      className={`rounded-2xl shadow-sm relative ${
                        isSticker
                          ? "bg-transparent shadow-none"
                          : isOutgoing
                            ? "bg-[#D9FDD3] text-gray-800 rounded-tr-md px-3.5 py-2.5"
                            : "bg-white text-gray-800 border border-gray-100 rounded-tl-md px-3.5 py-2.5"
                      }`}
                    >
                      {/* Reply context */}
                      {parentContextMessage &&
                        renderReplyPreview(
                          parentContextMessage,
                          scrollToMessage,
                        )}

                      {renderMessageContent(msg)}

                      {/* Footer */}
                      <div className="w-full flex justify-between items-center gap-3 mt-1 text-[10px] text-gray-500">
                        <div>
                          {isOutgoing && (
                            <p className="text-gray-400 font-medium">
                              {getSenderLabel(msg, users)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 select-none shrink-0">
                          {format(
                            new Date(msg.timestamp || msg.createdAt),
                            "hh:mm a",
                          ).toLowerCase()}
                          {isOutgoing && (
                            <div className="flex items-center ml-0.5" title={msg.status}>
                              <IoMdCheckmark
                                size={14}
                                className={
                                  msg.status === "read"
                                    ? "text-sky-500"
                                    : "text-gray-400"
                                }
                              />
                              {msg.status !== "sent" && (
                                <IoMdCheckmark
                                  size={14}
                                  className={`-ml-1.5 ${
                                    msg.status === "read"
                                      ? "text-sky-500"
                                      : "text-gray-400"
                                  }`}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reactions strip */}
                      {msg.reactions?.length > 0 && (
                        <div
                          className={`absolute -bottom-2.5 flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-sm z-20 ${
                            isOutgoing ? "right-2" : "left-2"
                          }`}
                        >
                          {msg.reactions.map((react, rIdx) => (
                            <span key={react._id || rIdx} title={`From: ${react.from}`}>
                              {react.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Always-visible mobile action buttons (no hover) */}
                    <div className="flex flex-col gap-1 shrink-0 pb-1">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveReactionMenuId(
                            activeReactionMenuId === msg._id ? null : msg._id,
                          )
                        }
                        className="p-1.5 bg-white/90 text-gray-500 active:text-gray-800 rounded-full shadow border border-gray-100"
                        title="React"
                      >
                        <MdOutlineInsertEmoticon size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(msg)}
                        className="p-1.5 bg-white/90 text-gray-500 active:text-gray-800 rounded-full shadow border border-gray-100"
                        title="Reply"
                      >
                        <BsReplyFill size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Reaction picker */}
                  {activeReactionMenuId === msg._id && (
                    <div
                      className={`mt-2 bg-white shadow-lg border border-gray-100 rounded-full py-2 px-3 flex gap-1.5 z-40 animate-badge-pop ${
                        isOutgoing ? "self-end mr-8" : "self-start ml-8"
                      }`}
                    >
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSelectReaction(msg._id, emoji)}
                          className="active:scale-125 transition-transform text-lg px-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleSelectReaction(msg._id, "")}
                        className="text-gray-400 active:text-red-500 pl-1.5 border-l text-xs"
                        title="Remove"
                      >
                        🚫
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReactionMenuId(null)}
                        className="text-gray-400 active:text-gray-600 pl-1 border-l text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Date divider */}
                {isFirstOfDay && (
                  <div className="flex justify-center my-1.5">
                    <div className="bg-white/90 border border-gray-200/60 shadow-sm text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                      {dateLabel}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          });
        })()}

        {(pagination.hasMore || loadingMore) && (
          <div
            ref={loadMoreSentinelRef}
            className="flex justify-center py-2 flex-shrink-0"
          >
            {loadingMore && (
              <span className="text-xs text-gray-500">
                Loading older messages…
              </span>
            )}
          </div>
        )}
      </div>

      {/* ──────────── Composer ──────────── */}
      {chat.status !== "completed" ? (
        <div className="bg-white border-t border-gray-200 flex-shrink-0 relative z-30">
          {/* Reply context bar */}
          {replyingTo && (
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-xs font-semibold text-orange-600 flex items-center gap-1.5">
                  <BsReplyFill size={13} />
                  Replying to{" "}
                  {replyingTo.direction === "outbound" || replyingTo.userId
                    ? "yourself"
                    : chat.profileName}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {replyingTo.type === "text"
                    ? replyingTo.body
                    : `📎 Attached ${replyingTo.type}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1.5 text-gray-400 active:bg-gray-200 rounded-full"
              >
                <IoMdClose size={18} />
              </button>
            </div>
          )}

          {/* File previews */}
          {filePreviews.length > 0 && (
            <div className="p-2.5 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filePreviews.map((file, index) => (
                <div
                  key={file.id}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2 w-40 relative pr-7 shadow-sm"
                >
                  {file.url ? (
                    <img
                      src={file.url}
                      alt="thumb"
                      className="w-8 h-8 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                      {file.name.split(".").pop() || "FILE"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 active:text-red-500 p-1 rounded-full"
                  >
                    <IoMdClose size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* WA Template panel */}
          {selectedWaTemplate && (
            <div className="px-3 py-2.5 bg-orange-50 border-b border-orange-100 space-y-2">
              <div className="text-xs font-semibold text-orange-700 flex items-center justify-between">
                <span>Template: {selectedWaTemplate.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWaTemplate(null);
                    setWaTemplateVars([]);
                  }}
                  className="text-gray-400 active:text-gray-700"
                >
                  <IoMdClose size={16} />
                </button>
              </div>

              {waTemplateVars.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Variable {{${idx + 1}}}`}
                  value={val}
                  onChange={(e) => {
                    const next = [...waTemplateVars];
                    next[idx] = e.target.value;
                    setWaTemplateVars(next);
                  }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400"
                />
              ))}

              <p className="text-xs text-gray-500 whitespace-pre-wrap bg-white rounded-lg p-2 border border-gray-100">
                {interpolateTemplate(
                  getTemplateBodyText(selectedWaTemplate),
                  waTemplateVars,
                )}
              </p>

              <button
                type="button"
                onClick={handleSendWaTemplate}
                disabled={loadingMsg || waTemplateVars.some((v) => !v.trim())}
                className="w-full bg-[#169444] active:bg-[#20bd5a] text-white text-sm font-medium rounded-lg py-2 disabled:opacity-50"
              >
                Send Template
              </button>
            </div>
          )}

          {/* Input bar */}
          <div className="p-2.5">
            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 bg-gray-100 px-3 py-1.5 rounded-2xl"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`pb-2.5 shrink-0 ${
                  selectedFiles.length > 0
                    ? "text-orange-600"
                    : "text-gray-400 active:text-orange-500"
                }`}
              >
                <IoMdAttach size={22} />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={
                  selectedFiles.length > 0
                    ? "Add a caption..."
                    : "Type a message..."
                }
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2.5 resize-none max-h-40 overflow-y-auto"
                value={inputMsg}
                onChange={(e) => {
                  setInputMsg(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                disabled={loadingMsg}
              />

              <button
                type="submit"
                disabled={
                  (!inputMsg.trim() && selectedFiles.length === 0) || loadingMsg
                }
                className="w-10 h-10 mb-0.5 rounded-full bg-[#169444] active:bg-[#20bd5a] text-white disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm"
              >
                {loadingMsg ? (
                  <SubmitLogo />
                ) : (
                  <IoMdSend size={18} className="translate-x-[1px]" />
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500 flex-shrink-0">
          This conversation is completed.
        </div>
      )}
    </div>
  );
}