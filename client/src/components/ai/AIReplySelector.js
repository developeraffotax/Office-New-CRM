import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {  HiArrowPath, HiOutlineDocumentDuplicate, HiCheckCircle } from "react-icons/hi2";
import { RiRobot2Line } from "react-icons/ri";
import { FaReplyAll } from "react-icons/fa";
 import { BsFillReplyAllFill } from "react-icons/bs";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-replies`;

export default function AIReplySelector({ threadId, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const generateReplies = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setSelectedIndex(null);
      const { data } = await axios.post(API_URL, { threadId }, { signal: controller.signal });
      setReplies(data.replies || []);
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error(err?.response?.data?.error || err?.response?.data?.message || "Generation failed. Please try again.");
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [threadId]);

  useEffect(() => {
    generateReplies();
  }, [generateReplies]);

 const copyToClipboard = (e, text) => {
  e.stopPropagation();

  const formattedText = text
    // Paragraphs → double line break
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")

    // Line breaks
    .replace(/<br\s*\/?>/gi, "\n")

    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, "")

    // Cleanup extra spacing
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  navigator.clipboard.writeText(formattedText);
  toast.success("Copied to clipboard", { id: "copy-toast" });
};

  return (
    <div className="absolute top-0 left-full ml-4 w-[450px] h-full   animate-fade-in duration-200 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-white h-full flex flex-col    ">

        {/* Header */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
     <div className="flex items-center gap-2">
  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-500">
    <BsFillReplyAllFill className="w-4 h-4 text-white" />
  </span>
  <h3 className="text-sm font-semibold text-slate-800">
    Reply Suggestions
  </h3>
</div>

          <button
            onClick={generateReplies}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
          >
            <HiArrowPath className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Generating..." : "Regenerate"}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-3">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2 animate-pulse">
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  <div className="h-3 w-4/6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((r, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedIndex(i);
                    onSelect(r.content);
                  }}
                  className={`
                    group relative p-4 rounded-lg cursor-pointer transition-all border-2
                    ${selectedIndex === i
                      ? "bg-gray-50 border-orange-500 shadow-lg "
                      : "bg-gray-50 border-transparent hover:shadow-md"
                    }
                  `}
                >
                  {/* Top-left Selected Badge */}
                  {selectedIndex === i && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
                      <HiCheckCircle className="w-3 h-3" />
                      Selected
                    </div>
                  )}

                  <div className="flex justify-start items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Reply {i + 1}
                    </span>
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyToClipboard(e, r.content)}
                        className="p-1 hover:text-orange-500 text-slate-400 transition-colors"
                        title="Copy text"
                      >
                        <HiOutlineDocumentDuplicate className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="text-sm text-slate-700 line-clamp-6"
                    dangerouslySetInnerHTML={{ __html: r.content }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <RiRobot2Line className="w-14 h-14 text-slate-200 mb-2" />
              <p className="text-sm font-medium text-slate-500">No suggestions generated</p>
              <button
                onClick={generateReplies}
                className="mt-2 text-sm text-orange-500 font-semibold hover:underline"
              >
                Click to retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







































// import { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-replies`;

// export default function AIReplySelector({ threadId, onSelect }) {
//   const [loading, setLoading] = useState(false);
//   const [replies, setReplies] = useState([]);
//   const [selectedIndex, setSelectedIndex] = useState(null);

//   const generateReplies = async () => {
//     try {
//       setLoading(true);
//       setSelectedIndex(null);
//       setReplies([]);

//       const { data } = await axios.post(API_URL, {
//         threadId: threadId,
//       });

//       setReplies(data.replies || []);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to generate replies");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     generateReplies();
//   }, []);

//   const selectReply = (index) => {
//     setSelectedIndex(index);
//     onSelect(replies[index].content);
//   };

//   return (
//     <div className="absolute top-0 left-full ml-5 w-[30rem] h-full">
//       {/* Card */}
//       <div className="bg-white border rounded-xl shadow-lg h-full flex flex-col overflow-hidden">
//         {/* Header (fixed height) */}
//         <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
//           <div>
//             <h3 className="text-sm font-semibold text-gray-800">
//               Reply Suggestions
//             </h3>
//             <p className="text-xs text-gray-500">
//               Select one to insert into reply
//             </p>
//           </div>

//           <button disabled={loading} onClick={generateReplies}  className={`text-xs text-left  text-blue-600 font-medium ${loading ? "opacity-50 cursor-not-allowed animate-pulse" : "hover:text-blue-500 cursor-pointer"}`}>
//               {loading ? "Generating…" : "Generate"}
//             </button>
           
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {/* Skeleton Loading */}
//           {loading &&
//             Array.from({ length: 4 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="p-3 border rounded-lg space-y-2 animate-pulse"
//               >
//                 <div className="h-3 w-28 bg-gray-200 rounded" />
//                 <div className="h-3 w-full bg-gray-200 rounded" />
//                 <div className="h-3 w-5/6 bg-gray-200 rounded" />
//                 <div className="h-3 w-4/6 bg-gray-200 rounded" />
//               </div>
//             ))}

//           {/* Replies */}
//           {!loading &&
//             replies.map((r, i) => (
//               <div
//                 key={i}
//                 onClick={() => selectReply(i)}
//                 className={`group p-4 border rounded-lg cursor-pointer transition-all
//                   ${
//                     selectedIndex === i
//                       ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
//                       : "hover:border-gray-300 hover:bg-gray-50"
//                   }`}
//               >
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                     {/* {r.option} */}
//                     Reply {i + 1}
//                   </span>

//                   {selectedIndex === i && (
//                     <span className="text-xs text-blue-600 font-medium">
//                       Selected
//                     </span>
//                   )}
//                 </div>

//                 <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-4" dangerouslySetInnerHTML={{__html: r.content}}>
                   
//                 </div>
//               </div>
//             ))}

//           {/* Empty State */}
//           {!loading && replies.length === 0 && (
//             <div className="text-center text-sm text-gray-500 py-10">
//               No suggestions available
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
