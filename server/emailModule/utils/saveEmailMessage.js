import EmailMessage from "../models/EmailMessage.js";
import EmailThread from "../models/EmailThread.js";

export const saveEmailMessage = async ({
  gmailThreadId,
  gmailMessageId,
  userName,
  companyName
}) => {
  try {
    await EmailMessage.create({
      gmailThreadId,
      gmailMessageId,
      senderName: userName,
      companyName
    });
  } catch (error) {
    console.error("Error saving email message:", error.message);
  }
};
