import { useEffect, useState } from "react";
import { style } from "../../utlis/CommonStyle";
import { IoArrowBackOutline } from "react-icons/io5";
import { HiReply } from "react-icons/hi";
import { Buffer } from "buffer";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../utlis/Loader";
import { FaRegFileImage } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { LuDownload } from "react-icons/lu";
import { ImAttachment } from "react-icons/im";
import { TbLoader2 } from "react-icons/tb";
import { IoMdCheckboxOutline } from "react-icons/io";
import Swal from "sweetalert2";
import SendEmailReply from "../../components/Tickets/SendEmailReply";

export default function EmailDetailDrawer({ id, setTicketSubject, isReplyModalOpenCb }) {
  const navigate = useNavigate();
  const params = useParams();
  const [ticketDetail, setTicketDetail] = useState(null);
  const [emailDetail, setEmailDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [attachmentId, setAttachmentId] = useState("");
  const [showReplay, setShowReply] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [users, setUsers] = useState([]);

  

  useEffect(() => {
    isReplyModalOpenCb(Boolean(showReplay));
  }, [showReplay, isReplyModalOpenCb]);

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      const filtered =
        data?.users?.filter((user) =>
          user.role?.access?.some((item) => item?.permission?.includes("Tickets"))
        ) || [];
      setUsers(filtered);
    } catch (error) {
      console.log("getAllUsers error", error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  // Get Single Ticket
  const getSingleTicket = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/ticket/${id}`
      );
      if (data?.ticket) {
        setTicketDetail(data.ticket);
        setTicketSubject(data.ticket.subject || "No Subject");
        setIsCompleted(data.ticket.state === "complete");
        getEmailDetail(data.ticket.mailThreadId, data.ticket.company);
      }
    } catch (error) {
      console.log("getSingleTicket error", error);
    }
  };

  useEffect(() => {
    if (id) getSingleTicket();
    // eslint-disable-next-line
  }, [id]);

  // Email Detail
  const getEmailDetail = async (mailThreadId, company) => {
    if (!mailThreadId || !company) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/email/detail/${mailThreadId}/${company}/${id}`
      );
      if (data?.emailDetails) {
        setEmailDetail(data.emailDetails);
        // mark last message read
        const lastMsg = data.emailDetails.threadData?.messages?.slice(-1)[0];
        if (lastMsg?.id) {
          markAsRead(lastMsg.id);
        }
      }
    } catch (error) {
      console.log("getEmailDetail error", error);
    } finally {
      setLoading(false);
    }
  };

  const emailData = async () => {
    try {
      if (!ticketDetail?.mailThreadId || !ticketDetail?.company) return;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/email/detail/${ticketDetail.mailThreadId}/${ticketDetail.company}/${id}`
      );
      if (data?.emailDetails) setEmailDetail(data.emailDetails);
    } catch (error) {
      console.log("emailData error", error);
    }
  };

  // Regex to extract the name and email address
  const separate = (email = "") => {
    if (!email) return null;
    const emailRegex = /(.*)<(.*)>/;
    const match = email.match(emailRegex);
    const name = match ? match[1]?.trim() : email.split("<")[0]?.trim() || email;
    const emailAddress = match ? match[2]?.trim() : email.includes("<") ? email.split("<")[1]?.replace(">", "").trim() : "";
    return (
      <div className="flex items-end gap-1">
        <span className=" font-semibold text-[15px] sm:text-[17px] ">
          {name}
        </span>
        {emailAddress ? (
          <span className=" font-normal text-[12px] sm:text-[14px] text-gray-600">
            {`<${emailAddress}>`}
          </span>
        ) : null}
      </div>
    );
  };

  // Email Time
  const EmailTimeDisplay = ({ internalDate }) => {
    if (!internalDate) return <span className="text-[12px] text-gray-600">—</span>;
    const emailDate = new Date(parseInt(internalDate));
    const isValidDate = !isNaN(emailDate.getTime());
    const formattedDate = isValidDate ? emailDate.toLocaleString() : "Invalid Date";
    return <span className="text-[12px] text-gray-600">{formattedDate}</span>;
  };

  // Download Email Attachments
  const downloadAttachments = async (attachmentIdParam, messageId, companyName, fileName) => {
    if (!attachmentIdParam || !messageId || !companyName) {
      toast.error("Attachment detail missing!");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/get/attachments/${attachmentIdParam}/${messageId}/${companyName}`,
        {
          headers: { "Content-Type": "application/json" },
          responseType: "json",
        }
      );

      if (data) {
        const encodedData = data.data;
        const decodedData = Buffer.from(encodedData, "base64");
        const byteArray = new Uint8Array(decodedData.buffer);
        const blob = new Blob([byteArray], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "attachment";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Error downloading attachment!");
    } finally {
      setIsLoading(false);
    }
  };

  // Clean Email: safer — do not strip blockquotes, only remove gmail_quote wrapper and MSO cruft
  const cleanEmailBody = (emailHtml = "") => {
    if (!emailHtml) return "";
    // remove gmail quoted wrapper but keep its inner content (if any) by replacing the wrapper with its inner HTML
    emailHtml = emailHtml.replace(/<div class="gmail_quote">([\s\S]*?)<\/div>/gi, "$1");
    // remove MSO cruft (keep structure)
    emailHtml = emailHtml.replace(
      /<p class=MsoNormal><o:p>&nbsp;<\/o:p><\/p><div style='border:none;border-top:solid [\s\S]*?<\/div><p class=MsoNormal>[\s\S]*?<o:p><\/o:p><\/p><\/div>/gi,
      ""
    );
    // ensure images are responsive (if server-side not added)
    emailHtml = emailHtml.replace(/<img([^>]*?)>/gi, (tag, attrs) => {
      if (/style\s*=/.test(attrs)) {
        if (!/max-width:/.test(attrs)) {
          return tag.replace(/style\s*=\s*(['"])(.*?)\1/, (m, q, style) => `style=${q}${style} max-width:100%;height:auto;${q}`);
        }
        return tag;
      }
      return `<img ${attrs} style="max-width:100%;height:auto;" />`;
    });

    return emailHtml;
  };




 const getNewMessageContent = (emailHtml) => {
  if (!emailHtml) return "";

  let cleaned = emailHtml;

  // 1️⃣ Remove Gmail quote divs recursively
  cleaned = cleaned.replace(/<div class="?gmail_quote"?[\s\S]*?<\/div>/gi, "");

  // 2️⃣ Remove all blockquotes (nested)
  cleaned = cleaned.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "");

  // 3️⃣ Remove lines like "On Thu, 23 May 2025, ... wrote:"
  cleaned = cleaned.replace(
    /^On\s.+?wrote:/gim,
    ""
  );

  // 4️⃣ Remove invisible chars, extra spaces, empty lines
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  cleaned = cleaned.replace(/(\r?\n){2,}/g, "\n"); // collapse multiple line breaks

  return cleaned;
};


  // File Icon
  const FileIcon = (fileName = "") => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const isImage = imageExtensions.includes(fileExtension);
    return isImage ? (
      <FaRegFileImage className="h-6 w-6 text-orange-500" />
    ) : (
      <FaRegFileLines className="h-6 w-6 text-sky-500" />
    );
  };

  // Mark as Read
  const markAsRead = async (messageId) => {
    if (!ticketDetail) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/tickets/markAsRead/${id}`, {
        messageId,
        companyName: ticketDetail.company || "Affotax",
      });
    } catch (error) {
      console.log("markAsRead error", error);
    }
  };

  const handleStatusComplete = async (ticketId) => {
    if (!ticketId) {
      toast.error("Ticket id is required!");
      return;
    }
    try {
      const state = isCompleted ? "progress" : "complete";
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { state }
      );
      if (data?.success) {
        toast.success("Status completed successfully!");
        setIsCompleted(data?.ticket?.state === "complete");
      }
    } catch (error) {
      console.log("handleStatusComplete error", error);
      toast.error(error?.response?.data?.message || "Error");
    }
  };

  const handleUpdateTicketStatusConfirmation = (ticketId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Do it!",
      target: "#emailDetailDrawer",
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusComplete(ticketId);
        Swal.fire({
          title: "Success!",
          text: "Your action completed successfully!",
          icon: "success",
          target: "#emailDetailDrawer",
        });
      }
    });
  };

  const updateJobHolder = async (jobHolder) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${id}`,
        { jobHolder }
      );
      if (data?.ticket) {
        toast.success("Job Holder updated successfully!");
        setTicketDetail((prev) => ({ ...(prev || {}), jobHolder: data.ticket.jobHolder }));
      }
    } catch (error) {
      console.log("updateJobHolder error", error);
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div
      id="emailDetailDrawer"
      className=" relative w-full h-[100%] flex flex-col  border border-gray-200 rounded-lg  shadow-sm "
    >
      <div className="w-full flex flex-col items-start justify-start   px-4 py-3 border-b border-gray-200 gap-4 ">
        <div className="flex items-center gap-4 self-end">
          <select
            value={ticketDetail?.jobHolder || "empty"}
            className="w-full h-[2rem] rounded-md border border-gray-400 outline-none text-[15px] px-2 py-1 "
            onChange={(e) => {
              updateJobHolder(e.target.value);
            }}
          >
            <option value="empty">Select Jobholder</option>
            {users?.map((jobHold, i) => (
              <option value={jobHold?.name} key={i}>
                {jobHold.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleUpdateTicketStatusConfirmation(id)}
            style={{ padding: ".4rem 1rem" }}
            className="flex items-center gap-1 text-[15px] bg-orange-500 text-white rounded-md   hover:bg-orange-600 transition-all duration-300"
          >
            <IoMdCheckboxOutline className="text-[18px] mb-[2px]" />
            <h3 className="text-sm text-nowrap"> {isCompleted ? "Undo Complete" : "Complete"} </h3>
          </button>

          <button
            className={`${style.button1} text-[15px] flex items-center gap-1 `}
            onClick={() => setShowReply(true)}
            style={{ padding: ".4rem 1rem" }}
            disabled={loading}
          >
            <HiReply className="h-4 w-4" /> Reply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-full">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-col gap-4 py-2 pb-4 px-4 w-full h-[100%] overflow-y-auto bg-white">
          {emailDetail?.decryptedMessages?.map((message, i) => (
            <div className="flex flex-col gap-4" key={message?.id || i}>
              {/* Sent by me */}
              {message?.payload?.body?.sentByMe || message?.labelIds?.includes("SENT") ? (
                <div className="flex flex-col gap-2 bg-orange-50 px-2 py-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-[2.3rem] h-[2.3rem] border border-orange-600 rounded-full overflow-hidden object-cover">
                        <img src="/favicon1.png" alt="Logo" className="w-full h-full " />
                      </div>
                      <div className="flex flex-col gap-0">
                        {separate(message?.payload?.headers?.find((h) => h.name === "From")?.value)}
                        <span className="text-[12px] text-gray-600 flex items-center gap-2 ">
                          to{" "}
                          {message?.payload?.headers?.find((h) => h.name === "To")?.value}
                          <span>
                            <FaCaretDown className="h-4 w-4 cursor-pointer" />
                          </span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <EmailTimeDisplay internalDate={message?.internalDate} />
                    </div>
                  </div>

                  <div
                    className="ml-10 text-[15px]"
                    style={{ lineHeight: "1.4rem" }}
                    dangerouslySetInnerHTML={{
                      __html: message?.payload?.body?.data
                        ? getNewMessageContent(
                            String(message.payload.body.data).replace(/<\/p>\s*<p>/g, "</p><br><p>")
                          )
                        : message?.snippet || "",
                    }}
                  ></div>

                  {(message?.payload?.body?.messageAttachments || []).length > 0 && (
                    <>
                      <hr />
                      <h3 className="text-[18px] font-medium flex items-center gap-2">
                        <ImAttachment className="h-6 w-6 text-black" />
                        Attachments ({(message?.payload?.body?.messageAttachments || []).length})
                      </h3>
                      <div className="flex items-center flex-wrap gap-4 py-3">
                        {message?.payload?.body?.messageAttachments?.map((item) => (
                          <div
                            className=" flex items-center gap-4 border bg-gray-50 hover:bg-gray-100 cursor-pointer px-3 py-2 transition-all duration-300 rounded-md hover:shadow-md font-medium text-[13px] "
                            key={item.attachmentId || item.attachmentMessageId}
                            onClick={() => {
                              downloadAttachments(item.attachmentId, item.attachmentMessageId, ticketDetail?.company, item.attachmentFileName);
                              setAttachmentId(item.attachmentId);
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span className="bg-gray-500/30 rounded-full p-[7px]">{FileIcon(item.attachmentFileName)}</span>
                              <span>{item?.attachmentFileName}</span>
                            </div>
                            <span className="bg-gray-300/30 hover:bg-gray-500/30 transition-all duration-300 cursor-pointer rounded-full p-[7px]">
                              {isloading && attachmentId === item.attachmentId ? (
                                <TbLoader2 className="h-5 w-5 animate-spin text-orange-500" />
                              ) : (
                                <LuDownload className="h-5 w-5 text-sky-500" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Received message
                <div className="flex flex-col gap-2 bg-sky-50 px-2 py-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className=" flex items-center justify-center w-[2.3rem] h-[2.3rem] border border-sky-600 bg-green-800 rounded-full overflow-hidden object-cover">
                        <span className="text-2xl font-medium uppercase text-white">
                          {(() => {
                            const fromVal = message?.payload?.headers?.find((h) => h.name.toLowerCase() === "from")?.value || "U";
                            return fromVal.charAt(0);
                          })()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0">
                        <h3 className="capitalize text-[14px] flex items-center gap-1">
                          {(() => {
                            const fromHeader = message?.payload?.headers?.find((header) => header.name === "From")?.value || "No Sender";
                            const [name, email] = fromHeader.split(/(?=<)/);
                            return (
                              <>
                                <span className="font-semibold text-[16px]">{String(name || "").trim().slice(0, 20)}</span>{" "}
                                {email || ""}
                              </>
                            );
                          })()}
                        </h3>
                        <span className="text-[12px] text-gray-600 flex items-center gap-2 ">
                          to me
                          <span>
                            <FaCaretDown className="h-4 w-4 cursor-pointer" />
                          </span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <EmailTimeDisplay internalDate={message?.internalDate} />
                    </div>
                  </div>

                  <div
                    className=" ml-10 text-[15px]"
                    style={{ lineHeight: "1.4rem" }}
                    dangerouslySetInnerHTML={{
                      __html: message?.payload?.body?.data
                        ? cleanEmailBody(String(message.payload.body.data).replace(/<\/p>\s*<p>/g, "</p><br><p>"))
                        : message?.snippet || "",
                    }}
                  ></div>

                  {(message?.payload?.body?.messageAttachments || []).length > 0 && (
                    <>
                      <hr />
                      <h3 className="text-[18px] font-medium flex items-center gap-2">
                        <ImAttachment className="h-6 w-6 text-black" />
                        Attachments ({(message?.payload?.body?.messageAttachments || []).length})
                      </h3>

                      <div className="flex items-center flex-wrap gap-4 py-3">
                        {message?.payload?.body?.messageAttachments?.map((item) => {
                          const contentDispositionHeader = item.attachmentHeaders?.find((header) => header.name === "Content-Disposition");
                          const isInline = contentDispositionHeader?.value?.toLowerCase().includes("inline");
                          return (
                            <div
                              className=" flex items-center gap-4 border bg-gray-50 hover:bg-gray-100 cursor-pointer px-3 py-2 transition-all duration-300 rounded-md hover:shadow-md font-medium text-[13px] "
                              key={item.attachmentId || item.attachmentMessageId}
                              onClick={() => {
                                downloadAttachments(item.attachmentId, item.attachmentMessageId, ticketDetail?.company, item.attachmentFileName);
                                setAttachmentId(item.attachmentId);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="bg-gray-500/30 rounded-full p-[7px]">{FileIcon(item?.attachmentFileName)}</span>
                                <span>{item?.attachmentFileName}</span>
                              </div>

                              <span className="bg-gray-300/30 hover:bg-gray-500/30 transition-all duration-300 cursor-pointer rounded-full p-[7px]">
                                {isloading && attachmentId === item.attachmentId ? (
                                  <TbLoader2 className="h-5 w-5 animate-spin text-orange-500" />
                                ) : (
                                  <LuDownload className="h-5 w-5 text-sky-500" />
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Email Reply */}
      {showReplay && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full py-1 bg-gray-700/70 flex items-center justify-center">
          <SendEmailReply
            setShowReply={setShowReply}
            subject={emailDetail?.subject}
            threadId={emailDetail?.threadId}
            company={ticketDetail?.company}
            ticketId={ticketDetail?._id}
            emailSendTo={emailDetail?.recipients?.[0]}
            getEmailDetail={emailData}
          />
        </div>
      )}
    </div>
  );
}
