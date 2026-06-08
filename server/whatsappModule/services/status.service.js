 
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import Conversation    from "../models/WhatsappConversation.js";
import WhatsappMessage from "../models/WhatsappMessage.js";
 
import logger          from "../utils/logger.js";

 
 
 

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — STATUS UPDATES
   ═══════════════════════════════════════════════════════════════ */

const STATUS_MAP = { sent: "sent", delivered: "delivered", read: "read", failed: "failed" };

/**
 * Handles Meta status webhooks: sent | delivered | read | failed
 */
export const processStatusUpdate = async (statusPayload) => {
  const { id: whatsappMessageId, status, timestamp, errors } = statusPayload;

  const normalised = STATUS_MAP[status];
  if (!normalised) {
    logger.warn("[Service] Unknown status type", { status });
    return;
  }

  const updated = await WhatsappMessage.findOneAndUpdate(
    { whatsappMessageId },
    {
      $set: {
        status:          normalised,
        statusUpdatedAt: new Date(Number(timestamp) * 1000),
        ...(errors ? { "meta.errors": errors } : {}),
      },
    },
    { new: true }
  );

  if (!updated) {
    // Can happen if the message hasn't been saved yet (race condition).
    // In production: push to a retry queue (BullMQ) instead.
    logger.warn("[Service] Status for unknown message", { whatsappMessageId, status });
    return;
  }

    const io = await getSocketEmitter();

  io.to(`conversation:${updated.conversationId.toString()}`).emit(
  "whatsapp:message-status-updated",
  {
    messageId: updated._id,
    status: updated.status,
    statusUpdatedAt: updated.statusUpdatedAt,
  }
);

  logger.info("[Service] Status updated", { whatsappMessageId, status: normalised });
 

  return updated;
};















 