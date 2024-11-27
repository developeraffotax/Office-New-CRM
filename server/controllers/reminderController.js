import reminderModel from "../models/reminderModel.js";
import moment from "moment";
import reminders from "node-reminders";

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
        message: "Date is required!",
      });
    }

    // const reminderDate = moment(`${date}T${time}`).toISOString();

    const reminder = await reminderModel.create({
      userId,
      title,
      description,
      taskId,
      date,
      time,
      redirectLink,
    });

    // Schedule reminder
    // reminders.schedule(
    //   {
    //     time: reminderDate,
    //     data: { id: reminder._id, title, redirectLink },
    //   },
    //   (reminderData) => {
    //     console.log(`Reminder Triggered: ${reminderData.data.title}`);
    //   }
    // );

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

// Delete  Reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;
    const reminder = await reminderModel.findById(reminderId);

    // if (reminder) {
    //   reminders.cancel(reminder._id.toString());
    // }

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
