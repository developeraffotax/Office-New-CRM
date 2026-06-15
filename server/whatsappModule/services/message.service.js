import Conversation    from "../models/WhatsappConversation.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
 
import logger          from "../utils/logger.js";
import { buildPreview, parseMessage } from "../utils/message.js";
import { getCompanyByPhoneNumber,  } from "../utils/config.js";

 


import { sendWhatsappPayload } from "../utils/whatsappApi.js"; 
import { downloadAndStoreMedia } from "./media.service.js";
 
import { addNotificationJob } from "../../jobs/queues/notificationQueue.js";
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import { emitToUser } from "../../utils/socketEmitter.js";
import { io } from "../../index.js";
import { getFileUrl } from "../utils/s3.js";
 




export const sendMessage = async ({
  conversationId,
  phoneNumberId,
  to,
  type,
  body,
  media,
  template,
  context,
  userId,

  presignedUrl,
 
}) => {
  // Build the baseline payload for Meta API
  let apiPayload = { to, type };

  // Add quoted reply context if provided
  if (context?.whatsappMessageId) {
    apiPayload.context = { message_id: context.whatsappMessageId };
  }

  // Handle specific message types
  if (type === "text") {
    apiPayload.text = { body, preview_url: false };
  } 
  else if (["image", "document", "audio", "video"].includes(type)) {
    apiPayload[type] = {
      link: presignedUrl,
      ...(media.caption && { caption: media.caption }),
      // WhatsApp requires filename specifically for documents
      ...(media.filename && type === "document" && { filename: media.filename }),
    };
  } 
  else if (type === "template") {
    apiPayload.template = template;
  }


 


  // ── Send to Meta ─────────────────────────────────────────────────
  const apiResponse = await sendWhatsappPayload(phoneNumberId, apiPayload);
  const whatsappMessageId = apiResponse.messages?.[0]?.id;

  if (!whatsappMessageId) {
    throw new Error("No message ID returned from WhatsApp API");
  }

  // ── Persist to DB ─────────────────────────────────────────────────
  const saved = await saveOutboundMessage({
    conversationId,
    whatsappMessageId,
    from: phoneNumberId,
    to,
    type,
    body: body ?? "",
    media: media ?? undefined,
    userId: userId ?? null,
 
  });

  return saved;
};



























/** Paginated messages for a conversation */
export const getMessages = async ({ conversationId, page = 1, limit = 50 }) => {
  const [messages, total] = await Promise.all([
    WhatsappMessage.find({ conversationId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    WhatsappMessage.countDocuments({ conversationId }),
  ]);


  const messagesWithUrls = await Promise.all(
    messages.map(async (msg) => {
      if (!msg.media?.s3Key) return msg;

      const mediaUrl = await getFileUrl(msg.media.s3Key);

      return {
        ...msg,
         media: {
        ...msg.media,
        url: mediaUrl,
      },
      };
    })
  );

  

  return { messages: messagesWithUrls.reverse(), pagination: { page, limit, total } };
};










/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — OUTBOUND MESSAGE  (call after WhatsApp API send)
   ═══════════════════════════════════════════════════════════════ */
 
export const saveOutboundMessage = async ({
  conversationId,
  whatsappMessageId,
  from,
  to,
  type,
  body,
  media,
  userId,
 
}) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const preview = buildPreview(type, body, media);
  const now     = new Date();
  const safeLastType = ["text","image","document","audio","video","sticker","location"].includes(type)
    ? type
    : "text";

  const message = await WhatsappMessage.create({
    conversationId,
    whatsappMessageId,
    direction:       "outbound",
    from,
    to,
    userId:          userId ?? null,
    type,
    body:            body ?? "",
    media:           media ?? undefined,
   
    status:          "sent",
    statusUpdatedAt: now,
    timestamp:       now,
  });

  const updatedConversation =  await Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        lastMessage:     preview,
        lastMessageType: safeLastType,
        lastMessageAt:   now,
        lastMessageBy:   "me",
        lastMessageId:   message._id,
      },
    },{
      new : true
    }
  );


  io.emit(`whatsapp:conversation-update-${conversation.companyName}`, {
              action: "updated",
              thread: updatedConversation
            });



  // also sending to myself
            // io.to(`conversation:${conversationId}`).emit(
            // "whatsapp:message-created",
            // {
            //     conversationId: conversationId,
            //     message,
            // }
            // );



  
  return message;
};











 