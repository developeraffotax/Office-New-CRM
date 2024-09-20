import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  deleteTicket,
  getAllSendTickets,
  getSingleEmailDetail,
  sendEmail,
  updateTickets,
} from "../controllers/ticketController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Send Email
router.post("/send/email", requiredSignIn, upload.array("files"), sendEmail);

// Get Single Email Detail
router.get("/single/email/detail", getSingleEmailDetail);

// Get All Send Tickets
router.get("/all/tickets", getAllSendTickets);

// Delete Ticket
router.delete("/delete/ticket/:id", requiredSignIn, deleteTicket);

// Update Ticket
router.put("/update/ticket/:id", requiredSignIn, updateTickets);

export default router;
