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
import { is24hWindowOpen } from "../utils/is24hWindowOpen.js";

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
  

  const conversation = await Conversation.findById(conversationId);

    if (!is24hWindowOpen(conversation) && type !== "template") {
      throw new Error("24h window expired");
    }



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

  console.log("THE API RESPONSE ", apiResponse)
  const whatsappMessageId = apiResponse.messages?.[0]?.id;

  if (!whatsappMessageId) {
    throw new Error("No message ID returned from WhatsApp API");
  }

 
  const saved = await saveOutboundMessage({
    companyName: conversation.companyName,
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



export const getMessages = async ({ conversationId, limit = 50, cursor = null }) => {
  const query = { conversationId };

  // cursor = oldest message currently loaded on the client; we want everything older
  if (cursor?.timestamp && cursor?.id) {
    query.$or = [
      { timestamp: { $lt: cursor.timestamp } },
      { timestamp: cursor.timestamp, _id: { $lt: cursor.id } },
    ];
  }

  const docs = await WhatsappMessage.find(query)
    .populate({
      path: "context.messageId",
      select: "_id body type media location from to direction timestamp userId",
    })
    .sort({ timestamp: -1, _id: -1 }) // newest first, _id breaks timestamp ties
    .limit(limit + 1)
    .lean();

  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;

  const messagesWithUrls = await Promise.all(
    pageDocs.map(async (msg) => {
      const result = { ...msg };

      if (result.media?.s3Key) {
        result.media.url = await getFileUrl(result.media.s3Key);
      }
      if (result.context?.messageId?.media?.s3Key) {
        result.context.messageId.media.url = await getFileUrl(
          result.context.messageId.media.s3Key,
        );
      }
      return result;
    }),
  );

  const oldest = pageDocs[pageDocs.length - 1];

  return {
    messages: messagesWithUrls.reverse(), // oldest -> newest, same shape as before
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && oldest
        ? { timestamp: oldest.timestamp, id: String(oldest._id) }
        : null,
    },
  };
};





export const getMessages2 = async ({
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
  companyName,
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
  // const conversation = await Conversation.findById(conversationId);
  // if (!conversation) throw new Error("Conversation not found");

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



  const populatedMessage = await WhatsappMessage.findById(message._id) .populate({ path: "context.messageId", select: "body type media from to timestamp", }) .lean();


  io.emit(`whatsapp:conversation-update-${companyName}`, {
    action: "updated",
    thread: updatedConversation,
  });

 

  return populatedMessage;
};
