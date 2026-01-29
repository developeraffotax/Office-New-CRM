import React, { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { HiReply } from "react-icons/hi";
import { Buffer } from "buffer";
import { FaCaretDown, FaRegFileImage } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { LuDownload } from "react-icons/lu";
import { ImAttachment } from "react-icons/im";
import { TbLoader2 } from "react-icons/tb";
import axios from "axios";
import toast from "react-hot-toast";
import Reply from "../reply/Reply.js";
import Loader from "../../../utlis/Loader.js";

export default function Thread({ company, threadId, subject, setShowEmailDetail, markAsRead }) {
  const [emailDetail, setEmailDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [attachmentId, setAttachmentId] = useState("");
  const [showReplay, setShowReply] = useState(false);





  const getEmailDetail = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/single/inbox/detail/${threadId}/${company}`
      );
      if (data) {
        setEmailDetail(data.emailDetails);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmailDetail();
    markAsRead(threadId, company); // mark as read whenever this thread is opened
  }, [threadId, company]);

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
          <span className="text-xs text-gray-500 font-normal">{emailAddress}</span>
        )}
      </div>
    );
  };

  const EmailTimeDisplay = ({ internalDate }) => {
    const emailDate = new Date(parseInt(internalDate));
    const formattedDate = !isNaN(emailDate.getTime())
      ? emailDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : "Invalid Date";
    return <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>;
  };

  const downloadAttachments = async (attachmentId, messageId, companyName, fileName) => {
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
        const blob = new Blob([new Uint8Array(decodedData.buffer)], { type: "application/octet-stream" });
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

  const cleanEmailBody = (emailHtml) => {
    return emailHtml
      .replace(/<div class="gmail_quote">([\s\S]*?)<\/div>/g, "")
      .replace(/<blockquote([\s\S]*?)<\/blockquote>/g, "");
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

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowEmailDetail(false)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <IoArrowBackOutline className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-800 truncate max-w-[200px] md:max-w-md">
            {subject}
          </h2>
        </div>
        <button
          onClick={() => setShowReply(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <HiReply className="h-4 w-4" /> Reply
        </button>
      </header>

      {/* Thread Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {emailDetail?.decryptedMessages?.map((message, i) => {
            const isSentByMe = message?.payload?.body?.sentByMe || message?.labelIds?.includes("SENT");
            const fromHeader = message?.payload?.headers?.find(h => h.name === "From")?.value || "";
            const toHeader = message?.payload?.headers?.find(h => h.name === "To")?.value || "";

            return (
              <div key={i} className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[95%] md:max-w-[85%] w-full rounded-2xl border p-5 shadow-sm transition-all ${
                  isSentByMe ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-100'
                }`}>
                  {/* Message Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        isSentByMe ? 'bg-orange-500' : 'bg-blue-600'
                      }`}>
                        {fromHeader.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        {separate(fromHeader)}
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          to {isSentByMe ? toHeader : 'me'} <FaCaretDown className="cursor-pointer" />
                        </span>
                      </div>
                    </div>
                    <EmailTimeDisplay internalDate={message?.internalDate} />
                  </div>

                  {/* Body Content */}
                  <div
                    className="text-gray-700 leading-relaxed text-[15px] prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: cleanEmailBody(message?.payload?.body?.data || message?.snippet || "").replace(
                        /<\/p>\s*<p>/g,
                        "</p><br><p>"
                      ),
                    }}
                  ></div>

                  {/* Attachments Section */}
                  {message?.payload?.body?.messageAttachments?.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-gray-500 font-semibold text-sm">
                        <ImAttachment className="h-4 w-4" />
                        Attachments ({message.payload.body.messageAttachments.length})
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {message.payload.body.messageAttachments.map((item) => (
                          <div
                            key={item.attachmentId}
                            onClick={() => downloadAttachments(item.attachmentId, item.attachmentMessageId, company, item.attachmentFileName)}
                            className="flex items-center gap-3 pl-3 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-white hover:border-orange-300 transition-all cursor-pointer group"
                          >
                            {FileIcon(item.attachmentFileName)}
                            <span className="text-xs font-medium text-gray-600 truncate max-w-[150px]">
                              {item.attachmentFileName}
                            </span>
                            <div className="p-1.5 rounded-full bg-white text-gray-400 group-hover:text-orange-500 shadow-sm border border-gray-100">
                              {isloading && attachmentId === item.attachmentId ? (
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
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {showReplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <Reply
              setShowReply={setShowReply}
              company={company}
              emailDetail={emailDetail}
              getEmailDetail={getEmailDetail}
            />
          </div>
        </div>
      )}
    </div>
  );
}