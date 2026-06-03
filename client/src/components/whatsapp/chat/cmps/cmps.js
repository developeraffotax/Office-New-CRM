// import React, { useState } from "react";
// import { format } from "date-fns";
// import { IoMdCheckmark } from "react-icons/io";
// import { HiOutlineDocument, HiDownload, HiExternalLink } from "react-icons/hi";
// import { FaPlay, FaPause, FaMapMarkerAlt } from "react-icons/fa";

// export default function MessageBubble({ msg }) {
//   const isOutgoing = msg.direction === "outbound" || msg.userId;
//   const isSticker = msg.type === "sticker";

//   // Base bubble styling matching your alignment choices
//   const bubbleClass = isSticker
//     ? "bg-transparent shadow-none" // Stickers skip backgrounds completely
//     : isOutgoing
//     ? "bg-orange-500 text-white rounded-lg rounded-tr-none shadow-sm"
//     : "bg-white text-gray-800 border border-gray-200/60 rounded-lg rounded-tl-none shadow-sm";

//   return (
//     <div className={`flex flex-col w-full ${isOutgoing ? "items-end" : "items-start"} mb-2`}>
//       <div className={`max-w-[70%] relative ${bubbleClass} ${!isSticker && "px-3 py-2"}`}>
        
//         {/* Dynamic Content Router */}
//         <MessageContent msg={msg} isOutgoing={isOutgoing} />

//         {/* Timestamp & Delivery Ticks */}
//         <div className={`text-[10px] text-right mt-1 flex items-center justify-end gap-1 select-none ${
//           isSticker ? "text-gray-500 bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm" : isOutgoing ? "text-orange-100" : "text-gray-400"
//         }`}>
//           <span>
//             {msg.timestamp ? format(new Date(msg.timestamp), "HH:mm") : format(new Date(), "HH:mm")}
//           </span>
//           {isOutgoing && (
//             <div className="flex items-center">
//               <IoMdCheckmark size={14} className={msg.status === "read" ? "text-blue-300" : "text-gray-300"} />
//               {msg.status === "read" && <IoMdCheckmark size={14} className="text-blue-300 -ml-2" />}
//             </div>
//           )}
//         </div>

//         {/* Floating Reactions Drawer */}
//         {msg.reactions && msg.reactions.length > 0 && (
//           <div className={`absolute bottom-[-10px] flex items-center gap-0.5 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-xs z-10 ${
//             isOutgoing ? "right-2" : "left-2"
//           }`}>
//             {msg.reactions.map((react, idx) => (
//               <span key={react._id || idx} title={`From: ${react.from}`}>{react.emoji}</span>
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// /* ==========================================================================
//    SUB-RENDERERS FOR EACH WHATSAPP TYPE
//    ========================================================================== */

// function MessageContent({ msg, isOutgoing }) {
//   switch (msg.type) {
//     case "image":
//       return (
//         <div className="flex flex-col -mx-1 -mt-1">
//           <img 
//             src={msg.media?.url} 
//             alt="WhatsApp attachment" 
//             className="rounded-md max-h-72 object-cover cursor-pointer max-w-full hover:brightness-95 transition-all"
//             onClick={() => window.open(msg.media?.url, "_blank")}
//           />
//           {msg.body && <p className="text-sm mt-2 px-1 pb-1">{msg.body}</p>}
//         </div>
//       );

//     case "video":
//       return (
//         <div className="flex flex-col -mx-1 -mt-1 max-w-[320px]">
//           <video src={msg.media?.url} controls className="rounded-md max-h-72 w-full bg-black shadow-inner" />
//           {msg.body && <p className="text-sm mt-2 px-1 pb-1">{msg.body}</p>}
//         </div>
//       );

//     case "audio":
//       return <CustomAudioPlayer url={msg.media?.url} isOutgoing={isOutgoing} />;

//     case "document":
//       return (
//         <a 
//           href={msg.media?.url} 
//           target="_blank" 
//           rel="noreferrer"
//           className={`flex items-center gap-3 p-2 rounded-md border no-underline text-inherit ${
//             isOutgoing ? "bg-orange-600/30 border-orange-400/20" : "bg-gray-50 border-gray-100"
//           }`}
//         >
//           <div className="p-2 bg-red-500 rounded text-white flex-shrink-0">
//             <HiOutlineDocument size={20} />
//           </div>
//           <div className="flex-1 min-w-0 pr-4">
//             <p className="text-sm font-medium truncate">{msg.media?.filename || "Document File"}</p>
//             <p className="text-xs opacity-70">
//               {msg.media?.size ? `${(msg.media.size / 1024 / 1024).toFixed(1)} MB` : "Document"}
//             </p>
//           </div>
//           <HiDownload size={18} className="text-gray-400 flex-shrink-0" />
//         </a>
//       );

//     case "sticker":
//       return (
//         <div className="w-36 h-36 p-1 hover:scale-105 transition-transform duration-200">
//           <img src={msg.media?.url} alt="WhatsApp Sticker" className="w-full h-full object-contain" />
//         </div>
//       );

//     case "location":
//       const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.body || "Location")}`;
//       return (
//         <div className="flex flex-col max-w-[260px]">
//           <div className="flex items-start gap-2 mb-2">
//             <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
//             <div className="text-sm font-medium truncate">{msg.body || "Shared Location"}</div>
//           </div>
//           {/* Mock Map Preview Box */}
//           <a 
//             href={googleMapsUrl} 
//             target="_blank" 
//             rel="noreferrer" 
//             className="relative rounded overflow-hidden border border-gray-200 block group"
//           >
//             <div className="h-28 bg-sky-100 flex items-center justify-center relative">
//               <span className="text-xs font-semibold text-sky-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 group-hover:bg-white transition-colors">
//                 Open Maps <HiExternalLink />
//               </span>
//             </div>
//           </a>
//         </div>
//       );

//     case "template":
//       return (
//         <div className="flex flex-col gap-2 max-w-[320px]">
//           <div className="text-xs font-bold uppercase tracking-wider opacity-60">Automated Template</div>
//           <p className="text-[15px] whitespace-pre-wrap">{msg.body}</p>
//           {/* Dynamic Interactive Template Buttons if provided via meta */}
//           {msg.meta?.buttons?.map((btn, i) => (
//             <button 
//               key={i} 
//               disabled
//               className="w-full text-center py-2 bg-white/20 border border-white/10 hover:bg-white/30 text-xs font-medium rounded transition-colors"
//             >
//               {btn.text || "Template Button"}
//             </button>
//           ))}
//         </div>
//       );

//     default:
//       return <p className="text-[15px] whitespace-pre-wrap break-words">{msg.body}</p>;
//   }
// }

// /* Custom WhatsApp Styled Voice Note Component */
// function CustomAudioPlayer({ url, isOutgoing }) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const audioRef = React.useRef(new Audio(url));

//   const togglePlay = () => {
//     if (isPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play().catch(err => console.error(err));
//       audioRef.current.onended = () => setIsPlaying(false);
//     }
//     setIsPlaying(!isPlaying);
//   };

//   return (
//     <div className="flex items-center gap-3 min-w-[250px] py-1">
//       <button 
//         onClick={togglePlay}
//         className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-95 ${
//           isOutgoing ? "bg-orange-600 text-white" : "bg-gray-100 text-orange-500"
//         }`}
//       >
//         {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
//       </button>
      
//       {/* Audio Wave tracking timeline placeholder mimicking WhatsApp */}
//       <div className="flex-1 flex flex-col gap-1">
//         <div className="h-1.5 rounded-full bg-black/10 relative overflow-hidden">
//           <div className={`h-full w-1/3 rounded-full ${isOutgoing ? "bg-white" : "bg-orange-500"}`} />
//         </div>
//         <div className="flex justify-between items-center text-[10px] opacity-70">
//           <span>Voice Note</span>
//         </div>
//       </div>
//     </div>
//   );
// }