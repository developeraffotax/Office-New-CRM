import { Router } from "express";
 
 
import { receiveWebhook, verifyWebhook } from "../controllers/whatsapp.controller.js";
import { captureRawBody, verifySignature } from "../middlewares/whatsappMiddlewares.js";

const router = Router();

// Meta webhook verification (GET)
//router.get("/webhook", verifyWebhook);

// Inbound events (POST)
// captureRawBody replaces express.json() for this route
// verifySignature validates the Meta HMAC header
//router.post("/webhook",  verifySignature, receiveWebhook);
















export default router;