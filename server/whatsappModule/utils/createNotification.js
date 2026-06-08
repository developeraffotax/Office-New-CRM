
import { scheduleNotification } from "../../utils/customFns/scheduleNotification.js";
import { getOtherParticipantEmail, isSelfAssignment } from "./utils.js";





export const createNotification = async (req, updatedConversation) => {

      console.log("createNotification called with thread:", updatedConversation);


  const payload = {
    title: "New Whatsapp Chat Assigned",
    redirectLink: `/whatsapp/${updatedConversation?._id}?companyName=${updatedConversation?.companyName}&search=${updatedConversation?.phone}`,
    description: `${req.user.user.name} assigned you a new Chat | ${updatedConversation?.companyName}
                ✔ From: ${updatedConversation?.profileName || updatedConversation?.phone || "N/A"}
                ✔ Last Message: ${updatedConversation?.lastMessage || "No messages yet"}
          `,
    taskId: `${updatedConversation?.phone}`,
    userId: updatedConversation.userId,
    type: "conversation_assigned",
    entityType: `whatsapp`,
  };

 
  scheduleNotification(true, payload);
};

