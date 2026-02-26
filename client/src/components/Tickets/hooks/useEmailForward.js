import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const extractHeaders = (msg) => {
  const map = {};
  msg?.payload?.headers?.forEach((h) => {
    map[h.name] = h.value;
  });
  return map;
};

const buildForwardSubject = (subject = "") => {
  if (/^fwd(\[\d+\])?:/i.test(subject)) return subject;
  return `Fwd: ${subject}`;
};

export function useEmailForward({
  companyName,
  emailDetail,
  jobHolder,
  forwardMessageId,
  setShowForward
}) {
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]); // new uploads
  const [originalAttachments, setOriginalAttachments] = useState([]); // original attachments array
  const [loading, setLoading] = useState(false);

  const forwardMessage = useMemo(
    () => emailDetail?.decryptedMessages?.find((m) => m.id === forwardMessageId),
    [emailDetail, forwardMessageId]
  );

  // auto populate subject & editor
  useEffect(() => {
    if (!forwardMessage) return;

    const headers = extractHeaders(forwardMessage);

    setSubject(buildForwardSubject(headers.Subject || ""));

    const forwardedHtml = `
      <br />
      <div style="border-top:1px solid #e5e7eb;margin-top:16px;padding-top:12px">
        <strong>---------- Forwarded message ----------</strong><br/>
        <strong>From:</strong> ${headers.From || ""}<br/>
        <strong>Date:</strong> ${new Date(+forwardMessage.internalDate).toLocaleString()}<br/>
        <strong>Subject:</strong> ${headers.Subject || ""}<br/>
        <strong>To:</strong> ${headers.To || ""}<br/><br/>
        ${forwardMessage.payload.body.data || forwardMessage.snippet || ""}
      </div>
    `;

    setMessage(forwardedHtml);

    // populate original attachments array
    setOriginalAttachments(forwardMessage.payload?.body?.messageAttachments || []);
  }, [forwardMessage]);

  // attachments logic
  const addFiles = (list) => setFiles((prev) => [...prev, ...Array.from(list)]);
  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));
  const removeOriginalAttachment = (id) =>
    setOriginalAttachments((prev) => prev.filter((a) => a.attachmentId !== id));

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () =>
        resolve({
          filename: file.name,
          mimeType: file.type,
          base64: r.result.split(",")[1]
        });
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const send = async () => {
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }
    if (!to.length && !cc.length && !bcc.length) {
      toast.error("At least one recipient required");
      return;
    }
    if (!forwardMessage) {
      toast.error("Forward message not found");
      return;
    }

    setLoading(true);
    try {
      const uploadedAttachments = await Promise.all(files.map(fileToBase64));

      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/gmail/forward`, {
        // threadId: emailDetail.threadId,
        companyName,
        to,
        cc,
        bcc,
        subject,
        html: message,
        attachments: uploadedAttachments,
        originalAttachments, // just send whatever is in the array now
        jobHolder,
        forwardMessageId
      });

      toast.success("Email forwarded");
      setMessage("");
      setFiles([]);
      setOriginalAttachments([]);
      setShowForward(false)
    } catch (e) {
      console.error(e);
      toast.error("Failed to forward email");
    } finally {
      setLoading(false);
    }
  };

  return {
    to, setTo,
    cc, setCc,
    bcc, setBcc,
    subject, setSubject,
    message, setMessage,
    files, addFiles, removeFile,
    originalAttachments, removeOriginalAttachment,
    send,
    loading
  };
}
