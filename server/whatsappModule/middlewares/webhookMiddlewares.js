import crypto from "crypto";
import logger from "../utils/logger.js";

/**
 * Verifies the X-Hub-Signature-256 header sent by Meta on every webhook POST.
 * Must be applied BEFORE express.json() parses the body — use raw body.
 *
 * Usage in app.js:
 *   app.post("/webhook", verifySignature, express.json(), receiveWebhook);
 *   — OR —
 *   Mount with rawBody middleware (see rawBody.js)
 */
export const verifySignature = (req, res, next) => {
  const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

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