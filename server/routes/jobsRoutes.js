import express from "express";
import {
  addDatalabel,
  addlabel,
  createDublicateJob,
  createJob,
  createSubTask,
  dashboardCompletedClients,
  deleteClientJob,
  deleteSubTask,
  getAllClients,
  getClientJobs,
  getClientWithJobs,
  getDashboardClients,
  getInactiveClientJobs,
  getTicketClients,
  getWorkflowClients,
  importData,
  singleClientComments,
  singleClientJob,
  updateBulkJob,
  updateClientJob,
  updateClientStatus,
  updateDates,
  updateJobHolder,
  updateLead,
  updateStatus,
  updateSubTaskStaus,
  updateTime,
} from "../controllers/jobController.js";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import multer from "multer";
// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Create Client
router.post("/create/client/job", requiredSignIn, createJob);

// Get All Client
router.get("/all/client/job", getAllClients);

// Update Status
router.patch("/update/status/:id", requiredSignIn, updateStatus);

// Update Lead
router.patch("/update/lead/:id", requiredSignIn, updateLead);

// Update Job Holder
router.patch("/update/jobholder/:id", requiredSignIn, updateJobHolder);

// Single Client Job
router.get("/single/client/:id", requiredSignIn, singleClientJob);

// Delete Client
router.delete("/delete/job/:id", requiredSignIn, deleteClientJob);

// Get Client with all jobs
router.get("/jobs", getClientWithJobs);

// Update Client Job
router.put("/update/job", requiredSignIn, updateClientJob);

// Update Dates
router.put("/update/dates/:id", requiredSignIn, updateDates);

// Get Comments
router.get("/job/comments/:id", singleClientComments);

// Get Only Status (Completed) Jobs
router.get("/jobs/status/complete", getClientJobs);

// Create Dublicate Job (Completed)
router.post("/dublicate/job/complete", requiredSignIn, createDublicateJob);

// Update Client Status
router.put("/update/client/status/:id", requiredSignIn, updateClientStatus);

// Add Label
router.put("/add/job/labe/:id", requiredSignIn, addlabel);

router.post("/import/data", upload.single("file"), requiredSignIn, importData);

// <-----Subtask----->
// Create subTask
router.post("/create/subTask/:id", requiredSignIn, createSubTask);

// Update Task
router.put("/update/subtask/status/:id", requiredSignIn, updateSubTaskStaus);

// Delete Task
router.delete(
  "/delete/subtask/:jobId/:subTaskId",
  requiredSignIn,
  deleteSubTask
);

// Get All Tickets Routes
router.get("/tickets/clients", getTicketClients);

// Add Label
router.put("/add/job/data/:id", requiredSignIn, addDatalabel);

// Update time
router.put("/update/timer/:id", requiredSignIn, isAdmin, updateTime);

// Update Bulk Jobs
router.put("/update/bulk/job", requiredSignIn, isAdmin, updateBulkJob);

// Get Workflow Clients
router.get("/workflow/clients", getWorkflowClients);
// Dashboard Client
router.get("/dashboard/clients/:type", getDashboardClients);
router.get("/completed/clients", dashboardCompletedClients);

// Get Inactive Client_Job
router.get("/inactive/clients", getInactiveClientJobs);

export default router;
