import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
import Conversation from "../models/WhatsappConversation.js";
import logger from "../utils/logger.js";
import { sendWhatsappPayload } from "../utils/whatsappApi.js";





/**
 * Processes, sends, and saves a message reaction to WhatsApp Business API
 * Target Route: POST /api/v1/whatsapp/conversations/:conversationId/messages/:messageId/reactions
 */
export const handleMessageReaction = async ({
   phoneNumberId,
   phoneNumber,
 
  conversationId,
  messageId,
  emoji,
 
}) => {
  // 1. Validate conversation layout context
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new Error("Conversation context tracking reference not found");

  // 2. Fetch target message to get real-time WhatsApp Meta ID references
  const targetMessage = await WhatsappMessage.findById(messageId);
  if (!targetMessage) throw new Error("Target message references missing from system logs");
  if (!targetMessage.whatsappMessageId) throw new Error("Cannot react to a message missing a verified WhatsApp Message ID");
 

  // 3. Build Cloud API compliance format for reactions
  const apiPayload = {
    
    to: conversation.phone,
    type: "reaction",
    reaction: {
      message_id: targetMessage.whatsappMessageId,
      emoji: emoji || "" // Passing an empty string removes the reaction in WhatsApp
    }
  };

  // 4. Dispatch external payload directly to Meta
  await sendWhatsappPayload(phoneNumberId, apiPayload);

  //const senderIdentifier = userId ? userId.toString() : "crm_agent";

  // 5. Clean up duplicates and push the new reaction into MongoDB atomicity chain
  // This removes any previous reaction left by this specific user/agent first
  await WhatsappMessage.updateOne(
    { _id: messageId },
    { $pull: { reactions: { from: phoneNumber } } }
  );

  let updatedMessage = null;
  if (emoji) {
    // If an emoji is present, add it to the reactions array
    updatedMessage = await WhatsappMessage.findOneAndUpdate(
      { _id: messageId },
      { 
        $push: { 
          reactions: { 
            from: phoneNumber, 
            emoji: emoji, 
            createdAt: new Date() 
          } 
        } 
      },
      { new: true }
    )
    .lean();
  } else {
    // If emoji is empty, the reaction was removed
    updatedMessage = await WhatsappMessage.findById(messageId).lean();
  }

  // 6. Broadcast real-time mutations to synchronize across open CRM client panels
  //const reactionObject = { from: phoneNumber, emoji };
  
  // Emit directly down target active conversational rooms matching your front-end schema
  // io.to(`whatsapp:conversation-${conversationId}`).emit("whatsapp:reaction-updated", {
  //   messageId: targetMessage._id,
  //   reaction: reactionObject,
  // });

  return updatedMessage;
};

 




































































































export const processReactionUpdate = async (
  from,
  targetWhatsappMessageId,
  emoji,
) => {
  const message = await WhatsappMessage.findOne({ whatsappMessageId: targetWhatsappMessageId, });

   if (!message) throw new Error("message not found");

  // Remove any existing reaction from this user
  await WhatsappMessage.updateOne(
    { _id: message._id },
    {
      $pull: {
        reactions: { from },
      },
    },
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
      },
    );
  }

  const updatedMessage = await WhatsappMessage.findById(message._id).lean();

  const io = await getSocketEmitter();

  io.to(`conversation:${updatedMessage.conversationId.toString()}`).emit(
    "whatsapp:reaction-updated",
    {
      messageId: message._id,
      reaction,
    },
  );

 

  return updatedMessage;
};
































