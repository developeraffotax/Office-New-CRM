import reminderModel from "../models/reminderModel.js";
import moment from "moment";

import agenda from "../utils/agenda.js";

// Create Reminder
export const createReminder = async (req, res) => {
  try {
    const {
      title,
      description,
      taskId,
      scheduledAt,
      redirectLink,

      usersList,
    } = req.body;

    if (!title) {
      return res.status(400).send({
        success: false,
        message: "Title is required!",
      });
    }

    if (!scheduledAt) {
      return res.status(400).send({
        success: false,
        message: "Scheduled time is required!",
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
        scheduledAt: new Date(scheduledAt),
        redirectLink: `${redirectLink}?comment_taskId=${taskId}`
      });

      // ✅ Schedule with Agenda
      await agenda.schedule(new Date(scheduledAt), "send reminder", {
        reminderId: reminder._id,
      });

      reminders.push(reminder);
    }

    res.status(200).send({
      success: true,
      message: "Reminder(s) created and scheduled successfully!",
      reminders,
    });
  } catch (error) {
    console.error("Create Reminder Error:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while creating reminder(s)!",
      error: error.message,
    });
  }
};

// Get All Reminders
// export const getReminderByUsers = async (req, res) => {
//   try {
//     const userId = req.user.user._id;
//     const startOfDay = moment().startOf("day").toDate();
//     const endOfDay = moment().endOf("day").toDate();

//     console.log("Data:", userId, startOfDay, endOfDay);

//     const reminders = await reminderModel.find({
//       userId: userId,
//       isCompleted: false,
//       date: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//     });

//     res.status(200).send({
//       success: true,
//       message: "Reminders List!",
//       reminders: reminders,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error occured while get reminder!",
//       error: error.message,
//     });
//   }
// };

export const getDueReminders = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const now = new Date();

    const reminders = await reminderModel.find({
      userId: userId,
      isCompleted: false,
      
      scheduledAt: { $lte: now }, // Only due or past
    }).sort({_id: -1})

    res.status(200).send({
      success: true,
      message: "Due reminders fetched!",
      reminders,
    });
  } catch (error) {
    console.error("Reminder fetch error:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while fetching reminders!",
      error: error.message,
    });
  }
};




export const getDueRemindersCount = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const now = new Date();

    const remindersCount = await reminderModel.countDocuments({
      userId: userId,
      isCompleted: false,
      isRead: false,
      scheduledAt: { $lte: now }, // Only due or past
    });

    res.status(200).send({
      success: true,
      message: "Due reminders count fetched!",
      remindersCount,
    });
  } catch (error) {
    console.error("Reminder fetch error:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while fetching reminders count!",
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














// Snooze reminder (update scheduledAt)
export const snoozeReminder = async (req, res) => {
  const { scheduledAt } = req.body;

  if (!scheduledAt) {
    return res.status(400).json({ message: "New scheduledAt time required" });
  }

  try {
    const reminder = await reminderModel.findByIdAndUpdate(
      req.params.id,
      { scheduledAt },
      { new: true }
    );

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    await agenda.schedule(new Date(scheduledAt), "send reminder", {
      reminderId: reminder._id,
    });

    res.status(200).json({ message: "Reminder snoozed", reminder });
  } catch (err) {
    res.status(500).json({ message: "Failed to snooze reminder" });
  }
};

// Complete reminder with optional note
export const completeReminder = async (req, res) => {
  // const { note } = req.body;

  try {
    const reminder = await reminderModel.findByIdAndUpdate(
      req.params.id,
      { isCompleted: true },
      { new: true }
    );

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    res.status(200).json({ message: "Reminder marked complete" });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete reminder" });
  }
};





// Complete reminder with optional note
export const markAsReadReminder = async (req, res) => {
  // const { note } = req.body;

  try {
    const reminder = await reminderModel.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    res.status(200).json({ message: "Reminder marked Read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update reminder" });
  }
};
