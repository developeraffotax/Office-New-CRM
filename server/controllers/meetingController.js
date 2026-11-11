import meetingModel from "../models/meetingModel.js";
import reminderModel from "../models/reminderModel.js";
import mongoose from "mongoose";
import agenda from "../utils/agenda.js";
import { emitToUser } from "../utils/socketEmitter.js"; // make sure this path is correct

// ===================== CREATE MEETING =====================
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      results,
      scheduledAt,
      color,
      usersList,
      redirectLink,
    } = req.body;

    if (!title || !description || !scheduledAt) {
      return res.status(400).send({
        success: false,
        message: "Title, Description & Date/Time should not be empty!",
      });
    }

    if (!usersList || !Array.isArray(usersList) || usersList.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Users list is required and should not be empty!",
      });
    }

    // Create meeting
    const meeting = await meetingModel.create({
      title,
      description,
      results,
      scheduledAt,
      color,
      usersList,
    });

    // Create one groupId for all reminders of this meeting
    const groupId = new mongoose.Types.ObjectId();
    const finalRedirectLink = `${redirectLink}?meeting_id=${meeting._id}`;

    for (const user of usersList) {
      const reminder = await reminderModel.create({
        userId: user._id,
        title,
        description,
        taskId: meeting._id.toString(),
        scheduledAt: new Date(scheduledAt),
        redirectLink: finalRedirectLink,
        groupId,
        createdBy: req.user.user._id,
      });

      // Schedule with Agenda
      await agenda.schedule(new Date(scheduledAt), "send reminder", {
        reminderId: reminder._id,
      });

      // Optional socket
      await emitToUser(user._id, "reminder:refresh", {
        type: "created",
        reminderId: reminder._id,
      });
    }

    res.status(200).send({
      success: true,
      message: "Meeting created successfully!",
      meeting,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error creating meeting",
      error: error.message,
    });
  }
};

// ===================== UPDATE MEETING =====================
export const updateMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const {
      title,
      description,
      results,
      scheduledAt,
      color,
      usersList,
      redirectLink,
    } = req.body;

    const existingMeeting = await meetingModel.findById(meetingId);
    if (!existingMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found!",
      });
    }

    // 1. Update the meeting itself
    const updatedMeeting = await meetingModel.findByIdAndUpdate(
      meetingId,
      {
        title: title ?? existingMeeting.title,
        description: description ?? existingMeeting.description,
        results: results ?? existingMeeting.results,
        scheduledAt: scheduledAt ?? existingMeeting.scheduledAt,
        color: color ?? existingMeeting.color,
        usersList: usersList ?? existingMeeting.usersList,
      },
      { new: true }
    );

    // 2. Sync reminders
    const existingReminders = await reminderModel.find({
      taskId: meetingId.toString(),
    });

    // If no usersList sent, just update title/description/time on existing reminders
    if (!usersList) {
      for (const reminder of existingReminders) {
        if (title) reminder.title = title;
        if (description) reminder.description = description;

        let scheduleChanged = false;
        if (scheduledAt) {
          reminder.scheduledAt = new Date(scheduledAt);
          scheduleChanged = true;
        }

        await reminder.save();

        if (scheduleChanged) {
          await agenda.cancel({
            name: "send reminder",
            "data.reminderId": reminder._id,
          });
          await agenda.schedule(new Date(scheduledAt), "send reminder", {
            reminderId: reminder._id,
          });
        }

        await emitToUser(reminder.userId, "reminder:refresh", {
          type: "updated",
          reminderId: reminder._id,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Meeting updated successfully!",
        meeting: updatedMeeting,
      });
    }

    // ---------- Full usersList sync ----------
    const newUserIds = usersList.map((u) => u._id.toString());
    const groupId =
      existingReminders[0]?.groupId || new mongoose.Types.ObjectId();

    const finalTitle = title ?? existingMeeting.title;
    const finalDescription = description ?? existingMeeting.description;
    const finalScheduledAt = scheduledAt
      ? new Date(scheduledAt)
      : existingMeeting.scheduledAt;
    const finalRedirectLink = redirectLink
      ? `${redirectLink}?meeting_id=${meetingId}`
      : existingReminders[0]?.redirectLink;

    // A. Delete reminders of users who were removed
    const toDelete = existingReminders.filter(
      (r) => !newUserIds.includes(r.userId.toString())
    );

    for (const rem of toDelete) {
      await agenda.cancel({
        name: "send reminder",
        "data.reminderId": rem._id,
      });
      await reminderModel.findByIdAndDelete(rem._id);

      await emitToUser(rem.userId, "reminder:refresh", {
        type: "deleted",
        reminderId: rem._id,
      });
    }

    // B. Update existing + create new
    for (const user of usersList) {
      const userIdStr = user._id.toString();
      const existing = existingReminders.find(
        (r) => r.userId.toString() === userIdStr
      );

      if (existing) {
        // Update existing reminder
        existing.title = finalTitle;
        existing.description = finalDescription;
        existing.redirectLink = finalRedirectLink;

        let scheduleChanged = false;
        if (scheduledAt) {
          existing.scheduledAt = finalScheduledAt;
          scheduleChanged = true;
        }

        // Make sure groupId is set (for older data)
        if (!existing.groupId) existing.groupId = groupId;

        await existing.save();

        if (scheduleChanged) {
          await agenda.cancel({
            name: "send reminder",
            "data.reminderId": existing._id,
          });
          await agenda.schedule(finalScheduledAt, "send reminder", {
            reminderId: existing._id,
          });
        }

        await emitToUser(existing.userId, "reminder:refresh", {
          type: "updated",
          reminderId: existing._id,
        });
      } else {
        // Create new reminder for newly added user
        const newRem = await reminderModel.create({
          userId: user._id,
          title: finalTitle,
          description: finalDescription,
          taskId: meetingId.toString(),
          scheduledAt: finalScheduledAt,
          redirectLink: finalRedirectLink,
          groupId,
          createdBy: req.user.user._id,
        });

        await agenda.schedule(finalScheduledAt, "send reminder", {
          reminderId: newRem._id,
        });

        await emitToUser(user._id, "reminder:refresh", {
          type: "created",
          reminderId: newRem._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Meeting updated successfully!",
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating meeting",
      error: error.message,
    });
  }
};

// ===================== DELETE MEETING =====================
export const deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;

    const meeting = await meetingModel.findById(meetingId);
    if (!meeting) {
      return res.status(404).send({
        success: false,
        message: "Meeting not found!",
      });
    }

    // Find all related reminders
    const reminders = await reminderModel.find({
      taskId: meetingId.toString(),
    });

    // Cancel Agenda jobs + emit socket + delete
    for (const reminder of reminders) {
      await agenda.cancel({
        name: "send reminder",
        "data.reminderId": reminder._id,
      });

      await emitToUser(reminder.userId, "reminder:refresh", {
        type: "deleted",
        reminderId: reminder._id,
      });
    }

    // Delete all reminders of this meeting
    await reminderModel.deleteMany({ taskId: meetingId.toString() });

    // Delete the meeting
    await meetingModel.findByIdAndDelete(meetingId);

    res.status(200).send({
      success: true,
      message: "Meeting and all related reminders deleted successfully!",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while deleting meeting!",
      error: error.message,
    });
  }
};

// ===================== GET ALL MEETINGS =====================
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await meetingModel
      .find({})
      .populate("usersList", "name email avatar");

    res.status(200).send({
      success: true,
      message: "Meetings list!",
      meetings,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while getting meetings list!",
      error: error.message,
    });
  }
};

// ===================== GET SINGLE MEETING =====================
export const fetchMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const meeting = await meetingModel
      .findById(meetingId)
      .populate("usersList", "name email avatar");

    res.status(200).send({
      success: true,
      message: "Meeting details!",
      meeting,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occurred while getting meeting!",
      error: error.message,
    });
  }
};