import { google } from "googleapis";
import { FOLLOW_UP, REPLY } from "../constants.js";
// import OpenAI from "openai";
// import * as pdfParse from "pdf-parse";
// import mammoth from "mammoth";
// import XLSX from "xlsx";
 
 
// Decode Gmail base64 body
// Decode base64url safely
const decodeBase64Url = (data = "") =>
  Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");

// Recursively extract body parts
const extractBodyFromParts = (parts = [], result = { text: "", html: "" }) => {
  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      result.text += decodeBase64Url(part.body.data) + "\n";
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      result.html += decodeBase64Url(part.body.data) + "\n";
    }

    if (part.parts) {
      extractBodyFromParts(part.parts, result);
    }
  }

  return result;
};

export const decodeEmailBody = (msg) => {
  if (!msg?.payload) return "";

  const { body, parts } = msg.payload;

  // Case 1: Single-part email
  if (body?.data) {
    return decodeBase64Url(body.data).trim();
  }

  // Case 2: Multi-part email (recursive)
  const { text, html } = extractBodyFromParts(parts);

  // Prefer plain text, fallback to HTML
  return (text || html || "").trim();
};

// Fetch attachments and extract text
// export const extractAttachmentText = async (msg, gmail) => {
//   if (!msg.payload?.parts) return "";

//   let text = "";

//   for (const part of msg.payload.parts) {
//     if (!part.filename || !part.body?.attachmentId) continue;

//     const attachmentId = part.body.attachmentId;
//     const attachmentRes = await gmail.users.messages.attachments.get({
//       userId: "me",
//       messageId: msg.id,
//       id: attachmentId,
//     });

//     let fileData = Buffer.from(attachmentRes.data.data, "base64");

//     // Determine file type
//     if (part.mimeType === "application/pdf") {
//       const pdfText = await pdfParse(fileData);
//       text += `\n[Attachment: ${part.filename}]\n${pdfText.text}\n`;
//     } else if (
//       part.mimeType ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ) {
//       const docText = await mammoth.extractRawText({ buffer: fileData });
//       text += `\n[Attachment: ${part.filename}]\n${docText.value}\n`;
//     } else if (
//       part.mimeType ===
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       const workbook = XLSX.read(fileData, { type: "buffer" });
//       workbook.SheetNames.forEach((sheetName) => {
//         const sheetText = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
//         text += `\n[Attachment: ${part.filename} - Sheet: ${sheetName}]\n${sheetText}\n`;
//       });
//     } else {
//       text += `\n[Attachment: ${part.filename} - unsupported type]\n`;
//     }
//   }

//   return text.trim();
// };



const getGmailClient = () => {
  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  // Set the refresh token for the user
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  // gmail client
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  return gmail;
};




// Fetch Gmail thread
export const fetchThreadMessages = async (threadId) => {
  const gmail = getGmailClient();

  const thread = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
  });

  // Process messages
  const messages = [];
  for (const msg of thread.data.messages) {
    const headers = msg.payload.headers.reduce((acc, h) => {
      acc[h.name.toLowerCase()] = h.value;
      return acc;
    }, {});

    const body = decodeEmailBody(msg);
    // const attachmentText = await extractAttachmentText(msg, gmail);

     

    messages.push({
      id: msg.id,
      from: headers["from"] || "",
      to: headers["to"] || "",
      subject: headers["subject"] || "",
      date: headers["date"] || "",
      labelIds: msg.labelIds || [],
      body,
      // attachments: attachmentText,
    });
  }

  return messages;
};

// Build AI prompt context
export const buildEmailContext = (messages = [] ) => {

  const slicedArr = messages?.length > 6 ? messages.slice(-6) : messages;

  return slicedArr
    .map(
      (m, i) =>
        `Message ${i + 1}:\nFrom: ${m.from}\n${m.body}\n${
          m.attachments ? "Attachment content:\n" + m.attachments : ""
        }\n`
    )
    .join("\n");
};
















export const getActionType = (messages = []) => {



  const isSentByMe = messages[messages.length - 1].labelIds.includes("SENT");
  
  return isSentByMe ? FOLLOW_UP : REPLY;


}










// export const formatReplyEmail = (html) => {
//   const signature = `<p>Kind regards,<br/>Affotax</p>`;

//   // Ensure signature exists
//   if (!html?.includes(signature)) html += `\n${signature}`;

//   // Split content into paragraphs
//   const paragraphs = html.split(/<\/p>\s*<p>/).map(p => p.replace(/<\/?p>/g, '').trim());

//   if (paragraphs.length < 2) {
//     // Simple fallback for single paragraph
//     return `<p>${paragraphs[0]}</p>\n<p></p>\n${signature}`;
//   }

//   // Add spacing after greeting (first paragraph) and before signature (last paragraph)
//   const greeting = `<p>${paragraphs[0]}</p>`;
//   const body = paragraphs.slice(1, -1).map(p => `<p>${p}</p>`).join('\n');
//   const sigSpacing = `<p></p>\n${signature}`;

//   return `${greeting}\n<p></p>\n${body}\n${sigSpacing}`;
// };
