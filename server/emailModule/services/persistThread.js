// services/persistThread.js
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import EmailThread from "../models/EmailThread.js";
import { createNotificationForInboxReceive } from "../utils/createNotification.js";
import {
  getHeader,
  parseEmail,
  parseEmailList,
  extractAttachments,
} from "../utils/utils.js";
import { getGmailClient } from "./gmail.service.js";
import { decode } from "entities";

export async function persistThread({ threadId, companyName }) {
  try {
    const gmail = await getGmailClient(companyName);
    const res = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
      metadataHeaders: ["From", "To", "Subject", "Date"],
    });

    const messages = res.data.messages || [];
    if (!messages.length) return;

    const participantsMap = new Map();
    let inboxLastMessageAt = null;

    let sentLastMessageAt = null;

    let lastMessageAt = null;
    let lastMessageSnippet = "";

    let unreadCount = 0;
    let attachments = [];
    const labels = new Set();

    let latestInboxMessage = null;

    for (const msg of messages) {
      const headers = msg.payload.headers;
      const from = parseEmail(getHeader(headers, "From"));
      const toList = parseEmailList(getHeader(headers, "To"));
      const date = new Date(Number(msg.internalDate));
      const isUnread = msg.labelIds.includes("UNREAD");
      const isInbox = msg.labelIds.includes("INBOX");
      const isSent = msg.labelIds.includes("SENT");

      // Track all labels
      msg.labelIds.forEach((l) => labels.add(l));

      // Participants
      if (from.email) participantsMap.set(from.email, from);
      toList.forEach((t) => t.email && participantsMap.set(t.email, t));

      if (!lastMessageAt || date > lastMessageAt) {
        lastMessageAt = date;
        lastMessageSnippet = msg.snippet ? decode(msg.snippet) : "";
      }

      // ---------------- Folder-based last message logic ----------------
      if (isInbox) {
        // Only consider messages from others for Inbox
        if (!inboxLastMessageAt || date > inboxLastMessageAt) {
          inboxLastMessageAt = date;
        }
        if (isUnread) unreadCount++;

        if (!latestInboxMessage || date > latestInboxMessage.date) {
          latestInboxMessage = {
            messageId: msg.id,
            date,
            isUnread,
          };
        }
      }

      if (isSent) {
        // Only consider messages from self for Sent
        if (!sentLastMessageAt || date > sentLastMessageAt) {
          sentLastMessageAt = date;
        }
      }

      // Attachments
      attachments.push(...extractAttachments(msg.payload));
    }

    const participants = Array.from(participantsMap.values());
    const subject = getHeader(messages[0].payload.headers, "Subject");
    const labelArray = Array.from(labels);

    const prevThread = await EmailThread.findOne({
      companyName,
      threadId,
    }).lean();

    // ---------------- Upsert thread ----------------
    const threadDoc = await EmailThread.findOneAndUpdate(
      { companyName, threadId },
      {
        companyName,
        threadId,
        subject,
        participants,
        unreadCount,
        messageCount: messages.length,
        attachments,
        labels: labelArray,
        hasInboxMessage: labelArray.includes("INBOX"),
        hasSentMessage: labelArray.includes("SENT"),
        lastMessageAtInbox: inboxLastMessageAt,
        lastMessageAtSent: sentLastMessageAt,

        lastMessageAt: lastMessageAt,
        lastMessageSnippet: lastMessageSnippet,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // ---------------- Emit socket update ----------------
    const io = await getSocketEmitter();
    io.emit(`gmail:thread-delta-${companyName}`, {
      action: "updated",
      thread: threadDoc.toObject(),
    });

    const hasNewMessage =
      !prevThread || messages.length > prevThread.messageCount;

    const shouldNotify =
      hasNewMessage &&
      latestInboxMessage &&
      latestInboxMessage.isUnread &&
      (threadDoc?.userId || prevThread?.userId);

    console.log("SHOULD NOTIFY ✔️✔️✔️✔️", shouldNotify);

    if (shouldNotify) {
      await createNotificationForInboxReceive(threadDoc);
    }
  } catch (error) {
    console.error(
      `Failed to persist thread ${threadId} for ${companyName}:`,
      error,
    );
  }
}






























// // services/persistThread.js
// import { connectDB } from "../../config/db.js";
// import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
// import EmailThread from "../models/EmailThread.js";

// import {
//   getHeader,
//   parseEmail,
//   parseEmailList,
//   extractAttachments
// } from "../utils/utils.js";
// import { getGmailClient } from "./gmail.service.js";
// import { decode } from "entities";

// export async function persistThread({ threadId, companyName }) {
//   try {

//     // Use provided Gmail client or create a new one
//     const gmail = (await getGmailClient(companyName));

//     const res = await gmail.users.threads.get({
//       userId: "me",
//       id: threadId,
//       format: "full",
//       metadataHeaders: ["From", "To", "Subject", "Date"]
//     });

//     const messages = res.data.messages || [];
//     if (!messages.length) return; // Nothing to persist

//     // Initialize thread data
//     const participantsMap = new Map(); // key = email, value = { name, email }
//     let lastMessageAt = null;
//     let lastMessageSnippet = "";
//     let unreadCount = 0;
//     let hasInboxMessage = false;
//     let hasSentMessage = false;
//     let attachments = [];

//     for (const msg of messages) {
//       const headers = msg.payload.headers;

//       const from = parseEmail(getHeader(headers, "From")); // { name, email }
//       const toList = parseEmailList(getHeader(headers, "To")); // [{ name, email }, ...]

//       const date = new Date(Number(msg.internalDate));
//       const isUnread = msg.labelIds.includes("UNREAD");
//       const isInbox = msg.labelIds.includes("INBOX");
//       const isSent = msg.labelIds.includes("SENT");

//       // Add participants to map (avoids duplicates automatically)
//       if (from.email) participantsMap.set(from.email, from);
//       for (const to of toList) {
//         if (to.email) participantsMap.set(to.email, to);
//       }

//       // Track last message
//       if (!lastMessageAt || date > lastMessageAt) {
//         lastMessageAt = date;
//         lastMessageSnippet = msg.snippet ? decode(msg.snippet) : "";

//       }

//       // Track inbox/unread
//       if (isInbox) {
//         hasInboxMessage = true;
//         if (isUnread) unreadCount++;
//       }

//             // Track inbox/unread
//       if (isSent) {
//         hasSentMessage = true;
//         // if (isUnread) unreadCount++;

//       }

//       // Extract attachments
//       const msgAttachments = extractAttachments(msg.payload);
//       if (msgAttachments.length) attachments.push(...msgAttachments);
//     }

//     // Convert participants map to array for MongoDB
//     const participants = Array.from(participantsMap.values());

//     // Subject: use first message's subject
//     const subject = getHeader(messages[0].payload.headers, "Subject");

//     // Upsert thread in DB
//     const threadDoc = await EmailThread.updateOne(
//       { companyName, threadId },
//       {
//         companyName,
//         threadId,
//         subject,
//         participants,
//         lastMessageAt,
//         lastMessageSnippet,
//         messageCount: messages.length,
//         unreadCount,
//         hasInboxMessage,
//         hasSentMessage,
//         attachments
//       },
//       { upsert: true }
//     );

//    const io = await getSocketEmitter();

//     // Emit the full thread for the client to upsert
//     io.emit("gmail:thread-updated", {
//       thread: threadDoc
//     });

//     // gpt emit or boradcast socket event here so i can update all the users realtime

//     console.log("EMAIL THREAD CREATED❤✔")

//   } catch (error) {
//     console.error(`Failed to persist thread ${threadId} for ${companyName}:`, error);
//   }
// }
