import express from "express";
import {
  createDublicateJob,
  createJob,
  deleteClientJob,
  getAllClients,
  getClientJobs,
  getClientWithJobs,
  importData,
  singleClientComments,
  singleClientJob,
  updateClientJob,
  updateClientStatus,
  updateDates,
  updateJobHolder,
  updateLead,
  updateStatus,
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

router.post("/import/data", upload.single("file"), requiredSignIn, importData);

export default router;
