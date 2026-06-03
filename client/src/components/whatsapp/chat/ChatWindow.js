import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdSend, IoMdAttach, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { HiOutlineUserAdd, HiOutlineCheckCircle, HiOutlineDocumentDownload, HiOutlineMap } from "react-icons/hi";
import { FiHeadphones, FiFilm } from "react-icons/fi";
import { format } from "date-fns";

export default function ChatWindow({ chat, team, handleUpdateStatus }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  
  // ── Multiple File Upload State Arrays ────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]); // Array of { id, url, name, size }
  
  const [loadingMsg, setLoadingMsg] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Messages for active chat
  useEffect(() => {
    if (!chat?._id) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages?limit=50`);
        console.log("Fetched messages for chat>>>", data);
        setMessages(data.messages || data.docs || data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [chat._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Multi-File Attachment selection
  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    
    // Append files to primary array tracking
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Map previews metadata arrays tracking
    const newPreviews = newFiles.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        url: isImage ? URL.createObjectURL(file) : null
      };
    });

    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove individual target attachment from upload array sequence queue
  const removeSelectedFile = (indexToRemove) => {
    // Revoke object URL memory resource pointer leaks
    if (filePreviews[indexToRemove]?.url) {
      URL.revokeObjectURL(filePreviews[indexToRemove].url);
    }
    
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Clear everything following a successful dispatch pipeline
  const clearAllSelectedFiles = () => {
    filePreviews.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() && selectedFiles.length === 0) return;

    try {
      setLoadingMsg(true);
      let data;

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("to", chat.phone);
        formData.append("body", inputMsg);

        // Append multiple documents/images to the singular multi-multipart 'file' array field
        selectedFiles.forEach((file) => {
          formData.append("files", file); 
        });

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        data = response.data; // Server loops and builds a list configuration array array
      } else {
        // Plain Text Message
        const payload = {
          to: chat.phone,
          type: "text",
          body: inputMsg,
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`, 
          payload
        );
        data = [response.data]; // Normalize item block layout structure format
      }
      
      setMessages((prev) => [...prev, ...data]);
      setInputMsg("");
      clearAllSelectedFiles(); 
    } catch (err) {
      console.error("Failed to send message sequence:", err);
    } finally {
      setLoadingMsg(false);
    }
  };

  // Dynamic Content Render Engine mapped directly to your Mongoose Schema
  const renderMessageContent = (msg) => {
    const textStyle = msg.direction === "outbound" || msg.userId ? "text-white" : "text-gray-800";
    const subTextStyle = msg.direction === "outbound" || msg.userId ? "text-orange-100" : "text-gray-500";

    switch (msg.type) {
      case "image":
        return (
          <div className="flex flex-col max-w-[280px]">
            <img 
              src={`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/media/${msg._id}`}
              alt={msg.media?.filename || "WhatsApp Image"} 
              className="rounded-md max-h-64 object-cover cursor-pointer w-full border border-black/5"
              onClick={() => window.open(`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/media/${msg._id}`, "_blank")}
            />
            {(msg.media?.caption || msg.body) && (
              <p className={`text-sm mt-1.5 ${textStyle}`}>{msg.media?.caption || msg.body}</p>
            )}
          </div>
        );

      case "video":
        return (
          <div className="flex flex-col max-w-[280px]">
            <div className="relative rounded-md overflow-hidden border border-black/5 bg-black flex items-center justify-center">
              <video src={`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/media/${msg._id}`} controls className="max-h-64 w-full" />
            </div>
            {(msg.media?.caption || msg.body) && (
              <p className={`text-sm mt-1.5 ${textStyle}`}>{msg.media?.caption || msg.body}</p>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="flex items-center gap-3 min-w-[240px] py-1">
            <div className={`p-2 rounded-full ${msg.direction === "outbound" ? "bg-orange-600" : "bg-gray-100"}`}>
              <FiHeadphones size={20} className={msg.direction === "outbound" ? "text-white" : "text-orange-500"} />
            </div>
            <audio src={`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/media/${msg._id}`} controls className="w-full h-8 custom-audio-player compact" />
          </div>
        );

      case "document":
        return (
          <a 
            href={`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/media/${msg._id}`} 
            target="_blank" 
            rel="noreferrer" 
            className={`flex items-center gap-3 p-2.5 rounded-lg border text-inherit no-underline hover:opacity-90 transition-opacity min-w-[240px] ${
              msg.direction === "outbound" ? "bg-orange-600/40 border-orange-400/30" : "bg-gray-50 border-gray-100"
            }`}
          >
            <HiOutlineDocumentDownload size={28} className="text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate mb-0.5">{msg.media?.filename || "Attachment Document"}</p>
              <p className={`text-xs opacity-75 truncate ${subTextStyle}`}>
                {msg.media?.size ? `${(msg.media.size / 1024 / 1024).toFixed(2)} MB` : msg.media?.mimeType || "File"}
              </p>
            </div>
          </a>
        );

      case "sticker":
        return (
          <div className="w-32 h-32 py-1">
            <img src={`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/media/${msg._id}`} alt="Sticker" className="w-full h-full object-contain" />
          </div>
        );

      case "location": {
        const loc = msg.location;
        const hasCoords = loc?.latitude != null && loc?.longitude != null;
        const mapsUrl = hasCoords
          ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
          : `https://maps.google.com/?q=${encodeURIComponent(loc?.name || loc?.address || "Location")}`;

        return (
          <div className="flex flex-col min-w-[200px]">
            <div className="flex items-center gap-2 mb-1.5">
              <HiOutlineMap size={20} className="text-orange-500 flex-shrink-0" />
              <span className={`text-sm font-medium ${textStyle}`}>Shared Location</span>
            </div>
            {loc?.name && <p className={`text-xs font-medium truncate ${textStyle}`}>{loc.name}</p>}
            {loc?.address && <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>{loc.address}</p>}
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
        return <p className="text-[15px] whitespace-pre-wrap break-words">{msg.body}</p>;
    }
  };

  return (
    <div className="flex flex-col h-full z-10">
      {/* Header Panel */}
      <div className="h-16 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold border border-orange-200 shadow-sm">
            {chat.contactName?.charAt(0).toUpperCase() || "#"}
          </div>
          <div className="ml-3">
            <h2 className="text-base font-semibold text-gray-900">{chat.profileName || chat.phone}</h2>
            <p className="text-xs text-gray-500">
              {chat.status === "progress" ? "In Progress" : "Completed"} • Assigned to {chat?.userId || "Unassigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chat.status !== "completed" && (
            <button 
              onClick={() => handleUpdateStatus(chat._id, "resolve")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors"
            >
              <HiOutlineCheckCircle size={18} /> Resolve
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-md transition-colors">
            <HiOutlineUserAdd size={18} /> Assign
          </button>
        </div>
      </div>

      {/* Message Streaming Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => {
          const isOutgoing = msg.direction === "outbound" || msg.userId;
          const isSticker = msg.type === "sticker";

          return (
            <div key={msg._id || idx} className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}>
              <div 
                className={`max-w-[70%] rounded-lg shadow-sm relative ${
                  isSticker 
                    ? "bg-transparent shadow-none" 
                    : isOutgoing 
                      ? "bg-orange-500 text-white rounded-tr-none px-3.5 py-2" 
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none px-3.5 py-2"
                }`}
              >
                {renderMessageContent(msg)}
                
                <div className={`text-[10px] text-right mt-1 flex items-center justify-end gap-1 ${
                  isSticker ? "text-gray-500 bg-white/70 px-1 rounded-full w-max ml-auto" : isOutgoing ? "text-orange-100" : "text-gray-400"
                }`}>
                  {msg.timestamp ? format(new Date(msg.timestamp), "HH:mm") : msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : ""}
                  {isOutgoing && (
                    <div className="flex items-center">
                      <IoMdCheckmark size={14} className={msg.status === 'read' ? 'text-blue-300' : msg.status === 'delivered' ? 'text-gray-300' : ''} />
                      {msg.status === 'read' && <IoMdCheckmark size={14} className="text-blue-300 -ml-2" />}
                    </div>
                  )}
                </div>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-xs z-20 select-none ${
                    isOutgoing ? "right-2" : "left-2"
                  }`}>
                    {msg.reactions.map((react, rIdx) => (
                      <span key={react._id || rIdx} title={`From: ${react.from}`}>
                        {react.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Action Panel */}
      {chat.status !== "completed" ? (
        <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-gray-200">
          
          {/* ── File Upload Attachment PREVIEW TRAY (Supports Grid Layout for Multiple Files) ── */}
          {filePreviews.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
              {filePreviews.map((file, index) => (
                <div key={file.id} className="p-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-2 w-48 relative pr-7 animate-fade-in shadow-sm">
                  {file.url ? (
                    <img src={file.url} alt="Upload thumb" className="w-9 h-9 object-cover rounded border" />
                  ) : (
                    <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                      {file.name.split('.').pop() || "FILE"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-800 truncate mb-0.5">{file.name}</p>
                    <p className="text-[9px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
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

          <form onSubmit={handleSend} className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-orange-500/30 transition-all">
            {/* Added HTML multi-select support using the multiple attribute flag */}
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
              className={`transition-colors ${selectedFiles.length > 0 ? "text-orange-600" : "text-gray-400 hover:text-orange-500"}`}
            >
              <IoMdAttach size={24} />
            </button>
            
            <input
              type="text"
              placeholder={selectedFiles.length > 0 ? "Add a caption..." : "Type a message..."}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-700 placeholder-gray-500 py-2"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={loadingMsg}
            />
            
            <button 
              type="submit" 
              disabled={(!inputMsg.trim() && selectedFiles.length === 0) || loadingMsg}
              className="text-white bg-orange-500 p-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0"
            >
              <IoMdSend size={20} className="ml-0.5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
          This conversation is resolved.
        </div>
      )}
    </div>
  );
}