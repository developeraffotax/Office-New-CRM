import express from "express";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartmentDetail,
  fetchDepartments,
  updateDepartment,
  updateUserStatus,
} from "../controllers/departmentController.js";

const router = express.Router();

// Create Department
router.post("/create", createDepartment);
router.put("/edit/:id", updateDepartment);
router.get("/all", fetchDepartments);
router.get("/detail/:id", fetchDepartmentDetail);
router.delete("/delete/:id", deleteDepartment);
router.put("/update/status/:id", updateUserStatus);

export default router;
