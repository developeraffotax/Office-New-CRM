import React, { useEffect, useState } from "react";
import Layout from "../Loyout/Layout";
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
import SendEmailReply from "../Tickets/SendEmailReply";
import { IoMdCheckboxOutline } from "react-icons/io";
import Swal from "sweetalert2";

export default function EmailDetailDrawer({ id, toggleDrawer }) {
  const navigate = useNavigate();
  const params = useParams();
  const [ticketDetail, setTicketDetail] = useState([]);
  const [emailDetail, setEmailDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [attachmentId, setAttachmentId] = useState("");
  const [showReplay, setShowReply] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);
      const [users, setUsers] = useState([]);

  console.log("Ticket Detail:", ticketDetail);


  
        
        const getAllUsers = async () => {
          try {
            const { data } = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
            );
            setUsers( data?.users?.filter((user) => user.role?.access?.some((item) => item?.permission?.includes("Tickets") ) ) || [] );
      
        
      
            
      
          } catch (error) {
            console.log(error);
          }
        };
  
  
        useEffect(() => {
          getAllUsers();
          //eslint-disable-next-line
        }, []);



  //   Get Single Ticket
  const getSingleTicket = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/ticket/${id}`
      );
      if (data) {
        setTicketDetail(data?.ticket);
        setIsCompleted(data?.ticket?.state === "complete");
        getEmailDetail(data?.ticket?.mailThreadId, data?.ticket?.company);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleTicket();

    //eslint-disable-next-line
  }, []);

  //   Email Detail
  const getEmailDetail = async (mailThreadId, company) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/email/detail/${mailThreadId}/${company}/${id}`
      );
      if (data) {
        console.log("EMAIL DATA SINGLE>>>>>>>>>>>>>>>>>>>>>>>>", data);
        setLoading(false);
        setEmailDetail(data.emailDetails);
        //
        markAsRead(
          data.emailDetails.threadData.messages[
            data.emailDetails.threadData.messages.length - 1
          ].id
        );
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const emailData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/email/detail/${ticketDetail.mailThreadId}/${ticketDetail.company}/${id}`
      );
      if (data) {
        setEmailDetail(data?.emailDetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Regex to extract the name and email address
  const separate = (email) => {
    const emailRegex = /(.*)<(.*)>/;
    const match = email?.match(emailRegex);

    const name = match ? match[1]?.trim() : "";

    const emailAddress = match ? match[2]?.trim() : "";

    return (
      <>
        <div className="flex items-end gap-1">
          <span className=" font-semibold text-[15px] sm:text-[17px] ">
            {name}
          </span>
          <span className=" font-normal text-[12px] sm:text-[14px] text-gray-600">
            {`<${emailAddress}>`}
          </span>
        </div>
      </>
    );
  };

  //   Email Time
  const EmailTimeDisplay = ({ internalDate }) => {
    // Parse the internalDate and convert it to a Date object
    const emailDate = new Date(parseInt(internalDate));

    // Check if the date is valid
    const isValidDate = !isNaN(emailDate.getTime());

    // Format the date if it's valid, otherwise show an error message
    const formattedDate = isValidDate
      ? emailDate.toLocaleString()
      : "Invalid Date";

    return <span className="text-[12px] text-gray-600">{formattedDate}</span>;
  };

  // ------------Download Email Attachments-------->
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

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/get/attachments/${attachmentId}/${messageId}/${companyName}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "json",
        }
      );

      if (data) {
        const jsonData = data;

        const encodedData = jsonData.data;

        const decodedData = Buffer.from(encodedData, "base64");

        const byteArray = new Uint8Array(decodedData.buffer);

        const blob = new Blob([byteArray], {
          type: "application/octet-stream",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;

        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(url);

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Error downloading attachment!");
      setIsLoading(false);
    }
  };

  // Clean Email
  const cleanEmailBody = (emailHtml) => {
    const cleanedHtml = emailHtml
      .replace(/<div class="gmail_quote">([\s\S]*?)<\/div>/g, "")
      .replace(/<blockquote([\s\S]*?)<\/blockquote>/g, "");

    return cleanedHtml;
  };

  // ---------File Type--------->
  const FileIcon = (fileName) => {
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
    if (!ticketDetail) {
      return;
    }
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/markAsRead/${id}`,
        { messageId, companyName: ticketDetail.company || "Affotax" }
      );
    } catch (error) {
      console.log(error);
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
        { state: state }
      );
      if (data?.success) {
        const updateTicket = data?.ticket;
        toast.success("Status completed successfully!");
        setIsCompleted(data?.ticket?.state === "complete");

        // setEmailData((prevData) =>
        //   prevData.filter((item) => item._id !== updateTicket._id)
        // );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // ------------Update Status------------>
  const handleUpdateTicketStatusConfirmation = (ticketId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Do it!",

      target: "#emailDetailDrawer", // Target the drawer
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusComplete(ticketId);

        Swal.fire({
          title: "Success!",
          text: "Your action completed successfully!",
          icon: "success",
          target: "#emailDetailDrawer", // Target the drawer
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
          if (data) {
            const updatedTicket = data?.ticket;
            toast.success("Job Holder updated successfully!");
            setTicketDetail((prevData) => {
              return {
                ...prevData,
                jobHolder: updatedTicket.jobHolder,
              }
          });
  
  
  
          }
        } catch (error) {
          console.log(error);
          toast.error(error.response?.data?.message || "An error occurred");
        }
      };

  return (
    <>
      <div
        id="emailDetailDrawer"
        className=" relative w-full h-[100%] flex flex-col bg-gray-50 "
      >
        <div className="w-full flex flex-col items-start justify-start bg-white px-4 py-3 border-b border-gray-200 gap-4 ">
          <div className="flex items-center justify-center gap-3">

             



            <span
              // onClick={() => navigate("/tickets")}
              onClick={() => toggleDrawer(false)}
              className="rounded-full p-1 bg-gray-100 hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
              <IoArrowBackOutline className="h-5 w-5 cursor-pointer" />
            </span>
            <h2 className="text-[2xl] font-semibold text-black">
              {ticketDetail?.subject}
            </h2>
          </div>
          <div className="flex items-center gap-4 self-end">

            <select
                  value={ticketDetail?.jobHolder || "empty"}
                  className="w-full h-[2rem] rounded-md border border-gray-400 outline-none text-[15px] px-2 py-1 bg-gray-50"
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
              <h3> {isCompleted ? "Undo Complete" : "Complete"} </h3>
            </button>

            <button
              className={`${style.button1} text-[15px] flex items-center gap-1 `}
              onClick={() => setShowReply(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              <HiReply className="h-4 w-4" /> Reply
            </button>
          </div>
        </div>
        {/* Email Detail */}
        {loading ? (
          <div className="w-full h-full">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-col gap-4  bg-white py-2 pb-4 px-4 w-full h-[100%] overflow-y-auto">
            {emailDetail?.decryptedMessages &&
              emailDetail?.decryptedMessages?.map((message, i) => (
                <div className="flex flex-col gap-4" key={i}>
                  {console.log("THE MESSAGE >>", message)}

                  {/* || message?.labelIds?.includes('SENT') */}
                  {message?.payload?.body?.sentByMe ||
                  message?.labelIds?.includes("SENT") ? (
                    <div className="flex flex-col gap-2 bg-orange-50 px-2 py-2 rounded-md">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-[2.3rem] h-[2.3rem] border border-orange-600 rounded-full overflow-hidden object-cover">
                            <img
                              src="/favicon1.png"
                              alt="Logo"
                              className="w-full h-full "
                            />
                          </div>
                          <div className="flex flex-col gap-0">
                            {/* {separate(message?.payload?.headers[1]?.value) } */}
                            {separate(
                              message?.payload?.headers.find(
                                (h) => h.name === "From"
                              )?.value
                            )}
                            <span className="text-[12px] text-gray-600 flex items-center gap-2 ">
                              to{" "}
                              {/* {message?.payload?.headers[2]?.value.slice(0, 12)}{" "} */}
                              {
                                message?.payload?.headers.find(
                                  (h) => h.name === "To"
                                )?.value
                              }
                              <span>
                                <FaCaretDown className="h-4 w-4 cursor-pointer" />
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="">
                          {EmailTimeDisplay({
                            internalDate: message?.internalDate,
                          })}
                        </div>
                      </div>
                      {/* -------------Message------------ */}
                      <div
                        className="ml-10 text-[15px]"
                        style={{ lineHeight: "1rem" }}
                        dangerouslySetInnerHTML={{
                          __html: message?.payload?.body?.data
                            ? cleanEmailBody(
                                message?.payload?.body?.data.replace(
                                  /<\/p>\s*<p>/g,
                                  "</p><br><p>"
                                )
                              )
                            : message?.snippet,
                        }}
                        // dangerouslySetInnerHTML={{
                        //   __html: (message?.payload?.body?.data || "").replace(
                        //     /<\/p>\s*<p>/g,
                        //     "</p><br><p>"
                        //   ),
                        // }}
                      ></div>

                      {/* ------------Attachments----------- */}
                      {message?.payload?.body?.messageAttachments.length >
                        0 && (
                        <>
                          <hr />
                          <h3 className="text-[18px] font-medium flex items-center gap-2">
                            <ImAttachment className="h-6 w-6 text-black" />
                            Attachments
                            {`(${message?.payload?.body?.messageAttachments.length})`}
                          </h3>
                          <div className="flex items-center flex-wrap gap-4 py-3">
                            {message?.payload?.body?.messageAttachments?.map(
                              (item) => {
                                return (
                                  <div
                                    className=" flex items-center gap-4 border bg-gray-50 hover:bg-gray-100 cursor-pointer px-3 py-2 transition-all duration-300 rounded-md hover:shadow-md font-medium text-[13px] "
                                    key={item.attachmentId}
                                    onClick={() => {
                                      downloadAttachments(
                                        item.attachmentId,
                                        item.attachmentMessageId,
                                        ticketDetail.company,
                                        item.attachmentFileName
                                      );
                                      setAttachmentId(item.attachmentId);
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="bg-gray-500/30 rounded-full p-[7px]">
                                        {FileIcon(item.attachmentFileName)}
                                      </span>
                                      <span>{item?.attachmentFileName}</span>
                                    </div>
                                    <span className="bg-gray-300/30 hover:bg-gray-500/30 transition-all duration-300 cursor-pointer rounded-full p-[7px]">
                                      {isloading &&
                                      attachmentId === item.attachmentId ? (
                                        <TbLoader2 className="h-5 w-5 animate-spin text-orange-500" />
                                      ) : (
                                        <LuDownload className="h-5 w-5 text-sky-500" />
                                      )}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 bg-sky-50 px-2 py-2 rounded-md">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className=" flex items-center justify-center w-[2.3rem] h-[2.3rem] border border-sky-600 bg-green-800 rounded-full overflow-hidden object-cover">
                            <span className="text-2xl font-medium uppercase text-white">
                              {message?.payload?.headers[18]?.value?.slice(
                                0,
                                1
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0">
                            {/* {separate(message?.payload?.headers[18]?.value)} */}
                            <h3 className="capitalize text-[14px] flex items-center gap-1">
                              {(() => {
                                const fromHeader =
                                  message?.payload?.headers?.find(
                                    (header) => header.name === "From"
                                  )?.value || "No Sender";
                                const [name, email] = fromHeader.split(/(?=<)/);
                                return (
                                  <>
                                    <span class="font-semibold text-[16px]">
                                      {name.trim().slice(0, 20)}
                                    </span>{" "}
                                    {email}
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
                        <div className="">
                          {EmailTimeDisplay({
                            internalDate: message?.internalDate,
                          })}
                        </div>
                      </div>
                      {/* Message */}

                      <div
                        className=" ml-10 text-[15px]"
                        style={{ lineHeight: "1rem" }}
                        dangerouslySetInnerHTML={{
                          __html: message?.payload?.body?.data
                            ? cleanEmailBody(
                                message?.payload?.body?.data.replace(
                                  /<\/p>\s*<p>/g,
                                  "</p><br><p>"
                                )
                              )
                            : message?.snippet,
                        }}
                      ></div>

                      {/* Attachments */}
                      {message?.payload?.body?.messageAttachments.length >
                        0 && (
                        <>
                          <hr />
                          <h3 className="text-[18px] font-medium flex items-center gap-2">
                            <ImAttachment className="h-6 w-6 text-black" />
                            Attachments
                            {`(${message?.payload?.body?.messageAttachments.length})`}
                          </h3>

                          <div className="flex items-center flex-wrap gap-4 py-3">
                            {message?.payload.body?.messageAttachments?.map(
                              (item) => {
                                console.log(
                                  "ATTACHMENT HEADEERS",
                                  item.attachmentHeaders
                                );

                                const contentDispositionHeader =
                                  item.attachmentHeaders.find(
                                    (header) =>
                                      header.name === "Content-Disposition"
                                  );

                                const isInline = contentDispositionHeader?.value
                                  ?.toLowerCase()
                                  .includes("inline");

                                return (
                                  <div
                                    className=" flex items-center gap-4 border bg-gray-50 hover:bg-gray-100 cursor-pointer px-3 py-2 transition-all duration-300 rounded-md hover:shadow-md font-medium text-[13px] "
                                    key={item.attachmentId}
                                    onClick={() => {
                                      downloadAttachments(
                                        item.attachmentId,
                                        item.attachmentMessageId,
                                        ticketDetail.company,
                                        item.attachmentFileName
                                      );
                                      setAttachmentId(item.attachmentId);
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="bg-gray-500/30 rounded-full p-[7px]">
                                        {FileIcon(item?.attachmentFileName)}
                                      </span>
                                      <span>{item?.attachmentFileName}</span>
                                    </div>

                                    {/* { isInline && <h3>| Signature</h3> } */}

                                    <span className="bg-gray-300/30 hover:bg-gray-500/30 transition-all duration-300 cursor-pointer rounded-full p-[7px]">
                                      {isloading &&
                                      attachmentId === item.attachmentId ? (
                                        <TbLoader2 className="h-5 w-5 animate-spin text-orange-500" />
                                      ) : (
                                        <LuDownload className="h-5 w-5 text-sky-500" />
                                      )}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* ----------------Email Reply-------------- */}
        {showReplay && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-1 bg-gray-700/70 flex items-center justify-center">
            <SendEmailReply
              setShowReply={setShowReply}
              subject={emailDetail.subject}
              threadId={emailDetail.threadId}
              company={ticketDetail.company}
              ticketId={ticketDetail._id}
              emailSendTo={emailDetail.recipients[0]}
              getEmailDetail={emailData}
            />
          </div>
        )}
      </div>
    </>
  );
}
