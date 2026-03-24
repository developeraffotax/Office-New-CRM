import mongoose from "mongoose";
import aiProject from "../models/aiProject.js";

 

// ---------------- CREATE ----------------
export const createAiProject = async (req, res) => {
  try {
    const project = await aiProject.create({
      ...req.body,
      createdBy: new mongoose.Types.ObjectId(req.user.user._id),
    });

    res.status(201).json({
      success: true,
      message: "AI Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create AI Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating AI project",
      error: error.message,
    });
  }
};

// ---------------- GET ALL ----------------
export const getAllAiProjects = async (req, res) => {
  try {
    const { companyName } = req.query;
    

    const filter = {
      companyName,
      createdBy: req.user.user._id
    };
    

    const projects = await aiProject.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get AI Projects Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching AI projects",
      error: error.message,
    });
  }
};

// ---------------- GET SINGLE ----------------
export const getAiProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await aiProject.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "AI Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get AI Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching AI project",
      error: error.message,
    });
  }
};

// ---------------- UPDATE ----------------
export const updateAiProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await aiProject.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "AI Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "AI Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update AI Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating AI project",
      error: error.message,
    });
  }
};

// ---------------- DELETE ----------------
export const deleteAiProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await aiProject.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "AI Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "AI Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete AI Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting AI project",
      error: error.message,
    });
  }
};