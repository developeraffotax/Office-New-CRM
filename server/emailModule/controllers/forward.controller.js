import { buildGmailForward } from "../utils/buildGmailForward.js";
import { getGmailClient } from "../services/gmail.service.js";
 

// gmailAttachments.service.js
export async function getAttachmentContent(gmail, attachment) {
  // fetch attachment from Gmail API
  const res = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId: attachment.attachmentMessageId, // if you store both messageId + attachment
    id: attachment.attachmentId
  });

  return res.data?.data || ""; // this is base64
}



export async function forward(req, res) {
  const {
    companyName,
    threadId,        // optional – attach to same thread
    to,
    cc,
    bcc,
    subject,
    html,
    forwardedHtml,
    attachments = [],          // new uploads from frontend
    originalAttachments = []   // [{ attachmentId, attachmentFileName }]
  } = req.body;

  try {
    const gmail = await getGmailClient(companyName);

    // fetch original attachments content
    const originalsWithContent = await Promise.all(
      originalAttachments.map(async (a) => {
        const base64 = await getAttachmentContent(gmail, a);
        return {
          filename: a.attachmentFileName,
          mimeType: "application/octet-stream", // optional: you can fetch real type if needed
          base64
        };
      })
    );

    // combine new uploads + original attachments
    const allAttachments = [
      ...attachments,
      ...originalsWithContent
    ];

    const raw = buildGmailForward({
      to,
      cc,
      bcc,
      subject,
      html,
      forwardedHtml,
      attachments: allAttachments
    });

    const payload = {
      userId: "me",
      requestBody: { raw }
    };

    if (threadId) payload.requestBody.threadId = threadId;

    await gmail.users.messages.send(payload);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
