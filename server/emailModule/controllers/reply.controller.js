import {
  buildGmailReply,
  updateTicketAfterEmail,
} from "../utils/buildGmailReply.js";
import { getGmailClient } from "../services/gmail.service.js";
import ticketActivityModel from "../../models/ticketActivityModel.js";

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
    attachments,

    ticketId,
    jobHolder,
  } = req.body;

  const userName = req.user.user.name;
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
    attachments,
  });

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId,
    },
  });

  if (ticketId) {
    const update = {
      lastMessageSentBy: userName,
      lastMessageSentTime: new Date(),
      status: "Sent",
    };

    if (jobHolder) {
      update.jobHolder = jobHolder;
    }

    await updateTicketAfterEmail(ticketId, update);

    await ticketActivityModel.create({
      ticketId: ticketId,
      userId: req.user.user._id,
      action: "replied",
      gmailMessageId: response?.data?.id || "",
      details: `
          "${req.user.user.name}" replied to this ticket.
          ${jobHolder ? `And updated the job holder to ${jobHolder}` : ""}
          -- Company: ${companyName}
          -- Email: ${to}
        `,
    });
  }





  res.status(200).json({ success: true });
}
