import reminderModel from "../models/reminderModel.js";
import moment from "moment";
import reminders from "node-reminders";
import userModel from "../models/userModel.js";

// Create Reminder
export const createReminder = async (req, res) => {
  try {
    const { title, description, taskId, date, time, redirectLink, usersList } =
      req.body;

    if (!title) {
      return res.status(400).send({
        success: false,
        message: "Title is required!",
      });
    }
    if (!date || !time) {
      return res.status(400).send({
        success: false,
        message: "Date and time are required!",
      });
    }

    if (!usersList || !Array.isArray(usersList) || usersList.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Users list is required and should not be empty!",
      });
    }

    const reminders = [];

    for (let user of usersList) {
      const reminder = await reminderModel.create({
        userId: user._id,
        title,
        description,
        taskId,
        date,
        time,
        redirectLink,
      });
      reminders.push(reminder);
    }

    res.status(200).send({
      success: true,
      message: "Reminder(s) created successfully!",
      reminders: reminders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occurred while creating reminder(s)!",
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

// Delete  Reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;
    const reminder = await reminderModel.findById(reminderId);

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
