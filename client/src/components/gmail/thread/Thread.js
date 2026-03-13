import React, { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { HiReply } from "react-icons/hi";
import { Buffer } from "buffer";
import { FaCaretDown, FaCheckCircle, FaRegFileImage, FaUndoAlt } from "react-icons/fa";
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
import { useEscapeKey } from "../../../utlis/useEscapeKey.js";
import { useClickOutside } from "../../../utlis/useClickOutside.js";
import { gmailParser } from "../utils/gmailParser.js";
import EmailHeaderDetails from "./EmailHeaderDetails.js";
import AssignUser from "../shared/ui/AssignUser.js";
import AssignCategory from "../shared/ui/AssignCategory.js";
import { FiMessageSquare } from "react-icons/fi";
import IconButtonWithBadge from "../shared/ui/IconButtonWithBadge.js";
import { useOverlayStack } from "../hooks/useOverlayStack.js";
import Swal from "sweetalert2";
import { confirmAlert } from "../shared/ui/Swal.js";

export default function Thread({
  company,
  threadId,
  subject,
 setEmailDetail,
  markAsRead,
  users,
  handleUpdateThread,
  mongoThreadId,
  userId,
  categories,
  category,
  status,
  setComment,
 
 
  unreadComments,
  show
}) {

  const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);


 
 
    
  const [swalOpen, setSwalOpen] = useState(false);


  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [attachmentId, setAttachmentId] = useState("");

  const [showForward, setShowForward] = useState(false);
  const [forwardMessageId, setForwardMessageId] = useState("");

  // Track which messages have their trimmed content expanded
  const [expandedMessages, setExpandedMessages] = useState({});

  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showStickyReply, setShowStickyReply] = useState(false);


  const [messageUsers, setMessageUsers] = useState({});


  const scrollContainerRef = useRef(null);
  const threadRef = useRef(null);

  const lastMessageRef = useRef(null);
  const replySectionRef = useRef(null);
 
const scrollAnchorRef = useRef(null); // { previousHeight }


  useLayoutEffect(() => {
  if (!loadingMore && scrollAnchorRef.current) {
    const container = scrollContainerRef.current;
    if (container) {
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - scrollAnchorRef.current.previousHeight;
    }
    scrollAnchorRef.current = null; // reset
  }
}, [loadingMore]); // fires when loadingMore flips false


useLayoutEffect(() => {
  const el = scrollContainerRef.current;
  if (el && !loading) {
    el.scrollTop = el.scrollHeight;
  }
}, [loading]);

  // Sticky logic
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

  // Parse all messages at once (outside the map loop)
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
      `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/inbox/detail/pagination/${threadId}/${company}?page=${pageNumber}&limit=10`
    );

    if (data?.emailDetails) {
      const pagination = data.emailDetails.pagination;

      /**
       * ✅ HAS MORE FROM BACKEND PAGINATION
       */
      setHasMore(
        pagination?.totalPages
          ? pageNumber < pagination.totalPages
          : false
      );

      if (isLoadMore) {
        // PREPEND older messages
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
  markAsRead(threadId, company);
   getMessageUsers();   // 👈 add this
}, [threadId, company]);



const handleLoadMore = async () => {
  if (!hasMore || loadingMore) return;
  
  const container = scrollContainerRef.current;
  // Capture BEFORE any state changes
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
    <div className="flex flex-col">
        <span className="font-semibold text-gray-900 text-sm md:text-base">
          {name.slice(0, 30)}
        </span>
        {emailAddress && (
          <span className="text-xs text-gray-500 font-normal">
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
          <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
        );
      };
      
      const downloadAttachments = async (
        attachmentId,
        messageId,
        companyName,
        fileName,
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
            { responseType: "json" },
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
        params: {
          threadId,
          companyName: company,
        },
      }
    );

    if (data?.success) {
      console.log("DATA RECEIVED", data)
      setMessageUsers(data.data || {});
    }
  } catch (error) {
    console.error("Failed to fetch message users", error);
  }
};







const updateStatus = async (status) => {
  setSwalOpen(true); // block overlay
  const { isConfirmed } = await confirmAlert({ type: "warning" });
  setSwalOpen(false);

  if (!isConfirmed) return;
  await handleUpdateThread(mongoThreadId, { status: status }, "status");
  setEmailDetail(prev => ({...prev, status: status}))
};



useOverlayStack({
  ref: threadRef,
  onClose: () => {
    if (swalOpen) return; // prevent closing
    setEmailDetail(prev => ({ ...prev, threadId: "", show: false, subject: "" }))
  },
  isOpen: show,
});



 

  return (
    <div
      className="relative w-full h-full flex flex-col bg-slate-50 "
      ref={threadRef}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 w-full flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEmailDetail(prev => ({...prev, threadId: "", show: false, subject: "" }))}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <IoArrowBackOutline className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-800 truncate max-w-[200px] md:max-w-md">
            {subject}
          </h2>
        </div>

          <div className=" flex justify-center items-center gap-4 ">



     {
                status === "progress" ? (
                  <button
              className="p-1 rounded-md   text-gray-500  hover:text-green-500"
              title="Complete Thread"
              onClick={(e) => {
                
                updateStatus("completed");
              }}
            > 
              <FaCheckCircle className="size-4   " />
            </button>
                ) : (
                   <button
              className="p-1 rounded-md   text-gray-500  hover:text-red-500"
              title="Undo Complete"
              onClick={(e) => {
                 
                updateStatus("progress");
              }}
            > 
              <FaUndoAlt className="size-4   " />
            </button>
                )
              }




        <IconButtonWithBadge
          icon={FiMessageSquare}
          unreadCount={unreadComments}
          title="View Comments"
          onClick={() =>
            setComment({
              show: true,
              threadId: mongoThreadId,
              threadSubject: subject,
            })
          }
        />

                            
                   

        <AssignUser
          users={users}
          mongoThreadId={mongoThreadId}
          currentUserId={userId}
          handleUpdateThread={handleUpdateThread}
          showLabel
        />

           <AssignCategory
                    categories={categories}
                    mongoThreadId={mongoThreadId}
                    currentCategory={category}
                    handleUpdateThread={handleUpdateThread}
        
                      
        
                  />






        

          </div>

        
      </header>

      {/* Thread Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div
         ref={scrollContainerRef}
        className="flex-1   overflow-y-auto p-4 md:p-6 flex flex-col  gap-8"
        > 
        {hasMore && (
            <div className="w-full flex justify-center mb-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition flex items-center gap-2"
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
            const toHeader =
              message?.payload?.headers?.find((h) => h.name === "To")?.value ||
              "";

            // Get the pre-parsed email content for this message
            const parsedEmail = parsedMessages[i] || {
              visible: "",
              hidden: "",
              hasThread: false,
            };
            const isExpanded = expandedMessages[message.id];
            const showToggle = parsedEmail.hasThread;
            const isLast = i === messages.decryptedMessages.length - 1;


            const crmUserName = messageUsers[message.id];

            // Inside your map loop where you find fromHeader and toHeader:
            const headersArr = message?.payload?.headers || [];
           const headerDetails = {
              from: message?.payload?.headers?.find((h) => h.name === "From")?.value || "",
              to: message?.payload?.headers?.find((h) => h.name === "To")?.value || "",
              cc: message?.payload?.headers?.find((h) => h.name === "Cc")?.value || "",
              bcc: message?.payload?.headers?.find((h) => h.name === "Bcc")?.value || "",
              subject: subject, // from props
              date: message.internalDate,
              // Check if current user is the recipient
              toShort: isSentByMe ? "" : "me" 
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
                  className={`max-w-[95%] md:max-w-[85%] w-full rounded-xl border p-5 shadow-sm   transition-all ${
                    isSentByMe
                      ? "bg-orange-50/50 border-orange-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          isSentByMe ? "bg-orange-500" : "bg-blue-600"
                        }`}
                      >
                        {fromHeader.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        {separate(fromHeader)}
                         



                        <EmailHeaderDetails details={headerDetails} />
                      </div>
                    </div>
                    

                    <div  className="flex flex-col  gap-0 items-start">  
                    <div className="flex justify-end gap-3 items-center">
                      <EmailTimeDisplay internalDate={message?.internalDate} />
                      <span className="border-l w-1 h-5 border-gray-400"></span>
                      <button
                        onClick={() => {
                          setShowForward(true);
                          setForwardMessageId(message.id);
                        }}
                        title="Forward Message"
                        className="flex items-center font-medium text-gray-400 hover:text-gray-600 transition"
                      >
                        <TbArrowForwardUp className="w-5 h-5" />
                      </button>


                         
                    </div>

                       {crmUserName && ( <span className="  text-gray-400 text-xs  ">Sent by {crmUserName} </span> ) }

                    </div>

  
                  </div>

                  {/* Body Content - Visible Part */}
                  <div
                    className="text-gray-700 leading-relaxed text-[15px] prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: parsedEmail.visible || message?.snippet || "",
                    }}
                  ></div>

                  {/* Show Trimmed Content Toggle - Gmail Style */}
                  {showToggle && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleTrimmedContent(message.id)}
                        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors group"
                      >
                        <BsThreeDots className="group-hover:text-orange-500" />
                        <span className="group-hover:underline">
                          {isExpanded
                            ? "Hide quoted text"
                            : "Show trimmed content"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Hidden/Trimmed Content - Collapsed by Default */}
                  {showToggle && isExpanded && (
                    <div
                      className="mt-4 pt-4 border-t border-gray-200 text-gray-600 leading-relaxed text-[14px] prose max-w-none opacity-80"
                      dangerouslySetInnerHTML={{
                        __html: parsedEmail.hidden,
                      }}
                    ></div>
                  )}

                  {/* Attachments Section */}
                  {message?.payload?.body?.messageAttachments?.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-gray-500 font-semibold text-sm">
                        <ImAttachment className="h-4 w-4" />
                        Attachments (
                        {message.payload.body.messageAttachments.length})
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {message.payload.body.messageAttachments.map((item) => (
                          <div
                            key={item.attachmentId}
                            onClick={() =>
                              downloadAttachments(
                                item.attachmentId,
                                item.attachmentMessageId,
                                company,
                                item.attachmentFileName,
                              )
                            }
                            className="flex items-center gap-3 pl-3 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-white hover:border-orange-300 transition-all cursor-pointer group"
                          >
                            {FileIcon(item.attachmentFileName)}
                            <span className="text-xs font-medium text-gray-600 truncate max-w-[150px]">
                              {item.attachmentFileName}
                            </span>
                            <div className="p-1.5 rounded-full bg-white text-gray-400 group-hover:text-orange-500 shadow-sm border border-gray-100">
                              {isloading &&
                              attachmentId === item.attachmentId ? (
                                <TbLoader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LuDownload className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* GMAIL STYLE REPLY TRIGGER (Only after last message) */}
                {isLast && !showReplyEditor && (
                  <div className="w-full mt-8">
                    <button
                      onClick={() => {
                        setShowReplyEditor(true);
                        setTimeout(
                          () =>
                            replySectionRef.current?.scrollIntoView({
                              behavior: "smooth",
                            }),
                          100,
                        );
                      }}
                      className="flex items-center gap-2 border border-gray-600 bg-white px-6 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                    >
                      <HiReply className="text-lg" /> Reply
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* THE EDITOR SECTION */}
          <div ref={replySectionRef} className="w-full ">
            {showReplyEditor && (
              <div className="w-full py-5 ">
                <Reply
                company={company}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <Forward
              setShowForward={setShowForward}
              company={company}
              emailDetail={messages}
              getEmailDetail={getEmailDetail}
              forwardMessageId={forwardMessageId}
            />
          </div>
        </div>
      )}

      {/* STICKY BAR */}
      {showStickyReply && (
        <div className="absolute bottom-0 left-0 w-full z-40 bg-gray-50 border-t border-gray-200 px-8 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] flex justify-between items-center animate-pop duration-300">
          <button
            onClick={() => {
              if (!showReplyEditor) setShowReplyEditor(true);
              setTimeout(
                () =>
                  replySectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  }),
                100,
              );
            }}
            className="  text-gray-600 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-gray-600"
          >
            <HiReply /> Reply
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
              ME
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Reply to: {subject}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
