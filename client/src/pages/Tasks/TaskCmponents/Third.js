// import React, { useEffect, useRef, useState } from "react";
// import { IoClose } from "react-icons/io5";
 
// import "froala-editor/js/froala_editor.pkgd.min.js";
// import "froala-editor/css/froala_editor.pkgd.min.css";
// import "froala-editor/css/froala_style.min.css";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { style } from "../../utlis/CommonStyle";
// import { BiLoaderCircle } from "react-icons/bi";
// import EmojiPicker from "emoji-picker-react";
// import { BsEmojiSmile } from "react-icons/bs";
// import { format } from "date-fns";
// import { AiFillLike, AiOutlineLike } from "react-icons/ai";
// import Loader from "../../utlis/Loader";

// import {
//   Menu,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   IconButton,
//   Tabs,
//   Tab,
//   Typography,
// } from "@mui/material";
// import { Close, DeleteOutline, EditOutlined, MessageRounded, MoreVert, Add as AddIcon, } from "@mui/icons-material";
 

 
// import { useSelector } from "react-redux";


 

// export default function Third({
   
//   jobId,

 
//   type,
//   getTasks1,
 
// }) {
 
//      const auth = useSelector((state => state.auth.auth));
//   const [loading, setLoading] = useState(false);
//   const [comment, setComment] = useState("");
//   const [showPicker, setShowPicker] = useState(false);
//   const [shopReply, setShowReply] = useState(false);
//   const [commentData, setCommentData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [commentReply, setCommentReply] = useState("");
//   const [commentId, setCommentId] = useState("");
//   const [replyLoading, setReplyLoading] = useState(false);
//   const [showReplyEmoji, setShowReplyEmoji] = useState(false);
//   const [commentLikes, setCommentLikes] = useState([]);
//   const [likeCounts, setLikeCounts] = useState({});
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [mentionStart, setMentionStart] = useState(-1);
//   const [selectedUser, setSelectedUser] = useState("");


//     const [users, setUsers] = useState([]);

//   const commentStatusRef = useRef(null);












// const [templates, setTemplates] = useState([]);

// const [quickReplyAnchorEl, setQuickReplyAnchorEl] = useState(null);
// const [selectedTemplate, setSelectedTemplate] = useState(null);
// const [templateText, setTemplateText] = useState("");
// const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
// const isEditingTemplate = !!selectedTemplate;




//    //---------- Get All Users-----------
//   const getAllUsers = async () => {
//     try {
//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
//       );
      

//       setUsers(
//         data?.users
//           ?.filter((user) =>
//             user?.role?.access?.map((item) => item.permission.includes("Tasks"))
//           )
//           ?.map((user) => user.name)
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   };


//   useEffect(() => {
//     getAllUsers();
//   }, []);
 


// const handleUseTemplate = (text) => {
//   setComment((prev) => prev + text);
//   setQuickReplyAnchorEl(null);
// };

// const handleOpenTemplateDialog = (template = null) => {
//   setSelectedTemplate(template);
//   setTemplateText(template ? template.text : "");
//   setTemplateDialogOpen(true);
// };

// const handleSaveTemplate = async () => {
//   try {
//     const body = {
//       userId: auth.user.id,
//       type,
//       text: templateText,
//       templateId: selectedTemplate?._id,
//     };
//     const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/templates`, body);

//     if (isEditingTemplate) {
//       setTemplates((prev) =>
//         prev.map((t) => (t._id === selectedTemplate._id ? res.data.template : t))
//       );
//     } else {
//       setTemplates((prev) => [...prev, res.data.template]);
//     }

//     setTemplateDialogOpen(false);
//   } catch (error) {
//     toast.error("Failed to save template");
//   }
// };


// const handleDeleteTemplate = async (id) => {
//   try {
//     await axios.delete(`${process.env.REACT_APP_API_URL}/api/templates/${id}`);
//     setTemplates((prev) => prev.filter((t) => t._id !== id));
//     //setQuickReplyAnchorEl(null);
//   } catch (err) {
//     toast.error("Failed to delete template");
//   }
// };












//   useEffect(() => {
//   const fetchTemplates = async () => {
//     try {
//       const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/templates?type=${type}`);
//       setTemplates(res.data.templates);
//     } catch (err) {
//       toast.error("Failed to load templates");
//     }
//   };
//   fetchTemplates();
// }, [type]);





























//   // -----------Mention User----->
//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setComment(value);

//     // Check for "@" mention trigger
//     const mentionIndex = value.lastIndexOf("@");

//     if (mentionIndex !== -1) {
//       const query = value.slice(mentionIndex + 1);

//       // Filter users based on the query after "@"
//       const filteredUsers = users?.filter((user) =>
//         user.toLowerCase().startsWith(query.toLowerCase())
//       );

//       setSuggestions(filteredUsers);
//       setShowSuggestions(true);
//       setMentionStart(mentionIndex);
//     } else {
//       setShowSuggestions(false);
//     }
//   };





















//   const handleMentionClick = (user) => {
//     const newText =
//       comment.slice(0, mentionStart) +
//       "@" +
//       user +
//       " " +
//       comment.slice(comment.length);

//     setSelectedUser(user);

//     setComment(newText);
//     setShowSuggestions(false);
//   };

//   // Add Emojis
//   const onEmojiClick = (event) => {
//     setComment((prevComment) => prevComment + event.emoji);
//   };
//   const onEmojiClickReply = (event) => {
//     setCommentReply((prevComment) => prevComment + event.emoji);
//   };

//   //  ------------- Get Single Job ||  Task || Ticket Comments-----------
//   const getSingleJobComment = async () => {
//     setIsLoading(true);
//     try {
//       if (type === "Jobs") {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/client/job/comments/${jobId}`
//         );
//         if (data) {
//           setIsLoading(false);
//           setCommentData(data?.comments?.comments);

//           // Socket
//           // socketId.emit("addJob", {
//           //   note: "New Task Added",
//           // });
//         }
//       } else if (type === "Task") {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/tasks/task/comments/${jobId}`
//         );
//         if (data) {
//           setIsLoading(false);
//           setCommentData(data?.comments?.comments);
//           // Send Socket Timer
//           // socketId.emit("addTask", {
//           //   note: "New Task Added",
//           // });
//         }
//       } else if (type === "Goals") {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/goals/get/comment/${jobId}`
//         );
//         if (data) {
//           setIsLoading(false);
//           setCommentData(data?.comments?.comments);
//           // Send Socket Timer
//           // socketId.emit("addTask", {
//           //   note: "New Task Added",
//           // });
//         }
//       } else {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/tickets/ticket/comments/${jobId}`
//         );
//         if (data) {
//           setIsLoading(false);
//           setCommentData(data?.comments?.comments);
//         }
//       }
//     } catch (error) {
//       setIsLoading(false);
//       console.log(error);
//       toast.error(error?.response?.data?.message);
//     }
//   };

//   useEffect(() => {
//     getSingleJobComment();
//     // eslint-disable-next-line
//   }, [jobId]);

 
  

//   // ----------Get Comment Without Load--------->
//   const getSingleComment = async () => {
//     try {
//       if (type === "Jobs") {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/client/job/comments/${jobId}`
//         );
//         if (data) {
//           console.log("data", data);
//           setCommentData(data?.comments?.comments);
//         }
//       } else if (type === "Task") {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/tasks/task/comments/${jobId}`
//         );
//         if (data) {
//           setCommentData(data?.comments?.comments);
//         }
//       } else if (type === "Goals") {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/goals/get/comment/${jobId}`
//         );
//         if (data) {
//           setIsLoading(false);
//           setCommentData(data?.comments?.comments);
        
//         }
//       } else {
//         const { data } = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/v1/tickets/ticket/comments/${jobId}`
//         );
//         if (data) {
//           setIsLoading(false);
//           setCommentData(data?.comments?.comments);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error?.response?.data?.message);
//     }
//   };

















 

//   //   Add Comment
//   const handleComment = async (e) => {
//     setLoading(true);
//     e.preventDefault();
//     if (!jobId) {
//       return toast.error("Job_id is required!");
//     }
//     try {
//       const { data } = await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/v1/comments/post/comment`,
//         {
//           comment: comment,
//           jobId: jobId,
//           type,
//           mentionUser: selectedUser,
//         }
//       );
//       if (data) {
//         setComment("");
//         getSingleComment();
//         getTasks1();
//         setLoading(false);
//         toast.success("Comment Posted!");
       
//       }
       
//     } catch (error) {
//       console.log(error);
//       setLoading(false);

//       toast.error(error?.response?.data?.message);
//     }
//   };








//   const sendComment = async (text) => {
//   if (!jobId) {
//     return toast.error("Job_id is required!");
//   }

//   try {
//     const { data } = await axios.post(
//       `${process.env.REACT_APP_API_URL}/api/v1/comments/post/comment`,
//       {
//         comment: text,
//         jobId: jobId,
//         type,
//         mentionUser: selectedUser,
//       }
//     );
//     if (data) {
//       getSingleComment();
//       getTasks1();
//       toast.success("Comment Posted!");
 
//     }
//   } catch (error) {
//     console.log(error);
//     toast.error(error?.response?.data?.message);
//   }
// };





//   //   Add Comment Reply
//   const handleCommentReply = async (e) => {
//     e.preventDefault();
//     setReplyLoading(true);
//     try {
//       const { data } = await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/v1/comments/reply/comment`,
//         { commentReply: commentReply, jobId: jobId, commentId: commentId, type }
//       );
//       if (data) {
//         setReplyLoading(false);
//         setCommentReply("");
//         getSingleComment();
//         toast.success("Reply added successfully!");
        
//       }

      
//     } catch (error) {
//       console.log(error);
//       setReplyLoading(false);
//       toast.error(error?.response?.data?.message);
//     }
//   };

//   // -----Like Counts----->
//   useEffect(() => {
//     setCommentLikes(
//       commentData?.reduce((acc, comment) => {
//         acc[comment._id] = comment.likes.includes(auth.user.id);
//         return acc;
//       }, {})
//     );
//     setLikeCounts(
//       commentData?.reduce((acc, comment) => {
//         acc[comment._id] = comment.likes.length;
//         return acc;
//       }, {})
//     );
//   }, [commentData, auth.user]);

//   // -------Like Comment------>
//   const likeComment = async (commentId) => {
//     try {
//       setCommentLikes((prevLike) => ({
//         ...prevLike,
//         [commentId]: true,
//       }));

//       setLikeCounts((prevCounts) => ({
//         ...prevCounts,
//         [commentId]: prevCounts[commentId] + 1,
//       }));

//       const { data } = await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/v1/comments/like/comment`,
//         { jobId: jobId, commentId: commentId, type }
//       );
//       if (data) {
//         getTasks1();
//         toast.success("Liked!");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response.data.message);
//       setCommentLikes((prevLikes) => ({
//         ...prevLikes,
//         [commentId]: false,
//       }));
//       setLikeCounts((prevCounts) => ({
//         ...prevCounts,
//         [commentId]: prevCounts[commentId] - 1,
//       }));
//     }
//   };

//   // --------Unlike Comment--------->
//   const unlikeComment = async (commentId) => {
//     try {
//       setCommentLikes((prevLike) => ({
//         ...prevLike,
//         [commentId]: false,
//       }));

//       setLikeCounts((prevCounts) => ({
//         ...prevCounts,
//         [commentId]: prevCounts[commentId] - 1,
//       }));

//       const { data } = await axios.put(
//         `${process.env.REACT_APP_API_URL}/api/v1/comments/unlike/comment`,
//         { jobId: jobId, commentId: commentId, type }
//       );
//       if (data) {
//         toast.success("Comment unliked!");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error?.response?.data?.message);
//       setCommentLikes((prevLikes) => ({
//         ...prevLikes,
//         [commentId]: true,
//       }));
//       setLikeCounts((prevCounts) => ({
//         ...prevCounts,
//         [commentId]: prevCounts[commentId] + 1,
//       }));
//     }
//   };

//   // --------AutoScroll------->
//   useEffect(() => {
//     const messageContainer = document.getElementById("message-container");
//     if (messageContainer) {
//       messageContainer.scrollTo({
//         top: messageContainer.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [commentData]);

//   return (
 
// <div
//   ref={commentStatusRef}
//   className="w-full h-full flex items-center justify-center overflow-hidden"
// >
//   <div className="w-full max-w-[45rem] h-full flex flex-col border rounded-xl shadow-sm bg-white relative">
//     {/* Header */}
//     <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b bg-gray-50">
//       <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
//     </div>

//     {/* Comments Section */}
//     <div className="  overflow-y-auto px-3 py-2 space-y-3 h-full">
//       {isLoading ? (
//         <div className="flex justify-center items-center h-40">
//           <Loader />
//         </div>
//       ) : (
//         commentData?.map((comment) => (
//           <div
//             key={comment._id}
//             className="border rounded-lg p-2 space-y-2 hover:shadow-sm transition"
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between px-1">
//               <div className="flex items-center gap-2">
//                 <img
//                   src={comment?.user?.avatar || "/profile1.jpeg"}
//                   alt="Avatar"
//                   className="w-8 h-8 rounded-full border-2 border-orange-500"
//                 />
//                 <span className="font-medium text-gray-800 text-sm">
//                   {comment?.user?.name}
//                 </span>
//               </div>
//               <span className="text-xs text-gray-500">
//                 {format(new Date(comment?.createdAt), "MMM dd 'at' p")}
//               </span>
//             </div>

//             {/* Message */}
//             <p className="ml-10 bg-sky-100 rounded-lg rounded-tl-none px-3 py-1 text-gray-800 text-sm">
//               {comment?.comment}
//             </p>

//             {/* Actions */}
//             <div className="flex items-center justify-between px-4">
//               <button
//                 className="flex items-center gap-1 text-sm text-gray-700 hover:text-orange-600 transition"
//                 onClick={() =>
//                   commentLikes[comment._id]
//                     ? unlikeComment(comment._id)
//                     : likeComment(comment._id)
//                 }
//               >
//                 {commentLikes[comment._id] ? (
//                   <AiFillLike className="h-4 w-4 text-orange-500" />
//                 ) : (
//                   <AiOutlineLike className="h-4 w-4" />
//                 )}
//                 ({likeCounts[comment._id] || 0})
//               </button>

//               <button
//                 className="text-sm text-orange-600 hover:text-orange-700 flex gap-1"
//                 onClick={() => {
//                   setCommentId(comment._id);
//                   setShowReply(!shopReply);
//                 }}
//               >
//                 Reply ({comment?.commentReplies?.length})
//               </button>
//             </div>

//             {/* Reply Input */}
//             {shopReply && comment._id === commentId && (
//               <div className="border-t pt-2 px-4">
//                 <form
//                   onSubmit={handleCommentReply}
//                   className="flex flex-col gap-2"
//                 >
//                   <div className="flex items-center gap-2">
//                     <input
//                       value={commentReply}
//                       onChange={(e) => setCommentReply(e.target.value)}
//                       placeholder="Enter your reply..."
//                       required
//                       className="flex-1 border rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-orange-400"
//                     />
//                     <button
//                       disabled={replyLoading}
//                       className={`px-3 py-1 rounded-md text-white text-sm bg-orange-500 hover:bg-orange-600 transition ${
//                         replyLoading && "opacity-60 cursor-not-allowed"
//                       }`}
//                     >
//                       {replyLoading ? (
//                         <BiLoaderCircle className="animate-spin w-4 h-4" />
//                       ) : (
//                         "Reply"
//                       )}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {/* Replies */}
//             {shopReply &&
//               comment.commentReplies?.map((reply) => (
//                 <div key={reply._id} className="ml-10 border-l pl-3 mt-2">
//                   <div className="flex items-center gap-2">
//                     <img
//                       src={reply?.user?.avatar || "/profile1.jpeg"}
//                       alt="Avatar"
//                       className="w-6 h-6 rounded-full border-2 border-sky-500"
//                     />
//                     <span className="text-sm font-medium text-gray-800">
//                       {reply?.user?.name}
//                     </span>
//                     <span className="text-xs text-gray-400">
//                       {format(new Date(reply?.createdAt), "MMM dd 'at' p")}
//                     </span>
//                   </div>
//                   <p className="ml-8 bg-orange-100 rounded-lg rounded-tl-none px-2 py-1 text-sm text-gray-700">
//                     {reply?.reply}
//                   </p>
//                 </div>
//               ))}
//           </div>
//         ))
//       )}
//     </div>

//     {/* Footer (Quick Replies + New Comment) */}
//     <div className="absolute bottom-0 w-full border-t bg-gray-50 px-3 py-2 space-y-3">
//       {/* Quick Replies */}
//       <div className="flex items-center justify-between">
//         <Button
//           size="small"
//           variant="outlined"
//           onClick={(e) => setQuickReplyAnchorEl(e.currentTarget)}
//         >
//           💬 Quick Replies
//         </Button>
//       </div>

//       {/* New Comment */}
//       <form
//         onSubmit={handleComment}
//         className="flex items-start gap-2 border border-orange-400 rounded-lg p-2 bg-white"
//       >
//         <img
//           src={auth?.user?.avatar || "/profile1.jpeg"}
//           alt="Avatar"
//           className="w-10 h-10 rounded-full border-2 border-orange-500"
//         />
//         <div className="flex-1 flex flex-col">
//           <textarea
//             value={comment}
//             onChange={handleInputChange}
//             required
//             placeholder="Enter your comment..."
//             className="w-full h-20 resize-none outline-none p-2 text-sm border-none"
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) handleComment(e);
//             }}
//           />
//           <div className="flex justify-between items-center">
//             <BsEmojiSmile
//               className="text-yellow-500 w-5 h-5 cursor-pointer"
//               onClick={() => setShowPicker(!showPicker)}
//             />
//             <button
//               disabled={loading || !comment}
//               type="submit"
//               className={`px-3 py-1.5 rounded-md text-white text-sm bg-orange-500 hover:bg-orange-600 transition ${
//                 loading && "opacity-60 cursor-not-allowed"
//               }`}
//             >
//               {loading ? (
//                 <BiLoaderCircle className="animate-spin w-4 h-4" />
//               ) : (
//                 "Send"
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   </div>
// </div>

   

 


//   );
// }
