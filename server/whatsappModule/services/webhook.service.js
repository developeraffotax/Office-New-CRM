import { addNotificationJob } from "../../jobs/queues/notificationQueue.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
import Conversation from "../models/WhatsappConversation.js";
import { getCompanyByPhoneNumber } from "../utils/config.js";
import logger from "../utils/logger.js";
import { buildPreview, parseMessage } from "../utils/message.js";
import { downloadAndStoreMedia } from "./media.service.js";
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import { getFileUrl } from "../utils/s3.js";

const MEDIA_TYPES = new Set(["image", "video", "audio", "document", "sticker"]);

/**
 * Called by the webhook controller for every inbound WhatsApp message.
 * Idempotent — safe to call multiple times (deduplication via unique index).
 */
export const processInboundMessage = async (rawMessage, contact, metadata) => {
  const whatsappMessageId = rawMessage.id;

  // ── Deduplication ────────────────────────────────────────────────
  const existing = await WhatsappMessage.findOne({ whatsappMessageId }).lean();
  if (existing) {
    logger.info("[Service] Duplicate ignored", { whatsappMessageId });
    return existing;
  }

  const phone = rawMessage.from;
  const profileName = contact?.profile?.name ?? "";

  const wa_id = contact?.wa_id;
  const wa_user_id = contact?.user_id;

  const { type, body, media, location } = parseMessage(rawMessage);

  // ── NEW: Download & store media before persisting ─────────────────
  let resolvedMedia = media ?? undefined;

  if (MEDIA_TYPES.has(type) && media?.id) {
    try {
      const { key } = await downloadAndStoreMedia(
        media.id,
        media.mimeType,
        phone,
      );
      resolvedMedia = { ...media, s3Key: key };
    } catch (err) {
      logger.error("[Service] Media download failed", {
        whatsappMessageId,
        mediaId: media.id,
        err: err.message,
      });
      resolvedMedia = { ...media, s3Key: null }; // still saves the id
    }
  }

  const preview = buildPreview(type, body, media);
  const timestamp = new Date(Number(rawMessage.timestamp) * 1000);

  // ── Upsert conversation ──────────────────────────────────────────
  // lastMessageType enum excludes "template"/"unknown" — map to "text"
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

  const existingConversation = await Conversation.findOne({ phone }).select("_id").lean();

  const conversation = await Conversation.findOneAndUpdate(
    { phone },
    {
      $set: {
        profileName,
        lastMessage: preview,
        lastMessageType: safeLastType,
        lastMessageAt: timestamp,
        lastMessageBy: "client",
      },
      $setOnInsert: {
        companyName:
          getCompanyByPhoneNumber(metadata?.phone_number_id) ?? "default",
        phone,
        wa_id,
        wa_user_id,
      },
      $inc: { totalInboundMessages: 1 },
    },
    { upsert: true, new: true,   },
  );


  let context;

if (rawMessage.context?.id) {
  const repliedMessage = await WhatsappMessage.findOne({
    whatsappMessageId: rawMessage.context.id,
  })
    .select("_id")
    .lean();

  context = {
    whatsappMessageId: rawMessage.context.id,
    messageId: repliedMessage?._id ?? null,
  };
}



  // ── Persist message ──────────────────────────────────────────────
  const message = await WhatsappMessage.create({
    conversationId: conversation._id,
    whatsappMessageId,
    direction: "inbound",
    from: rawMessage.from,
    to: metadata?.display_phone_number ?? "",
    type,
    body,
    media: resolvedMedia ?? undefined,
    location: location ?? undefined,
    status: "received",
    statusUpdatedAt: new Date(),
    context,
    timestamp,
    meta: rawMessage,
  });

  // Update lastMessageId reference
  await Conversation.updateOne(
    { _id: conversation._id },
    { $set: { lastMessageId: message._id } },
  );

  // await addNotificationJob({
  //   type: "whatsapp",
  //   payload: {
  //     _id: conversation._id,
  //     companyName: conversation.companyName,
  //     phone: conversation.phone,
  //     profileName: conversation.profileName,
  //     lastMessage: conversation.lastMessage,
  //     userId: conversation.userId,
  //   },
  // });
 
  
if (!existingConversation) {
  await addNotificationJob({
    type: "whatsapp_lead",
    payload: {
      _id: conversation._id,
      companyName: conversation.companyName,
      phone: conversation.phone,
      profileName: conversation.profileName,
      lastMessage: conversation.lastMessage,
    },
  });
}

  // ---------------- Emit socket update ----------------
  const io = await getSocketEmitter();

  // if(conversation?.userId){
  //   io.to(`user:${conversation.userId.toString()}`).emit(`whatsapp:conversation-update-${conversation.companyName}`, {
  //     action: "updated",
  //     thread: conversation.toObject()
  //   });
  // }

  io.emit(`whatsapp:conversation-update-${conversation.companyName}`, {
    action: "updated",
    thread: conversation.toObject(),
  });

  const socketMessage = message.toObject();

  if (socketMessage?.media?.s3Key) {
    socketMessage.media.url = await getFileUrl(socketMessage.media.s3Key);
  }

  io.to(`conversation:${conversation._id}`).emit("whatsapp:message-created", {
    conversationId: conversation._id,
    message: socketMessage,
  });

  logger.info("[Service] Inbound saved", { conversationId: conversation._id, type, });

  return message;
};




















export const processMessageEcho = async (echo, metadata) => {
  const whatsappMessageId = echo.id;

  // ── Deduplication ────────────────────────────────────────────────
  const existing = await WhatsappMessage.findOne({ whatsappMessageId }).lean();
  if (existing) { logger.info("[Echo] Duplicate ignored", { whatsappMessageId }); return existing; }

  const phone = echo.to;

  // ── Parse message (reuse your existing utility) ──────────────────
  const { type, body, media, location } = parseMessage(echo);

  // ── Optionally download & store media ────────────────────────────
  // Echo media comes from WhatsApp Business App — the media ID is still
  // valid and downloadable via Graph API, same as inbound.
  let resolvedMedia = media ?? undefined;

  if (MEDIA_TYPES.has(type) && media?.id) {
    try {
      const { key } = await downloadAndStoreMedia(
        media.id,
        media.mimeType,
        phone, // used as folder prefix in S3
      );
      resolvedMedia = { ...media, s3Key: key };
    } catch (err) {
      logger.error("[Echo] Media download failed", { whatsappMessageId, mediaId: media.id, err: err.message, });
      resolvedMedia = { ...media, s3Key: null };
    }
  }

  const preview = buildPreview(type, body, media); // pass media so caption shows
  const timestamp = new Date(Number(echo.timestamp) * 1000);

  // ── Conversation upsert ──────────────────────────────────────────
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

  const conversation = await Conversation.findOneAndUpdate(
    { phone },
    {
      $set: {
        lastMessage: preview,
        lastMessageType: safeLastType,
        lastMessageAt: timestamp,
        lastMessageBy: "me",
      },
      $setOnInsert: {
        companyName:
          getCompanyByPhoneNumber(metadata?.phone_number_id) ?? "default",
        phone,
      },
    },
    { upsert: true, new: true },
  );


  
  let context;

if (rawMessage.context?.id) {
  const repliedMessage = await WhatsappMessage.findOne({
    whatsappMessageId: rawMessage.context.id,
  })
    .select("_id")
    .lean();

  context = {
    whatsappMessageId: rawMessage.context.id,
    messageId: repliedMessage?._id ?? null,
  };
}

  // ── Persist message ──────────────────────────────────────────────
  const message = await WhatsappMessage.create({
    conversationId: conversation._id,
    whatsappMessageId,
    direction: "outbound",
    from: echo.from,
    to: echo.to,
    type,
    body: body ?? "",
    media: resolvedMedia ?? undefined,
    location: location ?? undefined,
    status: "sent",
    statusUpdatedAt: new Date(),
    timestamp,
    meta: echo,
    sentFrom: "external",
    context,
  });

  // ── Update conversation ──────────────────────────────────────────
  await Conversation.updateOne(
    { _id: conversation._id },
    { $set: { lastMessageId: message._id } },
  );

  // ── Socket updates ───────────────────────────────────────────────
  const io = await getSocketEmitter();

  io.emit(`whatsapp:conversation-update-${conversation.companyName}`, {
    action: "updated",
    thread: { ...conversation.toObject(), lastMessageId: message._id },
  });

  // Enrich socket message with a presigned URL if media was stored
  const socketMessage = message.toObject();
  if (socketMessage?.media?.s3Key) {
    socketMessage.media.url = await getFileUrl(socketMessage.media.s3Key);
  }

  io.to(`conversation:${conversation._id}`).emit("whatsapp:message-created", {
    conversationId: conversation._id,
    message: socketMessage,
  });

  logger.info("[Echo] Outbound message saved", { conversationId: conversation._id, whatsappMessageId, type, });

  return message;
};




 