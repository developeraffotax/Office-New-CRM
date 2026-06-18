// import React from "react";
// import { FiHeadphones } from "react-icons/fi";
// import { HiOutlineDocumentDownload, HiOutlineMap } from "react-icons/hi";

// export const renderMessageContent = (msg) => {
//   const textStyle = "text-gray-800";
//   const subTextStyle = "text-gray-500";

//   switch (msg.type) {
//     case "image":
//       return (
//         <div className="flex flex-col max-w-[380px]">
//           <img
//             src={`${msg?.media?.url}`}
//             alt={msg.media?.filename || "WhatsApp Image"}
//             className="rounded-md max-h-64 object-cover cursor-pointer w-full border border-black/5"
//             onClick={() => window.open(`${msg?.media?.url}`, "_blank")}
//           />
//           <div>
//             {(msg.body || msg.media?.caption) && (
//               <p className={`text-sm mt-1.5 whitespace-pre-wrap break-words ${textStyle}`}>
//                 {msg.body || msg.media?.caption}
//               </p>
//             )}
//           </div>
//         </div>
//       );

//     case "video":
//       return (
//         <div className="flex flex-col max-w-[380px]">
//           <div className="relative rounded-md overflow-hidden border border-black/5 bg-black flex items-center justify-center">
//             <video src={`${msg?.media?.url}`} controls className="max-h-64 w-full" />
//           </div>
//           {(msg.body || msg.media?.caption) && (
//             <p className={`text-sm mt-1.5 whitespace-pre-wrap break-words ${textStyle}`}>
//               {msg.body || msg.media?.caption}
//             </p>
//           )}
//         </div>
//       );

//     case "audio":
//       return (
//         <div className="flex items-center gap-3 min-w-[240px] py-1">
//           <div className={`p-2 rounded-full ${msg.direction === "outbound" ? "bg-orange-600" : "bg-gray-100"}`}>
//             <FiHeadphones size={20} className={msg.direction === "outbound" ? "text-white" : "text-orange-500"} />
//           </div>
//           <audio src={`${msg?.media?.url}`} controls className="w-full h-8 custom-audio-player compact" />
//         </div>
//       );

//     case "document":
//       return (
//         <div className="flex flex-col max-w-[380px]">
//           <a
//             href={`${msg?.media?.url}`}
//             target="_blank"
//             rel="noreferrer"
//             className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-inherit no-underline hover:opacity-90 transition-opacity min-w-[240px]"
//           >
//             <HiOutlineDocumentDownload size={28} className="text-orange-500 flex-shrink-0" />
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium truncate mb-0.5">
//                 {msg.media?.filename || "Attachment Document"}
//               </p>
//               <p className={`text-xs opacity-75 truncate ${subTextStyle}`}>
//                 {msg.media?.size ? `${(msg.media.size / 1024 / 1024).toFixed(2)} MB` : msg.media?.mimeType || "File"}
//               </p>
//             </div>
//           </a>
//           <div>
//             {(msg.body || msg.media?.caption) && (
//               <p className={`text-sm mt-1.5 whitespace-pre-wrap break-words ${textStyle}`}>
//                 {msg.body || msg.media?.caption}
//               </p>
//             )}
//           </div>
//         </div>
//       );

//     case "sticker":
//       return (
//         <div className="w-32 h-32 py-1">
//           <img src={`${msg?.media?.url}`} alt="Sticker" className="w-full h-full object-contain" />
//         </div>
//       );

//     case "location": {
//       const loc = msg.location;
//       const hasCoords = loc?.latitude != null && loc?.longitude != null;
//       const mapsUrl = hasCoords
//         ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
//         : `https://maps.google.com/?q=${encodeURIComponent(loc?.name || loc?.address || "Location")}`;

//       return (
//         <div className="flex flex-col min-w-[200px]">
//           <div className="flex items-center gap-2 mb-1.5">
//             <HiOutlineMap size={20} className="text-orange-500 flex-shrink-0" />
//             <span className={`text-sm font-medium ${textStyle}`}>Shared Location</span>
//           </div>
//           {loc?.name && <p className={`text-xs font-medium truncate ${textStyle}`}>{loc.name}</p>}
//           {loc?.address && <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>{loc.address}</p>}
//           {!loc?.name && !loc?.address && hasCoords && (
//             <p className={`text-xs truncate opacity-80 mb-2 ${subTextStyle}`}>
//               {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
//             </p>
//           )}
//           <a
//             href={mapsUrl}
//             target="_blank"
//             rel="noreferrer"
//             className="text-xs font-semibold text-center py-1.5 bg-white text-orange-600 rounded border border-gray-200 shadow-sm hover:bg-gray-50 mt-1"
//           >
//             View on Google Maps
//           </a>
//         </div>
//       );
//     }

//     case "template":
//     case "text":
//     default:
//       return <p className="text-[15px] whitespace-pre-wrap break-words">{msg.body}</p>;
//   }
// };

// /**
//  * Renders the reply preview card attached above input fields or nested within target message contexts
//  */
// export const renderReplyPreview = (reply, onContextClick = null) => {
//   if (!reply) return null;

//   let previewText = "";
//   switch (reply.type) {
//     case "image": previewText = "📷 Photo"; break;
//     case "video": previewText = "🎥 Video"; break;
//     case "audio": previewText = "🎵 Audio"; break;
//     case "document": previewText = `📄 ${reply.media?.filename || "Document"}`; break;
//     case "location": previewText = "📍 Location"; break;
//     case "sticker": previewText = "😀 Sticker"; break;
//     default: previewText = reply.body;
//   }

//   return (
//     <div 
//       onClick={() => onContextClick && onContextClick(reply._id || reply.id)}
//       className={`mb-2 border-l-4 border-orange-500 bg-black/5 rounded-r-md px-3 py-1.5 text-left select-none ${
//         onContextClick ? "cursor-pointer hover:bg-black/10 transition-colors" : ""
//       }`}
//     >
//       <div className="text-[11px] font-semibold text-orange-600">
//         {reply.direction === "outbound" || reply.userId ? "You" : "Customer"}
//       </div>
//       <div className="text-xs text-gray-600 truncate max-w-full">
//         {previewText}
//       </div>
//     </div>
//   );
// };