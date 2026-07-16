import EmailMessage from "../models/EmailMessage.js";
import EmailThread from "../models/EmailThread.js";

export const saveEmailMessage = async ({
  gmailThreadId,
  gmailMessageId,
  userName,
  companyName,
  sentFrom
}) => {
  try {
    await EmailMessage.create({
      gmailThreadId,
      gmailMessageId,
      senderName: userName,
      companyName,
      sentFrom
    });
  } catch (error) {
    console.error("Error saving email message:", error.message);
  }
};
