import { updateTicketAfterEmail } from "../utils/buildGmailReply.js";
import ticketActivityModel from "../../models/ticketActivityModel.js";
import { sendThreadEmail } from "../services/sendThreadEmail.service.js";
import { restartFollowUpTimer } from "../services/followUp.service.js";

export async function reply(req, res) {
  try {
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
    const sentFrom = ticketId ? "CRM-Tickets" : "CRM-Inbox";

    // Interaction type, Gmail send and saveEmailMessage all happen in the service
    const { gmailMessageId } = await sendThreadEmail({
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
      userName,
      sentFrom,
    });

    // If linked to ticket → update ticket
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

      // Log activity
      await ticketActivityModel.create({
        ticketId: ticketId,
        userId: req.user.user._id,
        action: "replied",
        gmailMessageId: gmailMessageId || "",
        details: `
          "${userName}" replied to this ticket.
          ${jobHolder ? `And updated the job holder to ${jobHolder}` : ""}
          -- Company: ${companyName}
          -- Email: ${to}
        `,
      });
    }

    // A manual reply restarts the follow-up timer, so a human reply and an
    // automated follow-up never land on the same day.
    // Wrapped separately: the email is already sent, so this must never fail the request.
    // ...after the ticket update, replacing the old try/catch block:
      await restartFollowUpTimer({ companyName, threadId });

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Reply Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
}