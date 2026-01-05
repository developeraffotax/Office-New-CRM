// import { useState } from "react";
// import axios from "axios";

// const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/ai/generate-email-replies`;
 

// export default function AIReplySelector({ threadMessages, onSelect }) {
//   const [loading, setLoading] = useState(false);
//   const [replies, setReplies] = useState([]);
//   const [selectedIndex, setSelectedIndex] = useState(null);

//   const generateReplies = async () => {
//     setLoading(true);
//     setSelectedIndex(null);
//     setReplies([]);

//     const { data } = await axios.post(API_URL, {
//       messages: threadMessages,
//     });

//     setReplies(data.replies);
//     setLoading(false);
//   };

//   const selectReply = (index) => {
//     setSelectedIndex(index);
//     onSelect(replies[index].content); // 🔥 send to parent
//   };

//   return (
//     <div className="border rounded-lg p-4 bg-white dark:bg-zinc-900">
//       <div className="flex justify-between items-center mb-3">
//         <h3 className="font-semibold">AI Reply Suggestions</h3>
//         <button
//           onClick={generateReplies}
//           className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
//         >
//           {loading ? "Generating..." : "Generate Replies"}
//         </button>
//       </div>

//       <div className="space-y-3">
//         {replies.map((r, i) => (
//           <div
//             key={i}
//             onClick={() => selectReply(i)}
//             className={`p-3 border rounded cursor-pointer transition ${
//               selectedIndex === i
//                 ? "border-blue-500 bg-blue-50"
//                 : "hover:bg-gray-50"
//             }`}
//           >
//             <div className="text-xs font-medium text-gray-500 mb-1">
//               {r.tone}
//             </div>
//             <div className="text-sm line-clamp-4 whitespace-pre-line">
//               {r.content}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
