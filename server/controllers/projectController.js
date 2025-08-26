import projectModel from "../models/projectModel.js";
import taskModel from "../models/taskModel.js";

// ✅ Create Project
export const createProject = async (req, res) => {
  try {
    const { projectName, users_list, departments } = req.body;

    console.log("Project Name:", projectName);
    console.log("Users List:", users_list);
    console.log("Department IDs:", departments);

    if (!projectName) {
      return res.status(400).send({
        success: false,
        message: "Project Name is required!",
      });
    }

    const existingProject = await projectModel.findOne({ projectName });
    if (existingProject) {
      return res.status(400).send({
        success: false,
        message: "Project with this name already exists!",
      });
    }

    const projectCount = await projectModel.countDocuments();

    const project = await projectModel.create({
      projectName,
      users_list: users_list || [],
      order: projectCount,
      departments: Array.isArray(departments) ? departments : [], // ✅ store multiple departments
    });

    res.status(200).send({
      success: true,
      message: "Project created successfully!",
      project,
    });
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).send({
      success: false,
      message: "Error in create project!",
      error,
    });
  }
};

// ✅ Update Project
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }

    const { projectName, users_list, departments } = req.body;

    if (!projectName) {
      return res.status(400).send({
        success: false,
        message: "Project Name is required!",
      });
    }

    const existingProject = await projectModel.findById(projectId);
    if (!existingProject) {
      return res.status(404).send({
        success: false,
        message: "Project not found!",
      });
    }

    const project = await projectModel.findByIdAndUpdate(
      projectId,
      {
        projectName,
        users_list: users_list || [],
        departments: Array.isArray(departments) ? departments : [], // ✅ update multiple departments
      },
      { new: true }
    );

    // // ✅ Update tasks if they embed project object
    // await taskModel.updateMany(
    //   { "project._id": project._id },
    //   { $set: { project } }
    // );

    res.status(200).send({
      success: true,
      message: "Project updated successfully!",
      project,
    });
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(500).send({
      success: false,
      message: "Error in update project!",
      error,
    });
  }
};

// Get All Projects

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel
      .find({ status: { $ne: "completed" } }).populate("departments") // ✅ populate departments
      .sort({ order: 1 });

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

// Reordering
export const reordering = async (req, res) => {
  try {
    const { projects } = req.body;
    await Promise.all(
      projects.map((project, index) =>
        projectModel.findByIdAndUpdate(
          project._id,
          { order: index + 1 },
          { new: true }
        )
      )
    );
    res.status(200).json({ message: "Project order updated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error while reordering projects!",
      error: error,
    });
  }
};
