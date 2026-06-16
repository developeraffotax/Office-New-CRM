import { whatsappQueue } from "../jobs/queues/whatsappQueue.js";
import logger from "../utils/logger.js";

 
export const verifyWebhook = (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info("[Webhook] Verified");
    return res.status(200).send(challenge);
  }

  logger.warn("[Webhook] Verification failed");
  return res.sendStatus(403);
};

 




 
export const receiveWebhook = async (req, res) => {
  res.sendStatus(200);

  const body = req.body;

  if (body?.object !== "whatsapp_business_account") return;

  const jobs = [];

  

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {

      const { value } = change;
 
      if (change.field === "messages") {
        const metadata = value.metadata;

        // Inbound messages
        for (const message of value.messages ?? []) {
          const contact = value.contacts?.find( (c) => c.wa_id === message.from );

          jobs.push(
            whatsappQueue
              .add(
                "inbound",
                { message, contact, metadata, },
                { jobId: `inbound_${message.id}`, }
              )
              .catch((err) =>
                logger.error(
                  "[Webhook] Failed to enqueue inbound message",
                  {
                    whatsappMessageId: message.id,
                    err: err.message,
                  }
                )
              )
          );
        }

        // Status updates
        for (const status of value.statuses ?? []) {
          jobs.push(
            whatsappQueue
              .add(
                "status",
                { status, metadata, },
                { jobId: `status_${status.id}_${status.status}`, }
              )
              .catch((err) =>
                logger.error(
                  "[Webhook] Failed to enqueue status update",
                  {
                    whatsappMessageId: status.id,
                    err: err.message,
                  }
                )
              )
          );
        }
      }

       

      
      else if (change.field === "smb_message_echoes") {
        const metadata = value.metadata;

        for (const echo of value.message_echoes ?? []) {
          jobs.push(
            whatsappQueue
              .add(
                "echo",
                { echo, metadata, },
                { jobId: `echo_${echo.id}`, }
              )
              .catch((err) =>
                logger.error(
                  "[Webhook] Failed to enqueue SMB echo",
                  {
                    whatsappMessageId: echo.id,
                    err: err.message,
                  }
                )
              )
          );
        }
      }
    }
  }

  await Promise.allSettled(jobs);


  
};






















 



































