import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  assignEmail,
  createTicket,
  deleteinboxEmail,
  deleteMultipleEmail,
  deleteTicket,
  getAllInbox,
  getAllSendTickets,
  getCompleteTickets,
  getDashboardTickets,
  getInboxDetail,
  getSentReceivedCountsPerThread,
  getSingleEmailDetail,
  getTicketActivity,
  getTicketActivityStats,
  getTicketAttachments,
  getTicketsByClientName,
  markAsRead,
  markAsReadInboxEmail,
  sendEmail,
  sendTicketReply,
  singleTicket,
  singleTicketByMailThreadId,
  singleTicketComments,
  updateBulkTickets,
  updateReadUnreadTickets,
  updateTickets,
} from "../controllers/ticketController.js";
import multer from "multer";
import { getMessageSender, getThreadSenders, getTicketActivities } from "../controllers/ticketActivityController.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Send Email
router.post("/send/email", requiredSignIn, upload.array("files"), sendEmail);
router.post("/create-ticket", requiredSignIn, createTicket);

// Get Single Email Detail
router.get(
  "/single/email/detail/:mailThreadId/:company/:ticketId",
  getSingleEmailDetail
);

// Get All Send Tickets
router.get("/all/tickets",requiredSignIn, getAllSendTickets);


// Get All Send Tickets
router.get("/all/tickets-replies",requiredSignIn, getSentReceivedCountsPerThread);

// Get All Send Tickets      ------------------->>>    /api/v1/tickets/all/ticketsByClientName/:clientName
router.get("/all/ticketsByClientName", getTicketsByClientName);

 

// Delete Ticket
router.delete("/delete/ticket/:id", requiredSignIn, deleteTicket);

// Update Ticket
router.put("/update/ticket/:id", requiredSignIn, updateTickets);

// Get Single Ticket
router.get("/single/ticket/:id", singleTicket);


//get single ticket using the mail thrad id
router.get("/get/mailThreadId/:id", singleTicketByMailThreadId);

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
router.get("/complete/tickets", requiredSignIn, getCompleteTickets);

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




router.get("/activity/:ticketId", requiredSignIn, getTicketActivities);

// router.get("/activity/:gmailMessageId",requiredSignIn, getMessageSender)
router.get("/activity/map/:ticketId",requiredSignIn, getThreadSenders)
// Update Bulk Tickets
router.put("/update/bulk/tickets", requiredSignIn, isAdmin, updateBulkTickets);
















// Protected GET route to trigger the update manually
router.get("/update-tickets", requiredSignIn, async (req, res) => {
  try {
    await getSentReceivedCountsPerThread();
    // await updateReadUnreadTickets(req, res)
    res.status(200).json({ message: "Tickets updated successfully." });
  } catch (error) {
    console.error("Manual update error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

















router.get("/userchart/ticketActivity",    getTicketActivity);
router.get("/userchart/ticketActivity/stats",    getTicketActivityStats);







export default router;
