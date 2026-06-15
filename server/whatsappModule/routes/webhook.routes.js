import { Router } from "express";
 
 
import { receiveWebhook, verifyWebhook } from "../controllers/webhook.controller.js";
import { captureRawBody, verifyWebhookPayload } from "../middlewares/webhookMiddlewares.js";

const router = Router();

// Meta webhook verification (GET)
//      /api/v1/whatsapp/webhook
router.get("/", verifyWebhook);




// Inbound events (POST)
// captureRawBody replaces express.json() for this route
// verifySignature validates the Meta HMAC header
router.post("/",  verifyWebhookPayload,    receiveWebhook);
















export default router;