

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import axios from "axios";
// import { IoMdSend, IoMdAttach, IoMdCheckmark, IoMdClose } from "react-icons/io";
// import { MdReply } from "react-icons/md";
// import { format, isToday, isYesterday } from "date-fns";
// import { useSocket } from "../../../context/socketProvider";
// import toast from "react-hot-toast";
// import { getSenderLabel } from "../utils/getSenderLabel";
// import { renderMessageContent, renderReplyPreview } from "./utils";
// import { SubmitLogo } from "./ui";

// const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// export default function ChatWindow({ users, chat, team, updateConversation }) {
//   const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [inputMsg, setInputMsg] = useState("");

//   // ── Multiple File Upload State Arrays ────────────────────────────
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [filePreviews, setFilePreviews] = useState([]);

//   const [loadingMsg, setLoadingMsg] = useState(false);

//   // ── Reply state ─────────────────────────────────────────────────
//   const [replyTo, setReplyTo] = useState(null); // full message object

//   // ── Hover state for action buttons ──────────────────────────────
//   const [hoveredMsgId, setHoveredMsgId] = useState(null);
//   const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);

//   // ── Highlighted message (flash on scroll-to) ────────────────────
//   const [highlightedMsgId, setHighlightedMsgId] = useState(null);

//   // ── Refs ─────────────────────────────────────────────────────────
//   const fileInputRef = useRef(null);
//   const textareaRef = useRef(null);
//   // Map of messageId → DOM node ref
//   const msgRefs = useRef({});

//   const setMsgRef = useCallback((id, node) => {
//     if (node) msgRefs.current[id] = node;
//     else delete msgRefs.current[id];
//   }, []);

//   // ── Socket setup ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (!chat?._id || !socket) return;
//     socket.emit("whatsapp:join-conversation", { conversationId: chat._id });
//     return () => socket.emit("whatsapp:leave-conversation", { conversationId: chat._id });
//   }, [chat?._id, socket]);

//   useEffect(() => {
//     if (!chat?._id || !socket) return;

//     const handleMessage = ({ conversationId, message }) => {
//       if (conversationId !== chat?._id) return;
//       setMessages((prev) => {
//         if (prev.some((m) => m._id === message._id)) return prev;
//         return [...prev, message];
//       });
//     };

//     const handleStatus = ({ messageId, status, statusUpdatedAt }) => {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, status, statusUpdatedAt } : msg,
//         ),
//       );
//     };

//     const handleReaction = ({ messageId, reaction }) => {
//       setMessages((prev) =>
//         prev.map((msg) => {
//           if (msg._id !== messageId) return msg;
//           const filtered = (msg.reactions || []).filter((r) => r.from !== reaction.from);
//           return { ...msg, reactions: [...filtered, reaction] };
//         }),
//       );
//     };

//     socket.on("whatsapp:message-created", handleMessage);
//     socket.on("whatsapp:message-status-updated", handleStatus);
//     socket.on("whatsapp:reaction-updated", handleReaction);

//     return () => {
//       socket.off("whatsapp:message-created", handleMessage);
//       socket.off("whatsapp:message-status-updated", handleStatus);
//       socket.off("whatsapp:reaction-updated", handleReaction);
//     };
//   }, [chat?._id, socket]);

//   // Fetch Messages for active chat
//   useEffect(() => {
//     if (!chat?._id) return;
//     const fetchMessages = async () => {
//       try {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
//         );
//         setMessages(data.messages || []);
//       } catch (err) {
//         console.error("Failed to fetch messages", err);
//       }
//     };
//     fetchMessages();
//   }, [chat?._id]);

//   // ── Scroll to message by ID (used when clicking reply preview) ───
//   const scrollToMessage = useCallback((messageId) => {
//     const node = msgRefs.current[messageId];
//     if (!node) return;

//     node.scrollIntoView({ behavior: "smooth", block: "center" });
//     setHighlightedMsgId(messageId);
//     setTimeout(() => setHighlightedMsgId(null), 1800);
//   }, []);

//   // ── Handle Multi-File Attachment selection ────────────────────────
//   const handleFileChange = (e) => {
//     if (!e.target.files) return;
//     const newFiles = Array.from(e.target.files);
//     setSelectedFiles((prev) => [...prev, ...newFiles]);

//     const newPreviews = newFiles.map((file) => {
//       const isImage = file.type.startsWith("image/");
//       return {
//         id: `${file.name}-${Date.now()}-${Math.random()}`,
//         name: file.name,
//         size: file.size,
//         url: isImage ? URL.createObjectURL(file) : null,
//       };
//     });
//     setFilePreviews((prev) => [...prev, ...newPreviews]);
//   };

//   const removeSelectedFile = (indexToRemove) => {
//     if (filePreviews[indexToRemove]?.url) URL.revokeObjectURL(filePreviews[indexToRemove].url);
//     setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
//     setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const clearAllSelectedFiles = () => {
//     filePreviews.forEach((p) => { if (p.url) URL.revokeObjectURL(p.url); });
//     setSelectedFiles([]);
//     setFilePreviews([]);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   // ── Send reaction ────────────────────────────────────────────────
//   const handleSendReaction = async (msgId, emoji) => {
//     setReactionPickerMsgId(null);
//     try {
//       await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages/${msgId}/react`,
//         { emoji },
//       );
//     } catch (err) {
//       toast.error("Failed to send reaction");
//     }
//   };

//   // ── Send message ──────────────────────────────────────────────────
//   const handleSend = async (e) => {
//     e?.preventDefault();
//     if (!inputMsg.trim() && selectedFiles.length === 0) return;

//     try {
//       setLoadingMsg(true);
//       let data;

//       if (selectedFiles.length > 0) {
//         const formData = new FormData();
//         formData.append("to", chat.phone);
//         formData.append("body", inputMsg);
//         if (replyTo?._id) formData.append("contextMessageId", replyTo._id);
//         selectedFiles.forEach((file) => formData.append("files", file));

//         const response = await axios.post(
//           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
//           formData,
//           { headers: { "Content-Type": "multipart/form-data" } },
//         );
//         data = response.data;
//       } else {
//         const payload = {
//           to: chat.phone,
//           type: "text",
//           body: inputMsg,
//           ...(replyTo?._id ? { contextMessageId: replyTo._id } : {}),
//         };
//         const response = await axios.post(
//           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
//           payload,
//         );
//         data = response.data;
//       }

//       setMessages((prev) => [...prev, ...data]);
//       setInputMsg("");
//       setReplyTo(null);
//       clearAllSelectedFiles();
//       if (textareaRef.current) textareaRef.current.style.height = "auto";
//     } catch (err) {
//       console.error("Failed to send message sequence:", err);
//       toast.error(err?.message || "Failed to send message");
//     } finally {
//       setLoadingMsg(false);
//     }
//   };

//   // ── Close reaction picker on outside click ───────────────────────
//   useEffect(() => {
//     if (!reactionPickerMsgId) return;
//     const handler = () => setReactionPickerMsgId(null);
//     document.addEventListener("click", handler);
//     return () => document.removeEventListener("click", handler);
//   }, [reactionPickerMsgId]);

//   if (!chat) {
//     return (
//       <div className="flex-1 flex items-center justify-center">Select a conversation</div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full z-10 font-inter">
//       {/* Header Panel */}
//       <div className="h-16 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between shadow-sm">
//         <div className="flex items-center">
//           <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold border border-orange-200 shadow-sm">
//             {chat?.profileName?.charAt(0).toUpperCase() || "#"}
//           </div>
//           <div className="ml-3">
//             <h2 className="text-base font-semibold text-gray-900">
//               {chat?.profileName} | {chat?.phone}
//             </h2>
//             <p className="text-xs text-gray-500">
//               {chat?.status === "progress" ? "In Progress" : "Completed"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Message Streaming Area */}
//       <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 custom-scrollbar">
//         {(() => {
//           const reversedMessages = [...messages].reverse();

//           return reversedMessages.map((msg, idx) => {
//             const isOutgoing = msg.direction === "outbound" || msg.userId;
//             const isSticker = msg.type === "sticker";

//             const msgDate = new Date(msg.timestamp || msg.createdAt);
//             const dateString = format(msgDate, "yyyy-MM-dd");

//             const olderMsg = reversedMessages[idx + 1];
//             const olderMsgDate = olderMsg
//               ? new Date(olderMsg.timestamp || olderMsg.createdAt)
//               : null;
//             const olderMsgDateString = olderMsgDate ? format(olderMsgDate, "yyyy-MM-dd") : null;
//             const isFirstOfDay = dateString !== olderMsgDateString;

//             let dateLabel = "";
//             if (isFirstOfDay) {
//               if (isToday(msgDate)) dateLabel = "Today";
//               else if (isYesterday(msgDate)) dateLabel = "Yesterday";
//               else dateLabel = format(msgDate, "MMMM d, yyyy");
//             }

//             const isHovered = hoveredMsgId === msg._id;
//             const showPicker = reactionPickerMsgId === msg._id;
//             const isHighlighted = highlightedMsgId === msg._id;

//             return (
//               <React.Fragment key={msg._id || idx}>
//                 {/* ── Render Message ── */}
//                 <div
//                   className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}
//                   ref={(node) => setMsgRef(msg._id, node)}
//                   onMouseEnter={() => setHoveredMsgId(msg._id)}
//                   onMouseLeave={() => {
//                     setHoveredMsgId(null);
//                     // Keep picker open if user moves to it
//                   }}
//                 >
//                   {/* ── Action Row (reply + react) ── */}
//                   <div
//                     className={`flex items-center gap-1 mb-1 transition-all duration-150 ${
//                       isHovered || showPicker ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
//                     } ${isOutgoing ? "flex-row-reverse" : "flex-row"}`}
//                   >
//                     {/* Reply button */}
//                     <button
//                       type="button"
//                       onClick={() => setReplyTo(msg)}
//                       className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors"
//                       title="Reply"
//                     >
//                       <MdReply size={16} />
//                     </button>

//                     {/* React button */}
//                     <div className="relative">
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setReactionPickerMsgId(showPicker ? null : msg._id);
//                         }}
//                         className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors text-[13px] leading-none"
//                         title="React"
//                       >
//                         😊
//                       </button>

//                       {/* Reaction picker popup */}
//                       {showPicker && (
//                         <div
//                           onClick={(e) => e.stopPropagation()}
//                           className={`absolute bottom-full mb-2 z-50 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1.5 flex items-center gap-1 ${
//                             isOutgoing ? "right-0" : "left-0"
//                           }`}
//                           style={{ minWidth: "max-content" }}
//                         >
//                           {QUICK_REACTIONS.map((emoji) => (
//                             <button
//                               key={emoji}
//                               type="button"
//                               onClick={() => handleSendReaction(msg._id, emoji)}
//                               className="text-xl leading-none hover:scale-125 transition-transform duration-100 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
//                               title={emoji}
//                             >
//                               {emoji}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* ── Bubble ── */}
//                   <div
//                     className={`max-w-[70%] rounded-xl shadow-sm relative transition-colors duration-300 ${
//                       isHighlighted ? "ring-2 ring-orange-400 ring-offset-1" : ""
//                     } ${
//                       isSticker
//                         ? "bg-transparent shadow-none"
//                         : isOutgoing
//                         ? `bg-[#D9FDD3] text-gray-800 rounded-tr-none px-4 py-3 ${isHighlighted ? "bg-yellow-100" : ""}`
//                         : `bg-white text-gray-800 border border-gray-100 rounded-tl-none px-4 py-3 ${isHighlighted ? "bg-yellow-50" : ""}`
//                     }`}
//                   >
//                     {/* Reply preview — clickable, scrolls to original */}
//                     {msg?.context?.messageId && (
//                       <div
//                         className="mb-2 border-l-4 border-green-500 bg-black/5 rounded-r-md px-3 py-2 cursor-pointer hover:bg-black/10 transition-colors"
//                         onClick={() => scrollToMessage(msg.context.messageId._id)}
//                         title="Jump to original message"
//                       >
//                         {renderReplyPreview(msg.context.messageId)}
//                       </div>
//                     )}

//                     {renderMessageContent(msg)}

//                     <div className="w-full flex justify-between items-center gap-4 mt-1 text-[11px] text-gray-500">
//                       <div>
//                         {isOutgoing && <p>{getSenderLabel(msg, users)}</p>}
//                       </div>
//                       <div className="flex items-center justify-end gap-1">
//                         {format(new Date(msg.timestamp || msg.createdAt), "hh:mm a").toLowerCase()}
//                         {isOutgoing && (
//                           <div
//                             className="flex items-center ml-0.5"
//                             title={
//                               msg.status === "read"
//                                 ? "Seen"
//                                 : msg.status === "delivered"
//                                 ? "Delivered"
//                                 : "Sent"
//                             }
//                           >
//                             <IoMdCheckmark
//                               size={16}
//                               className={msg.status === "read" ? "text-sky-500" : "text-gray-400"}
//                             />
//                             {msg.status !== "sent" && (
//                               <IoMdCheckmark
//                                 size={16}
//                                 className={`-ml-2 ${msg.status === "read" ? "text-sky-500" : "text-gray-400"}`}
//                               />
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {msg.reactions && msg.reactions.length > 0 && (
//                       <div
//                         className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-xs z-20 select-none ${
//                           isOutgoing ? "right-2" : "left-2"
//                         }`}
//                       >
//                         {msg.reactions.map((react, rIdx) => (
//                           <span key={react._id || rIdx} title={`From: ${react.from}`}>
//                             {react.emoji}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* ── Date Divider ── */}
//                 {isFirstOfDay && (
//                   <div className="flex justify-center my-2">
//                     <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200 shadow-sm text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
//                       {dateLabel}
//                     </div>
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           });
//         })()}
//       </div>

//       {/* Input Action Panel */}
//       {chat.status !== "completed" ? (
//         <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">

//           {/* ── Reply Preview Strip ── */}
//           {replyTo && (
//             <div className="mb-2 flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
//               <div className="flex-1 border-l-4 border-orange-400 pl-2 min-w-0">
//                 <p className="text-[11px] font-semibold text-orange-500 mb-0.5">
//                   {replyTo.direction === "outbound" || replyTo.userId ? "You" : "Customer"}
//                 </p>
//                 <p className="text-xs text-gray-600 truncate">
//                   {replyTo.type === "image"
//                     ? "📷 Photo"
//                     : replyTo.type === "video"
//                     ? "🎥 Video"
//                     : replyTo.type === "audio"
//                     ? "🎵 Audio"
//                     : replyTo.type === "document"
//                     ? `📄 ${replyTo.media?.filename || "Document"}`
//                     : replyTo.type === "location"
//                     ? "📍 Location"
//                     : replyTo.type === "sticker"
//                     ? "😀 Sticker"
//                     : replyTo.body || "Message"}
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setReplyTo(null)}
//                 className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 mt-0.5"
//               >
//                 <IoMdClose size={14} />
//               </button>
//             </div>
//           )}

//           {/* ── File Previews ── */}
//           {filePreviews.length > 0 && (
//             <div className="mb-3 p-2 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
//               {filePreviews.map((file, index) => (
//                 <div
//                   key={file.id}
//                   className="p-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2 w-48 relative pr-7 animate-fade-in shadow-sm"
//                 >
//                   {file.url ? (
//                     <img
//                       src={file.url}
//                       alt="Upload thumb"
//                       className="w-9 h-9 object-cover rounded border"
//                     />
//                   ) : (
//                     <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
//                       {file.name.split(".").pop() || "FILE"}
//                     </div>
//                   )}
//                   <div className="min-w-0 flex-1">
//                     <p className="text-[11px] font-semibold text-gray-800 truncate mb-0.5">
//                       {file.name}
//                     </p>
//                     <p className="text-[9px] text-gray-400">
//                       {(file.size / 1024).toFixed(1)} KB
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => removeSelectedFile(index)}
//                     className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
//                   >
//                     <IoMdClose size={14} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           <form
//             onSubmit={handleSend}
//             className="flex items-end gap-3 bg-gray-100 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/30 transition-all"
//           >
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//               multiple
//             />

//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className={`transition-colors pb-2 ${
//                 selectedFiles.length > 0
//                   ? "text-orange-600"
//                   : "text-gray-400 hover:text-orange-500"
//               }`}
//             >
//               <IoMdAttach size={24} />
//             </button>

//             <textarea
//               ref={textareaRef}
//               rows={1}
//               placeholder={selectedFiles.length > 0 ? "Add a caption..." : "Type a message..."}
//               className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2.5 resize-none max-h-56 overflow-y-auto custom-scrollbar"
//               value={inputMsg}
//               onChange={(e) => {
//                 setInputMsg(e.target.value);
//                 e.target.style.height = "auto";
//                 e.target.style.height = `${e.target.scrollHeight}px`;
//               }}
//               onKeyDown={(e) => {
//                 if (e.shiftKey && e.key === "Enter") handleSend(e);
//               }}
//               disabled={loadingMsg}
//             />

//             <button
//               type="submit"
//               disabled={(!inputMsg.trim() && selectedFiles.length === 0) || loadingMsg}
//               className="text-white bg-orange-500 p-2 mb-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px]"
//             >
//               {loadingMsg ? <SubmitLogo /> : <IoMdSend size={20} className="ml-0.5" />}
//             </button>
//           </form>
//         </div>
//       ) : (
//         <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500 flex-shrink-0">
//           This conversation is completed.
//         </div>
//       )}
//     </div>
//   );
// }











































































































































// // import React, { useEffect, useState, useRef } from "react";
// // import axios from "axios";
// // import { IoMdSend, IoMdAttach, IoMdCheckmark, IoMdClose } from "react-icons/io";
// // import {
// //   HiOutlineUserAdd,
// //   HiOutlineCheckCircle,
// //   HiOutlineDocumentDownload,
// //   HiOutlineMap,
// // } from "react-icons/hi";
// // import { FiHeadphones, FiFilm } from "react-icons/fi";
// // import { format, isToday, isYesterday } from "date-fns";
// // import { useSocket } from "../../../context/socketProvider";
// // import toast from "react-hot-toast";
// // import { getSenderLabel } from "../utils/getSenderLabel";
// // import { renderMessageContent, renderReplyPreview } from "./utils";
// // import { SubmitLogo } from "./ui";

// // export default function ChatWindow({ users, chat, team, updateConversation }) {
// //   const socket = useSocket();
// //   const [messages, setMessages] = useState([]);
// //   const [inputMsg, setInputMsg] = useState("");

// //   // ── Multiple File Upload State Arrays ────────────────────────────
// //   const [selectedFiles, setSelectedFiles] = useState([]);
// //   const [filePreviews, setFilePreviews] = useState([]);

// //   const [loadingMsg, setLoadingMsg] = useState(false);

// //   const fileInputRef = useRef(null);
// //   const textareaRef = useRef(null);

// //   useEffect(() => {
// //     if (!chat?._id || !socket) return;

// //     socket.emit("whatsapp:join-conversation", {
// //       conversationId: chat._id,
// //     });

// //     return () => {
// //       socket.emit("whatsapp:leave-conversation", {
// //         conversationId: chat._id,
// //       });
// //     };
// //   }, [chat?._id, socket]);

// //   useEffect(() => {
// //     if (!chat?._id || !socket) return;

// //     const handleMessage = ({ conversationId, message }) => {
// //       console.log("THE NEW MESSAGE IS ", message);
// //       if (conversationId !== chat?._id) return;

// //       setMessages((prev) => {
// //         const exists = prev.some((m) => m._id === message._id);
// //         if (exists) return prev;

// //         return [...prev, message];
// //       });
// //     };

// //     const handleStatus = ({ messageId, status, statusUpdatedAt }) => {
// //       setMessages((prev) =>
// //         prev.map((msg) =>
// //           msg._id === messageId
// //             ? {
// //                 ...msg,
// //                 status,
// //                 statusUpdatedAt,
// //               }
// //             : msg,
// //         ),
// //       );
// //     };

// //     const handleReaction = ({ messageId, reaction }) => {
// //       setMessages((prev) =>
// //         prev.map((msg) => {
// //           if (msg._id !== messageId) return msg;

// //           const existingReactions = msg.reactions || [];
// //           const filtered = existingReactions.filter(
// //             (r) => r.from !== reaction.from,
// //           );

// //           return {
// //             ...msg,
// //             reactions: [...filtered, reaction],
// //           };
// //         }),
// //       );
// //     };

// //     socket.on("whatsapp:message-created", handleMessage);
// //     socket.on("whatsapp:message-status-updated", handleStatus);
// //     socket.on("whatsapp:reaction-updated", handleReaction);

// //     return () => {
// //       socket.off("whatsapp:message-created", handleMessage);
// //       socket.off("whatsapp:message-status-updated", handleStatus);
// //       socket.off("whatsapp:reaction-updated", handleReaction);
// //     };
// //   }, [chat?._id, socket]);

// //   // Fetch Messages for active chat
// //   useEffect(() => {
// //     if (!chat?._id) return;
// //     const fetchMessages = async () => {
// //       try {
// //         const { data } = await axios.get(
// //           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
// //         );
// //         setMessages(data.messages || []);
// //       } catch (err) {
// //         console.error("Failed to fetch messages", err);
// //       }
// //     };
// //     fetchMessages();
// //   }, [chat?._id]);

// //   // Handle Multi-File Attachment selection
// //   const handleFileChange = (e) => {
// //     if (!e.target.files) return;
// //     const newFiles = Array.from(e.target.files);

// //     setSelectedFiles((prev) => [...prev, ...newFiles]);

// //     const newPreviews = newFiles.map((file) => {
// //       const isImage = file.type.startsWith("image/");
// //       return {
// //         id: `${file.name}-${Date.now()}-${Math.random()}`,
// //         name: file.name,
// //         size: file.size,
// //         url: isImage ? URL.createObjectURL(file) : null,
// //       };
// //     });

// //     setFilePreviews((prev) => [...prev, ...newPreviews]);
// //   };

// //   const removeSelectedFile = (indexToRemove) => {
// //     if (filePreviews[indexToRemove]?.url) {
// //       URL.revokeObjectURL(filePreviews[indexToRemove].url);
// //     }

// //     setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
// //     setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));

// //     if (fileInputRef.current) fileInputRef.current.value = "";
// //   };

// //   const clearAllSelectedFiles = () => {
// //     filePreviews.forEach((preview) => {
// //       if (preview.url) URL.revokeObjectURL(preview.url);
// //     });
// //     setSelectedFiles([]);
// //     setFilePreviews([]);
// //     if (fileInputRef.current) fileInputRef.current.value = "";
// //   };

// //   const handleSend = async (e) => {
// //     e?.preventDefault();
// //     if (!inputMsg.trim() && selectedFiles.length === 0) return;

// //     try {
// //       setLoadingMsg(true);
// //       let data;

// //       if (selectedFiles.length > 0) {
// //         const formData = new FormData();
// //         formData.append("to", chat.phone);
// //         formData.append("body", inputMsg);

// //         selectedFiles.forEach((file) => {
// //           formData.append("files", file);
// //         });

// //         const response = await axios.post(
// //           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
// //           formData,
// //           { headers: { "Content-Type": "multipart/form-data" } },
// //         );

// //         data = response.data;
// //       } else {
// //         const payload = {
// //           to: chat.phone,
// //           type: "text",
// //           body: inputMsg,
// //         };
// //         const response = await axios.post(
// //           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
// //           payload,
// //         );
// //         data = response.data;
// //       }

// //       setMessages((prev) => [...prev, ...data]);
// //       setInputMsg("");
// //       clearAllSelectedFiles();

// //       if (textareaRef.current) {
// //         textareaRef.current.style.height = "auto";
// //       }
// //     } catch (err) {
// //       console.error("Failed to send message sequence:", err);
// //       toast.error(err?.message || "Failed to send message");
// //     } finally {
// //       setLoadingMsg(false);
// //     }
// //   };



// //   if (!chat) {
// //     return (
// //       <div className="flex-1 flex items-center justify-center">
// //         Select a conversation
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex flex-col h-full z-10 font-inter">
// //       {/* Header Panel */}
// //       <div className="h-16 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between shadow-sm">
// //         <div className="flex items-center">
// //           <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold border border-orange-200 shadow-sm">
// //             {chat?.profileName?.charAt(0).toUpperCase() || "#"}
// //           </div>
// //           <div className="ml-3">
// //             <h2 className="text-base font-semibold text-gray-900">
// //               {chat?.profileName} | {chat?.phone}
// //             </h2>
// //             <p className="text-xs text-gray-500">
// //               {chat?.status === "progress" ? "In Progress" : "Completed"}
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Message Streaming Area */}
// //       {/* Container is now flex-col-reverse and gap-4. No scrolling JS needed. */}
// //       <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 custom-scrollbar">
// //         {(() => {
// //           // Reverse the array so the newest message is mapped first
// //           const reversedMessages = [...messages].reverse();

// //           return reversedMessages.map((msg, idx) => {
// //             const isOutgoing = msg.direction === "outbound" || msg.userId;
// //             const isSticker = msg.type === "sticker";

// //             const msgDate = new Date(msg.timestamp || msg.createdAt);
// //             const dateString = format(msgDate, "yyyy-MM-dd");

// //             // Look ahead to the older message to see if the date changes
// //             const olderMsg = reversedMessages[idx + 1];
// //             const olderMsgDate = olderMsg
// //               ? new Date(olderMsg.timestamp || olderMsg.createdAt)
// //               : null;
// //             const olderMsgDateString = olderMsgDate
// //               ? format(olderMsgDate, "yyyy-MM-dd")
// //               : null;

// //             // If there is no older message, or the older message is from a different day,
// //             // this is the earliest message of the day, so we show the divider.
// //             const isFirstOfDay = dateString !== olderMsgDateString;

// //             let dateLabel = "";
// //             if (isFirstOfDay) {
// //               if (isToday(msgDate)) {
// //                 dateLabel = "Today";
// //               } else if (isYesterday(msgDate)) {
// //                 dateLabel = "Yesterday";
// //               } else {
// //                 dateLabel = format(msgDate, "MMMM d, yyyy");
// //               }
// //             }

// //             return (
// //               <React.Fragment key={msg._id || idx}>
// //                 {/* ── Render Message ── */}
// //                 <div
// //                   className={`flex flex-col ${
// //                     isOutgoing ? "items-end" : "items-start"
// //                   }`}
// //                 >
// //                   <div
// //                     className={`max-w-[70%]  rounded-xl shadow-sm relative ${
// //                       isSticker
// //                         ? "bg-transparent shadow-none"
// //                         : isOutgoing
// //                         ? "bg-[#D9FDD3] text-gray-800 rounded-tr-none px-4 py-3"
// //                         : "bg-white text-gray-800 border border-gray-100 rounded-tl-none px-4 py-3"
// //                     }`}
// //                   >
// //                     {renderReplyPreview(msg?.context?.messageId)}
// //                     {renderMessageContent(msg)}

// //                     <div className="w-full flex justify-between items-center gap-4 mt-1 text-[11px] text-gray-500">
// //                       <div className="">
// //                         {isOutgoing && (
// //                           <p className="  ">{getSenderLabel(msg, users)}</p>
// //                         )}
// //                       </div>

// //                       <div className={` flex items-center justify-end gap-1`}>
// //                         {format(
// //                           new Date(msg.timestamp || msg.createdAt),
// //                           "hh:mm a",
// //                         ).toLowerCase()}

// //                         {isOutgoing && (
// //                           <div
// //                             className="flex items-center ml-0.5"
// //                             title={
// //                               msg.status === "read"
// //                                 ? "Seen"
// //                                 : msg.status === "delivered"
// //                                 ? "Delivered"
// //                                 : "Sent"
// //                             }
// //                           >
// //                             <IoMdCheckmark
// //                               size={16}
// //                               className={
// //                                 msg.status === "read"
// //                                   ? "text-sky-500"
// //                                   : "text-gray-400"
// //                               }
// //                             />
// //                             {msg.status !== "sent" && (
// //                               <IoMdCheckmark
// //                                 size={16}
// //                                 className={`-ml-2 ${
// //                                   msg.status === "read"
// //                                     ? "text-sky-500"
// //                                     : "text-gray-400"
// //                                 }`}
// //                               />
// //                             )}
// //                           </div>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {msg.reactions && msg.reactions.length > 0 && (
// //                       <div
// //                         className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-xs z-20 select-none ${
// //                           isOutgoing ? "right-2" : "left-2"
// //                         }`}
// //                       >
// //                         {msg.reactions.map((react, rIdx) => (
// //                           <span
// //                             key={react._id || rIdx}
// //                             title={`From: ${react.from}`}
// //                           >
// //                             {react.emoji}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>

// //                 {/* ── Render Date Divider ── 
// //                     Because the flex container is reversed, putting this divider
// //                     AFTER the message in the DOM makes it visually appear ABOVE it. */}
// //                 {isFirstOfDay && (
// //                   <div className="flex justify-center my-2">
// //                     <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200 shadow-sm text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
// //                       {dateLabel}
// //                     </div>
// //                   </div>
// //                 )}
// //               </React.Fragment>
// //             );
// //           });
// //         })()}
// //       </div>

// //       {/* Input Action Panel */}
// //       {chat.status !== "completed" ? (
// //         <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
// //           {filePreviews.length > 0 && (
// //             <div className="mb-3 p-2 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
// //               {filePreviews.map((file, index) => (
// //                 <div
// //                   key={file.id}
// //                   className="p-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2 w-48 relative pr-7 animate-fade-in shadow-sm"
// //                 >
// //                   {file.url ? (
// //                     <img
// //                       src={file.url}
// //                       alt="Upload thumb"
// //                       className="w-9 h-9 object-cover rounded border"
// //                     />
// //                   ) : (
// //                     <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
// //                       {file.name.split(".").pop() || "FILE"}
// //                     </div>
// //                   )}
// //                   <div className="min-w-0 flex-1">
// //                     <p className="text-[11px] font-semibold text-gray-800 truncate mb-0.5">
// //                       {file.name}
// //                     </p>
// //                     <p className="text-[9px] text-gray-400">
// //                       {(file.size / 1024).toFixed(1)} KB
// //                     </p>
// //                   </div>
// //                   <button
// //                     type="button"
// //                     onClick={() => removeSelectedFile(index)}
// //                     className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
// //                   >
// //                     <IoMdClose size={14} />
// //                   </button>
// //                 </div>
// //               ))}
// //             </div>
// //           )}

// //           <form
// //             onSubmit={handleSend}
// //             className="flex items-end gap-3 bg-gray-100 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/30 transition-all"
// //           >
// //             <input
// //               type="file"
// //               ref={fileInputRef}
// //               onChange={handleFileChange}
// //               className="hidden"
// //               multiple
// //             />

// //             <button
// //               type="button"
// //               onClick={() => fileInputRef.current?.click()}
// //               className={`transition-colors pb-2 ${
// //                 selectedFiles.length > 0
// //                   ? "text-orange-600"
// //                   : "text-gray-400 hover:text-orange-500"
// //               }`}
// //             >
// //               <IoMdAttach size={24} />
// //             </button>

// //             <textarea
// //               ref={textareaRef}
// //               rows={1}
// //               placeholder={
// //                 selectedFiles.length > 0
// //                   ? "Add a caption..."
// //                   : "Type a message..."
// //               }
// //               className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2.5 resize-none max-h-56 overflow-y-auto custom-scrollbar"
// //               value={inputMsg}
// //               onChange={(e) => {
// //                 setInputMsg(e.target.value);
// //                 e.target.style.height = "auto";
// //                 e.target.style.height = `${e.target.scrollHeight}px`;
// //               }}
// //               onKeyDown={(e) => {
// //                 if (e.shiftKey && e.key === "Enter") {
// //                   handleSend(e);
// //                 }
// //               }}
// //               disabled={loadingMsg}
// //             />

// //             <button
// //               type="submit"
// //               disabled={
// //                 (!inputMsg.trim() && selectedFiles.length === 0) || loadingMsg
// //               }
// //               className="text-white bg-orange-500 p-2 mb-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px]"
// //             >
// //               {loadingMsg ? (
// //                 <SubmitLogo />
// //               ) : (
// //                 <IoMdSend size={20} className="ml-0.5" />
// //               )}
// //             </button>
// //           </form>
// //         </div>
// //       ) : (
// //         <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500 flex-shrink-0">
// //           This conversation is completed.
// //         </div>
// //       )}
// //     </div>
// //   );
// // }





 