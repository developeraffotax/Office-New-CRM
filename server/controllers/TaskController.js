import projectModel from "../models/projectModel.js";
import taskModel from "../models/taskModel.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const {
      projectId,
      jobHolder,
      task,
      hours,
      startDate,
      deadline,
      lead,
      label,
    } = req.body;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }
    if (!jobHolder || !lead) {
      return res.status(400).send({
        success: false,
        message: "JobHolder & Lead are required!",
      });
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(400).send({
        success: false,
        message: "Project not found!",
      });
    }

    const tasks = await taskModel.create({
      project: {
        _id: project._id,
        projectName: project.projectName,
        users_list: project.users_list,
        status: project.status,
      },
      jobHolder,
      task,
      hours,
      startDate,
      deadline,
      lead,
      label,
    });

    const user = req.user.user;

    if (tasks) {
      tasks.activities.push({
        userName: user.name,
        profileImage: user.avatar,
        activity: `created a task: ${task} in project: ${project.projectName}`,
      });
    }

    await tasks.save();

    res.status(200).send({
      success: true,
      message: "Task created successfully!",
      task: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in create task!",
      error: error,
    });
  }
};

// Get ALl Projects
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskModel
      .find({ status: { $ne: "completed" } })
      .select(
        "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id label"
      )
      .sort({ updatedAt: -1 });

    res.status(200).send({
      success: true,
      message: "All task list!",
      tasks: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in get all tasks!",
      error: error,
    });
  }
};

// Get Single Task
export const getSingleTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task Id is required!",
      });
    }

    const task = await taskModel.findById(taskId);

    res.status(200).send({
      success: true,
      message: "Single task!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in get single task!",
      error: error,
    });
  }
};

// Update Task/Project
export const updatetaskProject = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { projectId } = req.body;
    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task Id is required!",
      });
    }

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    const updateTask = await taskModel.findByIdAndUpdate(
      task._id,
      {
        project: {
          _id: project._id,
          projectName: project.projectName,
          users_list: project.users_list,
          status: project.status,
        },
      },
      { new: true }
    );
    await updateTask.save();

    res.status(200).send({
      success: true,
      message: "Task project updated!",
      task: updateTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in task project!",
      error: error,
    });
  }
};

// Update JobHolder -/- Lead | Status
export const updateJobHolderLS = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { jobHolder, lead, status } = req.body;

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    let updateTask;

    if (jobHolder) {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { jobHolder: jobHolder },
        { new: true }
      );
    } else if (lead) {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { lead: lead },
        { new: true }
      );
    } else {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { status: status },
        { new: true }
      );
    }

    res.status(200).send({
      success: true,
      message: "Task updated!",
      task: updateTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update task Job_holder/Lead/Status!",
      error: error,
    });
  }
};

// Update Alocate Task
export const updateAlocateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { allocateTask, startDate, deadline } = req.body;

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    let updateTask;

    if (allocateTask) {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { task: allocateTask },
        { new: true }
      );
    } else if (startDate) {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { startDate: startDate },
        { new: true }
      );
    } else {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { deadline: deadline },
        { new: true }
      );
    }

    res.status(200).send({
      success: true,
      message: "Task updated!",
      task: updateTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update task Job_holder/Lead/Status!",
      error: error,
    });
  }
};

// Get Single Task Comments
export const singleTaskComments = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task id is required!",
      });
    }

    const taskComments = await taskModel
      .findById({ _id: taskId })
      .select("comments");

    res.status(200).send({
      success: true,
      comments: taskComments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single job!",
      error: error,
    });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task id is required!",
      });
    }

    await taskModel.findByIdAndDelete({ _id: taskId });

    res.status(200).send({
      success: true,
      message: "Task deleted!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error in delete task: ${error} `,
    });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const {
      projectId,
      jobHolder,
      task,
      hours,
      startDate,
      deadline,
      lead,
      label,
    } = req.body;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Project Id is required!",
      });
    }
    if (!jobHolder || !lead) {
      return res.status(400).send({
        success: false,
        message: "JobHolder & Lead are required!",
      });
    }

    const existingTask = await taskModel.findById(taskId);
    if (!existingTask) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(400).send({
        success: false,
        message: "Project not found!",
      });
    }

    const tasks = await taskModel.findByIdAndUpdate(
      { _id: existingTask._id },
      {
        project: {
          _id: project._id,
          projectName: project.projectName,
          users_list: project.users_list,
          status: project.status,
        },
        jobHolder,
        task,
        hours,
        startDate,
        deadline,
        lead,
        label,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Task updated successfully!",
      task: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update task!",
      error: error,
    });
  }
};

// Create Subtask
export const createSubTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { subTask } = req.body;
    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task Id is required!",
      });
    }
    if (!subTask) {
      return res.status(400).send({
        success: false,
        message: "Subtask is required!",
      });
    }

    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    task.subtasks.push({ subTask: subTask });

    await task.save();

    res.status(200).send({
      success: true,
      message: "Subtask added successfully!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in create subtask!",
      error: error,
    });
  }
};

// Update SubTask Status
export const updateSubTaskStaus = async (req, res) => {
  try {
    const taskId = req.params.id;

    const { subTaskId } = req.body;
    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task Id is required!",
      });
    }
    if (!subTaskId) {
      return res.status(400).send({
        success: false,
        message: "Subtask id is required!",
      });
    }

    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    const subtaskIndex = task.subtasks.findIndex(
      (item) => item._id.toString() === subTaskId
    );
    if (subtaskIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Subtask not found!",
      });
    }

    task.subtasks[subtaskIndex].status =
      task.subtasks[subtaskIndex].status === "process" ? "complete" : "process";

    await task.save();

    res.status(200).send({
      success: true,
      message: "Subtask status updated!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update subtask!",
      error: error,
    });
  }
};

// Delete Subtask
export const deleteSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;

    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Task Id is required!",
      });
    }
    if (!subTaskId) {
      return res.status(400).send({
        success: false,
        message: "Subtask id is required!",
      });
    }

    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    const subtaskIndex = task.subtasks.findIndex(
      (subtask) => subtask._id.toString() === subTaskId
    );

    // If the subtask is not found
    if (subtaskIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "Subtask not found!",
      });
    }

    task.subtasks.splice(subtaskIndex, 1);
    await task.save();

    res.status(200).send({
      success: true,
      message: "Subtask deleted!",
      task: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update subtask!",
      error: error,
    });
  }
};

// Get Just Completed Tasks
export const getAllCompletedTasks = async (req, res) => {
  try {
    const tasks = await taskModel
      .find({ status: "completed" })
      .select(
        "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id label"
      )
      .sort({ updatedAt: -1 });

    res.status(200).send({
      success: true,
      message: "All completed task list!",
      tasks: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in get all tasks!",
      error: error,
    });
  }
};
