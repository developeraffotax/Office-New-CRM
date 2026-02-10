import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";



const myEmailMap = {
  affotax: "info@affotax.com",
  outsource: "admin@outsourceaccountings.co.uk",
}



/* ---------- utils ---------- */

const parseList = (v = "") =>
  v
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);




const extractEmail = (str = "") => {
  // extract the email inside <>
  const match = str.match(/<(.+?)>/);
  return (match ? match[1] : str).toLowerCase().trim();
};

const normalizeEmails = (list, self, type) => {
  const set = new Set();

  list.forEach((e) => {
    const email = extractEmail(e);
    if (
      isValidEmail(email) &&
      (!self || email !== self.toLowerCase())
    ) {
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



/* ---------- hook ---------- */

export function useEmailReply({

    
 
  companyName,
  emailDetail,

 
  jobHolder
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

 

  
useEffect(() => {
  if (!emailDetail?.decryptedMessages?.length) return;

  const myEmail = myEmailMap[companyName];

  // pick the last message NOT from me
  const lastExternal = [...emailDetail.decryptedMessages]
    .reverse()
    .find((m) => !isFromMe(m, myEmail));

  if (!lastExternal) return;

  const h = extractHeaders(lastExternal);

  const from = parseList(h.From);  // array of sender(s)
  const toList = parseList(h.To);   // array of original To recipients
  const ccList = parseList(h.Cc);   // array of original CC recipients

  // normalize: remove myEmail and duplicates
  const normalizedFrom = normalizeEmails(from, myEmail, "FROM");
  const normalizedTo = normalizeEmails(toList, myEmail, "TO");
  const normalizedCc = normalizeEmails(ccList, myEmail, "CC");

 

  // ----- reply mode logic -----
  if (mode === "reply") {
    setTo(normalizedFrom.length ? normalizedFrom : []); // always reply to sender
    setCc([]);
  }

  if (mode === "replyAll") {
    // reply to sender + everyone else in To/Cc except me
    setTo(normalizedFrom.length ? normalizedFrom : []);
    setCc([...normalizedTo, ...normalizedCc]);
  }

  // set Reply-To header for sending
  if (!replyTo && from.length) {
    setReplyTo(from[0]);
  }
}, [mode, emailDetail, companyName]);



  /* ---------- attachments ---------- */

  const addFiles = (list) =>
    setFiles((p) => [...p, ...Array.from(list)]);

  const removeFile = (name) =>
    setFiles((p) => p.filter((f) => f.name !== name));

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
      const attachments = await Promise.all(
        files.map(fileToBase64)
      );

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/gmail/reply`,
        {
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
          jobHolder
        }
      );

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
    loading
  };
}
