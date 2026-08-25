import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* ---------- utils ---------- */

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () =>
      resolve({
        filename: file.name,
        mimeType: file.type,
        base64: r.result.split(",")[1],
      });
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const makeFileId = (file) =>
  `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

/* ---------- hook ---------- */

export function useEmailCompose({ companyName }) {
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  // files: [{ id, file }]
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [signature, setSignature] = useState("");

  /* ---------- attachments ---------- */

  const addFiles = (list) => {
    const incoming = Array.from(list).map((file) => ({
      id: makeFileId(file),
      file,
    }));
    setFiles((prev) => [...prev, ...incoming]);
  };

  const removeFile = (id) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  /* ---------- reset ---------- */

  const reset = () => {
    setTo([]);
    setCc([]);
    setBcc([]);
    setSubject("");
    setMessage("");
    setFiles([]);
  };

  /* ---------- send ---------- */

  const send = async ({ html } = {}) => {
    const finalHtml = html ?? message;

    if (!finalHtml?.trim()) {
      toast.error("Message is required");
      return { success: false };
    }

    if (!to?.length && !cc?.length && !bcc?.length) {
      toast.error("At least one recipient required");
      return { success: false };
    }

    if (!subject?.trim()) {
      toast.error("Subject is required");
      return { success: false };
    }

    setLoading(true);

    const finalMessage = signature
      ? `${finalHtml}<br/><br/>${signature}`
      : finalHtml;

    try {
      const attachments = await Promise.all(
        files.map((f) => fileToBase64(f.file))
      );

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/send`,
        {
          companyName,
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          html: finalMessage,
          attachments,
        }
      );

      toast.success("Email sent");
      reset();

      return { success: true, data: res.data };
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to send email");
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  };

  return {
    to,
    setTo,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    message,
    setMessage,
    files,
    addFiles,
    removeFile,
    send,
    loading,
    reset,
    signature,
    setSignature,
  };
}