import hrModel from "../models/hrModel.js";

// Create
export const createHrTask = async (req, res) => {
  try {
    const { title, department, category, software, description } = req.body;

    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    const task = await hrModel.create({
      title,
      department,
      category,
      software,
      description,
    });

    res.status(200).send({
      success: true,
      message: "HR task created successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Update
export const updateHrTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, department, category, software, description } = req.body;

    const existingTask = await hrModel.findById(taskId);

    if (!existingTask) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    const task = await hrModel.findByIdAndUpdate(
      { _id: existingTask._id },
      {
        title,
        department,
        category,
        software,
        description,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "HR task updated successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while update hr task!",
      error: error,
    });
  }
};

// Fetch All
export const allHrTask = async (req, res) => {
  try {
    const tasks = await hrModel
      .find({})
      .populate("department")
      .populate({
        path: "department",
        populate: {
          path: "users.user",
          select: "name email",
        },
      });

    res.status(200).send({
      success: true,
      message: "HR tasks list!",
      tasks: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while get hr tasks!",
      error: error,
    });
  }
};

// Fetch By ID
export const hrTaskDetail = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await hrModel
      .findById(taskId)
      .populate("department")
      .populate({
        path: "department",
        populate: {
          path: "users.user",
          select: "name email",
        },
      });

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "HR task detail!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while get hr task detail!",
      error: error,
    });
  }
};

// Delete By ID
export const deleteHrTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await hrModel.findById(taskId);

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    await hrModel.findByIdAndDelete({ _id: task._id });

    res.status(200).send({
      success: true,
      message: "HR task deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while delete hr task detail!",
      error: error,
    });
  }
};
