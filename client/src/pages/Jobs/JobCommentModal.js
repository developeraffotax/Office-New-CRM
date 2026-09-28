import React, { useEffect, useRef, useState } from "react";
import {
  FiX,
  FiMessageCircle,
  FiLoader,
  FiSend,
  FiAtSign,
  FiZap,
} from "react-icons/fi";

import "froala-editor/js/froala_editor.pkgd.min.js";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import toast from "react-hot-toast";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { format } from "date-fns";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";

import {
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Close,
  DeleteOutline,
  EditOutlined,
  Add as AddIcon,
} from "@mui/icons-material";

import { useSelector } from "react-redux";

export default function JobCommentModal({
  setIsComment,
  jobId,
  setJobId,
  users,
  type,
  getTasks1,
  page,
  anchored = false, // sized by the parent popover (width 340 + maxHeight)
  maxHeight = 480,
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

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef) {
      textareaRef.current?.focus();
    }
  }, []);

  // -----------Mention User----->
  const handleInputChange = (e) => {
    const { value } = e.target;
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickInside =
        commentStatusRef.current?.contains(event.target) ||
        document.querySelector(".MuiPopover-root")?.contains(event.target) || // MUI Menu
        document.querySelector(".EmojiPickerReact")?.contains(event.target) || // Emoji picker
        document.querySelector(".MuiDialog-root")?.contains(event.target); // Dialog

      if (!clickInside) {
        setIsComment(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsComment(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  // ----------Get Comment Without Load--------->
  const getSingleComment = async () => {
    try {
      if (type === "Jobs") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/client/job/comments/${jobId}`
        );
        if (data) {
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
          // Send Socket
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
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Socket
  // useEffect(() => {
  //   socketId.on("addnewTaskComment", () => {
  //     getSingleComment();
  //   });

  //   return () => {
  //     socketId.off("addnewTaskComment", getSingleComment);
  //   };
  //   // eslint-disable-next-line
  // }, [socketId]);

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
        // Send Socket Notification
        // socketId.emit("notification", {
        //   title: "New comment received!",
        //   redirectLink: "/job-planning",
        //   description: `${auth.user.name} add a new comment. ${comment}`,
        //   taskId: jobId,
        //   userId: auth.user.id,
        //   status: "unread",
        // });
      }
      // Send Socket Timer
      // socketId.emit("addTask", {
      //   note: "New Task Added",
      // });
      // socketId.emit("addTaskComment", {
      //   note: "New Task Added",
      // });
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

        // Send Socket Notification
        // socketId.emit("notification", {
        //   title: "New comment received!",
        //   redirectLink: "/job-planning",
        //   description: `${auth.user.name} add a new comment. ${text}`,
        //   taskId: jobId,
        //   userId: auth.user.id,
        //   status: "unread",
        // });

        // socketId.emit("addTask", { note: "New Task Added" });
        // socketId.emit("addTaskComment", { note: "New Task Added" });
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
        // Send Socket Notification
        // socketId.emit("notification", {
        //   title: "New comment reply received!",
        //   redirectLink: "/job-planning",
        //   description: `${auth.user.name} add a new comment reply . ${commentReply}`,
        //   taskId: jobId,
        //   userId: auth.user.id,
        //   status: "unread",
        // });
      }

      // Send Socket Timer
      // socketId.emit("addTask", {
      //   note: "New Task Added",
      // });
      // socketId.emit("addTaskComment", {
      //   note: "New Task Added",
      // });
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

  // ==========================================
  // UI
  // ==========================================
  const mentionClass =
    "font-semibold px-1 py-0.5 rounded bg-blue-50 text-blue-700";

  const panelSize = anchored
    ? ""
    : page === "detail"
    ? "w-full h-[33rem] 2xl:h-[40rem]"
    : "w-[400px] max-w-full max-h-[36rem]";

  const canSend = !(loading || !comment);

  return (
    <>
      <div
        ref={commentStatusRef}
        style={anchored ? { width: 340, maxHeight } : undefined}
        className={`flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-400/60 font-inter ${panelSize}`}
      >
        {/* Header */}
        <div
          className={`flex-shrink-0 px-3 py-2 flex items-center justify-between border-b border-slate-200 bg-white ${
            page === "detail" ? "hidden" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-white flex-shrink-0">
              <FiMessageCircle size={15} />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900 leading-none">
              Comments
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setJobId("");
              setIsComment(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <FiX size={15} />
          </button>
        </div>

        {/* -----------------Display-Comments------------ */}
        <div
          id="message-container"
          className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5 bg-white custom-scrollbar overscroll-contain"
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 py-10">
              <FiLoader className="animate-spin" size={18} />
              <p className="text-[11px] font-medium">Loading…</p>
            </div>
          ) : !commentData || commentData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <FiMessageCircle size={18} />
              </div>
              <p className="text-[12px] font-medium text-slate-600">
                No comments yet
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Start the conversation below
              </p>
            </div>
          ) : (
            commentData.map((comment) => {
              const isMe =
                Boolean(comment?.user?._id) &&
                comment.user._id === auth?.user?.id;

              return (
                <div
                  key={comment._id}
                  className={`flex flex-col w-full ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Meta row */}
                  <div
                    className={`flex items-center gap-1.5 mb-1 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <img
                      src={
                        comment?.user?.avatar
                          ? comment?.user?.avatar
                          : "/profile1.jpeg"
                      }
                      alt="Avatar"
                      className="h-5 w-5 flex-shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">
                      {isMe ? "You" : comment?.user?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {format(new Date(comment?.createdAt), "dd MMM yyyy · h:mm a")}
                    </span>
                  </div>

                  {/* Bubble + actions */}
                  <div
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    } max-w-[85%]`}
                  >
                    <div
                      className={`px-3 py-2 text-[13px] leading-snug rounded-md ${
                        isMe
                          ? "bg-slate-800 text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {comment?.comment.split(/(@\w+)/g).map((part, i) =>
                          part.startsWith("@") ? (
                            <span key={i} className={mentionClass}>
                              {part}
                            </span>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-1 px-0.5">
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
                          commentLikes[comment._id]
                            ? "text-blue-600"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                        onClick={() =>
                          commentLikes[comment?._id]
                            ? unlikeComment(comment?._id)
                            : likeComment(comment?._id)
                        }
                      >
                        {commentLikes[comment._id] ? (
                          <AiFillLike size={13} />
                        ) : (
                          <AiOutlineLike size={13} />
                        )}
                        <span className="tabular-nums">
                          {likeCounts[comment?._id] || 0}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
                        onClick={() => {
                          setCommentId(comment?._id);
                          setShowReply(!shopReply);
                        }}
                      >
                        Reply
                        <span className="tabular-nums">
                          ({comment?.commentReplies?.length || 0})
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* ----------Comm_Replies----------- */}
                  {shopReply && comment._id === commentId && (
                    <div className="w-full mt-1.5 pl-3 border-l border-slate-200 ml-2.5">
                      <form
                        onSubmit={handleCommentReply}
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-slate-300/60 focus-within:border-slate-300 transition-shadow"
                      >
                        <input
                          placeholder="Write a reply…"
                          onClick={() => setShowReplyEmoji(false)}
                          value={commentReply}
                          required
                          onChange={(e) => setCommentReply(e.target.value)}
                          className="w-full px-0.5 py-1 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                        <div className="flex items-center justify-between mt-1">
                          <button
                            type="button"
                            title="Add Emoji"
                            onClick={() => setShowReplyEmoji(!showReplyEmoji)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <BsEmojiSmile size={15} />
                          </button>

                          <button
                            type="submit"
                            disabled={replyLoading || !comment}
                            className={`inline-flex items-center justify-center h-7 min-w-[3.25rem] px-3 text-[11px] font-semibold rounded-md transition-colors ${
                              replyLoading || !comment
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900"
                            }`}
                          >
                            {replyLoading ? (
                              <FiLoader className="animate-spin" size={12} />
                            ) : (
                              "Reply"
                            )}
                          </button>
                        </div>
                      </form>

                      {showReplyEmoji && (
                        <div className="mt-1.5">
                          <EmojiPicker
                            width="100%"
                            height={260}
                            onEmojiClick={onEmojiClickReply}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {shopReply &&
                    comment?.commentReplies?.length > 0 && (
                      <div className="w-full mt-1.5 pl-3 border-l border-slate-200 ml-2.5 space-y-2">
                        {comment.commentReplies.map((commentReply) => (
                          <div key={commentReply._id} className="w-full">
                            <div className="flex items-center gap-1.5 mb-1">
                              <img
                                src={
                                  commentReply?.user?.avatar
                                    ? commentReply?.user?.avatar
                                    : "/profile1.jpeg"
                                }
                                alt="Avatar"
                                className="h-4 w-4 flex-shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              <span className="text-[11px] font-semibold text-slate-700">
                                {commentReply?.user?.name}
                              </span>
                              <span className="text-[10px] text-slate-400 tabular-nums">
                                {format(
                                  new Date(commentReply?.createdAt),
                                  "MMM dd 'at' p"
                                )}
                              </span>
                            </div>
                            <p className="px-3 py-2 text-[13px] leading-snug rounded-md rounded-tl-sm bg-slate-100 text-slate-800 whitespace-pre-wrap break-words">
                              {commentReply?.reply}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              );
            })
          )}
        </div>

        {/* --------Add Comment-------- */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80 px-3 py-2.5">
          {/* Quick replies */}
          <div className="mb-2">
            <button
              type="button"
              onClick={(e) => setQuickReplyAnchorEl(e.currentTarget)}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FiZap size={11} />
              Quick replies
            </button>
            <Menu
              anchorEl={quickReplyAnchorEl}
              open={Boolean(quickReplyAnchorEl)}
              onClose={() => setQuickReplyAnchorEl(null)}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              slotProps={{
                paper: {
                  sx: {
                    width: 320,
                    maxHeight: 360,
                    mt: -0.5,
                    borderRadius: 1.5,
                    px: 0.5,
                    py: 0.5,
                    boxShadow: 6,
                  },
                },
              }}
            >
              <div className="p-2">
                <h3 className="text-[12px] font-semibold text-slate-800 mb-1.5">
                  Saved replies
                </h3>

                {templates.filter((t) => t.type === type).length === 0 ? (
                  <div className="text-[12px] text-slate-500 p-1">
                    No templates available
                  </div>
                ) : (
                  templates
                    .filter((t) => t.type === type)
                    .map((t) => (
                      <div
                        key={t._id}
                        onClick={() => {
                          sendComment(t.text);
                          setQuickReplyAnchorEl(null);
                        }}
                        className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-md cursor-pointer transition"
                      >
                        <div className="text-[13px] text-slate-800 truncate max-w-[200px] pr-3">
                          {t.text}
                        </div>
                        <div className="flex items-center gap-1">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTemplateDialog(t);
                            }}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(t._id);
                            }}
                          >
                            <DeleteOutline
                              fontSize="small"
                              className="text-red-400"
                            />
                          </IconButton>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="border-t border-slate-200 mt-1 pt-1.5 px-2">
                <div
                  onClick={() => handleOpenTemplateDialog(null)}
                  className="flex items-center justify-center gap-2 text-[13px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1.5 rounded-md cursor-pointer transition"
                >
                  <AddIcon fontSize="small" />
                  Add new template
                </div>
              </div>
            </Menu>
          </div>

          {showPicker && (
            <div className="mb-2">
              <EmojiPicker
                width="100%"
                height={260}
                onEmojiClick={onEmojiClick}
              />
            </div>
          )}

          <form
            onSubmit={handleComment}
            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 focus-within:ring-2 focus-within:ring-slate-300/60 focus-within:border-slate-300 transition-shadow"
          >
            <div className="relative w-full">
              {/* Highlighted mirror div */}
              <div
                className="absolute inset-0 whitespace-pre-wrap break-words text-[13px] leading-snug text-slate-800 pointer-events-none"
                dangerouslySetInnerHTML={{
                  __html: comment
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/@(\w+)/g, '<span class="text-blue-600">@$1</span>')
                    .replace(/\n$/g, "\n "),
                }}
              />

              {/* Actual textarea */}
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={handleInputChange}
                placeholder="Write a comment… (@ to mention)"
                className="relative block w-full resize-none overflow-hidden border-none outline-none p-0 bg-transparent text-[13px] leading-snug text-transparent caret-slate-800 placeholder:text-slate-400"
                rows={1}
                onKeyDown={handleKeyDown}
              />

              {showSuggestions && suggestions?.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2.5 w-52 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      Mention
                    </span>
                    <FiAtSign className="text-slate-300" size={11} />
                  </div>
                  <ul id="mention-list" className="max-h-44 overflow-y-auto py-1 m-0 p-0 list-none">
                    {suggestions.map((user, index) => (
                      <li
                        key={index}
                        ref={(el) => (suggestionRefs.current[index] = el)}
                        onClick={() => handleMentionClick(user)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 text-[13px] cursor-pointer transition-colors m-0 ${
                          index === highlightedIndex
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                            index === highlightedIndex
                              ? "bg-slate-300 text-slate-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user?.charAt(0)}
                        </div>
                        <span className="font-medium truncate">{user}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <button
                type="button"
                title="Add Emoji"
                onClick={() => setShowPicker(!showPicker)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <BsEmojiSmile size={16} />
              </button>

              <button
                disabled={loading || !comment}
                type="submit"
                className={`inline-flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-semibold rounded-md transition-colors ${
                  canSend
                    ? "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <FiLoader className="animate-spin" size={13} />
                ) : (
                  <>
                    <span>Send</span>
                    <FiSend size={12} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
            pb: 1,
          }}
        >
          <Typography variant="h6">
            {isEditingTemplate ? "Edit Quick Reply" : "Add New Quick Reply"}
          </Typography>
          <IconButton onClick={() => setTemplateDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, p: 3 }}>
          <TextField
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            placeholder="Enter your quick reply text here..."
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline
                handleSaveTemplate(); // trigger save
              }
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button
            onClick={() => setTemplateDialogOpen(false)}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}