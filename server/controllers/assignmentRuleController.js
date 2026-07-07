import mongoose from "mongoose";
 import userModel from "../models/userModel.js";
import assignmentRuleModel from "../models/assignmentRuleModel.js";

export const getAssignmentRules = async (req, res) => {
  try {
    const rules = await assignmentRuleModel
      .find()
      // .populate("assignedUsers", "_id name email avatar");

    return res.json({
      success: true,
      data: rules,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment rules.",
    });
  }
};

export const saveAssignmentRule = async (req, res) => {
  try {
    const { type, strategy, assignedUsers = [] } = req.body;

    if (!["quote", "whatsapp_lead"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment type.",
      });
    }

    if (!["fixed", "round_robin", "random"].includes(strategy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment strategy.",
      });
    }

    if (!Array.isArray(assignedUsers)) {
      return res.status(400).json({
        success: false,
        message: "assignedUsers must be an array.",
      });
    }

    const validIds = assignedUsers.filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    const users = await userModel.find({
      _id: { $in: validIds },
      isActive: true,
    });

    const rule = await assignmentRuleModel.findOneAndUpdate(
      { type },
      {
        strategy,
        assignedUsers: users.map((u) => u._id),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).populate("assignedUsers", "_id name email avatar");

    return res.json({
      success: true,
      message: "Assignment rule updated successfully.",
      data: rule,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to save assignment rule.",
    });
  }
};


export const deleteAssignmentRule = async (req, res) => {
  try {
    const { type } = req.params;

    await assignmentRuleModel.findOneAndDelete({ type });

    return res.json({
      success: true,
      message: "Assignment rule removed successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to remove assignment rule.",
    });
  }
};