


import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import Reply from "./Reply";
import axios from "axios";
import { useClickOutside } from "../../../utlis/useClickOutside";


export const ReplyPopup = ({ threadId, companyName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [emailDetail, setEmailDetail] = useState(null);
  const popupRef = useRef()


    useClickOutside(popupRef, onClose)

  const getEmailDetail = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/inbox/detail/pagination/${threadId}/${companyName}?page=1&limit=1`
      );

      if (data?.success) {
        setEmailDetail(data.emailDetails);
      }
    } catch (error) {
      console.error("Error fetching thread detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmailDetail();
  }, [threadId]);

  if (!threadId) return null;

  return (
    <div
      ref={popupRef}
      className="
        absolute
        top-8
        right-0
        z-50
        w-[520px]
        bg-white
        border
        border-gray-200
        rounded-lg
        shadow-2xl
        animate-in fade-in zoom-in
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-lg">
        <span className="text-[11px] font-semibold text-gray-600 truncate">
          {emailDetail?.subject || "Reply"}
        </span>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-red-50 hover:text-red-500 text-gray-400"
        >
          <IoClose size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-0 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <TbLoader2 className="animate-spin text-blue-500" size={20} />
          </div>
        ) : (
          <Reply
            company={companyName}
            emailDetail={emailDetail}
            getEmailDetail={getEmailDetail}
            setShowReplyEditor={onClose}
            inline={true}
          />
        )}
      </div>
    </div>
  );
};
























































// import { useEffect, useState } from "react";
// import { IoClose } from "react-icons/io5";
// import { TbLoader2 } from "react-icons/tb";
// import Reply from "./Reply";
// import axios from "axios";

// export const ReplyPopup = ({ threadId, companyName, onClose }) => {
//   const [loading, setLoading] = useState(true);
//   const [emailDetail, setEmailDetail] = useState(null);

//   const getEmailDetail = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/inbox/detail/pagination/${threadId}/${companyName}?page=1&limit=1`
//       );
//       if (data?.success) {
//         setEmailDetail(data.emailDetails);
//       }
//     } catch (error) {
//       console.error("Error fetching thread detail:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getEmailDetail();
//   }, [threadId]);

//   if (!threadId) return null;

//   const lastMessage = emailDetail?.decryptedMessages?.[0];
//   const lastMessageContent = lastMessage?.payload?.body?.data || lastMessage?.snippet;

//   return (
//     <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2">
//       <div className="relative w-[70%] h-[75vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">
        
//         {/* Header - Ultra Compact */}
//         <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
//           <div className="flex items-center gap-3">
//             <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
//               {companyName}
//             </span>
//             <h3 className="text-xs font-bold text-gray-600 truncate max-w-md">
//               {emailDetail?.subject || "Loading Subject..."}
//             </h3>
//           </div>
//           <button 
//             onClick={onClose} 
//             className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors text-gray-400"
//           >
//             <IoClose size={18} />
//           </button>
//         </div>

//         {loading ? (
//           <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
//             <TbLoader2 className="animate-spin text-blue-500" size={24} />
//             <p className="text-[11px] text-gray-400 mt-2 font-medium">Fetching conversation...</p>
//           </div>
//         ) : (
//           <div className="flex-1 flex overflow-hidden">
            
//             {/* LEFT COLUMN: Last Message Reference (30%) */}
//             <div className="w-[30%] border-r border-gray-100 bg-gray-50/30 flex flex-col overflow-hidden">
//               <div className="px-3 py-1.5 border-b border-gray-100 bg-white flex justify-between items-center">
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                   Reference
//                 </span>
//                 <span className="text-[9px] text-gray-400 font-medium">
//                   {emailDetail?.formattedDate}
//                 </span>
//               </div>
//               <div 
//                 className="flex-1 p-4 overflow-y-auto text-[13px] leading-relaxed text-gray-600 selection:bg-blue-100 custom-scrollbar"
//                 dangerouslySetInnerHTML={{ __html: lastMessageContent }}
//               />
//             </div>

//             {/* RIGHT COLUMN: Reply Editor & AI Selector (70%) */}
//             <div className="flex-1 flex flex-col overflow-hidden bg-white p-2">
//               <div className="flex-1 overflow-y-auto custom-scrollbar">
//                 <Reply
//                   company={companyName}
//                   emailDetail={emailDetail}
//                   getEmailDetail={getEmailDetail}
//                   setShowReplyEditor={onClose}
//                 />
//               </div>
//             </div>

//           </div>
//         )}
//       </div>
//     </div>
//   );
// };















