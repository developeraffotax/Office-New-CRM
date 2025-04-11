import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  assignEmail,
  deleteinboxEmail,
  deleteMultipleEmail,
  deleteTicket,
  getAllInbox,
  getAllSendTickets,
  getCompleteTickets,
  getDashboardTickets,
  getInboxDetail,
  getSingleEmailDetail,
  getTicketAttachments,
  markAsRead,
  markAsReadInboxEmail,
  sendEmail,
  sendTicketReply,
  singleTicket,
  singleTicketComments,
  updateTickets,
} from "../controllers/ticketController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Send Email
router.post("/send/email", requiredSignIn, upload.array("files"), sendEmail);

// Get Single Email Detail
router.get(
  "/single/email/detail/:mailThreadId/:company/:ticketId",
  getSingleEmailDetail
);

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

// Ticket Reply
router.post(
  "/reply/email",
  requiredSignIn,
  upload.array("files"),
  sendTicketReply
);

// Mark as Read
router.put("/markAsRead/:id", markAsRead);

// Get Comments
router.get("/ticket/comments/:id", singleTicketComments);

// Get Complete Ticket
router.get("/complete/tickets", getCompleteTickets);

// Fetch All Inbox
router.get("/fetch/inbox/:selectedCompany/:pageNo/:type", getAllInbox);

// Delete Email
router.delete(
  "/delete/inbox/email/:id/:companyName",
  requiredSignIn,
  deleteinboxEmail
);

// Delete Multiple Email
router.delete(
  "/delete/multiple/email/:companyName",
  requiredSignIn,
  deleteMultipleEmail
);

// Get Single Email Detail
router.get("/single/inbox/detail/:mailThreadId/:company", getInboxDetail);

// Mark as Read Inbox
router.put("/markAsRead/inbox/email", markAsReadInboxEmail);

// Assign Inbox email to User
router.post("/assign/email", requiredSignIn, assignEmail);

// Dashboard Tickets
router.get("/dashboard/tickets", getDashboardTickets);

export default router;
