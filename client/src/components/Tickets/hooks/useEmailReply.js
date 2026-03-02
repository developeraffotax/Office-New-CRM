import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const myEmailMap = {
  affotax: "info@affotax.com",
  outsource: "admin@outsourceaccountings.co.uk",
};

/* ---------- utils ---------- */

const parseList = (v = "") =>
  v
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const extractEmail = (str = "") => {
  // extract the email inside <>
  const match = str.match(/<(.+?)>/);
  return (match ? match[1] : str).toLowerCase().trim();
};

const normalizeEmails = (list, self, type) => {
  const set = new Set();

  list.forEach((e) => {
    const email = extractEmail(e);
    if (isValidEmail(email) && (!self || email !== self.toLowerCase())) {
      set.add(email);
    }
  });

  return [...set];
};

/* ---------- header helpers ---------- */

const extractHeaders = (msg) => {
  const map = {};
  msg?.payload?.headers?.forEach((h) => {
    map[h.name] = h.value;
  });
  return map;
};

const getSenderEmail = (from = "") => {
  const match = from.match(/<(.+?)>/);
  return (match ? match[1] : from).toLowerCase();
};

const isFromMe = (msg, myEmail) => {
  const from = extractHeaders(msg)?.From || "";
  return getSenderEmail(from).includes(myEmail.toLowerCase());
};

export const getLastRelevantMessage = (messages = [], myEmail) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  // Find last message NOT from me
  const lastExternal = [...messages]
    .reverse()
    .find((msg) => !isFromMe(msg, myEmail));

  // If found → return it
  if (lastExternal) {
    return lastExternal;
  }

  // Fallback → return very last message in thread
  return messages[messages.length - 1] || null;
};

const buildRecipients = ({
  messages, // pass full thread here
  myEmail,
  mode,
}) => {
  if (!messages?.length) {
    return { to: [], cc: [], replyTo: "" };
  }

  // Find last message that actually contains recipient info
  const lastWithRecipients = [...messages].reverse().find((msg) => {
    const headers = extractHeaders(msg);
    return headers?.From || headers?.To || headers?.Cc;
  });

  const headers = extractHeaders(lastWithRecipients || messages.at(-1));

  const fromList = parseList(headers?.From);
  const toList = parseList(headers?.To);
  const ccList = parseList(headers?.Cc);

  const normalizedFrom = normalizeEmails(fromList, myEmail);
  const normalizedTo = normalizeEmails(toList, myEmail);
  const normalizedCc = normalizeEmails(ccList, myEmail);

  // Default reply target
  const nextTo = normalizedFrom.length
    ? normalizedFrom
    : normalizedTo.length
    ? normalizedTo
    : [];

  let nextCc = [];

  if (mode === "replyAll") {
    const combined = [...normalizedTo, ...normalizedCc];

    nextCc = [...new Set(combined)].filter((email) => !nextTo.includes(email));
  }

  return {
    to: nextTo,
    cc: nextCc,
    replyTo: fromList[0] || "",
  };
};

/* ---------- hook ---------- */

export function useEmailReply({
  companyName,
  emailDetail,

  jobHolder,
  ticketId
}) {
  const [mode, setMode] = useState("reply");
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- auto population ---------- */

  console.log("THE EMAIL DETAIL IS ❤️❤️", emailDetail);
  console.log("THE TICKET ID IS ✔️✔️✔️✔️", ticketId)
  useEffect(() => {
    if (!emailDetail?.decryptedMessages?.length) return;

    const myEmail = myEmailMap[companyName];

    const { to, cc, replyTo } = buildRecipients({
      messages: emailDetail.decryptedMessages,
      myEmail,
      mode,
    });

    setTo(to);
    setCc(cc);
    // setReplyTo(replyTo)
  }, [mode, emailDetail, companyName]);

  /* ---------- attachments ---------- */

  const addFiles = (list) => setFiles((p) => [...p, ...Array.from(list)]);

  const removeFile = (name) =>
    setFiles((p) => p.filter((f) => f.name !== name));

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

  /* ---------- send ---------- */

  const send = async () => {
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    if (!to.length && !cc.length && !bcc.length) {
      toast.error("At least one recipient required");
      return;
    }

    const last = emailDetail?.decryptedMessages?.at(-1);
    if (!last) return toast.error("Missing last message");

    const headers = extractHeaders(last);
    const quotedHtml = `
      <div class="gmail_quote">
        <div style="color:#555">
          On ${new Date(+last.internalDate).toLocaleString()},
          ${headers.From} wrote:
        </div>
        <blockquote style="border-left:1px solid #ccc;padding-left:1ex">
          ${last.snippet || ""}
        </blockquote>
      </div>
    `;

    setLoading(true);

    try {
      const attachments = await Promise.all(files.map(fileToBase64));

      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/gmail/reply`, {
        threadId: emailDetail.threadId,
        companyName,
        mode,
        to,
        cc,
        bcc,
        replyTo,
        html: message,
        quotedHtml,
        headers,
        attachments,
        jobHolder,
        ticketId
      });

      toast.success("Reply sent");
      setMessage("");
      setFiles([]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    setMode,
    to,
    setTo,
    cc,
    setCc,
    bcc,
    setBcc,
    replyTo,
    setReplyTo,
    message,
    setMessage,
    files,
    addFiles,
    removeFile,
    send,
    loading,
  };
}
