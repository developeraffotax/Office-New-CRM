import departmentModel from "../models/departmentModel.js";
import hrModel from "../models/hrModel.js";

// Create
export const createHrTask = async (req, res) => {
  try {
    const { title, department, category, software, description } = req.body;

    const departmentDetail = await departmentModel.findById(department);
    if (!departmentDetail) {
      return res.status(404).send({
        success: false,
        message: "Department not found!",
      });
    }

    const task = await hrModel.create({
      title,
      department,
      category,
      software,
      description,
      users: departmentDetail.users,
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

    const departmentDetail = await departmentModel.findById(department);
    if (!departmentDetail) {
      return res.status(404).send({
        success: false,
        message: "Department not found!",
      });
    }

    const existingUsersMap = new Map(
      existingTask.users.map((userObj) => [
        userObj.user.toString(),
        userObj.status,
      ])
    );

    const updatedUsers = departmentDetail.users.map((userObj) => {
      return {
        user: userObj.user,
        status: existingUsersMap.get(userObj.user.toString()) || "No",
      };
    });

    const task = await hrModel.findByIdAndUpdate(
      { _id: existingTask._id },
      {
        title,
        department,
        category,
        software,
        description,
        users: updatedUsers,
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
      .populate({
        path: "users.user",
        select: "name email",
      })
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
      .populate({
        path: "users.user",
        select: "name email",
      })
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

// Copy Task
export const copyHrTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await hrModel.findById(taskId);

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Hr task not found!",
      });
    }

    const taskData = { ...task.toObject() };
    delete taskData._id;
    delete taskData.createdAt;
    delete taskData.updatedAt;

    const copyTask = await hrModel.create(taskData);

    res.status(200).send({
      success: true,
      message: "Task copy successfully!",
      copyTask: copyTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while copy hr task!",
      error: error,
    });
  }
};

// Update User Status
export const updateUserStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { statusId, status } = req.body;

    const task = await hrModel.findById(taskId);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Task not found!",
      });
    }

    const userIndex = task.users.findIndex(
      (user) => user._id.toString() === statusId
    );

    if (userIndex === -1) {
      return res.status(404).send({
        success: false,
        message: "User not found in this project!",
      });
    }

    task.users[userIndex].status = status;

    await task.save();

    res.status(200).send({
      success: true,
      message: "User status updated successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while update user status, please try again!",
    });
  }
};
