import crypto from "crypto";
import logger from "../utils/logger.js";

/**
 * Validates inbound Meta webhook POSTs in the Dualhook-managed flow.
 *
 * Dualhook uses Webhook Override — Meta delivers message-path webhooks
 * directly to your endpoint signed with Dualhook's Meta App Secret (not yours).
 * Standard X-Hub-Signature-256 HMAC verification will always fail, so instead
 * we validate payload shape + phone_number_id + wabaId against your stored connection.
 *
 * Usage in app.js:
 *   app.post("/webhook/meta/messages", express.json(), verifySignature, receiveWebhook);
 *
 * Note: raw body middleware is no longer needed for this route.
 */

 

export const verifyWebhookPayload = (req, res, next) => {
  try {
    const body = req.body;

    // Basic payload validation
    if (body?.object !== "whatsapp_business_account") {
      logger.warn("[WebhookVerify] Invalid object", {
        object: body?.object,
      });

      return res.status(400).json({
        error: "Invalid webhook payload",
      });
    }

    const entries = body.entry || [];

    if (!entries.length) {
      logger.warn("[WebhookVerify] Missing entries");

      return res.status(400).json({
        error: "Missing entries",
      });
    }

    let validMessageEvent = false;
    let phoneNumberId = null;
    let wabaId = null;

    for (const entry of entries) {
      wabaId = entry?.id;

      for (const change of entry?.changes || []) {
        // Ignore unrelated events
        if (change?.field !== "messages") {
          continue;
        }

        validMessageEvent = true;

        phoneNumberId =
          change?.value?.metadata?.phone_number_id;

        if (!phoneNumberId || !wabaId) {
          logger.warn(
            "[WebhookVerify] Missing identifiers",
            {
              phoneNumberId,
              wabaId,
            }
          );

          return res.status(400).json({
            error: "Missing identifiers",
          });
        }

        // Validate Phone Number ID
        if (
          process.env.WHATSAPP_AFFOTAX_PHONE_NUMBER_ID &&
          phoneNumberId !== process.env.WHATSAPP_AFFOTAX_PHONE_NUMBER_ID
        ) {
          logger.warn(
            "[WebhookVerify] Unknown phone_number_id",
            {
              phoneNumberId,
            }
          );

          return res.status(401).json({
            error: "Unauthorized phone number",
          });
        }

        // Validate WABA ID
        if (
          process.env.WHATSAPP_APP_BUSINESS_ACCOUNT_ID &&
          wabaId !== process.env.WHATSAPP_APP_BUSINESS_ACCOUNT_ID
        ) {
          logger.warn(
            "[WebhookVerify] Unknown wabaId",
            {
              wabaId,
            }
          );

          return res.status(401).json({
            error: "Unauthorized WABA",
          });
        }

        req.phoneNumberId = phoneNumberId;
        req.wabaId = wabaId;

        break;
      }

      if (validMessageEvent) break;
    }

    // No messages event found
    if (!validMessageEvent) {
      logger.info(
        "[WebhookVerify] Non-message webhook event ignored"
      );

      return res.sendStatus(200);
    }

    next();
  } catch (error) {
    logger.error("[WebhookVerify] Error", error);

    return res.status(500).json({
      error: "Webhook verification failed",
    });
  }
};







































































export const verifySignature2 = (req, res, next) => {
  const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

  console.log("APP SECRET", APP_SECRET)

  if (!APP_SECRET) {
    logger.warn("[SignatureVerify] WHATSAPP_APP_SECRET not set — skipping verification");
    return next();
  }

  const signature = req.headers["x-hub-signature-256"];

  if (!signature) {
    logger.warn("[SignatureVerify] Missing x-hub-signature-256 header");
    return res.status(401).json({ error: "Missing signature" });
  }

  // req.rawBody must be set by a raw-body middleware (see below)
  const rawBody = req.rawBody;

  if (!rawBody) {
    logger.error("[SignatureVerify] rawBody not available — ensure raw body middleware is applied");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", APP_SECRET)
    .update(rawBody)
    .digest("hex")}`;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );

  console.log("[SignatureVerify] Signature check", { signature, expected, isValid });

  if (!isValid) {
    logger.warn("[SignatureVerify] Signature mismatch", { signature, expected });
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};

/**
 * Raw body capture middleware.
 * Must be used in place of express.json() for the webhook route.
 *
 * app.use("/webhook", captureRawBody);
 */
export const captureRawBody = (req, res, next) => {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => { data += chunk; });
  req.on("end", () => {
    req.rawBody = data;
    try {
      req.body = JSON.parse(data);
    } catch {
      req.body = {};
    }
    next();
  });
};