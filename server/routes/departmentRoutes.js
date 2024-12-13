import express from "express";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartmentDetail,
  fetchDepartments,
  updateDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

// Create Department
router.post("/create", createDepartment);
router.put("/edit/:id", updateDepartment);
router.get("/all", fetchDepartments);
router.get("/detail/:id", fetchDepartmentDetail);
router.delete("/delete/:id", deleteDepartment);

export default router;
