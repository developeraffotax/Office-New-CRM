 

import { buildGmailReply } from "../utils/buildGmailReply.js";
import { getGmailClient } from "../services/gmail.service.js";

export async function reply(req, res) {
  const {
    companyName,
    threadId,
    to,
    cc,
    bcc,
    replyTo,
    html,
    quotedHtml,
    headers,
    attachments
  } = req.body;

  const gmail = await getGmailClient(companyName);

  const raw = buildGmailReply({
    to,
    cc,
    bcc,
    replyTo,
    subject: headers.Subject,
    html,
    quotedHtml,
    headers,
    attachments
  });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId
    }
  });

  res.json({ success: true });
}
