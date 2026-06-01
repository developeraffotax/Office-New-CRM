 
/**
 * GET /webhook
 * Meta verification handshake
 */
export const verifyWebhook = (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info("[Webhook] Verified");
    return res.status(200).send(challenge);
  }

  logger.warn("[Webhook] Verification failed");
  return res.sendStatus(403);
};

 



/**
 * POST /webhook
 * Receives all WhatsApp events, ACKs Meta immediately, enqueues for processing.
 * Never does DB work here — the worker handles everything.
 */
export const receiveWebhook = async (req, res) => {
  res.sendStatus(200); // ← Meta needs this before 20s — always first
 
  const body = req.body;
  if (body?.object !== "whatsapp_business_account") return;
 
  const jobs = [];
 
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
 
      const { value }  = change;
      const metadata   = value.metadata; // { phone_number_id, display_phone_number }
 
      // ── Inbound messages ─────────────────────────────────────────
      for (const message of value.messages ?? []) {
        const contact = value.contacts?.find((c) => c.wa_id === message.from);
 
        jobs.push(
          whatsappQueue
            .add(
              "inbound",
              { message, contact, metadata },
              // Use whatsapp message ID as job ID → automatic deduplication at queue level
              { jobId: `inbound:${message.id}` }
            )
            .catch((err) =>
              logger.error("[Webhook] Failed to enqueue inbound message", {
                whatsappMessageId: message.id,
                err: err.message,
              })
            )
        );
      }
 
      // ── Status updates ────────────────────────────────────────────
      for (const status of value.statuses ?? []) {
        jobs.push(
          whatsappQueue
            .add(
              "status",
              { status, metadata },
              // status webhooks for the same message can arrive multiple times — dedupe by id+status
              { jobId: `status:${status.id}:${status.status}` }
            )
            .catch((err) =>
              logger.error("[Webhook] Failed to enqueue status update", {
                whatsappMessageId: status.id,
                err: err.message,
              })
            )
        );
      }
    }
  }
 
  await Promise.allSettled(jobs);
};














































