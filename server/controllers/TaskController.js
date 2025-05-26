import activityModel from "../models/activityModel.js";
import notificationModel from "../models/notificationModel.js";
import projectModel from "../models/projectModel.js";
import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";
import cron from "node-cron";
import moment from "moment";
import XLSX from "xlsx";

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
      deleteCompletedRecurringSubtasks,
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

    let updatedNextRecurringDate = nextRecurringDate
      ? new Date(nextRecurringDate)
      : new Date();

    if (recurring === "weekly") {
      const prevDate = new Date();
      prevDate.setDate(updatedNextRecurringDate.getDate() - 1);
      updatedNextRecurringDate = prevDate;
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
      nextRecurringDate: updatedNextRecurringDate.toISOString(),
      deleteCompletedRecurringSubtasks,
    });

    // Push activity to activities array
    tasks.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has create this task.`,
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
    console.log(notiUser);

    if (!notiUser) {
      res.status(200).send({
        success: true,
        message: "Notification User not found while creating task!",
      });
      return;
    }

    await notificationModel.create({
      title: "New Task Assigned",
      redirectLink: "/tasks",
      description: `${req.user.user.name} assign a new task of "${tasks.task}"`,
      taskId: `${tasks?._id}`,
      userId: notiUser?._id || null,
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
    // const tasks = await taskModel
    //   .find({ status: { $ne: "completed" } })
    //   .select(
    //     "project jobHolder task hours startDate deadline status lead  estimate_Time comments._id comments.status labal recurring"
    //   );

      const tasks = await taskModel.aggregate([
        {
          $match: { status: { $ne: "completed" } }
        },
        {
          $project: {
            project: 1,
            jobHolder: 1,
            task: 1,
            hours: 1,
            startDate: 1,
            deadline: 1,
            status: 1,
            lead: 1,
            estimate_Time: 1,
            comments: { _id: 1, status: 1 },
            subtasksLength: { $size: "$subtasks" },
            labal: 1,
            recurring: 1
          }
        }
      ]);



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
      activity: `${req.user.user.name} has updated this task project "${project?.projectName}".`,
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
        activity: `${req.user.user.name} has updated this task assign "${jobHolder}".`,
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
        activity: `${req.user.user.name} has updated this task owner "${lead}".`,
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
          activity: `${req.user.user.name} has update this task status "${status}" .`,
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
        activity: `${req.user.user.name} has updated this allocate task .`,
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
      deleteCompletedRecurringSubtasks
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

    let updatedNextRecurringDate = nextRecurringDate
      ? new Date(nextRecurringDate)
      : new Date();

    if (recurring === "weekly") {
      const prevDate = new Date();
      prevDate.setDate(updatedNextRecurringDate.getDate() - 1);
      updatedNextRecurringDate = prevDate;
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
        nextRecurringDate: updatedNextRecurringDate.toISOString(),
        deleteCompletedRecurringSubtasks
      },
      { new: true }
    );

    // Push activity to activities array
    tasks.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has updated this full task.`,
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
      activity: `${req.user.user.name} updated the subtask in this task.`,
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
      activity: `${req.user.user.name} has delete the subtask in this task.`,
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
      activity: `${req.user.user.name} has added label "${name}" in this task .`,
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

    // Push activity to activities array
    updateTask.activities.push({
      user: req.user.user._id,
      activity: `${req.user.user.name} has update hours & add "${hours}h" in this task.`,
    });

    await updateTask.save();

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

//   const adjustForFridayAndWeekend = (date) => {
//     const day = date.getDay();
//     if (day === 5) {
//       // If Friday, move to Monday
//       date.setDate(date.getDate() + 3);
//     } else if (day === 6) {
//       // If Saturday, move to Monday
//       date.setDate(date.getDate() + 2);
//     } else if (day === 0) {
//       // If Sunday, move to Monday
//       date.setDate(date.getDate() + 1);
//     }
//     return date;
//   };

//   switch (recurringType) {
//     case "daily":
//       return addDaysSkippingWeekends(currentDate, 1);
//     case "weekly":
//       return addDaysSkippingWeekends(currentDate, 7);
//     case "monthly":
//       const nextMonthDate = new Date(
//         currentDate.setMonth(currentDate.getMonth() + 1)
//       );
//       return adjustForFridayAndWeekend(nextMonthDate);
//     case "quarterly":
//       const nextQuarterDate = new Date(
//         currentDate.setMonth(currentDate.getMonth() + 3)
//       );
//       return adjustForFridayAndWeekend(nextQuarterDate);
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
//       let newStartDate = calculateStartDate(task.startDate, task.recurring);
//       let newDeadline = calculateStartDate(task.deadline, task.recurring);

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
//         label: task?.label,
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
//       message: "Recurring tasks processed successfully.",
//     });
//   } catch (error) {
//     console.error("Error in auto-creating recurring tasks:", error);
//     res.status(500).send({
//       success: false,
//       message: "An error occurred while processing recurring tasks.",
//       error: error.message,
//     });
//   }
// };
// // Schedule the task to run daily at midnight
// cron.schedule("30 22 * * *", () => {
//   console.log("Running task scheduler for recurring tasks...");
//   autoCreateRecurringTasks();
// });

// Function to calculate the next start date
const calculateStartDate = (date, recurringType) => {
  const currentDate = new Date(date);

  // const addDaysSkippingWeekends = (date, days) => {
  //   let result = new Date(date);
  //   while (days > 0) {
  //     result.setDate(result.getDate() + 1);
  //     if (result.getDay() !== 0 && result.getDay() !== 6) {
  //       days--; 
  //     }
  //   }
  //   return result;
  // };


  const addOneBusinessDay = (date) => {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);

  // If Saturday, move to Monday (+2)
  // If Sunday, move to Monday (+1)
  if (result.getDay() === 6) {
    result.setDate(result.getDate() + 2);
  } else if (result.getDay() === 0) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};







 

  // Mon   1
  // Tue   2
  // Wed   3
  // Thu   4
  // Fri   5
  // Sat   6
  // Sun   0



  // const adjustForFridayAndWeekend = (date) => {
  //   const day = date.getDay();
  //   if (day === 5) {
  //     date.setDate(date.getDate() + 3);
  //   } else if (day === 6) {
  //     date.setDate(date.getDate() + 2);
  //   } else if (day === 0) {
  //     date.setDate(date.getDate() + 1);
  //   }
  //   return date;
  // };

  // const adjustForFridayAndWeekend = (date) => {
  //   const day = date.getDay();
  //   if (day === 5) {
  //     date.setDate(date.getDate() + 2);
  //   } else if (day === 6) {
  //     date.setDate(date.getDate() + 1);
  //   }
  //   return date;
  // };

   const adjustForFridayAndWeekend = (date) => {
    const day = date.getDay();
    if (day === 6) {
      date.setDate(date.getDate() + 2);
    } else if (day === 0) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  };


  switch (recurringType) {
    case "daily":
      return addOneBusinessDay(currentDate);
    case "weekly":
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return adjustForFridayAndWeekend(nextWeek);
    // case "weekly":
    //   return addDaysSkippingWeekends(currentDate, 7);
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

// Main task scheduler
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
      let newStartDate = calculateStartDate(task.startDate, task.recurring);
      let newDeadline = calculateStartDate(task.deadline, task.recurring);

      const subtasksIncludingCompleted = task.subtasks?.map((subtask) => ({
        ...subtask,
        status: "process",
      }));

      console.log(subtasksIncludingCompleted, "SUBTASKS INC COMPLETED")

      const subtasksNotIncludingCompleted = task.subtasks?.filter(el => el.status !== "complete").map((subtask) => ({
        ...subtask,
        status: "process",
      }));

      const result  = await taskModel.create({
        project: task.project,
        jobHolder: task.jobHolder,
        task: `${task.task}`,
        hours: task.hours,
        startDate: newStartDate,
        deadline: newDeadline,
        lead: task.lead,
        recurring: task.recurring,
        label: task?.label,
        status: "Progress",
        subtasks: task.deleteCompletedRecurringSubtasks ? subtasksNotIncludingCompleted : subtasksIncludingCompleted,
        nextRecurringDate: calculateStartDate(
          task.nextRecurringDate,
          task.recurring
        ),

        deleteCompletedRecurringSubtasks: task.deleteCompletedRecurringSubtasks
      });


      console.log(result)
      // if(task.deleteCompletedRecurringSubtasks) {
      //   await taskModel.create({
      //     project: task.project,
      //     jobHolder: task.jobHolder,
      //     task: `${task.task}`,
      //     hours: task.hours,
      //     startDate: newStartDate,
      //     deadline: newDeadline,
      //     lead: task.lead,
      //     recurring: task.recurring,
      //     label: task?.label,
      //     status: "Progress",
      //     subtasks: task.deleteCompletedRecurringSubtasks ? subtasksNotIncludingCompleted : subtasksIncludingCompleted,
      //     nextRecurringDate: calculateStartDate(
      //       task.nextRecurringDate,
      //       task.recurring
      //     ),
  
      //     deleteCompletedRecurringSubtasks: task.deleteCompletedRecurringSubtasks
      //   });
      // }

       
    }

    if (res) {
      res.status(200).send({
        success: true,
        message: "Recurring tasks processed successfully.",
      });
    }
  } catch (error) {
    console.error("Error in auto-creating recurring tasks:", error);
    if (res) {
      res.status(500).send({
        success: false,
        message: "An error occurred while processing recurring tasks.",
        error: error.message,
      });
    }
  }
};

// if(process.env.pm_id === '0') { 

//   // Schedule the task to run daily at 11:30 PM
//   cron.schedule("30 23 * * *", async () => {
//     console.log("Running task scheduler for recurring tasks at 10 PM...");
//     await autoCreateRecurringTasks();
// });

// }

if (process.env.pm_id === '0') { 
  // Schedule the task to run daily at 12:05 AM
  cron.schedule("5 0 * * *", async () => {
    console.log("Running task scheduler for recurring tasks at 12:05 AM...💛");
    await autoCreateRecurringTasks();
  });
}



// ---------------------Delete Daily Recurring Tasks ---------------------->
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

    console.log("Received subtasks:", subtasks);

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

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found!",
      });
    }

    // Ensure subtasks in the task match the ones provided
    const taskSubtaskIds = task.subtasks.map((sub) => sub._id.toString());
    const providedSubtaskIds = subtasks.map((sub) => sub._id);

    const invalidIds = providedSubtaskIds.filter(
      (id) => !taskSubtaskIds.includes(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid subtask IDs provided: ${invalidIds.join(", ")}`,
      });
    }

    // Update the order of each subtask
    const updateSubtasks = await Promise.all(
      subtasks.map((stask, index) => {
        return taskModel.updateOne(
          { _id: taskId, "subtasks._id": stask._id },
          { $set: { "subtasks.$.order": index + 1 } }
        );
      })
    );

    const allUpdatesSuccessful = updateSubtasks.every(
      (update) => update.acknowledged && update.modifiedCount > 0
    );

    if (!allUpdatesSuccessful) {
      return res.status(500).json({
        success: false,
        message: "Some subtasks could not be updated!",
        updateSubtasks,
      });
    }

    res.status(200).json({
      success: true,
      message: "Subtask order updated successfully!",
    });
  } catch (error) {
    console.error("Error while reordering subtasks:", error);
    res.status(500).json({
      success: false,
      message: "Error while reordering subtasks!",
      error: error.message,
    });
  }
};

// Function to parse Excel/CSV data
const parseData = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

const parseExcelDate = (serial) => {
  if (!serial || isNaN(serial)) return null;
  const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  const daysOffset = Math.floor(serial - 1);
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  return new Date(excelEpoch.getTime() + daysOffset * millisecondsInDay);
};

// Controller to handle file upload
export const importData = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const data = parseData(file.buffer);

    console.log("data:", data);

    const clients = data.map((task) => ({
      task: task.task || "",
      jobHolder: task.jobHolder || "",
      hours: task.hours || "",
      startDate: task.startDate ? parseExcelDate(task.startDate) : null,
      deadline: task.deadline ? parseExcelDate(task.deadline) : null,
      lead: task.lead || "",
      project: {
        projectName: task.projectName || "",
      },
    }));

    await taskModel.insertMany(clients);
    res.status(200).send({
      success: true,
      message: "Data imported successfully!",
    });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).send("An error occurred while importing data.");
  }
};

// Update Multiple Tasks
export const updateMultipleTasks = async (req, res) => {
  try {
    const {
      rowSelection,
      projectId,
      jobHolder,
      hours,
      startDate,
      deadline,
      lead,
      status,
    } = req.body;

    console.log("rowSelection:", rowSelection);

    if (
      !rowSelection ||
      !Array.isArray(rowSelection) ||
      rowSelection.length === 0
    ) {
      return res.status(400).send({
        success: false,
        message: "No tasks selected for update.",
      });
    }

    let project;
    if (projectId) {
      project = await projectModel.findById(projectId);
      if (!project) {
        return res.status(400).send({
          success: false,
          message: "Project not found!",
        });
      }
    }

    let updateData = {};
    if (project) updateData["project._id"] = project._id;
    if (project) updateData["project.projectName"] = project.projectName;
    if (project) updateData["project.users_list"] = project.users_list;
    if (project) updateData["project.status"] = project.status;
    if (jobHolder) updateData["jobHolder"] = jobHolder;
    if (hours) updateData["hours"] = hours;
    if (startDate) updateData["startDate"] = startDate;
    if (deadline) updateData["deadline"] = deadline;
    if (lead) updateData["lead"] = lead;
    if (status) updateData["status"] = status;

    const updatedTasks = await taskModel.updateMany(
      {
        _id: { $in: rowSelection },
      },
      { $set: updateData },
      { multi: true }
    );

    // Check if any jobs were updated
    if (updatedTasks.modifiedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs were updated.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Tasks updated successfully!",
      updatedTasks,
    });
  } catch (error) {
    console.log("Error in update multiple tasks:", error);
    res.status(500).send({
      success: false,
      message: "Error in update multiple tasks!",
      error: error,
    });
  }
};
