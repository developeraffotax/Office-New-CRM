import { Router } from "express";
 
 
import { receiveWebhook, verifyWebhook } from "../controllers/webhook.controller.js";
import {  verifySecret } from "../middlewares/webhookMiddlewares.js";

const router = Router();

// Meta webhook verification (GET)
//      /api/v1/whatsapp/webhook
router.get("/:secret", verifyWebhook);




// Inbound events (POST)
// captureRawBody replaces express.json() for this route
// verifySignature validates the Meta HMAC header
router.post("/:secret",  verifySecret,    receiveWebhook);
















export default router;