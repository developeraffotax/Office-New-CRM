 
import EmailThread from "../models/EmailThread.js";

export const saveEmailThread = async ({
  threadId,
  userId,
  companyName
}) => {
  try {
    await EmailThread.create({
      threadId,
      userId,
      companyName
    });
  } catch (error) {
    console.error("Error saving email thread:", error.message);
  }
};
