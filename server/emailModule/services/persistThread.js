 
// services/persistThread.js
import { connectDB } from "../../config/db.js";
import EmailThread from "../models/EmailThread.js";
 
import {
  getHeader,
  parseEmail,
  parseEmailList,
  extractAttachments
} from "../utils/utils.js";
import { getGmailClient } from "./gmail.service.js";





export async function persistThread({ threadId, companyName }) {
  try {

    // Use provided Gmail client or create a new one
    const gmail = (await getGmailClient(companyName));

    const res = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
      metadataHeaders: ["From", "To", "Subject", "Date"]
    });

    const messages = res.data.messages || [];
    if (!messages.length) return; // Nothing to persist

    // Initialize thread data
    const participantsMap = new Map(); // key = email, value = { name, email }
    let lastMessageAt = null;
    let lastMessageSnippet = "";
    let unreadCount = 0;
    let hasInboxMessage = false;
    let hasSentMessage = false;
    let attachments = [];

    for (const msg of messages) {
      const headers = msg.payload.headers;

      const from = parseEmail(getHeader(headers, "From")); // { name, email }
      const toList = parseEmailList(getHeader(headers, "To")); // [{ name, email }, ...]

      const date = new Date(Number(msg.internalDate));
      const isUnread = msg.labelIds.includes("UNREAD");
      const isInbox = msg.labelIds.includes("INBOX");
      const isSent = msg.labelIds.includes("SENT");
      

      // Add participants to map (avoids duplicates automatically)
      if (from.email) participantsMap.set(from.email, from);
      for (const to of toList) {
        if (to.email) participantsMap.set(to.email, to);
      }

      // Track last message
      if (!lastMessageAt || date > lastMessageAt) {
        lastMessageAt = date;
        lastMessageSnippet = msg.snippet;
      }

      // Track inbox/unread
      if (isInbox) {
        hasInboxMessage = true;
        if (isUnread) unreadCount++;
      }

            // Track inbox/unread
      if (isSent) {
        hasSentMessage = true;
        if (isUnread) unreadCount++;  
        
      }

      

      // Extract attachments
      const msgAttachments = extractAttachments(msg.payload);
      if (msgAttachments.length) attachments.push(...msgAttachments);
    }

    // Convert participants map to array for MongoDB
    const participants = Array.from(participantsMap.values());

    // Subject: use first message's subject
    const subject = getHeader(messages[0].payload.headers, "Subject");

    // Upsert thread in DB
    await EmailThread.updateOne(
      { companyName, threadId },
      {
        companyName,
        threadId,
        subject,
        participants,
        lastMessageAt,
        lastMessageSnippet,
        messageCount: messages.length,
        unreadCount,
        hasInboxMessage,
        hasSentMessage,
        attachments
      },
      { upsert: true }
    );
      // can create notificaiotn here using the job
    console.log("EMAIL THREAD CREATED❤✔")

  } catch (error) {
    console.error(`Failed to persist thread ${threadId} for ${companyName}:`, error);
  }
}

