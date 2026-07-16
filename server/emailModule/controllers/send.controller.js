import { getGmailClient } from "../services/gmail.service.js";
import ticketActivityModel from "../../models/ticketActivityModel.js";
import { saveEmailMessage } from "../utils/saveEmailMessage.js";
import { updateTicketAfterEmail } from "../utils/buildGmailReply.js";
import { buildGmailSend } from "../utils/buildGmailSend.js";

export async function sendEmail(req, res) {
  try {
    const {
      companyName,

      to,
      cc,
      bcc,
      replyTo,

      subject,
      html,

      attachments,
       
      jobHolder,
    } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "'to' is required",
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "'subject' is required",
      });
    }

    const userName = req.user.user.name;
    const userId = req.user.user._id;

    // Get Gmail client
    const gmail = await getGmailClient(companyName);

    // Build raw email (new thread, so no threading headers needed)
    const raw = buildGmailSend({
      to,
      cc,
      bcc,
      replyTo,
      subject,
      html,
      attachments,
 
    });

    // Send email - no threadId, this starts a new thread
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });

    // Save message reference
    await saveEmailMessage({
      gmailThreadId: response?.data?.threadId,
      gmailMessageId: response?.data?.id,
      userName,
      companyName,
      sentFrom: "CRM-Inbox"
    });

 

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: {
        messageId: response?.data?.id,
        threadId: response?.data?.threadId,
      },
    });

  } catch (error) {
    console.error("Send Mail Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
}