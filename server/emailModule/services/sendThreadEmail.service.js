// services/sendThreadEmail.service.js
import { buildGmailReply } from "../utils/buildGmailReply.js";
import { getGmailClient } from "./gmail.service.js";
import { saveEmailMessage } from "../utils/saveEmailMessage.js";
import EmailThread from "../models/EmailThread.js";

// ...extractParticipants() moves here unchanged

function extractParticipants(to) {
  // normalize: array of addresses (frontend) OR comma-separated header string (legacy) OR single string
  const addresses = Array.isArray(to)
    ? to
    : String(to || "").split(",");

  return addresses
    .map((addr) => {
      const match = String(addr).match(/(.*)<(.+)>/);
      const name = match ? match[1].trim().replace(/^"|"$/g, "") : "";
      const email = (match ? match[2] : addr).trim().toLowerCase();
      return { name, email };
    })
    .filter((p) => p.email);
}




export async function sendThreadEmail({
  companyName, threadId, to, cc, bcc, replyTo,
  html, quotedHtml, headers, attachments,
  userName, sentFrom,
}) {
  const emailThread = await EmailThread.findOne({ companyName, threadId })
    .select("participants").lean();

  const existing = new Set(
    (emailThread?.participants || []).map((p) => p.email?.toLowerCase()).filter(Boolean),
  );
  const recipientEmails = extractParticipants(to).map((r) => r.email);
  const interactionType = recipientEmails.every((e) => !existing.has(e)) ? "initial" : "reply";

  const gmail = await getGmailClient(companyName);
  const raw = buildGmailReply({
    to, cc, bcc, replyTo, subject: headers.Subject,
    html, quotedHtml, headers, attachments,
  });

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw, threadId },
  });

  await saveEmailMessage({
    gmailThreadId: threadId,
    gmailMessageId: response?.data?.id,
    userName, companyName, sentFrom, interactionType,
  });

  return { gmailMessageId: response?.data?.id };
}