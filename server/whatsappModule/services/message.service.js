import Conversation    from "../models/WhatsappConversation.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
 
import logger          from "../utils/logger.js";
import { buildPreview, parseMessage } from "../utils/message.js";
import { getCompanyByPhoneNumber,  } from "../utils/config.js";

 


import { sendWhatsappPayload } from "../utils/whatsappApi.js";
 
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
}) => {
  // Build the payload for Meta API
  let apiPayload = { to, type };

   // Add quoted reply context if provided
  if (context?.whatsappMessageId) {
    apiPayload.context = { message_id: context.whatsappMessageId };
  }

  if (type === "text") {
    apiPayload.text = { body, preview_url: false };
  } else if (["image", "document", "audio", "video"].includes(type)) {
    apiPayload[type] = {
      link: media.url,
      ...(media.caption  && { caption:  media.caption  }),
      ...(media.filename && { filename: media.filename }),
    };
  } else if (type === "template") {
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

  return { messages: messages.reverse(), total, page, limit };
};


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

  const phone       = rawMessage.from;
  const profileName = contact?.profile?.name ?? "";
  const { type, body, media } = parseMessage(rawMessage);
  const preview     = buildPreview(type, body, media);
  const timestamp   = new Date(Number(rawMessage.timestamp) * 1000);

  // ── Upsert conversation ──────────────────────────────────────────
  // lastMessageType enum excludes "template"/"unknown" — map to "text"
  const safeLastType = ["text","image","document","audio","video","sticker","location"].includes(type)
    ? type
    : "text";

  const conversation = await Conversation.findOneAndUpdate(
    { phone },
    {
      $set: {
        profileName,
        lastMessage:     preview,
        lastMessageType: safeLastType,
        lastMessageAt:   timestamp,
      },
      $setOnInsert: {
         companyName: getCompanyByPhoneNumber(metadata?.display_phone_number) ?? "Default",
        phone,
      },
    },
    { upsert: true, new: true }
  );

  // ── Persist message ──────────────────────────────────────────────
  const message = await WhatsappMessage.create({
    conversationId:    conversation._id,
    whatsappMessageId,
    direction:         "inbound",
    from:              rawMessage.from,
    to:                metadata?.display_phone_number ?? "",
    type,
    body,
    media:             media ?? undefined,
    status:            "received",
    statusUpdatedAt:   new Date(),
    context:           rawMessage.context
                         ? { whatsappMessageId: rawMessage.context.id }
                         : undefined,
    timestamp,
    meta:              rawMessage,
  });

  // Update lastMessageId reference
  await Conversation.updateOne(
    { _id: conversation._id },
    { $set: { lastMessageId: message._id } }
  );

  logger.info("[Service] Inbound saved", { conversationId: conversation._id, type });

 

  return message;
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

  await Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        lastMessage:     preview,
        lastMessageType: safeLastType,
        lastMessageAt:   now,
        lastMessageId:   message._id,
      },
    }
  );

  
  return message;
};











 