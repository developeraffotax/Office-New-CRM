import activityModel from "../models/activityModel.js";
import notificationModel from "../models/notificationModel.js";
import projectModel from "../models/projectModel.js";
import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";
import cron from "node-cron";
import moment from "moment";

const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

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

    // Push activity to activities array
    tasks.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} create a new task "${tasks.task}".`,
    });

    await tasks.save();

    res.status(200).send({
      success: true,
      message: "Task created successfully!",
      task: tasks,
    });

    // Add Activity Log
    const user = req.user.user;
    if (tasks) {
      activityModel.create({
        user: user._id,
        action: `${user.name} is created a task: ${tasks.task} in project: ${tasks.project.projectName}`,
        entity: "Task",
        details: `Task Details:
        - Project Name: ${tasks.project.projectName}
        - Assigned To: ${tasks.jobHolder || "Unassigned"}
        - Task Description: ${tasks.task || "No description provided"}
        - Created At: ${currentDateTime}`,
      });
    }

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
        "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id comments.status labal recurring"
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

    const task = await taskModel
      .findById(taskId)
      .populate({ path: "activities.user", select: "name avatar" });

    // Sort subtasks by `order`
    const sortedSubtasks = task.subtasks.sort((a, b) => a.order - b.order);

    res.status(200).send({
      success: true,
      message: "Single task retrieved successfully!",
      task: {
        ...task.toObject(),
        subtasks: sortedSubtasks,
      },
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

    // Push activity to activities array
    updateTask.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated the task project to "${project.projectName}" in task "${task.task}".`,
    });

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

      // Push activity to activities array
      updateTask.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} updated the task assign in task "${updateTask.task}".`,
      });

      // Create Notification
      const notiUser = await userModel.findOne({ name: jobHolder });
      if (!notiUser) {
        res.status(200).send({
          success: true,
          message: "Notification User not found while create task!",
        });

        return;
      }

      await notificationModel.create({
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

      // Push activity to activities array
      updateTask.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} updated the task owner in task "${updateTask.task}".`,
      });
    } else {
      if (status === "completed") {
        updateTask = await taskModel.findByIdAndUpdate(
          task._id,
          { status: status },
          { new: true }
        );

        // Push activity to activities array
        updateTask.activities.push({
          user: req.user.user._id,
          activity: `${req.user.user.name} complete the task "${updateTask.task}".`,
        });
      } else {
        updateTask = await taskModel.findByIdAndUpdate(
          task._id,
          { status: status },
          { new: true }
        );

        // Push activity to activities array
        updateTask.activities.push({
          user: req.user.user._id,
          activity: `${req.user.user.name} updated the task status "${status}" in task "${updateTask.task}" .`,
        });
      }
    }

    await updateTask.save();

    const user = req.user.user;

    res.status(200).send({
      success: true,
      message: "Task updated!",
      task: updateTask,
    });

    // Add Activity Log
    if (updateTask) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is update a task: ${
          updateTask.task
        } in project: ${updateTask.project.projectName}`,
        entity: "Task",
        details: `Task Details:
          - Project Name: ${updateTask.project.projectName}
          - Assigned To: ${updateTask.jobHolder || "Unassigned"}
          - Update Type: ${
            jobHolder
              ? "Assign Update"
              : lead
              ? "Lead Update"
              : "Task Status Update"
          }
          - Task Description: ${updateTask.task || "No description provided"}
          - Update At: ${currentDateTime}`,
      });
    }
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

      // Push activity to activities array
      updateTask.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} updated the allocate task "${updateTask.task}" .`,
      });
    } else if (startDate) {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { startDate: startDate },
        { new: true }
      );

      // Push activity to activities array
      updateTask.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} updated the allocate task start date in task "${updateTask.task}".`,
      });
    } else {
      updateTask = await taskModel.findByIdAndUpdate(
        task._id,
        { deadline: deadline || new Date().toISOString() },
        { new: true }
      );

      // Push activity to activities array
      updateTask.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} updated the allocate task deadline date in task "${updateTask.task}".`,
      });
    }

    await updateTask.save();

    // Add Activity Log
    const user = req.user.user;
    if (updateTask) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is update a task: ${
          updateTask.task
        } in project: ${updateTask.project.projectName}`,
        entity: "Task",
        details: `Task Details:
          - Project Name: ${updateTask.project.projectName}
          - Assigned To: ${updateTask.jobHolder || "Unassigned"}
          - Update Type: ${
            allocateTask
              ? "Task description Update"
              : startDate
              ? "Start Date Update"
              : "Deadline Update Update"
          }
          - Task Description: ${updateTask.task || "No description provided"}
          - Update At: ${currentDateTime}`,
      });
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

    const task = await taskModel.findById(taskId);
    // Add Activity Log
    const user = req.user.user;
    if (task) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} delete a task: ${task.task} in project: ${
          task.project.projectName
        }`,
        entity: "Task",
        details: `Task Details:
            - Project Name: ${task.project.projectName}
            - Assigned To: ${task.jobHolder || "Unassigned"}
            - Task Description: ${task.task || "No description provided"}
            - Deleted At: ${currentDateTime}`,
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

    // Push activity to activities array
    tasks.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated the full task "${tasks.task}".`,
    });

    await tasks.save();

    // Add Activity Log
    const user = req.user.user;
    if (tasks) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is update a task: ${
          tasks.task
        } in project: ${tasks.project.projectName}`,
        entity: "Task",
        details: `Task Details:
          - Project Name: ${tasks.project.projectName}
          - Assigned To: ${tasks.jobHolder || "Unassigned"}
          - Task Description: ${tasks.task || "No description provided"}
          - Update At: ${currentDateTime}`,
      });
    }

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

    // Count existing subtasks
    const subtaskCount = task.subtasks ? task.subtasks.length : 0;

    task.subtasks.push({ subTask: subTask, order: subtaskCount + 1 });

    await task.save();

    // Add Activity Log
    const user = req.user.user;
    if (task) {
      activityModel.create({
        user: user._id,
        action: `${user.name.trim()} is create a subtask in task: ${task.task}`,
        entity: "Task",
        details: `Task Details:
           - Project Name: ${task.project.projectName}
           - Task Description: ${task.task || "No description provided"}
           - Update At: ${currentDateTime}`,
      });
    }

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

    // Push activity to activities array
    task.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} updated the subtask in task "${task.task}".`,
    });

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

    // Push activity to activities array
    task.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} delete the subtask in task "${task.task}".`,
    });

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
        "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id labal recurring"
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

    // Push activity to activities array
    updateTask.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} added label in task "${updateTask.task}".`,
    });

    await updateTask.save();

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
// case "monthly":
// {
//   const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
//   return nextMonth.getDay() === 6 || nextMonth.getDay() === 0
//     ? addDaysSkippingWeekends(nextMonth, 1)
//     : nextMonth;
// }
// case "quarterly":
// {
//   const nextQuarter = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
//   return nextQuarter.getDay() === 6 || nextQuarter.getDay() === 0
//     ? addDaysSkippingWeekends(nextQuarter, 1)
//     : nextQuarter;
// }
// const calculateStartDate = (date, recurringType) => {
//   const currentDate = new Date(date);

//   const addDaysSkippingWeekends = (date, days) => {
//     let result = new Date(date);
//     while (days > 0) {
//       result.setDate(result.getDate() + 1);
//       // Skip Saturday and Sunday
//       if (result.getDay() !== 6 && result.getDay() !== 0) {
//         days--;
//       }
//     }
//     return result;
//   };

//   switch (recurringType) {
//     case "2_minutes":
//       return new Date(currentDate.getTime() + 2 * 60 * 1000);
//     case "daily":
//       return new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
//     case "weekly":
//       return new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
//     case "monthly":
//       return new Date(currentDate.setMonth(currentDate.getMonth() + 1));
//     case "quarterly":
//       return new Date(currentDate.setMonth(currentDate.getMonth() + 3));
//     default:
//       return currentDate;
//   }
// };

// export const autoCreateRecurringTasks = async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfToday = new Date(now.setHours(0, 0, 0, 0));
//     const endOfToday = new Date(now.setHours(23, 59, 59, 999));

//     const tasks = await taskModel.find({
//       recurring: { $exists: true, $ne: "", $ne: null },
//       nextRecurringDate: {
//         $gte: startOfToday,
//         $lte: endOfToday,
//       },
//     });

//     for (const task of tasks) {
//       // Calculate the new start and deadline dates
//       const newStartDate = calculateStartDate(task.startDate, task.recurring);
//       const newDeadline = calculateStartDate(task.deadline, task.recurring);

//       // Ensure tasks are not created for Saturday or Sunday
//       if (newStartDate.getDay() === 6 || newStartDate.getDay() === 0) {
//         continue;
//       }

//       // Create a new task with updated dates
//       await taskModel.create({
//         project: task.project,
//         jobHolder: task.jobHolder,
//         task: `${task.task}`,
//         hours: task.hours,
//         startDate: newStartDate,
//         deadline: newDeadline,
//         lead: task.lead,
//         recurring: task.recurring,
//         labal: task.labal,
//         status: "Progress",
//         subtasks: task.subtasks.map((subtask) => ({
//           ...subtask,
//           status: "process",
//         })),
//         nextRecurringDate: calculateStartDate(
//           task.nextRecurringDate,
//           task.recurring
//         ),
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: "Recurring function call...",
//     });
//   } catch (error) {
//     console.error("Error in auto-creating recurring tasks:", error);
//   }
// };
// ---------------------Handle Recurreing---------->
const calculateStartDate = (date, recurringType) => {
  const currentDate = new Date(date);

  const addDaysSkippingWeekends = (date, days) => {
    let result = new Date(date);
    while (days > 0) {
      result.setDate(result.getDate() + 1);
      // Skip Saturday and Sunday
      if (result.getDay() !== 6 && result.getDay() !== 0) {
        days--;
      }
    }
    return result;
  };

  switch (recurringType) {
    case "2_minutes":
      return new Date(currentDate.getTime() + 2 * 60 * 1000);
    case "daily":
      return addDaysSkippingWeekends(currentDate, 1);
    case "weekly":
      return addDaysSkippingWeekends(currentDate, 7);
    case "monthly":
      const nextMonthDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 1)
      );
      return adjustForFridayAndWeekend(nextMonthDate);
    case "quarterly":
      const nextQuarterDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 3)
      );
      return adjustForFridayAndWeekend(nextQuarterDate);
    default:
      return currentDate;
  }
};

const adjustForFridayAndWeekend = (date) => {
  const day = date.getDay();
  if (day === 5) {
    // If Friday, move to the following Monday
    date.setDate(date.getDate() + 3);
  } else if (day === 6) {
    // If Saturday, move to Monday
    date.setDate(date.getDate() + 2);
  } else if (day === 0) {
    // If Sunday, move to Monday
    date.setDate(date.getDate() + 1);
  }
  return date;
};

export const autoCreateRecurringTasks = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const tasks = await taskModel.find({
      recurring: { $exists: true, $ne: "", $ne: null },
      nextRecurringDate: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    for (const task of tasks) {
      // Calculate the new start and deadline dates
      let newStartDate = calculateStartDate(task.startDate, task.recurring);
      let newDeadline = calculateStartDate(task.deadline, task.recurring);

      // Adjust for Fridays and weekends
      newStartDate = adjustForFridayAndWeekend(newStartDate);
      newDeadline = adjustForFridayAndWeekend(newDeadline);

      // Create a new task with updated dates
      await taskModel.create({
        project: task.project,
        jobHolder: task.jobHolder,
        task: `${task.task}`,
        hours: task.hours,
        startDate: newStartDate,
        deadline: newDeadline,
        lead: task.lead,
        recurring: task.recurring,
        label: task?.labal,
        status: "Progress",
        subtasks: task.subtasks.map((subtask) => ({
          ...subtask,
          status: "process",
        })),
        nextRecurringDate: adjustForFridayAndWeekend(
          calculateStartDate(task.nextRecurringDate, task.recurring)
        ),
      });
    }

    res.status(200).send({
      success: true,
      message: "Recurring tasks processed successfully.",
    });
  } catch (error) {
    console.error("Error in auto-creating recurring tasks:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while processing recurring tasks.",
      error: error.message,
    });
  }
};

// Schedule the task to run daily at midnight
cron.schedule("30 23 * * *", () => {
  console.log("Running task scheduler for recurring tasks...");
  autoCreateRecurringTasks();
});

export const deleteDailyRecurringTasks = async (req, res) => {
  try {
    const tasksToDelete = await taskModel.find({ recurring: "daily" });

    const taskCount = tasksToDelete.length;

    if (taskCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No daily recurring tasks found",
      });
    }

    // Delete the tasks
    await taskModel.deleteMany({ recurring: "daily" });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${taskCount} daily recurring tasks`,
    });
  } catch (error) {
    console.error("Error deleting daily recurring tasks:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting tasks",
    });
  }
};

// Delete Duplicate tasks
export const deleteDuplicateTasks = async (req, res) => {
  try {
    const tasks = await taskModel.find();

    const uniqueTasks = new Map();
    const duplicatesToDelete = [];

    tasks.forEach((task) => {
      const uniqueKey = `${task.task}_${task.jobHolder}`;

      if (!uniqueTasks.has(uniqueKey)) {
        uniqueTasks.set(uniqueKey, task._id);
      } else {
        duplicatesToDelete.push(task._id);
      }
    });

    if (duplicatesToDelete.length > 0) {
      await taskModel.deleteMany({ _id: { $in: duplicatesToDelete } });
    }

    res.status(200).json({
      message: "Duplicate tasks have been deleted successfully.",
      deletedCount: duplicatesToDelete.length,
    });
  } catch (error) {
    console.error("Error deleting duplicate tasks:", error);
    res.status(500).json({
      message: "An error occurred while deleting duplicate tasks.",
      error: error.message,
    });
  }
};

// Get ALl Tasks for Daskboard Analytics
export const getDashboardTasks = async (req, res) => {
  try {
    const tasks = await taskModel
      .find({})
      .select("project.projectName jobHolder createdAt");

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
// Reordering Subtasks
export const reordering = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { subtasks } = req.body;

    // Validate input
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required!",
      });
    }
    if (!subtasks || !Array.isArray(subtasks)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtasks format. Must be an array of subtasks!",
      });
    }

    // Fetch the task to ensure it exists
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found!",
      });
    }

    // Update the order of each subtask
    await Promise.all(
      subtasks.map((stask, index) =>
        taskModel.updateOne(
          { "subtasks._id": stask._id },
          { $set: { "subtasks.$.order": index + 1 } }
        )
      )
    );

    res.status(200).json({
      success: true,
      message: "Subtask order updated successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while reordering subtasks!",
      error: error.message,
    });
  }
};
