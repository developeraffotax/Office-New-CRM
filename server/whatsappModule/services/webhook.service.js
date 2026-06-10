import { addNotificationJob } from "../../jobs/queues/notificationQueue.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
import Conversation from "../models/WhatsappConversation.js";
import { getCompanyByPhoneNumber } from "../utils/config.js";
import logger from "../utils/logger.js";
import { buildPreview, parseMessage } from "../utils/message.js";
import { downloadAndStoreMedia } from "./media.service.js";
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";





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

  const phone       = rawMessage.from;
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
        phone
      );
      resolvedMedia = { ...media, s3Key: key };
    } catch (err) {

      console.error("Media download/store failed", { err: err });
      // Don't fail the whole message — store media_id as fallback
      logger.error("[Service] Media download failed", {
        whatsappMessageId,
        mediaId: media.id,
        err: err.message,
      });
      resolvedMedia = { ...media, s3Key: null }; // still saves the id
    }
  }
  // ─────────────────────────────────────────────────────────────────


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
        lastMessageBy:   "client",
      },
      $setOnInsert: {
         companyName: getCompanyByPhoneNumber(metadata?.display_phone_number) ?? "default",
        phone,
        wa_id,
        wa_user_id
      },
      $inc: { totalInboundMessages: 1 },
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
    media:             resolvedMedia ?? undefined,
    location:          location ?? undefined,
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

  await addNotificationJob({
          type: "whatsapp",
          payload: { _id: conversation._id, companyName: conversation.companyName, phone: conversation.phone, profileName: conversation.profileName, lastMessage: conversation.lastMessage, userId: conversation.userId }
        });


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
            thread: conversation.toObject()
          });

 

            io.to(`conversation:${conversation._id}`).emit(
            "whatsapp:message-created",
            {
                conversationId: conversation._id,
                message,
            }
            );


  logger.info("[Service] Inbound saved", { conversationId: conversation._id, type });

 

  return message;
};
