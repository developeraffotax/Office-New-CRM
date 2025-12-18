import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

import "froala-editor/js/froala_editor.pkgd.min.js";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import toast from "react-hot-toast";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import { BiLoaderCircle } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { format } from "date-fns";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import Loader from "../../utlis/Loader";
import { GoDotFill } from "react-icons/go";

import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import {
  Close,
  DeleteOutline,
  EditOutlined,
  MessageRounded,
  MoreVert,
  Add as AddIcon,
} from "@mui/icons-material";

import { useSelector } from "react-redux";

export default function DetailComments({
  jobId,

  type,
  getTasks1,
}) {
  const auth = useSelector((state) => state.auth.auth);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [shopReply, setShowReply] = useState(false);
  const [commentData, setCommentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentReply, setCommentReply] = useState("");
  const [commentId, setCommentId] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplyEmoji, setShowReplyEmoji] = useState(false);
  const [commentLikes, setCommentLikes] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedUser, setSelectedUser] = useState("");

  const [users, setUsers] = useState([]);

  const commentStatusRef = useRef(null);

  const [templates, setTemplates] = useState([]);

  const [quickReplyAnchorEl, setQuickReplyAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateText, setTemplateText] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const isEditingTemplate = !!selectedTemplate;

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const suggestionRefs = useRef([]);
  suggestionRefs.current = []; // reset before rendering new list

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev === 0 ? suggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleMentionClick(suggestions[highlightedIndex]);
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (showSuggestions) {
          e.preventDefault();
          handleMentionClick(suggestions[highlightedIndex]);
        }
      }
    } else {
      if (e.key === "Enter" && !e.shiftKey) {
        handleComment(e);
      }
    }
  };

  useEffect(() => {
    if (
      highlightedIndex !== null &&
      suggestionRefs?.current[highlightedIndex]
    ) {
      suggestionRefs.current[highlightedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef) {
      textareaRef.current?.focus();
    }
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      setUsers(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.map((item) => item.permission.includes("Tasks"))
          )
          ?.map((user) => user.name)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleUseTemplate = (text) => {
    setComment((prev) => prev + text);
    setQuickReplyAnchorEl(null);
  };

  const handleOpenTemplateDialog = (template = null) => {
    setSelectedTemplate(template);
    setTemplateText(template ? template.text : "");
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      const body = {
        userId: auth.user.id,
        type,
        text: templateText,
        templateId: selectedTemplate?._id,
      };
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/templates`,
        body
      );

      if (isEditingTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t._id === selectedTemplate._id ? res.data.template : t
          )
        );
      } else {
        setTemplates((prev) => [...prev, res.data.template]);
      }

      setTemplateDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/templates/${id}`
      );
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      //setQuickReplyAnchorEl(null);
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/templates?type=${type}`
        );
        setTemplates(res.data.templates);
      } catch (err) {
        toast.error("Failed to load templates");
      }
    };
    fetchTemplates();
  }, [type]);

  // -----------Mention User----->
  const handleInputChange = (e) => {
    const value = e.target.value;
    setComment(value);

    // 🔹 Reset height first, then set to scrollHeight
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
    

    // Check for "@" mention trigger
    const mentionIndex = value.lastIndexOf("@");

    if (mentionIndex !== -1) {
      const query = value.slice(mentionIndex + 1);

      // Filter users based on the query after "@"
      const filteredUsers = users?.filter((user) =>
        user.toLowerCase().startsWith(query.toLowerCase())
      );

      setSuggestions(filteredUsers);
      setShowSuggestions(true);
      setMentionStart(mentionIndex);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleMentionClick = (user) => {
    const newText =
      comment.slice(0, mentionStart) +
      "@" +
      user +
      " " +
      comment.slice(comment.length);

    setSelectedUser(user);

    setComment(newText);
    setShowSuggestions(false);
  };

  // Add Emojis
  const onEmojiClick = (event) => {
    setComment((prevComment) => prevComment + event.emoji);
  };
  const onEmojiClickReply = (event) => {
    setCommentReply((prevComment) => prevComment + event.emoji);
  };

  //  ------------- Get Single Job ||  Task || Ticket Comments-----------
  const getSingleJobComment = async () => {
    setIsLoading(true);
    try {
      if (type === "Jobs") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/client/job/comments/${jobId}`
        );
        if (data) {
          setIsLoading(false);
          setCommentData(data?.comments?.comments);

          // Socket
          // socketId.emit("addJob", {
          //   note: "New Task Added",
          // });
        }
      } else if (type === "Task") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/task/comments/${jobId}`
        );
        if (data) {
          setIsLoading(false);
          setCommentData(data?.comments?.comments);
          // Send Socket Timer
          // socketId.emit("addTask", {
          //   note: "New Task Added",
          // });
        }
      } else if (type === "Goals") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/goals/get/comment/${jobId}`
        );
        if (data) {
          setIsLoading(false);
          setCommentData(data?.comments?.comments);
          // Send Socket Timer
          // socketId.emit("addTask", {
          //   note: "New Task Added",
          // });
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tickets/ticket/comments/${jobId}`
        );
        if (data) {
          setIsLoading(false);
          setCommentData(data?.comments?.comments);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    getSingleJobComment();
    // eslint-disable-next-line
  }, [jobId]);

  // ----------Get Comment Without Load--------->
  const getSingleComment = async () => {
    try {
      if (type === "Jobs") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/client/job/comments/${jobId}`
        );
        if (data) {
          console.log("data", data);
          setCommentData(data?.comments?.comments);
        }
      } else if (type === "Task") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/task/comments/${jobId}`
        );
        if (data) {
          setCommentData(data?.comments?.comments);
        }
      } else if (type === "Goals") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/goals/get/comment/${jobId}`
        );
        if (data) {
          setIsLoading(false);
          setCommentData(data?.comments?.comments);
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tickets/ticket/comments/${jobId}`
        );
        if (data) {
          setIsLoading(false);
          setCommentData(data?.comments?.comments);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Add Comment
  const handleComment = async (e) => {
    e.preventDefault();
    if (!jobId) {
      return toast.error("Job_id is required!");
    }

    if (!comment?.trim()) {
      return toast.error("Comment is required!");
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/comments/post/comment`,
        {
          comment: comment,
          jobId: jobId,
          type,
          mentionUser: selectedUser,
        }
      );
      if (data) {
        setComment("");
        getSingleComment();
        getTasks1();
        setLoading(false);
        toast.success("Comment Posted!");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);

      toast.error(error?.response?.data?.message);
    }
  };

  const sendComment = async (text) => {
    if (!jobId) {
      return toast.error("Job_id is required!");
    }

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/comments/post/comment`,
        {
          comment: text,
          jobId: jobId,
          type,
          mentionUser: selectedUser,
        }
      );
      if (data) {
        getSingleComment();
        getTasks1();
        toast.success("Comment Posted!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Add Comment Reply
  const handleCommentReply = async (e) => {
    e.preventDefault();
    setReplyLoading(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/comments/reply/comment`,
        { commentReply: commentReply, jobId: jobId, commentId: commentId, type }
      );
      if (data) {
        setReplyLoading(false);
        setCommentReply("");
        getSingleComment();
        toast.success("Reply added successfully!");
      }
    } catch (error) {
      console.log(error);
      setReplyLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  // -----Like Counts----->
  useEffect(() => {
    setCommentLikes(
      commentData?.reduce((acc, comment) => {
        acc[comment._id] = comment.likes.includes(auth.user.id);
        return acc;
      }, {})
    );
    setLikeCounts(
      commentData?.reduce((acc, comment) => {
        acc[comment._id] = comment.likes.length;
        return acc;
      }, {})
    );
  }, [commentData, auth.user]);

  // -------Like Comment------>
  const likeComment = async (commentId) => {
    try {
      setCommentLikes((prevLike) => ({
        ...prevLike,
        [commentId]: true,
      }));

      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [commentId]: prevCounts[commentId] + 1,
      }));

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/comments/like/comment`,
        { jobId: jobId, commentId: commentId, type }
      );
      if (data) {
        getTasks1();
        toast.success("Liked!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setCommentLikes((prevLikes) => ({
        ...prevLikes,
        [commentId]: false,
      }));
      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [commentId]: prevCounts[commentId] - 1,
      }));
    }
  };

  // --------Unlike Comment--------->
  const unlikeComment = async (commentId) => {
    try {
      setCommentLikes((prevLike) => ({
        ...prevLike,
        [commentId]: false,
      }));

      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [commentId]: prevCounts[commentId] - 1,
      }));

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/comments/unlike/comment`,
        { jobId: jobId, commentId: commentId, type }
      );
      if (data) {
        toast.success("Comment unliked!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setCommentLikes((prevLikes) => ({
        ...prevLikes,
        [commentId]: true,
      }));
      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [commentId]: prevCounts[commentId] + 1,
      }));
    }
  };

  // --------AutoScroll------->
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [commentData]);

  return (
    <div
      ref={commentStatusRef}
      className="w-full h-full flex items-center justify-center px-3"
    >
      <div className="w-full max-w-[44rem] h-full flex flex-col justify-between rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <h3 className="text-base font-semibold text-gray-800">Comments</h3>
        </div>

        {/* Comments */}
        <div
          id="message-container"
          className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-4 text-sm text-gray-500">
              Loading comments...
            </div>
          ) : commentData?.length ? (
            commentData.map((comment) => (
              <div
                key={comment._id}
                className="rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment?.user?.avatar || "/profile1.jpeg"}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full border border-orange-400"
                    />
                    <span className="font-medium text-gray-800 text-sm">
                      {comment?.user?.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {format(new Date(comment?.createdAt), "dd MMM yyyy, h:mm a")}
                  </span>
                </div>

                {/* Message */}
                <div className="ml-9 bg-orange-50 text-gray-800 text-[13px] px-3 py-1.5 rounded-lg rounded-tl-none">
                  {comment?.comment.split(/(@\w+)/g).map((part, i) =>
                    part.startsWith("@") ? (
                      <span key={i} className="text-blue-600 font-semibold">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-9 mt-1">
                  <button
                    onClick={() =>
                      commentLikes[comment._id]
                        ? unlikeComment(comment._id)
                        : likeComment(comment._id)
                    }
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600 transition"
                  >
                    {commentLikes[comment._id] ? (
                      <AiFillLike className="w-3.5 h-3.5 text-orange-500" />
                    ) : (
                      <AiOutlineLike className="w-3.5 h-3.5" />
                    )}
                    {likeCounts[comment._id] || 0}
                  </button>

                  <button
                    onClick={() => {
                      setCommentId(comment._id);
                      setShowReply(!shopReply);
                    }}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    Reply ({comment?.commentReplies?.length})
                  </button>
                </div>

                {/* Reply Input */}
                {shopReply && comment._id === commentId && (
                  <div className="ml-9 mt-2">
                    <form
                      onSubmit={handleCommentReply}
                      className="flex items-center gap-2"
                    >
                      <input
                        value={commentReply}
                        onChange={(e) => setCommentReply(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-orange-400 outline-none"
                      />
                      <button
                        disabled={replyLoading}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-md flex items-center justify-center transition"
                      >
                        {replyLoading ? (
                          <BiLoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          "Reply"
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Replies */}
                {shopReply &&
                  comment.commentReplies?.map((reply) => (
                    <div key={reply._id} className="ml-12 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={reply?.user?.avatar || "/profile1.jpeg"}
                          alt="Avatar"
                          className="w-6 h-6 rounded-full border border-orange-400"
                        />
                        <span className="text-xs font-medium text-gray-800">
                          {reply?.user?.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {format(new Date(reply?.createdAt), "MMM dd, h:mm a")}
                        </span>
                      </div>
                      <p className="ml-8 bg-gray-100 text-gray-700 text-[13px] px-2.5 py-1 rounded-lg rounded-tl-none">
                        {reply?.reply}
                      </p>
                    </div>
                  ))}
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">
              No comments yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-3 py-2 ">
          <form
            onSubmit={handleComment}
            className="flex items-start gap-2 bg-white border border-gray-200 rounded-md p-2"
          >
            <img
              src={auth?.user?.avatar || "/profile1.jpeg"}
              alt="Avatar"
              className="w-9 h-9 rounded-full border border-orange-400"
            />
            <div className="flex-1 flex flex-col gap-1 relative w-full">
              {/* Highlighted mirror div */}
              <div
                className="absolute inset-0 whitespace-pre-wrap break-words text-sm text-gray-800 p-1 pointer-events-none"
                dangerouslySetInnerHTML={{
                  __html: comment
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(
                      /@(\w+)/g,
                      '<span class="text-blue-500 text-sm ">@$1</span>'
                    )
                    .replace(/\n$/g, "\n "),
                }}
              />

              {/* Actual textarea */}
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={handleInputChange}
                placeholder="Write a comment..."
                className="relative w-full resize-none text-sm border-none outline-none p-1 bg-transparent text-transparent caret-black"
                // rows={1}
                onKeyDown={handleKeyDown}
              />

              {showSuggestions && (
                <ul
                  id="mention-list"
                  className="absolute bottom-[110%] left-0 w-48 bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto z-10"
                >
                  {suggestions.map((user, index) => (
                    <li
                      key={index}
                      ref={(el) => (suggestionRefs.current[index] = el)}
                      onClick={() => handleMentionClick(user)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition m-0 ${
                        index === highlightedIndex
                          ? "bg-orange-100 text-orange-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <GoDotFill className="h-3 w-3 text-orange-500" />
                      <span>{user}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between">
                <div className="relative" title="Add Emoji">
                  <BsEmojiSmile
                    onClick={() => setShowPicker(!showPicker)}
                    className="text-yellow-600 w-5 h-5 cursor-pointer hover:scale-110 transition"
                  />
                  {showPicker && (
                    <div className="absolute bottom-6 left-0 z-50">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !comment}
                  className={`px-4 py-1.5 text-sm rounded-md text-white transition ${
                    loading
                      ? "bg-orange-400 opacity-70 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 shadow-sm"
                  }`}
                >
                  {loading ? (
                    <BiLoaderCircle className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
