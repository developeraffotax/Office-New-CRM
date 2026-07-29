import axios from "axios";
import logger from "./logger.js";

export async function sendWhatsappLead({
  phoneNumber,
  firstMessage,
  type = "homepage",
}, attempt = 1) {
  const MAX_ATTEMPTS = 3;
  try {
    await axios.post(
      `${process.env.WEBSITE_URL}/api/webhook/whatsapp-lead`,
      { phoneNumber, firstMessage, type },
      {
        headers: { "x-api-key": process.env.WHATSAPP_LEAD_WEBHOOK_SECRET },
        timeout: 10000, // give cold starts a bit more room
      }
    );
  } catch (err) {
    if (attempt < MAX_ATTEMPTS) {
      const delay = attempt * 2000; // 2s, 4s
      logger.error("[WhatsappLead] Attempt failed, retrying", {
        phoneNumber, attempt, error: err.message,
      });
      await new Promise((r) => setTimeout(r, delay));
      return sendWhatsappLead({ phoneNumber, firstMessage, type }, attempt + 1);
    }
    logger.error("[WhatsappLead] All attempts failed", {
      phoneNumber, error: err.message,
    });
  }
}