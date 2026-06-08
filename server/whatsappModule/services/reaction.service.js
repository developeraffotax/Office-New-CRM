import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
import logger from "../utils/logger.js";

 



export const processReactionUpdate = async (
  from,
  targetWhatsappMessageId,
  emoji
) => {
  const message = await WhatsappMessage.findOne({
    whatsappMessageId: targetWhatsappMessageId,
  });

  if (!message) {
    logger.warn("[Service] Reaction target not found", {
      targetWhatsappMessageId,
      from,
    });

    return null;
  }

  // Remove any existing reaction from this user
  await WhatsappMessage.updateOne(
    { _id: message._id },
    {
      $pull: {
        reactions: { from },
      },
    }
  );

  let reaction = null;

  // Add new reaction (if not removing)
  if (emoji) {
    reaction = {
      from,
      emoji,
      timestamp: new Date(),
    };

    await WhatsappMessage.updateOne(
      { _id: message._id },
      {
        $push: {
          reactions: reaction,
        },
      }
    );
  }

  const updatedMessage = await WhatsappMessage.findById(
    message._id
  ).lean();

  const io = await getSocketEmitter();

  io.to(`conversation:${updatedMessage.conversationId.toString()}`).emit(
  "whatsapp:reaction-updated",
  {
    messageId: message._id,
    reaction,
  }
);

  logger.info("[Service] Reaction updated", {
    conversationId: message.conversationId,
    whatsappMessageId: targetWhatsappMessageId,
    from,
    emoji: emoji || "REMOVED",
  });

 
  return updatedMessage;
};