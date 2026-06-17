


import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdSend, IoMdAttach, IoMdCheckmark, IoMdClose } from "react-icons/io";
import {
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlineDocumentDownload,
  HiOutlineMap,
} from "react-icons/hi";
import { FiHeadphones, FiFilm } from "react-icons/fi";
import { format, isToday, isYesterday } from "date-fns";
import { useSocket } from "../../../context/socketProvider";
import toast from "react-hot-toast";

export default function ChatWindow({ chat, team, updateConversation }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  // ── Multiple File Upload State Arrays ────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const [loadingMsg, setLoadingMsg] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!chat?._id || !socket) return;

    socket.emit("whatsapp:join-conversation", {
      conversationId: chat._id,
    });

    return () => {
      socket.emit("whatsapp:leave-conversation", {
        conversationId: chat._id,
      });
    };
  }, [chat?._id, socket]);

  useEffect(() => {
    if (!chat?._id || !socket) return;
    
    const handleMessage = ({ conversationId, message }) => {
      console.log("THE NEW MESSAGE IS ", message);
      if (conversationId !== chat?._id) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;

        return [...prev, message];
      });
    };

    const handleStatus = ({ messageId, status, statusUpdatedAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                status,
                statusUpdatedAt,
              }
            : msg
        )
      );
    };

    const handleReaction = ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== messageId) return msg;

          const existingReactions = msg.reactions || [];
          const filtered = existingReactions.filter(
            (r) => r.from !== reaction.from
          );

          return {
            ...msg,
            reactions: [...filtered, reaction],
          };
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

  // Fetch Messages for active chat
  useEffect(() => {
    if (!chat?._id) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`
        );
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [chat?._id]);

  // Handle Multi-File Attachment selection
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
    filePreviews.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
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

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("to", chat.phone);
        formData.append("body", inputMsg);

        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

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
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          payload
        );
        data = response.data;
      }

      setMessages((prev) => [...prev, ...data]);
      setInputMsg("");
      clearAllSelectedFiles();

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error("Failed to send message sequence:", err);
      toast.error(err?.message || "Failed to send message")
    } finally {
      setLoadingMsg(false);
    }
  };

  const renderMessageContent = (msg) => {
    const textStyle =
      msg.direction === "outbound" || msg.userId
        ? "text-white"
        : "text-gray-800";
    const subTextStyle =
      msg.direction === "outbound" || msg.userId
        ? "text-orange-100"
        : "text-gray-500";

    switch (msg.type) {
      case "image":
        return (
          <div className="flex flex-col max-w-[380px]">
            <img
              src={`${msg?.media?.url}`}
              alt={msg.media?.filename || "WhatsApp Image"}
              className="rounded-md max-h-64 object-cover cursor-pointer w-full border border-black/5"
              onClick={() => window.open(`${msg?.media?.url}`, "_blank")}
            />
           <div>

             {(msg.body || msg.media?.caption) && (
              <p className={`text-sm mt-1.5  whitespace-pre-wrap break-words ${textStyle}`}>
                {msg.body || msg.media?.caption}
              </p>
            )}

            </div>
          </div>
        );

      case "video":
        return (
          <div className="flex flex-col max-w-[380px]">
            <div className="relative rounded-md overflow-hidden border border-black/5 bg-black flex items-center justify-center">
              <video
                src={`${msg?.media?.url}`}
                controls
                className="max-h-64 w-full"
              />
            </div>
            {(msg.body || msg.media?.caption) && (
              <p className={`text-sm mt-1.5   whitespace-pre-wrap break-words ${textStyle}`}>
                {msg.body || msg.media?.caption}
              </p>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="flex items-center gap-3 min-w-[240px] py-1">
            <div
              className={`p-2 rounded-full ${
                msg.direction === "outbound" ? "bg-orange-600" : "bg-gray-100"
              }`}
            >
              <FiHeadphones
                size={20}
                className={
                  msg.direction === "outbound"
                    ? "text-white"
                    : "text-orange-500"
                }
              />
            </div>
            <audio
              src={`${msg?.media?.url}`}
              controls
              className="w-full h-8 custom-audio-player compact"
            />
          </div>
        );

      case "document":
        return (
          <div className="flex flex-col  max-w-[380px]">
                      <a
            href={`${msg?.media?.url}`}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-3 p-2.5 rounded-lg border text-inherit no-underline hover:opacity-90 transition-opacity min-w-[240px] ${
              msg.direction === "outbound"
                ? "bg-orange-600/40 border-orange-400/30"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <HiOutlineDocumentDownload
              size={28}
              className="text-orange-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate mb-0.5">
                {msg.media?.filename || "Attachment Document"}
              </p>
              <p className={`text-xs opacity-75 truncate ${subTextStyle}`}>
                 {msg.media?.size
                  ? `${(msg.media.size / 1024 / 1024).toFixed(2)} MB`
                  : msg.media?.mimeType || "File"}
              </p>
            </div>
              
            
          </a>


                 <div>
                     {(  msg.body || msg.media?.caption ) && (
              <p className={`text-sm mt-1.5 whitespace-pre-wrap break-words ${textStyle} `}>
                { msg.body ||msg.media?.caption }
              </p>
            )}
                  </div>
               
          </div>

        );

      case "sticker":
        return (
          <div className="w-32 h-32 py-1">
            <img
              src={`${msg?.media?.url}`}
              alt="Sticker"
              className="w-full h-full object-contain"
            />
          </div>
        );

      case "location": {
        const loc = msg.location;
        const hasCoords = loc?.latitude != null && loc?.longitude != null;
        const mapsUrl = hasCoords
          ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
          : `https://maps.google.com/?q=${encodeURIComponent(
              loc?.name || loc?.address || "Location"
            )}`;

        return (
          <div className="flex flex-col min-w-[200px]">
            <div className="flex items-center gap-2 mb-1.5">
              <HiOutlineMap
                size={20}
                className="text-orange-500 flex-shrink-0"
              />
              <span className={`text-sm font-medium ${textStyle}`}>
                Shared Location
              </span>
            </div>
            {loc?.name && (
              <p className={`text-xs font-medium truncate ${textStyle}`}>
                {loc.name}
              </p>
            )}
            {loc?.address && (
              <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>
                {loc.address}
              </p>
            )}
            {!loc?.name && !loc?.address && hasCoords && (
              <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>
                {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
              </p>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-center py-1.5 bg-white text-orange-600 rounded border border-gray-200 shadow-sm hover:bg-gray-50 mt-1"
            >
              View on Google Maps
            </a>
          </div>
        );
      }

      case "template":
      case "text":
      default:
        return (
          <p className="text-[15px] whitespace-pre-wrap break-words">
            {msg.body}
          </p>
        );
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full z-10 font-inter">
      {/* Header Panel */}
      <div className="h-16 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between shadow-sm">
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
      {/* Container is now flex-col-reverse and gap-4. No scrolling JS needed. */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 custom-scrollbar">
        {(() => {
          // Reverse the array so the newest message is mapped first
          const reversedMessages = [...messages].reverse();

          return reversedMessages.map((msg, idx) => {
            const isOutgoing = msg.direction === "outbound" || msg.userId;
            const isSticker = msg.type === "sticker";

            const msgDate = new Date(msg.timestamp || msg.createdAt);
            const dateString = format(msgDate, "yyyy-MM-dd");

            // Look ahead to the older message to see if the date changes
            const olderMsg = reversedMessages[idx + 1];
            const olderMsgDate = olderMsg
              ? new Date(olderMsg.timestamp || olderMsg.createdAt)
              : null;
            const olderMsgDateString = olderMsgDate
              ? format(olderMsgDate, "yyyy-MM-dd")
              : null;

            // If there is no older message, or the older message is from a different day,
            // this is the earliest message of the day, so we show the divider.
            const isFirstOfDay = dateString !== olderMsgDateString;

            let dateLabel = "";
            if (isFirstOfDay) {
              if (isToday(msgDate)) {
                dateLabel = "Today";
              } else if (isYesterday(msgDate)) {
                dateLabel = "Yesterday";
              } else {
                dateLabel = format(msgDate, "MMMM d, yyyy");
              }
            }

            return (
              <React.Fragment key={msg._id || idx}>
                {/* ── Render Message ── */}
                <div
                  className={`flex flex-col ${
                    isOutgoing ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl shadow-sm relative ${
                      isSticker
                        ? "bg-transparent shadow-none"
                        : isOutgoing
                        ? "bg-slate-500 text-white rounded-tr-none px-4 py-3"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none px-4 py-3"
                    }`}
                  >
                    {renderMessageContent(msg)}

                    <div
                      className={`text-[11px] flex items-center justify-end gap-1 mt-1 ${
                        isOutgoing ? "text-orange-100" : "text-gray-400"
                      }`}
                    >
                      {format(new Date(msg.timestamp || msg.createdAt), "hh:mm a").toLowerCase()}

                      {isOutgoing && (
                        <div
                          className="flex items-center ml-0.5"
                          title={
                            msg.status === "read"
                              ? "Seen"
                              : msg.status === "delivered"
                              ? "Delivered"
                              : "Sent"
                          }
                        >
                          <IoMdCheckmark
                            size={16}
                            className={
                              msg.status === "read"
                                ? "text-sky-400"
                                : "text-gray-100"
                            }
                          />
                          {msg.status !== "sent" && (
                            <IoMdCheckmark
                              size={16}
                              className={`-ml-2 ${
                                msg.status === "read"
                                  ? "text-sky-400"
                                  : "text-gray-100"
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {msg.reactions && msg.reactions.length > 0 && (
                      <div
                        className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-xs z-20 select-none ${
                          isOutgoing ? "right-2" : "left-2"
                        }`}
                      >
                        {msg.reactions.map((react, rIdx) => (
                          <span
                            key={react._id || rIdx}
                            title={`From: ${react.from}`}
                          >
                            {react.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Render Date Divider ── 
                    Because the flex container is reversed, putting this divider
                    AFTER the message in the DOM makes it visually appear ABOVE it. */}
                {isFirstOfDay && (
                  <div className="flex justify-center my-2">
                    <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200 shadow-sm text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                      {dateLabel}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          });
        })()}
      </div>

      {/* Input Action Panel */}
      {chat.status !== "completed" ? (
        <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
          {filePreviews.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
              {filePreviews.map((file, index) => (
                <div
                  key={file.id}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2 w-48 relative pr-7 animate-fade-in shadow-sm"
                >
                  {file.url ? (
                    <img
                      src={file.url}
                      alt="Upload thumb"
                      className="w-9 h-9 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                      {file.name.split(".").pop() || "FILE"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-800 truncate mb-0.5">
                      {file.name}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
                  >
                    <IoMdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-end gap-3 bg-gray-100 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/30 transition-all"
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
              className={`transition-colors pb-2 ${
                selectedFiles.length > 0
                  ? "text-orange-600"
                  : "text-gray-400 hover:text-orange-500"
              }`}
            >
              <IoMdAttach size={24} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={
                selectedFiles.length > 0
                  ? "Add a caption..."
                  : "Type a message..."
              }
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2.5 resize-none max-h-56 overflow-y-auto custom-scrollbar"
              value={inputMsg}
              onChange={(e) => {
                setInputMsg(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.shiftKey && e.key === "Enter") {
                  handleSend(e);
                }
              }}
              disabled={loadingMsg}
            />

            <button
              type="submit"
              disabled={(!inputMsg.trim() && selectedFiles.length === 0) || loadingMsg}
              className="text-white bg-orange-500 p-2 mb-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              {loadingMsg ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <IoMdSend size={20} className="ml-0.5" />
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500 flex-shrink-0">
          This conversation is completed.
        </div>
      )}
    </div>
  );
}
























































































// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { IoMdSend, IoMdAttach, IoMdCheckmark, IoMdClose } from "react-icons/io";
// import {
//   HiOutlineUserAdd,
//   HiOutlineCheckCircle,
//   HiOutlineDocumentDownload,
//   HiOutlineMap,
// } from "react-icons/hi";
// import { FiHeadphones, FiFilm } from "react-icons/fi";
// import { format, isToday, isYesterday } from "date-fns"; // Added isToday and isYesterday
// import { useSocket } from "../../../context/socketProvider";

// export default function ChatWindow({ chat, team, updateConversation }) {
//       const socket = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [inputMsg, setInputMsg] = useState("");

//   // ── Multiple File Upload State Arrays ────────────────────────────
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [filePreviews, setFilePreviews] = useState([]);

//   const [loadingMsg, setLoadingMsg] = useState(false);

//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const textareaRef = useRef(null);



//   useEffect(() => {
//   if (!chat?._id || !socket) return;

//   socket.emit("whatsapp:join-conversation", {
//     conversationId: chat._id,
//   });

//   return () => {
//     socket.emit("whatsapp:leave-conversation", {
//       conversationId: chat._id,
//     });
//   };
// }, [chat?._id, socket]);













// useEffect(() => {
//     if (!chat?._id || !socket) return;
//   const handleMessage = ({ conversationId, message }) => {

//     console.log("THE NEW MESSAGE IS ", message)
//     if (conversationId !== chat?._id) return;

//     setMessages(prev => {
//       const exists = prev.some(m => m._id === message._id);
//       if (exists) return prev;

//       return [...prev, message];
//     });
//   };

//   const handleStatus = ({messageId,
//     status,
//     statusUpdatedAt,}) => {


      
//     setMessages(prev =>
//       prev.map(msg =>
//         msg._id === messageId
//           ? {
//               ...msg,
//               status,
//               statusUpdatedAt,
//             }
//           : msg
//       )
//     );



//   }


// const handleReaction = ({ messageId, reaction }) => {
//   setMessages(prev =>
//     prev.map(msg => {
//       if (msg._id !== messageId) return msg;

//       const existingReactions = msg.reactions || [];

//       const filtered = existingReactions.filter(
//         r => r.from !== reaction.from
//       );

//       return {
//         ...msg,
//         reactions: [...filtered, reaction],
//       };
//     })
//   );
// };
  

//   socket.on("whatsapp:message-created", handleMessage);
//     socket.on( "whatsapp:message-status-updated", handleStatus );
//     socket.on( "whatsapp:reaction-updated", handleReaction );

//   return () => {
//     socket.off("whatsapp:message-created", handleMessage);
//     socket.off("whatsapp:message-status-updated", handleStatus);
//     socket.off("whatsapp:reaction-updated", handleReaction);
//   };
// }, [chat?._id, socket]);


 
 

 


  
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

// // Track if it's the initial load for the active chat
//   const isInitialScroll = useRef(true);

//   // Reset the initial scroll tracker when switching chats
//   useEffect(() => {
//     isInitialScroll.current = true;
//   }, [chat?._id]);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     if (messages.length > 0) {
//       messagesEndRef.current?.scrollIntoView({ 
//         // "auto" instantly snaps, "smooth" animates
//         behavior: isInitialScroll.current ? "auto" : "smooth" 
//       });
      
//       // After the first scroll, set to false so new messages scroll smoothly
//       isInitialScroll.current = false;
//     }
//   }, [messages]);

//   // Handle Multi-File Attachment selection
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
//     if (filePreviews[indexToRemove]?.url) {
//       URL.revokeObjectURL(filePreviews[indexToRemove].url);
//     }

//     setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
//     setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));

//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const clearAllSelectedFiles = () => {
//     filePreviews.forEach((preview) => {
//       if (preview.url) URL.revokeObjectURL(preview.url);
//     });
//     setSelectedFiles([]);
//     setFilePreviews([]);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

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

//         selectedFiles.forEach((file) => {
//           formData.append("files", file);
//         });

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
//         };
//         const response = await axios.post(
//           `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
//           payload,
//         );
//         data = response.data;
//       }

//       setMessages((prev) => [...prev, ...data]);
//       setInputMsg("");
//       clearAllSelectedFiles();

//       if (textareaRef.current) {
//         textareaRef.current.style.height = "auto";
//       }
//     } catch (err) {
//       console.error("Failed to send message sequence:", err);
//     } finally {
//       setLoadingMsg(false);
//     }
//   };

//   const renderMessageContent = (msg) => {
//     const textStyle =
//       msg.direction === "outbound" || msg.userId
//         ? "text-white"
//         : "text-gray-800";
//     const subTextStyle =
//       msg.direction === "outbound" || msg.userId
//         ? "text-orange-100"
//         : "text-gray-500";

//     switch (msg.type) {
//       case "image":
//         return (
//           <div className="flex flex-col max-w-[380px]">
//             <img
//               src={`${msg?.media?.url}`}
//               alt={msg.media?.filename || "WhatsApp Image"}
//               className="rounded-md max-h-64 object-cover cursor-pointer w-full border border-black/5"
//               onClick={() =>
//                 window.open(
//                   `${msg?.media?.url}`,
//                   "_blank",
//                 )
//               }
//             />
//             {(msg.media?.caption || msg.body) && (
//               <p className={`text-sm mt-1.5 ${textStyle}`}>
//                 {msg.media?.caption || msg.body}
//               </p>
//             )}
//           </div>
//         );

//       case "video":
//         return (
//           <div className="flex flex-col max-w-[380px]">
//             <div className="relative rounded-md overflow-hidden border border-black/5 bg-black flex items-center justify-center">
//               <video
//                 src={`${msg?.media?.url}`}
//                 controls
//                 className="max-h-64 w-full"
//               />
//             </div>
//             {(msg.media?.caption || msg.body) && (
//               <p className={`text-sm mt-1.5 ${textStyle}`}>
//                 {msg.media?.caption || msg.body}
//               </p>
//             )}
//           </div>
//         );

//       case "audio":
//         return (
//           <div className="flex items-center gap-3 min-w-[240px] py-1">
//             <div
//               className={`p-2 rounded-full ${
//                 msg.direction === "outbound" ? "bg-orange-600" : "bg-gray-100"
//               }`}
//             >
//               <FiHeadphones
//                 size={20}
//                 className={
//                   msg.direction === "outbound"
//                     ? "text-white"
//                     : "text-orange-500"
//                 }
//               />
//             </div>
//             <audio
//               src={`${msg?.media?.url}`}
//               controls
//               className="w-full h-8 custom-audio-player compact"
//             />
//           </div>
//         );

//       case "document":
//         return (
//           <a
//             href={`${msg?.media?.url}`}
//             target="_blank"
//             rel="noreferrer"
//             className={`flex items-center gap-3 p-2.5 rounded-lg border text-inherit no-underline hover:opacity-90 transition-opacity min-w-[240px] ${
//               msg.direction === "outbound"
//                 ? "bg-orange-600/40 border-orange-400/30"
//                 : "bg-gray-50 border-gray-100"
//             }`}
//           >
//             <HiOutlineDocumentDownload
//               size={28}
//               className="text-orange-500 flex-shrink-0"
//             />
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium truncate mb-0.5">
//                 {msg.media?.filename || "Attachment Document"}
//               </p>
//               <p className={`text-xs opacity-75 truncate ${subTextStyle}`}>
//                 {msg.media?.size
//                   ? `${(msg.media.size / 1024 / 1024).toFixed(2)} MB`
//                   : msg.media?.mimeType || "File"}
//               </p>
//             </div>
//           </a>
//         );

//       case "sticker":
//         return (
//           <div className="w-32 h-32 py-1">
//             <img
//               src={`${msg?.media?.url}`}
//               alt="Sticker"
//               className="w-full h-full object-contain"
//             />
//           </div>
//         );

//       case "location": {
//         const loc = msg.location;
//         const hasCoords = loc?.latitude != null && loc?.longitude != null;
//         const mapsUrl = hasCoords
//           ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
//           : `https://maps.google.com/?q=${encodeURIComponent(
//               loc?.name || loc?.address || "Location",
//             )}`;

//         return (
//           <div className="flex flex-col min-w-[200px]">
//             <div className="flex items-center gap-2 mb-1.5">
//               <HiOutlineMap
//                 size={20}
//                 className="text-orange-500 flex-shrink-0"
//               />
//               <span className={`text-sm font-medium ${textStyle}`}>
//                 Shared Location
//               </span>
//             </div>
//             {loc?.name && (
//               <p className={`text-xs font-medium truncate ${textStyle}`}>
//                 {loc.name}
//               </p>
//             )}
//             {loc?.address && (
//               <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>
//                 {loc.address}
//               </p>
//             )}
//             {!loc?.name && !loc?.address && hasCoords && (
//               <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>
//                 {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
//               </p>
//             )}
//             <a
//               href={mapsUrl}
//               target="_blank"
//               rel="noreferrer"
//               className="text-xs font-semibold text-center py-1.5 bg-white text-orange-600 rounded border border-gray-200 shadow-sm hover:bg-gray-50 mt-1"
//             >
//               View on Google Maps
//             </a>
//           </div>
//         );
//       }

//       case "template":
//       case "text":
//       default:
//         return (
//           <p className="text-[15px] whitespace-pre-wrap break-words">
//             {msg.body}
//           </p>
//         );
//     }
//   };




//   if (!chat) {
//   return (
//     <div className="flex-1 flex items-center justify-center">
//       Select a conversation
//     </div>
//   );
// }

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
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
//         {(() => {
//           let lastDate = null; // Tracks the last rendered date for dividers

//           return messages.map((msg, idx) => {
//             const isOutgoing = msg.direction === "outbound" || msg.userId;
//             const isSticker = msg.type === "sticker";

//             console.log("Rendering message:", msg); // Debug log for message rendering
//             // Determine if a Date Divider is needed
//             const msgDate = new Date(msg.timestamp || msg.createdAt);
//             const dateString = format(msgDate, "yyyy-MM-dd");
//             const showDateDivider = dateString !== lastDate;

//             let dateLabel = "";
//             if (showDateDivider) {
//               if (isToday(msgDate)) {
//                 dateLabel = "Today";
//               } else if (isYesterday(msgDate)) {
//                 dateLabel = "Yesterday";
//               } else {
//                 dateLabel = format(msgDate, "MMMM d, yyyy"); // e.g., May 10, 2026
//               }
//               lastDate = dateString;
//             }

//             // Format time as 12-hour (e.g., 05:30 pm)
//             const timeString = format(msgDate, "hh:mm a").toLowerCase();

//             return (
//               <React.Fragment key={msg._id || idx}>
//                 {/* ── Render Date Divider ── */}
//                 {showDateDivider && (
//                   <div className="flex justify-center my-6">
//                     <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200 shadow-sm text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
//                       {dateLabel}
//                     </div>
//                   </div>
//                 )}

//                 {/* ── Render Message ── */}
//                 <div
//                   className={`flex flex-col ${
//                     isOutgoing ? "items-end" : "items-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[70%] rounded-xl shadow-sm relative ${
//                       isSticker
//                         ? "bg-transparent shadow-none"
//                         : isOutgoing
//                         ? "bg-slate-500 text-white rounded-tr-none px-4 py-3"
//                         : "bg-white text-gray-800 border border-gray-100 rounded-tl-none px-4 py-3"
//                     }`}
//                   >
//                     {renderMessageContent(msg)}

//                     <div
//                       className={`text-[11px] flex items-center justify-end gap-1 mt-1 ${
//                         isOutgoing ? "text-orange-100" : "text-gray-400"
//                       }`}
//                     >
//                       {format(new Date(msg.timestamp), "hh:mm a").toLowerCase()}

//                       {isOutgoing && (
//                         <div
//                           className="flex items-center ml-0.5"
//                           title={
//                             msg.status === "read"
//                               ? "Seen"
//                               : msg.status === "delivered"
//                               ? "Delivered"
//                               : "Sent"
//                           }
//                         >
//                           <IoMdCheckmark
//                             size={16}
//                             className={
//                               msg.status === "read"
//                                 ? "text-sky-400"
//                                 : "text-gray-100"
//                             }
//                           />

//                           {msg.status !== "sent" && (
//                             <IoMdCheckmark
//                               size={16}
//                               className={`-ml-2 ${
//                                 msg.status === "read"
//                                   ? "text-sky-400"
//                                   : "text-gray-100"
//                               }`}
//                             />
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     {msg.reactions && msg.reactions.length > 0 && (
//                       <div
//                         className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-xs z-20 select-none ${
//                           isOutgoing ? "right-2" : "left-2"
//                         }`}
//                       >
//                         {msg.reactions.map((react, rIdx) => (
//                           <span
//                             key={react._id || rIdx}
//                             title={`From: ${react.from}`}
//                           >
//                             {react.emoji}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </React.Fragment>
//             );
//           });
//         })()}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Action Panel */}
//       {chat.status !== "completed" ? (
//         <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
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
//               placeholder={
//                 selectedFiles.length > 0
//                   ? "Add a caption..."
//                   : "Type a message..."
//               }
//               className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2.5 resize-none max-h-56 overflow-y-auto custom-scrollbar"
//               value={inputMsg}
//               onChange={(e) => {
//                 setInputMsg(e.target.value);
//                 e.target.style.height = "auto";
//                 e.target.style.height = `${e.target.scrollHeight}px`;
//               }}
//               onKeyDown={(e) => {
//                 if ( e.shiftKey && e.key === "Enter" ) {
//                   handleSend(e);
//                 }
//               }}
//               disabled={loadingMsg}
//             />

//             <button
//   type="submit"
//   disabled={(!inputMsg.trim() && selectedFiles.length === 0) || loadingMsg}
//   className="text-white bg-orange-500 p-2 mb-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px]"
// >
//   {loadingMsg ? (
//     <svg
//       className="animate-spin h-5 w-5 text-white"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//     >
//       <circle
//         className="opacity-25"
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="4"
//       />
//       <path
//         className="opacity-75"
//         fill="currentColor"
//         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//       />
//     </svg>
//   ) : (
//     <IoMdSend size={20} className="ml-0.5" />
//   )}
// </button>
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
