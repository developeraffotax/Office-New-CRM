import mongoose from "mongoose";
import { comparePassword, hashPassword } from "../helper/encryption.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

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

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password!",
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

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");

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
    const user = await userModel.findOne({ _id: userId }).select("-password");
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
    const { name, username, phone, emergency_contact, address, avatar } =
      req.body;

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
    const isExisting = await userModel.findById(userId).select("-avatar");

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
        username: username !== undefined ? username : isExisting.username,
        phone: phone !== undefined ? phone : isExisting.phone,
        emergency_contact:
          emergency_contact !== undefined
            ? emergency_contact
            : isExisting.emergency_contact,
        address: address !== undefined ? address : isExisting.address,
        avatar: avatar || isExisting.avatar,
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
