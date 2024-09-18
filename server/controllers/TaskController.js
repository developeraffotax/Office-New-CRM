import notificationModel from "../models/notificationModel.js";
import projectModel from "../models/projectModel.js";
import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";
import cron from "node-cron";

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
      status,
      recurring,
      nextRecurringDate,
    } = req.body;

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
      startDate: startDate || new Date().toISOString(),
      deadline: deadline || new Date().toISOString(),
      lead,
      status,
      recurring: recurring ? recurring : null,
      nextRecurringDate: nextRecurringDate
        ? nextRecurringDate
        : new Date().toISOString(),
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

    // Create Notification
    const notiUser = await userModel.findOne({ name: jobHolder });
    if (!notiUser) {
      res.status(200).send({
        success: true,
        message: "Notification User not found while create task!",
      });

      return;
    }

    const notification = await notificationModel.create({
      title: "New Task Assigned",
      redirectLink: "/tasks",
      description: `${req.user.user.name} assign a new task of "${tasks.task}"`,
      taskId: `${tasks._id}`,
      userId: notiUser._id,
    });

    //  -------------------Noti End---------

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

// Get ALl Tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskModel
      .find({ status: { $ne: "completed" } })
      .select(
        "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id comments.status labal"
      );

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

      // Create Notification
      const notiUser = await userModel.findOne({ name: jobHolder });
      if (!notiUser) {
        res.status(200).send({
          success: true,
          message: "Notification User not found while create task!",
        });

        return;
      }

      const notification = await notificationModel.create({
        title: "New Task Assigned",
        redirectLink: "/tasks",
        description: `${req.user.user.name} assign a new task of "${updateTask.task}"`,
        taskId: `${updateTask._id}`,
        userId: notiUser._id,
      });

      //  -------------------Noti End---------
    } else if (lead) {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { lead: lead },
        { new: true }
      );
    } else {
      if (status === "completed") {
        updateTask = await taskModel.findByIdAndUpdate(
          task._id,
          { status: status, recurring: "", nextRecurringDate: "" },
          { new: true }
        );
      } else {
        updateTask = await taskModel.findByIdAndUpdate(
          task._id,
          { status: status },
          { new: true }
        );
      }
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
        { deadline: deadline || new Date().toISOString() },
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
      recurring,
      nextRecurringDate,
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
        recurring: recurring ? recurring : null,
        nextRecurringDate: nextRecurringDate ? nextRecurringDate : null,
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
        "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id labal"
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

// Adding Label in Jobs
export const addlabel = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { name, color } = req.body;

    const task = await taskModel.findById(taskId);

    const updateTask = await taskModel.findByIdAndUpdate(
      { _id: task._id },
      { "labal.name": name, "labal.color": color },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Label added!",
      task: updateTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in add task label!",
      error: error,
    });
  }
};

// Update Hours
export const updateTaskHours = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { hours } = req.body;

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task not found!",
      });
    }

    let updateTask;

    updateTask = await taskModel.findByIdAndUpdate(
      task._id,
      { hours: hours },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Task updated!",
      task: updateTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messsage: "Error in update task hours!",
      error: error,
    });
  }
};

// --------------------------------Recurring Task---------------------------------------->

const calculateStartDate = (date, recurringType) => {
  const currentDate = new Date(date);

  switch (recurringType) {
    case "2_minutes":
      return new Date(currentDate.getTime() + 2 * 60 * 1000);
    case "daily":
      return new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    case "quarterly":
      return new Date(currentDate.setMonth(currentDate.getMonth() + 3));
    default:
      return currentDate;
  }
};

const autoCreateRecurringTasks = async () => {
  try {
    const now = new Date();

    const tasks = await taskModel.find({
      recurring: { $ne: null },
      nextRecurringDate: { $lte: now },
    });

    for (const task of tasks) {
      // Create a new task with updated dates
      const newTask = await taskModel.create({
        project: task.project,
        jobHolder: task.jobHolder,
        task: task.task,
        hours: task.hours,
        startDate: calculateStartDate(task.startDate, task.recurring),
        deadline: calculateStartDate(task.deadline, task.recurring),
        lead: task.lead,
        recurring: task.recurring,
        labal: task.labal,
        status: task.status,
        nextRecurringDate: calculateStartDate(
          task.nextRecurringDate,
          task.recurring
        ),
      });

      newTask.activities.push({
        userName: "System",
        activity: `Auto-created recurring task: ${task.task} for project: ${task.project.projectName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newTask.save();

      // Update the original task with the next recurring date
      // task.nextRecurringDate = calculateNextRecurringDate(
      //   task.nextRecurringDate,
      //   task.recurring
      // );
      // await task.save();
    }
  } catch (error) {
    console.error("Error in auto-creating recurring tasks:", error);
  }
};

// Schedule the task to run every 2 minutes
// cron.schedule("*/2 * * * *", () => {
//   console.log("Running task scheduler for recurring tasks...");
//   autoCreateRecurringTasks();
// });

// Schedule the task to run daily at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running task scheduler for recurring tasks...");
  autoCreateRecurringTasks();
});
