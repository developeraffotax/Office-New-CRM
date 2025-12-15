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

export default function EmailDetailDrawer({ id, setTicketSubject, isReplyModalOpenCb, setEmailData }) {
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
    // Multiple replies open state
  const [openReplies, setOpenReplies] = useState({});

  const toggleReply = (i) => {
    setOpenReplies((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  };

  

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


        // setEmailData((prevData) => prevData.map((item) => item._id === data.ticket._id ? data.ticket : item));


        
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


      console.log("THE RECEIVED EMAIL💛💛💚💛💛",data);
      //  return;
      if (data?.emailDetails) {
        setEmailDetail(data.emailDetails);
        // mark last message read
        const lastMsg = data.emailDetails.threadData?.messages?.slice(-1)[0];
         
        if (lastMsg?.id) {
          markAsRead(lastMsg.id, company);
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
      console.log("emailData called💛", data);
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

  // Clean Email
  // const cleanMessageHtmlAggressive = (emailHtml) => {
  //   const cleanedHtml = emailHtml
  //     .replace(/<div class="gmail_quote">([\s\S]*?)<\/div>/g, "")
  //     .replace(/<blockquote([\s\S]*?)<\/blockquote>/g, "");

  //   return cleanedHtml;
  // };

 const cleanMessageHtmlAggressive = (html = "") => {
  if (!html) return "";

  let cleaned = html;

  // Stage 1 — remove gmail quoted blocks
  cleaned = cleaned.replace(/<div class="?gmail_quote"?.*?<\/div>/gis, "");

  // Stage 2 — remove blockquotes (previous replies)
  cleaned = cleaned.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "");

  // Stage 3 — cut from "On ... wrote:"
  cleaned = cleaned.replace(/On\s.*?wrote:/gis, "");

  // Stage 4 — Outlook pattern
  cleaned = cleaned.replace(/-----Original Message-----[\s\S]*/gi, "");

  // Stage 5 — Trim whitespace + invisible chars
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

  return cleaned;
};




  function stripReplies(html) {
  let clean = html || "";

  // Generic reply markers
  clean = clean.replace(/On .* wrote:([\s\S]*)$/i, "");
  clean = clean.replace(/From:\s.*$/i, "");

  // Outlook original message
  clean = clean.replace(/-----Original Message-----[\s\S]*$/i, "");
  clean = clean.replace(/<hr[^>]*>[\s\S]*$/i, "");

  // Outlook specific divs
  clean = clean.replace(/<div[^>]*class="OutlookMessageHeader"[^>]*>[\s\S]*$/i, "");
  clean = clean.replace(/<div[^>]*id="divRplyFwdMsg"[^>]*>[\s\S]*$/i, "");
  clean = clean.replace(/<div[^>]*id="appendonsend"[^>]*>[\s\S]*$/i, "");

  // Microsoft column-style quoted reply
  clean = clean.replace(/<p[^>]*>\s*(From:|Sent:|To:|Subject:)[\s\S]*$/i, "");

  return clean.trim();
}



 function extractMessage(html) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find any WordSection div (first occurrence)
  const wordDiv = doc.querySelector("div[class*='WordSection'], div[class*='wordSection']");
  if (!wordDiv) return html;

  // Convert children to array
  const children = Array.from(wordDiv.childNodes);
  const clean = [];

  for (const node of children) {
    // ❗ Stop when reply starts (div, hr, blockquote = start of previous email)
    if (
      node.nodeName === "DIV" ||
      node.nodeName === "BLOCKQUOTE" ||
      node.nodeName === "HR"
    ) break;

    // Keep only paragraphs
    if (node.nodeName === "P") {
      clean.push(node.outerHTML);
    }
  }

  return clean.join("\n");
}



function splitMessage(html = "") {
  if (!html) return { main: "", reply: "" };

  let mainHtml = html;
  let replyHtml = "";

// 1️⃣ Use extractMessage logic: Stop at DIV, BLOCKQUOTE, or HR
//  const parser = new DOMParser();
//   const doc = parser.parseFromString(mainHtml, "text/html");
//   const wordDiv = doc.querySelector("div[class*='WordSection'], div[class*='wordSection']");

//   if (wordDiv) {
//     const children = Array.from(wordDiv.childNodes);
//     const mainParts = [];
//     const replyParts = [];
//     let isReply = false;

//     // 👇 allow more tags in main body
//     const MAIN_TAGS = new Set(["P", "OL", "UL", "LI", "SPAN", "B", "I", "U", "#text"]);

//     for (const node of children) {

//       // detect start of reply
//       if (
//         !isReply &&
//         (node.nodeName === "DIV" || node.nodeName === "BLOCKQUOTE" || node.nodeName === "HR")
//       ) {
//         isReply = true;
//       }

//       if (!isReply && MAIN_TAGS.has(node.nodeName)) {
//         // treat as main content
//         mainParts.push(node.outerHTML || node.textContent);
//       } else if (isReply) {
//         replyParts.push(node.outerHTML || node.textContent || "");
//       }
//     }

//     mainHtml = mainParts.join("\n").trim();
//     replyHtml = replyParts.join("\n").trim();
//   }

  // 2️⃣ Use stripReplies logic: Detect Outlook / generic reply markers
  const replyMarkers = [
    // /On .* wrote:([\s\S]*)$/i,
    /From:\s.*$/i,
    /-----Original Message-----[\s\S]*$/i,
    /<hr[^>]*>[\s\S]*$/i,
    /<div[^>]*class="OutlookMessageHeader"[^>]*>[\s\S]*$/i,
    /<div[^>]*id="divRplyFwdMsg"[^>]*>[\s\S]*$/i,
    /<div[^>]*id="appendonsend"[^>]*>[\s\S]*$/i,
    // /<p[^>]*>\s*(From:|Sent:|To:|Subject:)[\s\S]*$/i,
     // Match any tag wrapping From:, Sent:, To:, Subject:
    /<[^>]+>\s*(From:|Sent:|To:|Subject:)[\s\S]*$/i
  ];

  for (const marker of replyMarkers) {
    if (marker.test(mainHtml)) {
      const match = mainHtml.match(marker);
      mainHtml = mainHtml.replace(marker, "").trim();
      if (!replyHtml && match) replyHtml = match[0].trim();
      break;
    }
  }

  // 3️⃣ Use cleanMessageHtmlAggressive logic to remove Gmail / Outlook wrappers
  const gmailQuoteRegex = /<div class="?gmail_quote"?.*?<\/div>/gis;
  mainHtml = mainHtml.replace(gmailQuoteRegex, "").trim();
  if (replyHtml) replyHtml = replyHtml.replace(gmailQuoteRegex, "").trim();

  return { main: mainHtml, reply: replyHtml };
}




 

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
  const markAsRead = async (messageId, company) => {

    if(!messageId) {
      console.log("markAsRead: messageId is required");
      return;
    }
    try {
      const { data: {success, updatedTicket, message}  } = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/tickets/markAsRead/${id}`, {
        messageId,
        companyName: company || "Affotax",
      });

      if( success && setEmailData ) {
        setEmailData(prev => {

          
          return [...prev].map(ticket => {
            
            if (ticket._id === updatedTicket._id) {
              
              return { ...ticket, ...updatedTicket };
            }
            return ticket;
          })
           
          


          
        });

        toast.success("Email marked as read successfully!");
      }



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

                  {/* <div
                    className="ml-10 text-[13px]"
                    style={{ lineHeight: "1.2rem" }}
                    dangerouslySetInnerHTML={{
                      __html: message?.payload?.body?.data
                        ? cleanMessageHtmlAggressive(
                            stripReplies(extractMessage(message.payload.body.data))
                          )
                        : message?.snippet || "",
                    }}
                  ></div> */}



                  <div className="ml-10 text-[13px]" style={{ lineHeight: "1.2rem" }}>
                      {(() => {
                        const { main, reply } = splitMessage(message?.payload?.body?.data || "");
                        const hasReply = Boolean(reply);
                        const isOpen = openReplies[i]; // from your openReplies state

                        return (
                          <>
                            {/* MAIN MESSAGE */}
                            <div dangerouslySetInnerHTML={{ __html: main || message?.snippet }} />

                            {/* COLLAPSIBLE REPLY */}
                            {hasReply && (
                              <div className="mt-2">
                                <button
                                  className="flex items-center gap-1 text-[13px] text-blue-600 hover:text-blue-800"
                                  onClick={() => toggleReply(i)}
                                >
                                  <FaCaretDown
                                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                  />
                                  {isOpen ? "Show less" : "Show more"}
                                </button>

                                {isOpen && (
                                  <div
                                    className="mt-2 border border-gray-200 bg-gray-50 p-2 rounded-md text-[12px]"
                                    dangerouslySetInnerHTML={{ __html: reply }}
                                  />
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>




                  {(message?.payload?.body?.messageAttachments.filter(a => !a.isInline) || []).length > 0 && (
                    <>
                      <hr />
                      <h3 className="text-[18px] font-medium flex items-center gap-2">
                        <ImAttachment className="h-6 w-6 text-black" />
                        Attachments ({(message?.payload?.body?.messageAttachments.filter(a => !a.isInline) || []).length})
                      </h3>
                      <div className="flex items-center flex-wrap gap-4 py-3">
                        {message?.payload?.body?.messageAttachments?.filter(a => !a.isInline).map((item) => (
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

                  {/* <div
                    className=" ml-10 text-[13px]"
                    style={{ lineHeight: "1.2rem" }}
                    dangerouslySetInnerHTML={{
                      __html: message?.payload?.body?.data
                        ? cleanMessageHtmlAggressive(stripReplies(extractMessage(message.payload.body.data)))
                        : message?.snippet || "",
                    }}
                  ></div> */}


                    <div className="ml-10 text-[13px]" style={{ lineHeight: "1.2rem" }}>
                      {(() => {
                        const { main, reply } = splitMessage(message?.payload?.body?.data || "");
                        const hasReply = Boolean(reply);
                        const isOpen = openReplies[i]; // from your openReplies state

                        return (
                          <>
                            {/* MAIN MESSAGE */}
                            <div dangerouslySetInnerHTML={{ __html: main || message?.snippet }} />

                            {/* COLLAPSIBLE REPLY */}
                            {hasReply && (
                              <div className="mt-2">
                                <button
                                  className="flex items-center gap-1 text-[13px] text-blue-600 hover:text-blue-800"
                                  onClick={() => toggleReply(i)}
                                >
                                  <FaCaretDown
                                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                  />
                                  {isOpen ? "Show less" : "Show more"}
                                </button>

                                {isOpen && (
                                  <div
                                    className="mt-2 border border-gray-200 bg-gray-50 p-2 rounded-md text-[12px]"
                                    dangerouslySetInnerHTML={{ __html: reply }}
                                  />
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>





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
            setEmailData={setEmailData}
          />
        </div>
      )}
    </div>
  );
}
