import crypto from "crypto";
import logger from "../utils/logger.js";

 

 
export const verifySecret = (req, res, next) => {
  try {
    // ── 1. Secret token validation ──────────────────────────────
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error("[verifySecret] WEBHOOK_SECRET env var not set");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    if (req.params.secret !== webhookSecret) {
      logger.warn("[verifySecret] Invalid secret token", {
        ip: req.ip,
      });
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ── 2. Basic payload validation ─────────────────────────────
    const body = req.body;

    if (body?.object !== "whatsapp_business_account") {
      logger.warn("[verifySecret] Invalid object", {
        object: body?.object,
      });
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const entries = body.entry || [];

    if (!entries.length) {
      logger.warn("[verifySecret] Missing entries");
      return res.status(400).json({ error: "Missing entries" });
    }

 

    next();
  } catch (error) {
    logger.error("[verifySecret] Unexpected error", error);
    return res.status(500).json({ error: "Webhook verification failed" });
  }
};

































































// export const verifySignature2 = (req, res, next) => {
//   const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

//   console.log("APP SECRET", APP_SECRET)

//   if (!APP_SECRET) {
//     logger.warn("[SignatureVerify] WHATSAPP_APP_SECRET not set — skipping verification");
//     return next();
//   }

//   const signature = req.headers["x-hub-signature-256"];

//   if (!signature) {
//     logger.warn("[SignatureVerify] Missing x-hub-signature-256 header");
//     return res.status(401).json({ error: "Missing signature" });
//   }

//   // req.rawBody must be set by a raw-body middleware (see below)
//   const rawBody = req.rawBody;

//   if (!rawBody) {
//     logger.error("[SignatureVerify] rawBody not available — ensure raw body middleware is applied");
//     return res.status(500).json({ error: "Server misconfiguration" });
//   }

//   const expected = `sha256=${crypto
//     .createHmac("sha256", APP_SECRET)
//     .update(rawBody)
//     .digest("hex")}`;

//   const isValid = crypto.timingSafeEqual(
//     Buffer.from(signature),
//     Buffer.from(expected)
//   );

//   console.log("[SignatureVerify] Signature check", { signature, expected, isValid });

//   if (!isValid) {
//     logger.warn("[SignatureVerify] Signature mismatch", { signature, expected });
//     return res.status(401).json({ error: "Invalid signature" });
//   }

//   next();
// };

// /**
//  * Raw body capture middleware.
//  * Must be used in place of express.json() for the webhook route.
//  *
//  * app.use("/webhook", captureRawBody);
//  */



// export const captureRawBody = (req, res, next) => {
//   let data = "";
//   req.setEncoding("utf8");
//   req.on("data", (chunk) => { data += chunk; });
//   req.on("end", () => {
//     req.rawBody = data;
//     try {
//       req.body = JSON.parse(data);
//     } catch {
//       req.body = {};
//     }
//     next();
//   });
// };