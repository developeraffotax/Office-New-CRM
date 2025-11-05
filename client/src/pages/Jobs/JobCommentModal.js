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
import { GoDotFill } from "react-icons/go";

export default function JobCommentModal({
  setIsComment,
  jobId,
  setJobId,
  users,
  type,
  getTasks1,
  page,
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

    console.log("COMMENT LENGTH💛💛🧡🧡", newText);

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
    <>
      <div
        ref={commentStatusRef}
        className="w-full h-full flex items-center justify-center"
      >
        <div
          className={`w-[45rem]  ${
            page === "detail"
              ? " bg-gray-50 h-[33rem] 2xl:h-[40rem]"
              : " bg-gray-50 max-h-[36rem]"
          } rounded-md shadow-md  border flex flex-col gap-2`}
        >
          <div
            className={`flex items-center justify-between py-2 px-3 ${
              page === "detail" && "hidden"
            }`}
          >
            <h3 className="text-[18px] font-semibold text-black">Comments</h3>
            <span
              onClick={() => {
                setJobId("");
                setIsComment(false);
              }}
            >
              <IoClose className="text-black cursor-pointer h-6 w-6 " />
            </span>
          </div>
          <hr className="w-full h-[1px] bg-gray-500" />
          {/* -----------------Display-Comments------------ */}
          <div
            className="w-full max-h-[75%] bg-white overflow-y-auto py-3 px-3 flex flex-col gap-3"
            id="message-container"
          >
            <>
              {isLoading ? (
                <div className="max-h-[15rem] w-full">
                  <Loader />
                </div>
              ) : (
                <>
                  {commentData &&
                    commentData?.map((comment, i) => (
                      <div
                        className=" w-full flex flex-col gap-1 border border-gray-400 py-1 rounded-md "
                        key={comment._id}
                      >
                        {/*  */}
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-1">
                            <img
                              src={
                                comment?.user?.avatar
                                  ? comment?.user?.avatar
                                  : "/profile1.jpeg"
                              }
                              alt="Avatar"
                              className="rounded-full w-[2.2rem] h-[2.2rem] border-2 border-orange-500"
                            />
                            <span className="font-medium text-black text-[16px]">
                              {comment?.user?.name}
                            </span>
                          </div>
                          <span className="text-[12px] font-light text-gray-500">
                            {format(
                              new Date(comment?.createdAt),
                              "MMM dd 'at' p"
                            )}
                          </span>
                        </div>
                        {/* <hr className="w-full h-[1px] bg-gray-300" /> */}
                        {/* M */}
                        <div className="w-full px-2 py-1  ">
                          <div className="ml-9 bg-orange-50 text-gray-800 text-[13px] px-3 py-1.5 rounded-lg rounded-tl-none">
                            {comment?.comment.split(/(@\w+)/g).map((part, i) =>
                              part.startsWith("@") ? (
                                <span
                                  key={i}
                                  className="text-blue-600 font-semibold"
                                >
                                  {part}
                                </span>
                              ) : (
                                part
                              )
                            )}
                          </div>
                        </div>

                        <hr className="w-full h-[1px] bg-gray-100" />
                        <div className="flex items-center justify-between px-4 ">
                          <span
                            className="flex items-center cursor-pointer"
                            onClick={() =>
                              commentLikes[comment?._id]
                                ? unlikeComment(comment?._id)
                                : likeComment(comment?._id)
                            }
                          >
                            {commentLikes[comment._id] ? (
                              <AiFillLike className="h-5 w-5 text-orange-600" />
                            ) : (
                              <AiOutlineLike className="h-5 w-5 text-gray-900 dark:text-white" />
                            )}
                            ({likeCounts[comment?._id] || 0})
                          </span>
                          <span
                            className="flex gap-1 cursor-pointer relative "
                            onClick={() => {
                              setCommentId(comment?._id);
                              setShowReply(!shopReply);
                            }}
                          >
                            <span className="h-[12px] font-medium text-orange-500 hover:text-orange-600 transition-all duration-200 ">
                              Reply
                            </span>
                            <span className="">
                              ({comment?.commentReplies.length})
                            </span>
                          </span>
                        </div>
                        {/* ----------Comm_Replies----------- */}
                        {shopReply && comment._id === commentId && (
                          <>
                            <hr className="w-full h-[1px] bg-gray-200" />
                            <div className="flex items-start gap-1 w-full mt-1 px-4 ">
                              <form
                                onSubmit={handleCommentReply}
                                className="w-full border border-orange-500 rounded-md px-2 py-1"
                              >
                                <input
                                  placeholder="Enter your reply here..."
                                  onClick={() => setShowReplyEmoji(false)}
                                  value={commentReply}
                                  required
                                  onChange={(e) =>
                                    setCommentReply(e.target.value)
                                  }
                                  className="h-[2.4rem] w-full rounded-md  outline-none  resize-none py-1 px-2"
                                ></input>
                                <div className="flex items-center justify-between  ">
                                  <div className="relative " title="Add Emoji">
                                    <span
                                      onClick={() =>
                                        setShowReplyEmoji(!showReplyEmoji)
                                      }
                                    >
                                      <BsEmojiSmile className="text-yellow-600 z-20 h-6 w-6 cursor-pointer" />
                                    </span>
                                    {showReplyEmoji && (
                                      <span className="fixed bottom-[10rem] right-[30rem] z-40">
                                        <EmojiPicker
                                          onEmojiClick={onEmojiClickReply}
                                        />
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    disabled={replyLoading || !comment}
                                    className={`${style.btn} ${
                                      !comment &&
                                      "cursor-not-allowed opacity-[.5]"
                                    }   ${
                                      replyLoading && "cursor-no-drop"
                                    } shadow`}
                                  >
                                    {replyLoading ? (
                                      <BiLoaderCircle className="w-5 h-5 animate-spin text-white" />
                                    ) : (
                                      "Reply"
                                    )}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </>
                        )}
                        {shopReply &&
                          comment?.commentReplies?.map((commentReply, i) => (
                            <div className="w-full " key={commentReply._id}>
                              <div className="flex flex-col gap-2 ml-8 py-1 px-1 ">
                                {/* map */}
                                <div className="flex flex-col ga1 rounded-md border py-1">
                                  <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-1">
                                      <img
                                        src={
                                          commentReply?.user?.avatar
                                            ? commentReply?.user?.avatar
                                            : "/profile1.jpeg"
                                        }
                                        alt="Avatar"
                                        className="rounded-full w-[2rem] h-[2rem] border-2 border-sky-500"
                                      />
                                      <span className="font-medium text-black text-[16px]">
                                        {commentReply?.user?.name}
                                      </span>
                                    </div>
                                    <span className="text-[12px] font-light text-gray-500">
                                      {format(
                                        new Date(commentReply?.createdAt),
                                        "MMM dd 'at' p"
                                      )}
                                    </span>
                                  </div>
                                  {/* M */}
                                  <div className="w-full px-2 py-1 ">
                                    <p className="rounded-lg rounded-tl-none bg-orange-200 py-1 px-2 ml-4">
                                      {commentReply?.reply}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                </>
              )}
            </>
          </div>
          {/* --------Add Comm... */}

          <div className="flex items-center justify-between px-4 py-2">
            <div className="relative inline-block w-fit">
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setQuickReplyAnchorEl(e.currentTarget)}
              >
                💬 Quick Replies
              </Button>
              <Menu
                anchorEl={quickReplyAnchorEl}
                open={Boolean(quickReplyAnchorEl)}
                onClose={() => setQuickReplyAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "center",
                  horizontal: "center",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      width: 360,
                      maxHeight: 420,
                      mt: 1.5,
                      borderRadius: 2,
                      px: 1,
                      py: 0.5,
                      boxShadow: 6,
                      ml: 0, // margin from left of button (optional)
                    },
                  },
                }}
              >
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 ">
                    Saved Replies
                  </h3>

                  {templates.filter((t) => t.type === type).length === 0 ? (
                    <div className="text-sm text-gray-500 p-1">
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
                          className="flex items-center justify-between p-1 hover:bg-gray-50 rounded-md cursor-pointer transition"
                        >
                          <div className="text-sm text-gray-800 truncate max-w-[220px] pr-3">
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

                <div className="border-t border-gray-200 mt-2 pt-2 px-3">
                  <div
                    onClick={() => handleOpenTemplateDialog(null)}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 rounded-md cursor-pointer transition"
                  >
                    <AddIcon fontSize="small" />
                    Add New Template
                  </div>
                </div>
              </Menu>
            </div>
          </div>

          <div className={`flex flex-col gap-4 px-4 py-1 mb-2`}>
            <div className="flex items-start gap-1 w-full  ">
              <div className="w-[3.7rem] h-[3.7rem]">
                <img
                  src={
                    auth?.user?.avatar ? auth?.user?.avatar : "/profile1.jpeg"
                  }
                  alt="Avatar"
                  className="rounded-full w-[3.4rem] h-[3.4rem] border-2 border-orange-500"
                />
              </div>
              <form
                onSubmit={handleComment}
                className="w-full border border-orange-500 rounded-md px-2 py-1"
              >
                <div className="relative w-full">
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
                    rows={1}
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
                </div>

                <div className="flex items-center justify-between  ">
                  <div className="relative " title="Add Emoji">
                    <span onClick={() => setShowPicker(!showPicker)}>
                      <BsEmojiSmile className="text-yellow-600 z-20 h-6 w-6 cursor-pointer" />
                    </span>
                    {showPicker && (
                      <span className="absolute bottom-5 right-5 z-40">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                      </span>
                    )}
                  </div>

                  <button
                    disabled={loading || !comment}
                    className={`${style.btn} ${
                      !comment && "cursor-not-allowed opacity-[.5]"
                    }   ${loading && "cursor-no-drop"} shadow`}
                    type="submit"
                  >
                    {loading ? (
                      <BiLoaderCircle className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
