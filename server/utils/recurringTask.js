import cron from "node-cron";
import taskModel from "../models/taskModel.js";

// Utility function to calculate the next recurring date
const calculateNextRecurringDate = (currentDate, recurring) => {
  const date = new Date(currentDate);
  switch (recurring) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "5_minutes":
      date.setMinutes(date.getMinutes() + 5);
      break;
    default:
      return null;
  }
  return date;
};

// Auto-create recurring tasks based on their schedule
const autoCreateRecurringTasks = async () => {
  try {
    // Find all tasks that have a recurring field and a nextRecurringDate
    const tasks = await taskModel.find({
      recurring: { $ne: null },
      nextRecurringDate: { $lte: new Date() }, // Only tasks with a nextRecurringDate that's passed or today
    });

    for (const task of tasks) {
      // Create a new task with the same data but new start and deadline dates
      const newTask = await taskModel.create({
        project: task.project,
        jobHolder: task.jobHolder,
        task: task.task,
        hours: task.hours,
        startDate: new Date().toISOString(),
        deadline: task.deadline,
        status: task.status,
        lead: task.lead,
        recurring: task.recurring,
        nextRecurringDate: calculateNextRecurringDate(
          new Date().toISOString(),
          task.recurring
        ), // Set next recurring date
      });

      // Add activity log for the newly created recurring task
      newTask.activities.push({
        userName: "System", // Indicate that it was created automatically
        activity: `Auto-created a recurring task: ${task.task} for project: ${task.project.projectName}`,
      });

      await newTask.save();

      // Update the original task with the next recurring date
      task.nextRecurringDate = calculateNextRecurringDate(
        task.nextRecurringDate,
        task.recurring
      );
      await task.save();
    }
  } catch (error) {
    console.error("Error in auto-creating recurring tasks:", error);
  }
};

// Schedule the cron job to run daily at midnight
// cron.schedule("0 0 * * *", () => {
//   console.log("Running task scheduler for recurring tasks...");
//   autoCreateRecurringTasks();
// });

cron.schedule("* * * * *", () => {
  console.log("Running task scheduler for recurring tasks every 1 minute...");
  autoCreateRecurringTasks();
});
