import projectModel from "../models/projectModel.js";
import taskModel from "../models/taskModel.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { projectName, users_list } = req.body;

    if (!projectName) {
      return res.status(400).send({
        success: false,
        message: "Project Name is required!",
      });
    }

    const existingProject = await projectModel.findOne({
      projectName: projectName,
    });

    if (existingProject) {
      return res.status(400).send({
        success: false,
        message: "Project with this name already exist!",
      });
    }

    const project = await projectModel.create({ projectName, users_list });

    res.status(200).send({
      success: true,
      message: "Project created successfully!",
      project: project,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in create project!",
      error: error,
    });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }
    const { projectName, users_list } = req.body;

    if (!projectName) {
      return res.status(400).send({
        success: false,
        message: "Project Name is required!",
      });
    }

    const existingProject = await projectModel.findById(projectId);
    if (!existingProject) {
      return res.status(400).send({
        success: false,
        message: "Project not found!",
      });
    }

    const project = await projectModel.findByIdAndUpdate(
      { _id: existingProject._id },
      { projectName, users_list },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Project update successfully!",
      project: project,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in update project!",
      error: error,
    });
  }
};

// Get All Projects

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel
      .find({ status: { $ne: "completed" } })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All Project list",
      projects: projects,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in get all projects!",
      error: error,
    });
  }
};

// Get Single Project
export const getSingleProjects = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }
    const project = await projectModel.findById(projectId);

    res.status(200).send({
      success: true,
      message: "Single Project",
      project: project,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in get project!",
      error: error,
    });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }
    await projectModel.findByIdAndDelete({ _id: projectId });

    res.status(200).send({
      success: true,
      message: "Project deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in delete project!",
      error: error,
    });
  }
};

// Update Status
export const updateProjectStatus = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(400).send({
        success: false,
        message: "Project not found!",
      });
    }

    if (project.status === "processing") {
      await projectModel.findByIdAndUpdate(projectId, {
        $set: { status: "completed" },
      });

      const tasks = await taskModel.updateMany(
        { "project._id": projectId },
        { $set: { status: "completed" } },
        { new: true }
      );
    } else {
      await projectModel.findByIdAndUpdate(projectId, {
        $set: { status: "processing" },
      });
    }

    res.status(200).send({
      success: true,
      message: "Project status updated!",
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in project status!",
      error: error,
    });
  }
};

// Get Project
export const getCompleteProjects = async (req, res) => {
  try {
    const projects = await projectModel
      .find({ status: "completed" })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All completed project list",
      projects: projects,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in get completed projects!",
      error: error,
    });
  }
};
