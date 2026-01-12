import reminderModel from "../models/reminderModel.js";
import moment from "moment";

import agenda from "../utils/agenda.js";
import { emitToUser } from "../utils/socketEmitter.js";
import mongoose from "mongoose";

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

    const groupId = new mongoose.Types.ObjectId();

    
    for (let user of usersList) {
      const reminder = await reminderModel.create({
        userId: user._id,
        title,
        description,
        taskId,
        scheduledAt: new Date(scheduledAt),
        redirectLink: `${redirectLink}?comment_taskId=${taskId}`,
        groupId,
});

      // ✅ Schedule with Agenda
      await agenda.schedule(new Date(scheduledAt), "send reminder", {
        reminderId: reminder._id,
      });

      reminders.push(reminder);
      

       // 🔥 SOCKET: tell frontend to refresh reminders
      // await emitToUser(user._id, "reminder:refresh", {
      //   type: "created",
      //   reminderId: reminder._id,
      // });


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





// Update Reminder
export const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const {
      title,
      description,
      scheduledAt,
      redirectLink,
      isRead,
      isCompleted,
    } = req.body;

    if (!reminderId) {
      return res.status(400).send({
        success: false,
        message: "Reminder ID is required!",
      });
    }

    // 🔍 Find existing reminder
    const reminder = await reminderModel.findById(reminderId);

    if (!reminder) {
      return res.status(404).send({
        success: false,
        message: "Reminder not found!",
      });
    }

    // 📝 Update fields (only if provided)
    if (title !== undefined) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (redirectLink !== undefined) reminder.redirectLink = redirectLink;
    if (isRead !== undefined) reminder.isRead = isRead;
    if (isCompleted !== undefined) reminder.isCompleted = isCompleted;

    let scheduleChanged = false;

    if (scheduledAt) {
      reminder.scheduledAt = new Date(scheduledAt);
      scheduleChanged = true;
    }

    // 💾 Save updated reminder
    await reminder.save();

    // 🧹 Cancel old Agenda job (important!)
    if (scheduleChanged) {
      await agenda.cancel({
        name: "send reminder",
        "data.reminderId": reminder._id,
      });

      // ⏰ Re-schedule with new date
      await agenda.schedule(new Date(scheduledAt), "send reminder", {
        reminderId: reminder._id,
      });
    }

    // 🔥 Optional: socket refresh
    // await emitToUser(reminder.userId, "reminder:refresh", {
    //   type: "updated",
    //   reminderId: reminder._id,
    // });

    res.status(200).send({
      success: true,
      message: "Reminder updated successfully!",
      reminder,
    });
  } catch (error) {
    console.error("Update Reminder Error:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while updating reminder!",
      error: error.message,
    });
  }
};





// Delete Reminder
export const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    if (!reminderId) {
      return res.status(400).send({
        success: false,
        message: "Reminder ID is required!",
      });
    }

    // 🔍 Find reminder
    const reminder = await reminderModel.findById(reminderId);

    if (!reminder) {
      return res.status(404).send({
        success: false,
        message: "Reminder not found!",
      });
    }

    // 🧹 Cancel Agenda job FIRST
    await agenda.cancel({
      name: "send reminder",
      "data.reminderId": reminder._id,
    });

    // ❌ Delete reminder from DB
    await reminderModel.findByIdAndDelete(reminderId);

    // 🔥 Optional socket refresh
    // await emitToUser(reminder.userId, "reminder:refresh", {
    //   type: "deleted",
    //   reminderId,
    // });

    res.status(200).send({
      success: true,
      message: "Reminder deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Reminder Error:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while deleting reminder!",
      error: error.message,
    });
  }
};

























// export const updateReminder = async (req, res) => {
//   try {
//     const { reminderId } = req.params;
//     const payload = req.body;

//     const sourceReminder = await reminderModel.findById(reminderId);
//     if (!sourceReminder) {
//       return res.status(404).json({ success: false });
//     }

//     const update = {};
//     if (payload.title !== undefined) update.title = payload.title;
//     if (payload.description !== undefined) update.description = payload.description;
//     if (payload.redirectLink !== undefined) update.redirectLink = payload.redirectLink;
//     if (payload.scheduledAt) update.scheduledAt = new Date(payload.scheduledAt);

//     // ❌ DO NOT propagate isRead / isCompleted
//     if(sourceReminder?.groupId) {
//       await reminderModel.updateMany(
//       { groupId: sourceReminder.groupId },
//       { $set: update }
//     );
//     }

//     // 🔁 Reschedule ALL agenda jobs
//     if (payload.scheduledAt) {
//       const reminders = await reminderModel.find({
//         groupId: sourceReminder.groupId
//       }).select("_id");

//       for (const r of reminders) {
//         await agenda.cancel({
//           name: "send reminder",
//           "data.reminderId": r._id
//         });

//         await agenda.schedule(
//           new Date(payload.scheduledAt),
//           "send reminder",
//           { reminderId: r._id }
//         );
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Reminder updated for all users"
//     });

//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// };



















// export const deleteReminder = async (req, res) => {
//   try {
//     const { reminderId } = req.params;

//     const reminder = await reminderModel.findById(reminderId);
//     if (!reminder) {
//       return res.status(404).json({
//         success: false,
//         message: "Reminder not found",
//       });
//     }

//     // 🔥 Find all reminders in the same group
//     const reminders = await reminderModel.find({
//       groupId: reminder.groupId
//     }).select("_id");

//     // 🧹 Cancel ALL agenda jobs
//     for (const r of reminders) {
//       await agenda.cancel({
//         name: "send reminder",
//         "data.reminderId": r._id,
//       });
//     }

//     // ❌ Delete ALL reminders in the group
//     await reminderModel.deleteMany({
//       groupId: reminder.groupId
//     });

//     res.status(200).json({
//       success: true,
//       message: "Reminder deleted for all users",
//     });

//   } catch (err) {
//     console.error("Delete Reminder Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Delete failed",
//     });
//   }
// };


















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

// export const getDueReminders = async (req, res) => {
//   try {
//     const userId = req.user.user._id;
//     const now = new Date();

//     const reminders = await reminderModel.find({
//       userId: userId,
//       isCompleted: false,
      
//       scheduledAt: { $lte: now }, // Only due or past
//     }).sort({_id: -1})

//     res.status(200).send({
//       success: true,
//       message: "Due reminders fetched!",
//       reminders,
//     });
//   } catch (error) {
//     console.error("Reminder fetch error:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error occurred while fetching reminders!",
//       error: error.message,
//     });
//   }
// };


export const getDueReminders = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const now = new Date();

    const reminders = await reminderModel
      .find({
        userId,
        isCompleted: false,
      })
      .sort({ scheduledAt: -1 });

    const formatted = reminders.map((r) => ({
      ...r.toObject(),
      status: r.scheduledAt <= now ? "due" : "upcoming",
    }));

    res.status(200).send({
      success: true,
      reminders: formatted,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error occurred while fetching reminders!",
      error: error.message,
    });
  }
};








// export const getDueRemindersCount = async (req, res) => {
//   try {
//     const userId = req.user.user._id;
//     const now = new Date();

//     const remindersCount = await reminderModel.countDocuments({
//       userId: userId,
//       isCompleted: false,
//       isRead: false,
//       scheduledAt: { $lte: now }, // Only due or past
//     });

//     res.status(200).send({
//       success: true,
//       message: "Due reminders count fetched!",
//       remindersCount,
//     });
//   } catch (error) {
//     console.error("Reminder fetch error:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error occurred while fetching reminders count!",
//       error: error.message,
//     });
//   }
// };





export const getDueRemindersCount = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const now = new Date();

    // Count all reminders that are unread and not completed
    const unreadRemindersCount = await reminderModel.countDocuments({
      userId,
      isCompleted: false,
      isRead: false,
    });

    // Optionally, count only "due" reminders (past or now)
    // const dueRemindersCount = await reminderModel.countDocuments({
    //   userId,
    //   isCompleted: false,
    //   isRead: false,
    //   scheduledAt: { $lte: now },
    // });

    res.status(200).send({
      success: true,
      message: "Reminders count fetched successfully!",
      remindersCount:unreadRemindersCount, // for badge
      // dueRemindersCount,    
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





// // Delete  Reminder
// export const deleteReminder = async (req, res) => {
//   try {
//     const reminderId = req.params.id;
//     const reminder = await reminderModel.findById(reminderId);

//     await reminderModel.findByIdAndDelete(reminderId);

//     res.status(200).send({
//       success: true,
//       message: "Reminders deleted successfully!",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error occured while delete reminder!",
//       error: error.message,
//     });
//   }
// };














// Snooze reminder (update scheduledAt)
export const snoozeReminder = async (req, res) => {
  const { scheduledAt } = req.body;

  if (!scheduledAt) {
    return res.status(400).json({ message: "New scheduledAt time required" });
  }

  try {
    const reminder = await reminderModel.findByIdAndUpdate(
      req.params.id,
      { scheduledAt, isRead: false },
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
