import departmentModel from "../models/departmentModel.js";

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, users, type } = req.body;

    if (!departmentName) {
      return res.status(400).json({ message: "Department name is required" });
    }
    if (!users) {
      return res.status(400).json({ message: "Users is required" });
    }

    const department = await departmentModel.create({
      departmentName,
      users,
      type,
    });

    res.status(200).send({
      success: true,
      message: "Department created successfully!",
      department: department,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while create department, please try again!",
    });
  }
};
// Udpate Department
export const updateDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { departmentName, users, type } = req.body;

    const department = await departmentModel.findById(departmentId);
    if (!department) {
      return res.status(404).send({
        success: false,
        message: "Department not found!",
      });
    }

    const updateDepartment = await departmentModel.findByIdAndUpdate(
      { _id: department._id },
      {
        departmentName,
        users,
        type,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Department updated successfully!",
      department: updateDepartment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while updated department, please try again!",
    });
  }
};
// Fetch All Department
export const fetchDepartments = async (req, res) => {
  try {
    const departments = await departmentModel
      .find({})
      .populate("users", "name email");

    res.status(200).send({
      success: true,
      message: "Department list!",
      departments: departments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while fetch all departments, please try again!",
    });
  }
};
// Fetch Department Detail
export const fetchDepartmentDetail = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await departmentModel
      .findById(departmentId)
      .populate("users", "name email");

    res.status(200).send({
      success: true,
      message: "Department detail!",
      department: department,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while fetch department detail, please try again!",
    });
  }
};
// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await departmentModel.findById(departmentId);
    if (!department) {
      return res.status(404).send({
        success: false,
        message: "Department not found!",
      });
    }

    await departmentModel.findByIdAndDelete(department._id);

    res.status(200).send({
      success: true,
      message: "Department deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while delete department, please try again!",
    });
  }
};
