import mongoose from "mongoose";
import { comparePassword, hashPassword } from "../helper/encryption.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import labelModel from "../models/labelModel.js";

// Create User
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      username,
      phone,
      emergency_contact,
      address,
      role,
      avatar,
    } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: `Email is required!`,
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: `Password is required!`,
      });
    }

    // Existing User
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "This email is already registered!",
      });
    }

    // hash Password
    const hashedPassword = await hashPassword(password);

    const userCount = await userModel.countDocuments();

    // Save
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      username,
      phone,
      emergency_contact,
      address,
      role,
      avatar,
      order: userCount,
    });

    res.status(200).send({
      success: true,
      message: "User registered successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while register user!",
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: `Email is required!`,
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: `Password is required!`,
      });
    }

    const user = await userModel
      .findOne({ email: new RegExp(`^${email}$`, "i") })
      .populate("role");
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password!",
      });
    }

    if (user.isActive === false) {
      return res.status(400).send({
        success: false,
        message:
          "Access Denied: Your account has been temporarily blocked by the administrator. Please contact support for Admin.",
      });
    }

    // Compare Password
    const isPassword = await comparePassword(password, user.password);
    if (!isPassword) {
      return res.status(400).send({
        success: false,
        message: "Invalid Password!",
      });
    }

    const token = await jwt.sign(
      { id: user._id, user: user },
      process.env.JWT_SECRET,
      {
        expiresIn: "29d",
      }
    );

    res.status(200).send({
      success: true,
      message: "Login successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        emergency_contact: user.emergency_contact,
        address: user.address,
        isActive: user.isActive,
        role: user.role,
        avatar: user.avatar,
        access: user.access,
      },
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while login user!",
    });
  }
};

// Get All User
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({ name: { $ne: "Salmans" } })
      .select("-password")
      .populate("role")
      .populate("data")
      .sort({ order: 1 });

    res.status(200).send({
      total: users.length,
      success: true,
      message: "All users list",
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all users!",
    });
  }
};

// Get All Users(wothout InActive)
export const getAllActiveUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({ isActive: { $ne: false }, name: { $ne: "Salmans" } })
      .select("-password")
      .populate("role")
      .sort({ order: 1 });

    res.status(200).send({
      total: users.length,
      success: true,
      message: "All users list",
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all users!",
    });
  }
};

// Get Single User
export const singleUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "UserId is required!",
      });
    }
    const user = await userModel
      .findOne({ _id: userId })
      .select("-password")
      .populate("role");
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).send({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get user!",
    });
  }
};

// Update User
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      username,
      email,
      phone,
      emergency_contact,
      address,
      avatar,
      isActive,
      createdAt,
      updatedAt,
      juniors
    } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User Id is required!",
      });
    }

    // Validate userId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid User Id!",
      });
    }

    // Find the existing user by userId
    const isExisting = await userModel.findById(userId).select("-password");

    if (!isExisting) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    console.log("userinfo:", isExisting);

    // Update user profile
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name: name !== undefined ? name : isExisting.name,
        email: email !== undefined ? email : isExisting.email,
        username: username !== undefined ? username : isExisting.username,
        phone: phone !== undefined ? phone : isExisting.phone,
        emergency_contact:
          emergency_contact !== undefined
            ? emergency_contact
            : isExisting.emergency_contact,
        address: address !== undefined ? address : isExisting.address,
        avatar: avatar || isExisting.avatar,
        isActive: isActive !== undefined ? isActive : isExisting.isActive,
        createdAt: createdAt || isExisting.createdAt,
        updatedAt: updatedAt || isExisting.updatedAt,
        juniors: juniors
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile updated!",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while updating user profile!",
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User Id is required!",
      });
    }

    const user = await userModel
      .findOne({ _id: userId })
      .select("email password name");
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    await userModel.findByIdAndDelete({ _id: user._id });

    res.status(200).send({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete user!",
    });
  }
};

// Update Role
export const updateRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User Id is required!",
      });
    }

    const user = await userModel
      .findOne({ _id: userId })
      .select("email name role");
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    const updateRole = await userModel
      .findByIdAndUpdate({ _id: user._id }, { role: role }, { new: true })
      .select("-password");

    res.status(200).send({
      success: true,
      message: "Role updated!",
      user: updateRole,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update user role!",
    });
  }
};

// Get ALl Dashboard Users
export const getDashboardUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({ name: { $ne: "Salmans" }, isActive: { $ne: false } })
      .populate("role", "name")
      .select(" name createdAt role")
      .sort({ order: 1 });

    res.status(200).send({
      total: users.length,
      success: true,
      message: "All users list",
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all users!",
    });
  }
};

// Add data Label
export const addDatalabel = async (req, res) => {
  try {
    const userId = req.params.id;
    const { labelId } = req.body;

    const label = await labelModel.findById(labelId);

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found!",
      });
    }

    const updateUser = await userModel.findByIdAndUpdate(
      { _id: user._id },
      { data: label._id },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Data Label added!",
      user: updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in add user label!",
      error: error,
    });
  }
};

// Reordering
export const reordering = async (req, res) => {
  try {
    const { usersData } = req.body;
    await Promise.all(
      usersData.map((user, index) =>
        userModel.findByIdAndUpdate(
          user._id,
          { order: index + 1 },
          { new: true }
        )
      )
    );
    res.status(200).json({ message: "User order updated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error while reordering users!",
      error: error,
    });
  }
};
