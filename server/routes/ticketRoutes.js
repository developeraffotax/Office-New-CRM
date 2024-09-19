import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import { sendEmail } from "../controllers/ticketController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Send Email
router.post("/send/email", requiredSignIn, upload.array("files"), sendEmail);

export default router;
