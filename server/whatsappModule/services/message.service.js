import Conversation from "../models/WhatsappConversation.js";
import WhatsappMessage from "../models/WhatsappMessage.js";

import logger from "../utils/logger.js";
import { buildPreview, parseMessage } from "../utils/message.js";
import { getCompanyByPhoneNumber } from "../utils/config.js";

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
  phoneNumber,
  to,
  type,
  body,
  media,
  template,
  context,
  userId,

  presignedUrl,
}) => {
 
  let apiPayload = { to, type };

 
  if (context?.whatsappMessageId) {
    apiPayload.context = { message_id: context.whatsappMessageId };
  }

 
  if (type === "text") {
    apiPayload.text = { body, preview_url: false };
  } else if (["image", "document", "audio", "video"].includes(type)) {
    apiPayload[type] = {
      link: presignedUrl,
      ...(media.caption && { caption: media.caption }),
      // WhatsApp requires filename specifically for documents
      ...(media.filename &&
        type === "document" && { filename: media.filename }),
    };
  } else if (type === "template") {
    apiPayload.template = template;
  }

 
  const apiResponse = await sendWhatsappPayload(phoneNumberId, apiPayload);
  const whatsappMessageId = apiResponse.messages?.[0]?.id;

  if (!whatsappMessageId) {
    throw new Error("No message ID returned from WhatsApp API");
  }

 
  const saved = await saveOutboundMessage({
    conversationId,
    whatsappMessageId,
    from: phoneNumberId,
    to,
    type,
    body: body ?? "",
    media: media ?? undefined,
    userId: userId ?? null,
    context: context
  });

  return saved;
};









export const getMessages = async ({
  conversationId,
  page = 1,
  limit = 50,
}) => {
  const [messages, total] = await Promise.all([
    WhatsappMessage.find({ conversationId })
      .populate({
        path: "context.messageId",
        select:
          "_id body type media location from to direction timestamp userId",
      })
      .sort({ timestamp: -1 })
      // .skip((page - 1) * limit)
      // .limit(limit)
      .lean(),
    WhatsappMessage.countDocuments({ conversationId }),
  ]);

  const messagesWithUrls = await Promise.all(
    messages.map(async (msg) => {
      const result = { ...msg };

      // Current message media
      if (result.media?.s3Key) {
        result.media.url = await getFileUrl(result.media.s3Key);
      }

      // Replied-to message media
      if (result.context?.messageId?.media?.s3Key) {
        result.context.messageId.media.url = await getFileUrl(
          result.context.messageId.media.s3Key,
        );
      }

      return result;
    }),
  );

  return {
    messages: messagesWithUrls.reverse(),
    pagination: {
      page,
      limit,
      total,
    },
  };
};
 




export const saveOutboundMessage = async ({
  conversationId,
  whatsappMessageId,
  from,
  to,
  type,
  body,
  media,
  userId,
  context
}) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const preview = buildPreview(type, body, media);
  const now = new Date();
  const safeLastType = [
    "text",
    "image",
    "document",
    "audio",
    "video",
    "sticker",
    "location",
  ].includes(type)
    ? type
    : "text";

  const message = await WhatsappMessage.create({
    conversationId,
    whatsappMessageId,
    direction: "outbound",
    from,
    to,
    type,
    body: body ?? "",
    media: media ?? undefined,
    context,
    
    status: "sent",
    statusUpdatedAt: now,
    timestamp: now,
    
    
    userId: userId ?? null,
    sentFrom: "crm"
  });

  const updatedConversation = await Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        lastMessage: preview,
        lastMessageType: safeLastType,
        lastMessageAt: now,
        lastMessageBy: "me",
        lastMessageId: message._id,
      },
    },
    {
      new: true,
    },
  );

  io.emit(`whatsapp:conversation-update-${conversation.companyName}`, {
    action: "updated",
    thread: updatedConversation,
  });

 

  return message;
};
