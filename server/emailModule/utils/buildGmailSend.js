import crypto from "crypto";
import ticketModel from "../../models/ticketModel.js";
import mongoose from "mongoose";


function buildReplySubject(subject = "") {
  const s = subject.trim();
  if (/^re(\[\d+\])?:/i.test(s)) return s;
  return `Re: ${s}`;
}


function formatReplyHtml(message = "") {
  if (!message) return "";

  // 1️⃣ Remove completely empty <p> tags like <p></p> or <p>   </p>
  let cleaned = message.replace(/<p>\s*<\/p>/gi, "");

 

  // 3️⃣ Collapse multiple empty paragraphs into one
  cleaned = cleaned.replace(/(<p>\s*<\/p>)+/gi, "");

  // 4️⃣ Apply enterprise-style inline reset
  cleaned = cleaned.replace(
    /<p>/gi,
    '<p style="margin:0; padding:0; line-height:1.5;">'
  );

  // 5️⃣ Optional: normalize <div> too (some editors use div instead of p)
  // cleaned = cleaned.replace(
  //   /<div>/gi,
  //   '<div style="margin:0; padding:0; line-height:1.5;">'
  // );

  return cleaned.trim();
}



export function buildGmailSend({
  to = [],
  cc = [],
  bcc = [],
 
  subject,
  html,
 
  headers,
  attachments = []
}) {
  const boundary = crypto.randomBytes(16).toString("hex");

  

  const mimeHeaders = [
    `To: ${to.join(", ")}`,
    cc.length ? `Cc: ${cc.join(", ")}` : "",
    bcc.length ? `Bcc: ${bcc.join(", ")}` : "",
 
    `Subject: ${subject ? buildReplySubject(subject) : ""}`,
    // `In-Reply-To: ${headers["Message-Id"]}`,
    // `References: ${[
    //   headers.References,
    //   headers["Message-Id"]
    // ]
    //   .filter(Boolean)
    //   .join(" ")}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ]
    .filter(Boolean)
    .join("\r\n");

let body =
  `--${boundary}\r\n` +
  `Content-Type: text/html; charset="UTF-8"\r\n\r\n` +
  `${formatReplyHtml(html)}\r\n`;

for (const file of attachments) {
  body +=
    `--${boundary}\r\n` +
    `Content-Type: ${file.mimeType}; name="${file.filename}"\r\n` +
    `Content-Disposition: attachment; filename="${file.filename}"\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${file.base64}\r\n`;
}

body += `--${boundary}--`;

  const raw = Buffer.from(
    `${mimeHeaders}\r\n\r\n${body}`
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return raw;
}






 




 