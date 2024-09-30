import roleModel from "../models/roleModel.js";

// Create Roles
export const postRole = async (req, res) => {
  try {
    const { name, access } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Role name is required!",
      });
    }

    const role = await roleModel.create({ name, access });

    res.status(200).send({
      success: true,
      message: "Role create successfully!",
      role: role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create role!",
    });
  }
};

// Get All Roles
export const getAllRole = async (req, res) => {
  try {
    const roles = await roleModel.find({}).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All Role list!",
      roles: roles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetch all roles!",
    });
  }
};

// Update Roles
export const updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { name, access } = req.body;

    const existingRole = await roleModel.findById(roleId);

    const role = await roleModel.findByIdAndUpdate(
      { _id: roleId },
      { name: name ? name : existingRole.name, access },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Role update successfully!",
      role: role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update role!",
    });
  }
};

// Delete Roles
export const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    if (!roleId) {
      return res.status(400).send({
        success: false,
        message: "Role id is required!",
      });
    }

    await roleModel.findByIdAndDelete(roleId);

    res.status(200).send({
      success: true,
      message: "Role deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete role!",
    });
  }
};

// Get Single Role
export const getSingleRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    if (!roleId) {
      return res.status(400).send({
        success: false,
        message: "Role id is required!",
      });
    }

    const role = await roleModel.findById(roleId);

    res.status(200).send({
      success: true,
      message: "Single Role!",
      role: role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single role!",
    });
  }
};
