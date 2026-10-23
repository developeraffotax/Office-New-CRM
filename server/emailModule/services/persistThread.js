// services/persistThread.js
import { getAssignedUsers } from "../../utils/getAssignedUsers.js";
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import { resolveAutomation } from "../../utils/ruleEngine.js";
import EmailThread from "../models/EmailThread.js";
import {
  getHeader,
  parseEmail,
  parseEmailList,
  extractAttachments,
  addParticipant,
} from "../utils/utils.js";
import { getGmailClient } from "./gmail.service.js";
import { decode } from "entities";

export async function persistThread({ threadId, companyName, type }) {
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

    let lastMessageBy = "client";
    let lastMessageAt = null;
    let lastMessageSnippet = "";

    let unreadCount = 0;
    let attachments = [];
    const labels = new Set();

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
      // if (from.email) participantsMap.set(from.email, from);
      // toList.forEach(t => t.email && participantsMap.set(t.email, t));

      addParticipant(participantsMap, from);

      toList.forEach((t) => {
        addParticipant(participantsMap, t);
      });

      if (!lastMessageAt || date > lastMessageAt) {
        lastMessageAt = date;
        lastMessageSnippet = msg.snippet ? decode(msg.snippet) : "";

        // Determine sender
        if (isSent) {
          lastMessageBy = "me";
        } else {
          lastMessageBy = "client";
        }
      }

      // ---------------- Folder-based last message logic ----------------
      if (isInbox) {
        // Only consider messages from others for Inbox
        if (!inboxLastMessageAt || date > inboxLastMessageAt) {
          inboxLastMessageAt = date;
        }
        if (isUnread) unreadCount++;
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

    // ---------------- Auto-assign user only for new threads ----------------
    // let autoAssignedUserId;

    // if (type === "quote") {
    //   const automaticAssignedUsers = await getAssignedUsers("quote");
    //   autoAssignedUserId = automaticAssignedUsers?.[0];
    // }



        // ---------------- Rules: only for brand-new inbound threads ----------------
    const onInsert = {};
    const isNewThread = !(await EmailThread.exists({ companyName, threadId }));

    // quote emails are self-sent, so don't rely on the INBOX label alone
    if (isNewThread && (messages[0].labelIds?.includes("INBOX"))) {
      const firstHeaders = messages[0].payload.headers;
      const firstFrom = parseEmail(getHeader(firstHeaders, "From"));

      const result = await resolveAutomation("email", {
        type: type || "",
        companyName,
        from: firstFrom.email,
        fromName: firstFrom.name,
        to: parseEmailList(getHeader(firstHeaders, "To")).map((t) => t.email).join(", "),
        subject,
        snippet: messages[0].snippet ? decode(messages[0].snippet) : "",
        hasAttachments: attachments.length > 0,
      });

      if (result.userId) onInsert.userId = result.userId;
      if (result.category) onInsert.category = result.category;
    }


    

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

        lastMessageBy: lastMessageBy, // ✅ NEW
        // ...(autoAssignedUserId && {
        //   $setOnInsert: { userId: autoAssignedUserId },
        // }),

         ...(Object.keys(onInsert).length ? { $setOnInsert: onInsert } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // ---------------- Emit socket update ----------------
    const io = await getSocketEmitter();
    io.emit(`gmail:thread-delta-${companyName}`, {
      action: "updated",
      thread: threadDoc.toObject(),
    });
  } catch (error) {
    console.error(
      `Failed to persist thread ${threadId} for ${companyName}:`,
      error,
    );
  }
}
