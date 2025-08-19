import TaskDepartment from "../models/taskDepartment.js";

/**
 * Create Department
 */
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, users, type } = req.body;

    const department = new TaskDepartment({
      departmentName,
      users,
      type,
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Departments
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await TaskDepartment.find().populate("users.user");

    res.status(200).json({
      success: true,
      departments: departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Single Department
 */
export const getDepartmentById = async (req, res) => {
  try {
    const department = await TaskDepartment.findById(req.params.id).populate(
      "users.user"
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Department
 */
export const updateDepartment = async (req, res) => {
  try {
    const { departmentName, users, type } = req.body;

    const department = await TaskDepartment.findByIdAndUpdate(
      req.params.id,
      { departmentName, users, type },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Department
 */
export const deleteDepartment = async (req, res) => {
  try {
    const department = await TaskDepartment.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
