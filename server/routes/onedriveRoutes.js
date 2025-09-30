import express from "express";
import axios from "axios";
 
import { getClientFolder } from "../controllers/oneDriveController.js";


const router = express.Router();

router.get("/onedrive/folder/:clientName", getClientFolder);

export default router;
