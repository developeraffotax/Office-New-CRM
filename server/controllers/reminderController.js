import reminderModel from "../models/reminderModel.js";
import schedule from "node-schedule";
import moment from "moment";

const scheduledJobs = {};

// Create Reminder
export const createReminder = async (req, res) => {
  try {
    const { title, description, taskId, date, time, redirectLink } = req.body;
    const userId = req.user.user._id;

    if (!title) {
      return res.status(400).send({
        success: false,
        message: "Title is required!",
      });
    }
    if (!date || !time) {
      return res.status(400).send({
        success: false,
        message: "Date and time is required!",
      });
    }

    const reminder = await reminderModel.create({
      userId,
      title,
      description,
      taskId,
      date,
      time,
      redirectLink,
    });

    scheduleReminder(reminder);

    res.status(200).send({
      success: true,
      message: "Reminder created successfully!",
      reminder: reminder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while create reminder!",
      error: error.message,
    });
  }
};

// Get All Reminders
export const getReminderByUsers = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    console.log("Data:", userId, startOfDay, endOfDay);

    const reminders = await reminderModel.find({
      userId: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    res.status(200).send({
      success: true,
      message: "Reminders List!",
      reminders: reminders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while get reminder!",
      error: error.message,
    });
  }
};

// Schedule a reminder
const scheduleReminder = (reminder) => {
  const dateTime = new Date(`${reminder.date}T${reminder.time}`);

  if (dateTime > new Date()) {
    const job = schedule.scheduleJob(reminder.taskId, dateTime, () => {
      console.log(`Reminder Triggered: ${reminder.title}`);
    });

    scheduledJobs[reminder.taskId] = job;
  }
};

// Delete  Reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;

    await reminderModel.findByIdAndDelete(reminderId);

    res.status(200).send({
      success: true,
      message: "Reminders deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occured while delete reminder!",
      error: error.message,
    });
  }
};
