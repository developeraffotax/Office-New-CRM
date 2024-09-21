import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  deleteTicket,
  getAllSendTickets,
  getSingleEmailDetail,
  getTicketAttachments,
  sendEmail,
  singleTicket,
  updateTickets,
} from "../controllers/ticketController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Send Email
router.post("/send/email", requiredSignIn, upload.array("files"), sendEmail);

// Get Single Email Detail
router.get("/single/email/detail/:mailThreadId/:company", getSingleEmailDetail);

// Get All Send Tickets
router.get("/all/tickets", getAllSendTickets);

// Delete Ticket
router.delete("/delete/ticket/:id", requiredSignIn, deleteTicket);

// Update Ticket
router.put("/update/ticket/:id", requiredSignIn, updateTickets);

// Get Single Ticket
router.get("/single/ticket/:id", singleTicket);

// Get Attachment
router.get(
  "/get/attachments/:attachmentId/:messageId/:companyName",
  requiredSignIn,
  getTicketAttachments
);

export default router;
