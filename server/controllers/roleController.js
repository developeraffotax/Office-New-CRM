import mongoose from "mongoose";
import roleModel from "../models/roleModel.js";

// Create Roles
export const postRole = async (req, res) => {
  try {
    const { name, access } = req.body;

    console.log(name);

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

// Updated
// export const updateRole = async (req, res) => {
//   try {
//     const roleId = req.params.id;
//     const { name, access, subRoles } = req.body;

//     console.log("subRoles", subRoles);

//     const existingRole = await roleModel.findById(roleId);
//     if (!existingRole) {
//       return res.status(404).send({
//         success: false,
//         message: "Role not found!",
//       });
//     }

//     // Format the access array
//     const formattedAccess = access
//       ? access.map((permission) => ({
//           permission,
//           subRoles: [],
//         }))
//       : existingRole.access;

//     // Update subRoles based on the provided subRoles array
//     if (subRoles) {
//       subRoles.forEach(({ pageName, subRole }) => {
//         formattedAccess.forEach((item) => {
//           if (item.permission === pageName) {
//             item.subRoles = subRole.map((item) => item);
//           }
//         });
//       });
//     }

//     // Update the role with formatted access
//     const updatedRole = await roleModel.findByIdAndUpdate(
//       { _id: roleId },
//       {
//         name: name ? name : existingRole.name,
//         access: formattedAccess,
//       },
//       { new: true }
//     );

//     res.status(200).send({
//       success: true,
//       message: "Role updated successfully!",
//       role: updatedRole,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error while updating role!",
//     });
//   }
// };

export const updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { name, access, subRoles } = req.body;

    console.log("subRoles", access, subRoles);

    const existingRole = await roleModel.findById(roleId);
    if (!existingRole) {
      return res.status(404).send({
        success: false,
        message: "Role not found!",
      });
    }

    // Format the access array
    const formattedAccess = access
      ? access.map((permission) => ({
          permission,
          subRoles: [],
        }))
      : existingRole.access;

    // Ensure subRoles is in an array format
    if (subRoles && typeof subRoles === "object") {
      // Convert subRoles object to array if necessary
      const subRolesArray = Object.keys(subRoles)
        .filter((key) => !isNaN(key))
        .map((key) => subRoles[key]);

      // Iterate over the subRoles array
      subRolesArray.forEach(({ pageName, subRole }) => {
        formattedAccess.forEach((item) => {
          if (item.permission === pageName) {
            item.subRoles = subRole.map((item) => item);
          }
        });
      });

      // Additionally handle named keys like "Jobs"
      Object.keys(subRoles).forEach((key) => {
        if (isNaN(key)) {
          formattedAccess.forEach((item) => {
            if (item.permission === key) {
              item.subRoles = subRoles[key];
            }
          });
        }
      });
    }

    // Update the role with formatted access
    const updatedRole = await roleModel.findByIdAndUpdate(
      { _id: roleId },
      {
        name: name ? name : existingRole.name,
        access: formattedAccess,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Role updated successfully!",
      role: updatedRole,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating role!",
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
