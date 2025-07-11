import express from "express";
import {
  addDatalabel,
  addJobActivity,
  addlabel,
  createDublicateJob,
  createJob,
  createQuality,
  createQualityForAllJobs,
  createSubTask,
  dashboardCompletedClients,
  deleteClientJob,
  deleteQuality,
  deleteSubTask,
  getAllClients,
  getClientJobs,
  getClientWithJobs,
  getDashboardClients,
  getInactiveClientJobs,
  getTicketClients,
  getWorkflowClients,
  importData,
  reordering,
  singleClientComments,
  singleClientJob,
  updateBulkJob,
  updateClientJob,
  updateClientStatus,
  updateDates,
  updateFee,
  updateJobHolder,
  updateLead,
  updateQuality,
  updateStatus,
  updateSubTaskStaus,
  updateTime,
  updateUsers,
  updateWorkPlan,
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

// Update Fee
router.patch("/update/fee/:id", requiredSignIn, updateFee);

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
router.put("/update/bulk/job", requiredSignIn,  updateBulkJob);

// Get Workflow Clients
router.get("/workflow/clients", getWorkflowClients);

// Dashboard Client
router.get("/dashboard/clients/:type", getDashboardClients);
router.get("/completed/clients", dashboardCompletedClients);

// Get Inactive Client_Job
router.get("/inactive/clients", getInactiveClientJobs);

// Update WorkPlain
router.put("/update/workplain/:id", requiredSignIn, updateWorkPlan);

// Update (Prepared|Review|Filed)
router.put("/job/users/:id", requiredSignIn, updateUsers);

// ------------------------------Qulity Check-------------------------------->
// Create Quality Check
router.post("/create/quality/:id", requiredSignIn, createQuality);

// Update Quality Chec
router.put("/update/quality/status/:id", requiredSignIn, updateQuality);

// Delete Quality Check
router.delete(
  "/delete/quality/:jobId/:qualityId",
  requiredSignIn,
  deleteQuality
);

// Reordering Quality Check
router.put("/reordering/:id", requiredSignIn, reordering);

// Add Quality Check to All Jobs
router.post("/add/quality/all", requiredSignIn, createQualityForAllJobs);





// /api/v1/client/jobActivity/:jobId
router.post("/jobActivity/:jobId", requiredSignIn, addJobActivity);



export default router;
