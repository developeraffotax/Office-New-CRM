import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import { HiReply } from "react-icons/hi";
import { Buffer } from "buffer";
import { FaRegFileImage } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { LuDownload } from "react-icons/lu";
import { ImAttachment } from "react-icons/im";
import { TbArrowForwardUp, TbLoader2 } from "react-icons/tb";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";
import Reply from "../reply/Reply.js";
import Loader from "../../../utlis/Loader.js";
import Forward from "../forward/Forward.js";
import { gmailParser } from "../utils/gmailParser.js";
import EmailHeaderDetails from "./EmailHeaderDetails.js";
import { useSelector } from "react-redux";
import ThreadActivityPanel from "../shared/ui/ThreadActivityPanel.js";
import EmailSummaryDrawer from "./EmailSummaryDrawer.js";
import { hasSubrole } from "../../../utlis/checkPermission.js";
import ThreadHeaderMobile from "./ThreadHeaderMobile.js";
import { useMailThread } from "../hooks/useMailThread.js";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "../shared/ui/Swal.js";

export default function ThreadMobile({
  companyName,
  threadId,
  onClose = () => {},
  users = [],
  categories = [],
  openComments = () => {},
}) {
  const { auth } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    thread,
    loading: threadLoading,
    handleUpdateThread,
    markAsRead,
    deleteThread,
  } = useMailThread({ threadId, companyName });

  const { subject, userId, category, status } = thread || {};
  const mongoThreadId = thread?._id;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [summaryDrawer, setSummaryDrawer] = useState({ open: false });
  const [swalOpen, setSwalOpen] = useState(false);

  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [attachmentId, setAttachmentId] = useState("");

  const [showForward, setShowForward] = useState(false);
  const [forwardMessageId, setForwardMessageId] = useState("");
  const [expandedMessages, setExpandedMessages] = useState({});
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showStickyReply, setShowStickyReply] = useState(false);
  const [messageUsers, setMessageUsers] = useState({});

  const scrollContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const replySectionRef = useRef(null);
  const scrollAnchorRef = useRef(null);

  const [activityPanel, setActivityPanel] = useState({
    show: false,
    threadId: null,
  });

  const scope = useMemo(() => {
    const hasEditAccess = hasSubrole(auth.user, "Inbox", "Edit") || false;
    const hasDeleteAccess = hasSubrole(auth.user, "Inbox", "Delete") || false;
    return { edit: hasEditAccess, delete: hasDeleteAccess };
  }, [auth]);

  // Keep scroll position when loading older messages
  useLayoutEffect(() => {
    if (!loadingMore && scrollAnchorRef.current) {
      const container = scrollContainerRef.current;
      if (container) {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - scrollAnchorRef.current.previousHeight;
      }
      scrollAnchorRef.current = null;
    }
  }, [loadingMore]);

  // Scroll to bottom on first load
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (el && !loading) {
      el.scrollTop = el.scrollHeight;
    }
  }, [loading]);

  // Sticky reply bar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (!replySectionRef.current) return;
      const rect = replySectionRef.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setShowStickyReply(rect.top > containerRect.bottom);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [showReplyEditor]);

  const parsedMessages = useMemo(() => {
    return (
      messages?.decryptedMessages?.map((message) => {
        return gmailParser(message?.payload?.body?.data || "");
      }) || []
    );
  }, [messages?.decryptedMessages]);

  const getEmailDetail = async (pageNumber = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/inbox/detail/pagination/${threadId}/${companyName}?page=${pageNumber}&limit=10`
      );

      if (data?.emailDetails) {
        const pagination = data.emailDetails.pagination;
        setHasMore(
          pagination?.totalPages ? pageNumber < pagination.totalPages : false
        );

        if (isLoadMore) {
          setMessages((prev) => ({
            ...data.emailDetails,
            decryptedMessages: [
              ...data.emailDetails.decryptedMessages,
              ...(prev?.decryptedMessages || []),
            ],
          }));
        } else {
          setMessages(data.emailDetails);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    getEmailDetail(1, false);
    markAsRead(threadId, companyName);
    getMessageUsers();
  }, [threadId, companyName]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    const container = scrollContainerRef.current;
    scrollAnchorRef.current = { previousHeight: container.scrollHeight };
    const nextPage = page + 1;
    setPage(nextPage);
    await getEmailDetail(nextPage, true);
  };

  const separate = (email) => {
    const emailRegex = /(.*)<(.*)>/;
    const match = email?.match(emailRegex);
    const name = match ? match[1]?.trim() : email || "Unknown";
    const emailAddress = match ? match[2]?.trim() : "";

    return (
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-gray-900 text-sm truncate">
          {name}
        </span>
        {emailAddress && (
          <span className="text-xs text-gray-500 font-normal truncate">
            {emailAddress}
          </span>
        )}
      </div>
    );
  };

  const EmailTimeDisplay = ({ internalDate }) => {
    const emailDate = new Date(parseInt(internalDate));
    const formattedDate = !isNaN(emailDate.getTime())
      ? emailDate.toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Invalid Date";
    return (
      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
        {formattedDate}
      </span>
    );
  };

  const downloadAttachments = async (
    attachmentId,
    messageId,
    companyName,
    fileName
  ) => {
    if (!attachmentId || !messageId || !companyName) {
      toast.error("Attachment detail missing!");
      return;
    }
    setIsLoading(true);
    setAttachmentId(attachmentId);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/get/attachments/${attachmentId}/${messageId}/${companyName}`,
        { responseType: "json" }
      );
      if (data) {
        const decodedData = Buffer.from(data.data, "base64");
        const blob = new Blob([new Uint8Array(decodedData.buffer)], {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error("Download failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const FileIcon = (fileName) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
    const ext = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(ext) ? (
      <FaRegFileImage className="text-orange-500" />
    ) : (
      <FaRegFileLines className="text-blue-500" />
    );
  };

  const toggleTrimmedContent = (messageId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const getMessageUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/thread-message-users`,
        {
          params: { threadId, companyName },
        }
      );
      if (data?.success) {
        setMessageUsers(data.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch message users", error);
    }
  };

  const updateStatus = async (status) => {
    setSwalOpen(true);
    const { isConfirmed } = await confirmAlert({ type: "warning" });
    setSwalOpen(false);
    if (!isConfirmed) return;
    await handleUpdateThread(mongoThreadId, { status });
  };

  const deleteThreadHandler = async (threadId, company) => {
    setSwalOpen(true);
    const { isConfirmed } = await confirmAlert({ type: "warning" });
    setSwalOpen(false);
    if (!isConfirmed) return;

    const success = await deleteThread(threadId, company, false);
    if (success) navigate("/mail");
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50">
      {/* Mobile Header */}
      <ThreadHeaderMobile
        thread={thread}
        subject={subject}
        company={companyName}
        threadId={threadId}
        mongoThreadId={mongoThreadId}
        status={status}
        category={category}
        categories={categories}
        users={users}
        userId={userId}
        unreadComments={0}
        scope={scope}
        handleUpdateThread={handleUpdateThread}
        onBack={onClose}
        onShowSummary={() => setSummaryDrawer({ open: true })}
        onShowActivity={() =>
          setActivityPanel({ show: true, threadId: mongoThreadId })
        }
        onDeleteThread={() => deleteThreadHandler(threadId, companyName)}
        onUpdateStatus={updateStatus}
        openComments={openComments}
        firstMessageForPrefilling={messages?.decryptedMessages?.[0] || null}
      />

      {/* Thread Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5"
        >
          {hasMore && (
            <div className="w-full flex justify-center mb-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full active:bg-gray-100 transition flex items-center gap-2"
              >
                {loadingMore && (
                  <TbLoader2 className="w-4 h-4 animate-spin" />
                )}
                {loadingMore ? "Loading..." : "Load older messages"}
              </button>
            </div>
          )}

          {messages?.decryptedMessages?.map((message, i) => {
            const isSentByMe =
              message?.payload?.body?.sentByMe ||
              message?.labelIds?.includes("SENT");
            const fromHeader =
              message?.payload?.headers?.find((h) => h.name === "From")
                ?.value || "";

            const parsedEmail = parsedMessages[i] || {
              visible: "",
              hidden: "",
              hasThread: false,
            };
            const isExpanded = expandedMessages[message.id];
            const showToggle = parsedEmail.hasThread;
            const isLast = i === messages.decryptedMessages.length - 1;

            const senderName = messageUsers[message.id]?.senderName || "";
            const sentFrom = messageUsers[message.id]?.sentFrom || "";

            const headerDetails = {
              from:
                message?.payload?.headers?.find((h) => h.name === "From")
                  ?.value || "",
              to:
                message?.payload?.headers?.find((h) => h.name === "To")
                  ?.value || "",
              cc:
                message?.payload?.headers?.find((h) => h.name === "Cc")
                  ?.value || "",
              bcc:
                message?.payload?.headers?.find((h) => h.name === "Bcc")
                  ?.value || "",
              subject,
              date: message.internalDate,
              toShort: isSentByMe ? "" : "me",
            };

            return (
              <div
                key={message?.id}
                ref={isLast ? lastMessageRef : null}
                className={`flex flex-col ${
                  isSentByMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`w-full max-w-[98%] rounded-xl border p-3.5 shadow-sm ${
                    isSentByMe
                      ? "bg-orange-50/50 border-orange-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          isSentByMe ? "bg-orange-500" : "bg-blue-600"
                        }`}
                      >
                        {fromHeader.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        {separate(fromHeader)}
                        <EmailHeaderDetails details={headerDetails} />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <div className="flex items-center gap-2">
                        <EmailTimeDisplay internalDate={message?.internalDate} />
                        <button
                          onClick={() => {
                            setShowForward(true);
                            setForwardMessageId(message.id);
                          }}
                          className="p-1 text-gray-400 active:text-gray-600"
                          title="Forward"
                        >
                          <TbArrowForwardUp className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      {senderName && (
                        <span className="text-gray-500 text-[11px] flex items-center gap-1">
                          <span>by {senderName}</span>
                          {sentFrom && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{sentFrom}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    className="text-gray-700 leading-relaxed text-[14px] max-w-none break-words"
                    dangerouslySetInnerHTML={{
                      __html: parsedEmail.visible || message?.snippet || "",
                    }}
                  />

                  {/* Trimmed content toggle */}
                  {showToggle && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleTrimmedContent(message.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 active:text-gray-700 font-medium"
                      >
                        <BsThreeDots />
                        <span>
                          {isExpanded
                            ? "Hide quoted text"
                            : "Show trimmed content"}
                        </span>
                      </button>
                    </div>
                  )}

                  {showToggle && isExpanded && (
                    <div
                      className="mt-3 pt-3 border-t border-gray-200 text-gray-600 leading-relaxed text-[13px] opacity-80"
                      dangerouslySetInnerHTML={{
                        __html: parsedEmail.hidden,
                      }}
                    />
                  )}

                  {/* Attachments */}
                  {message?.payload?.body?.messageAttachments?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2 text-gray-500 font-semibold text-xs">
                        <ImAttachment className="h-3.5 w-3.5" />
                        Attachments (
                        {message.payload.body.messageAttachments.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.payload.body.messageAttachments.map((item) => (
                          <div
                            key={item.attachmentId}
                            onClick={() =>
                              downloadAttachments(
                                item.attachmentId,
                                item.attachmentMessageId,
                                companyName,
                                item.attachmentFileName
                              )
                            }
                            className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full active:bg-white active:border-orange-300 cursor-pointer"
                          >
                            {FileIcon(item.attachmentFileName)}
                            <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]">
                              {item.attachmentFileName}
                            </span>
                            <div className="p-1 rounded-full bg-white text-gray-400 border border-gray-100">
                              {isloading &&
                              attachmentId === item.attachmentId ? (
                                <TbLoader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <LuDownload className="h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply trigger (only after last message) */}
                {isLast && !showReplyEditor && (
                  <div className="w-full mt-5">
                    <button
                      onClick={() => {
                        setShowReplyEditor(true);
                        setTimeout(
                          () =>
                            replySectionRef.current?.scrollIntoView({
                              behavior: "smooth",
                            }),
                          100
                        );
                      }}
                      className="flex items-center gap-2 border border-gray-500 bg-white px-5 py-2 rounded-full text-sm font-medium text-gray-700 active:bg-gray-100"
                    >
                      <HiReply className="text-base" /> Reply
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Reply editor */}
          <div ref={replySectionRef} className="w-full">
            {showReplyEditor && (
              <div className="w-full py-4">
                <Reply
                  company={companyName}
                  emailDetail={messages}
                  getEmailDetail={() => {
                    getEmailDetail();
                    setShowReplyEditor(false);
                  }}
                  setShowReplyEditor={setShowReplyEditor}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForward && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh]">
            <Forward
              setShowForward={setShowForward}
              company={companyName}
              emailDetail={messages}
              getEmailDetail={getEmailDetail}
              forwardMessageId={forwardMessageId}
            />
          </div>
        </div>
      )}

      {/* Sticky Reply Bar */}
      {showStickyReply && (
        <div className="absolute bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] flex justify-between items-center">
          <button
            onClick={() => {
              if (!showReplyEditor) setShowReplyEditor(true);
              setTimeout(
                () =>
                  replySectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  }),
                100
              );
            }}
            className="text-gray-700 px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-gray-500 active:bg-gray-50"
          >
            <HiReply /> Reply
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              ME
            </div>
            <span className="text-xs font-medium text-gray-600 truncate max-w-[140px]">
              {subject}
            </span>
          </div>
        </div>
      )}

      {activityPanel.show && (
        <ThreadActivityPanel
          threadId={activityPanel.threadId}
          onClose={() =>
            setActivityPanel({ show: false, threadId: null })
          }
        />
      )}

      <EmailSummaryDrawer
        isOpen={summaryDrawer.open}
        onClose={() => setSummaryDrawer({ open: false })}
        threadId={threadId}
        companyName={companyName}
      />
    </div>
  );
}