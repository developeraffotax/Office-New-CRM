import subtaskListModel from "../models/subtaskListModel.js";

 


// ✅ Create new list
export const createSubtaskList = async (req, res) => {
  try {
    const { name, items, } = req.body;
    const createdBy = req.user.user.id; // Assuming user ID is available in req.userId

    // Validate input
    if (!name) {
      return res.status(400).json({ success: false, message: "Name  required." });
    }

    // Ensure items is an array (optional)
    if (items && !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items must be an array." });
    }

    const list = await subtaskListModel.create({ name, items, createdBy });

    res.status(201).json({ success: true, data: list });
  } catch (err) {
    console.error("Error creating subtask list:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create subtask list.",
      error: err.message,
    });
  }
};

// ✅ Get all lists
export const getAllSubtaskLists = async (req, res) => {
  try {
    const lists = await subtaskListModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: lists });
  } catch (err) {
    console.error("Error fetching subtask lists:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subtask lists.",
      error: err.message,
    });
  }
};

// ✅ Delete a list
export const deleteSubtaskList = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "List ID is required." });
    }

    const deleted = await subtaskListModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Subtask list not found." });
    }

    res.status(200).json({ success: true, message: "Subtask list deleted successfully." });
  } catch (err) {
    console.error("Error deleting subtask list:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete subtask list.",
      error: err.message,
    });
  }
};
