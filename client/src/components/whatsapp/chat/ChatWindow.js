import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdSend, IoMdAttach, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { BsReplyFill } from "react-icons/bs";
import { MdOutlineInsertEmoticon } from "react-icons/md";
import { format, isToday, isYesterday } from "date-fns";
import { useSocket } from "../../../context/socketProvider";
import toast from "react-hot-toast";
import { getSenderLabel } from "../utils/getSenderLabel";
import { renderMessageContent, renderReplyPreview } from "./utils";
import { SubmitLogo } from "./ui";
import { useParams } from "react-router-dom";

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function ChatWindow({ users, chat, team, updateConversation }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  
  // New Interactive State Additions
  const [replyingTo, setReplyingTo] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);

  // File Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

 

 

  useEffect(() => {
    if (!chat?._id || !socket) return;
    socket.emit("whatsapp:join-conversation", { conversationId: chat._id });
    return () => {
      socket.emit("whatsapp:leave-conversation", { conversationId: chat._id });
    };
  }, [chat?._id, socket]);

  useEffect(() => {
    if (!chat?._id || !socket) return;

    const handleMessage = ({ conversationId, message }) => {
      if (conversationId !== chat?._id) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const handleStatus = ({ messageId, status, statusUpdatedAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status, statusUpdatedAt } : msg
        )
      );
    };

    const handleReaction = ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== messageId) return msg;
          const existingReactions = msg.reactions || [];
          const filtered = existingReactions.filter((r) => r.from !== reaction.from);
          return { ...msg, reactions: [...filtered, reaction] };
        })
      );
    };

    socket.on("whatsapp:message-created", handleMessage);
    socket.on("whatsapp:message-status-updated", handleStatus);
    socket.on("whatsapp:reaction-updated", handleReaction);

    return () => {
      socket.off("whatsapp:message-created", handleMessage);
      socket.off("whatsapp:message-status-updated", handleStatus);
      socket.off("whatsapp:reaction-updated", handleReaction);
    };
  }, [chat?._id, socket]);

  // Fetch Messages
  useEffect(() => {
    if (!chat?._id) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`
        );
        setMessages(data.messages || []);
        setReplyingTo(null); // Clear context states on channel switch
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [chat?._id]);

  // Smooth Scroll-to-Message Context Anchor
  const scrollToMessage = (targetId) => {
    if (!targetId) return;
    const element = document.getElementById(`msg-${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(targetId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    } else {
      toast.error("Message reference missing from view history");
    }
  };

 



const handleSelectReaction = async (messageId, emoji) => {
  setActiveReactionMenuId(null);

  setMessages((prev) =>
    prev.map((msg) =>
      msg._id === messageId
        ? {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji }],
          }
        : msg
    )
  );

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages/${messageId}/reactions`,
      { emoji, companyName: chat.companyName }
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? { ...msg, reactions: data.data.reactions }
          : msg
      )
    );
  } catch (err) {
    console.error("Failed to send reaction:", err);
    toast.error("Failed to send reaction");
  }
};






  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        url: isImage ? URL.createObjectURL(file) : null,
      };
    });
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (indexToRemove) => {
    if (filePreviews[indexToRemove]?.url) {
      URL.revokeObjectURL(filePreviews[indexToRemove].url);
    }
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAllSelectedFiles = () => {
    filePreviews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() && selectedFiles.length === 0) return;

    try {
      setLoadingMsg(true);
      let data;
      
      // WhatsApp Meta context protocol formatting 
      const contextPayload = replyingTo ? { messageId: replyingTo._id, whatsappMessageId: replyingTo.whatsappMessageId } : null;

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("to", chat.phone);
        formData.append("body", inputMsg);
        formData.append("companyName", chat.companyName);
        if (contextPayload) {
          formData.append("context", JSON.stringify(contextPayload));
        }
        selectedFiles.forEach((file) => formData.append("files", file));

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        data = response.data;
      } else {
        const payload = {
          to: chat.phone,
          type: "text",
          body: inputMsg,
          companyName: chat.companyName,
          ...(contextPayload && { context: contextPayload }),
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          payload
        );
        data = response.data;

        
      }
      
      setMessages((prev) => [...prev, ...data]);
      setInputMsg("");
      setReplyingTo(null);
      clearAllSelectedFiles();

      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      console.error("Failed to send message sequence:", err);
      toast.error(err?.message || "Failed to send message");
    } finally {
      setLoadingMsg(false);
    }
  };

  if (!chat) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation</div>;
  }

  return (
    <div className="flex flex-col h-full z-10 font-inter bg-[#efeae2]">
      {/* Header Panel */}
      <div className="h-16 px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold border border-orange-200 shadow-sm">
            {chat?.profileName?.charAt(0).toUpperCase() || "#"}
          </div>
          <div className="ml-3">
            <h2 className="text-base font-semibold text-gray-900">
              {chat?.profileName} | {chat?.phone}
            </h2>
            <p className="text-xs text-gray-500">
              {chat?.status === "progress" ? "In Progress" : "Completed"}
            </p>
          </div>
        </div>
      </div>

      {/* Message Streaming Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 custom-scrollbar bg-opacity-40 relative">
        {(() => {
          const reversedMessages = [...messages].reverse();

          return reversedMessages.map((msg, idx) => {
            const isOutgoing = msg.direction === "outbound" || msg.userId;
            const isSticker = msg.type === "sticker";
            const isHighlighted = highlightedMessageId === msg._id;

            const msgDate = new Date(msg.timestamp || msg.createdAt);
            const dateString = format(msgDate, "yyyy-MM-dd");

            const olderMsg = reversedMessages[idx + 1];
            const olderMsgDate = olderMsg ? new Date(olderMsg.timestamp || olderMsg.createdAt) : null;
            const olderMsgDateString = olderMsgDate ? format(olderMsgDate, "yyyy-MM-dd") : null;
            const isFirstOfDay = dateString !== olderMsgDateString;

            let dateLabel = "";
            if (isFirstOfDay) {
              if (isToday(msgDate)) dateLabel = "Today";
              else if (isYesterday(msgDate)) dateLabel = "Yesterday";
              else dateLabel = format(msgDate, "MMMM d, yyyy");
            }

            // Find full historical context message matching structural references 
            const parentContextMessage = msg?.context?.messageId  

            return (
              <React.Fragment key={msg._id || idx}>
                {/* Render Main Message Structure */}
                <div
                  id={`msg-${msg._id}`}
                  className={`flex flex-col group transition-all duration-500 relative ${
                    isOutgoing ? "items-end" : "items-start"
                  } ${isHighlighted ? "bg-orange-500/10 scale-[1.01] rounded-lg p-1.5" : ""}`}
                >
                  <div className={`flex items-center gap-2 max-w-[70%] ${isOutgoing ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Message Card Bubble Container */}
                    <div
                      className={`rounded-xl shadow-sm relative transition-colors ${
                        isSticker
                          ? "bg-transparent shadow-none"
                          : isOutgoing
                          ? "bg-[#D9FDD3] text-gray-800 rounded-tr-none px-4 py-3"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none px-4 py-3"
                      }`}
                    >
                      {/* Context Box Section: Click routes back to parent context */}
                      {parentContextMessage && renderReplyPreview(parentContextMessage, scrollToMessage)}
                      {renderMessageContent(msg)}

                      {/* Footer Info Area */}
                      <div className="w-full flex justify-between items-center gap-4 mt-1 text-[11px] text-gray-500">
                        <div>
                          {isOutgoing && <p className="text-gray-400 font-medium">{getSenderLabel(msg, users)}</p>}
                        </div>
                        <div className="flex items-center justify-end gap-1 select-none">
                          {format(new Date(msg.timestamp || msg.createdAt), "hh:mm a").toLowerCase()}
                          {isOutgoing && (
                            <div className="flex items-center ml-0.5" title={msg.status}>
                              <IoMdCheckmark
                                size={16}
                                className={msg.status === "read" ? "text-sky-500" : "text-gray-400"}
                              />
                              {msg.status !== "sent" && (
                                <IoMdCheckmark
                                  size={16}
                                  className={`-ml-2 ${msg.status === "read" ? "text-sky-500" : "text-gray-400"}`}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Render Active Bubble Embedded Reaction Strips */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div
                          className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-sm z-20 select-none ${
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

                    {/* Desktop Hover Shortcut Panels (WhatsApp Web Style Interaction Controls) */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-20">
                      <button
                        type="button"
                        onClick={() => setActiveReactionMenuId(activeReactionMenuId === msg._id ? null : msg._id)}
                        className="p-1.5 bg-white text-gray-500 hover:text-gray-800 rounded-full shadow border border-gray-100 hover:scale-105 transition-transform"
                        title="React to message"
                      >
                        <MdOutlineInsertEmoticon size={16} />


                        
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(msg)}
                        className="p-1.5 bg-white text-gray-500 hover:text-gray-800 rounded-full shadow border border-gray-100 hover:scale-105 transition-transform"
                        title="Reply"
                      >
                        <BsReplyFill size={16} />
                      </button>
                    </div>

                    {/* Hover Reaction Sheet Container Overlay */}
                   {activeReactionMenuId === msg._id && (
  <div 
    className={`absolute -top-8 bg-white shadow-md border border-gray-100 rounded-full py-2 px-4 flex gap-1.5 z-40 animate-badge-pop ${
      isOutgoing ? "right-[20%]" : "left-[20%]"
    }`}
  >
    {COMMON_EMOJIS.map((emoji) => (
      <button
        key={emoji}
        type="button"
        onClick={() => handleSelectReaction(msg._id, emoji)}
        className="hover:scale-125 transition-transform text-base pb-0.5 px-0.5"
      >
        {emoji}
      </button>
    ))}
    <button 
      type="button"
      onClick={() => handleSelectReaction(msg._id, "")}
      className="text-gray-400 hover:text-red-500 pl-1 border-l text-xs transition-colors"
      title="Remove reaction"
    >
      🚫
    </button>
    <button 
      type="button"
      onClick={() => setActiveReactionMenuId(null)}
      className="text-gray-400 hover:text-gray-600 pl-1 border-l text-xs"
    >
      ✕
    </button>
  </div>
)}
                  </div>
                </div>

                {/* Render Date Grouping Dividers */}
                {isFirstOfDay && (
                  <div className="flex justify-center my-2">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                      {dateLabel}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          });
        })()}
      </div>

      {/* Input Action Panels & Context Bars */}
      {chat.status !== "completed" ? (
        <div className="bg-white border-t border-gray-200 flex-shrink-0 relative z-30">
          
          {/* Active Reply Context Bar Above Text input Form */}
          {replyingTo && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between animate-slide-up">
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-xs font-semibold text-orange-600 flex items-center gap-1.5">
                  <BsReplyFill size={14} />
                  Replying to {replyingTo.direction === "outbound" || replyingTo.userId ? "yourself" : chat.profileName}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {replyingTo.type === "text" ? replyingTo.body : `📎 Attached ${replyingTo.type}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <IoMdClose size={18} />
              </button>
            </div>
          )}

          {/* Core Multi File Previews Panel */}
          {filePreviews.length > 0 && (
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
              {filePreviews.map((file, index) => (
                <div
                  key={file.id}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2 w-48 relative pr-7 shadow-sm"
                >
                  {file.url ? (
                    <img src={file.url} alt="Upload thumb" className="w-9 h-9 object-cover rounded border" />
                  ) : (
                    <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                      {file.name.split(".").pop() || "FILE"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-800 truncate mb-0.5">{file.name}</p>
                    <p className="text-[9px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hover:bg-gray-100 p-1 rounded-full"
                  >
                    <IoMdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form Controls Input Wrapper */}
          <div className="p-3">
            <form
              onSubmit={handleSend}
              className="flex items-end gap-3 bg-gray-100 px-4 py-2 rounded-xl    transition-all"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`transition-colors pb-2 flex-shrink-0 ${
                  selectedFiles.length > 0 ? "text-orange-600" : "text-gray-400 hover:text-orange-500"
                }`}
              >
                <IoMdAttach size={24} />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={selectedFiles.length > 0 ? "Add a caption..." : "Type a message..."}
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2.5 resize-none max-h-56 overflow-y-auto custom-scrollbar"
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
  className="
    w-10 h-10 mb-1
    rounded-full
    bg-[#169444]
    hover:bg-[#20bd5a]
    text-white
    disabled:opacity-50
    disabled:cursor-not-allowed
    transition-all duration-200
    flex items-center justify-center
    shadow-sm
    flex-shrink-0
  "
>
  {loadingMsg ? (
    <SubmitLogo />
  ) : (
    <IoMdSend size={20} className="translate-x-[1px]" />
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