import meetingModel from "../models/meetingModel.js";
import reminderModel from "../models/reminderModel.js";
import cron from "node-cron";
import moment from "moment";
import notificationModel from "../models/notificationModel.js";
import agenda from "../utils/agenda.js";

// Create Meeting
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
        message: "Users list is required and should not be empty!",
      });
    }

    if (!usersList || !Array.isArray(usersList) || usersList.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Users list is required and should not be empty!",
      });
    }

    // Create a new meeting
    const meeting = await meetingModel.create({
      title,
      description,
      results,
      scheduledAt,
      color,
      usersList,
    });

    if (meeting) {
      // const reminders = [];

      for (let user of usersList) {
        const reminder = await reminderModel.create({
          userId: user._id,
          title,
          description,
          taskId: meeting._id,
          scheduledAt: new Date(scheduledAt),
          redirectLink: `${redirectLink}?meeting_id=${meeting._id}`,
        });
        // reminders.push(reminder);

        // ✅ Schedule with Agenda
        await agenda.schedule(new Date(scheduledAt), "send reminder", {
          reminderId: reminder._id,
        });
      }

      // Send notification to users
      // for (let user of usersList) {
      //   await notificationModel.create({
      //     title: "Meeting Created",
      //     redirectLink: "/meetings",
      //     description: `${req.user.user.name} create a new meeting of "${meeting.title}"`,
      //     taskId: `${meeting._id}`,
      //     userId: user._id,
      //   });
      // }
    }

    res.status(200).send({
      success: true,
      message: "Meeting created successfully!",
      meeting: meeting,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error creating meeting",
      error: error,
    });
  }
};










// Update Meeting
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

    // Step 1: Check if meeting exists
    const existingMeeting = await meetingModel.findById(meetingId);
    if (!existingMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found!",
      });
    }

    // Step 2: Update meeting with fallbacks
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

    // Step 3: Update associated reminders
    if (scheduledAt && updatedMeeting) {
      const reminders = await reminderModel.find({ taskId: meetingId });

      for (const reminder of reminders) {
        reminder.scheduledAt = new Date(scheduledAt);
        if (title) reminder.title = title;
        if (description) reminder.description = description;
        await reminder.save();

        // Cancel the old scheduled job
        await agenda.cancel({ "data.reminderId": reminder._id });

        // Reschedule the job with updated time
        await agenda.schedule(new Date(scheduledAt), "send reminder", {
          reminderId: reminder._id,
        });
      }
    }

    // Step 4: Respond success
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
      error,
    });
  }
};















// Get All Meetings
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await meetingModel
      .find({})
      .populate("usersList", "name email avatar");

    res.status(200).send({
      success: true,
      message: "Meetings list!",
      meetings: meetings,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occured while get meetings list!",
      error: error,
    });
  }
};











// Get Single Meeting
export const fetchMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const meeting = await meetingModel
      .findById({ _id: meetingId })
      .populate("usersList", "name email avatar");

    res.status(200).send({
      success: true,
      message: "Meeting details!",
      meeting: meeting,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occured while get meeting!",
      error: error,
    });
  }
};
























// Delete Meeting
export const deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const meeting = await meetingModel.findById({ _id: meetingId });
    if (meeting) {
      // for (let user of meeting.usersList) {
      //   const reminder = await reminderModel.create({
      //     userId: user._id,
      //     title: `Meeting Cancelled: ${meeting.title}`,
      //     description: meeting.description,
      //     taskId: meeting._id,
      //     date: meeting.date,
      //     time: meeting.time,
      //     redirectLink: "/meetings",
      //   });

      // }

      // Step 3: Update associated reminders

      const reminders = await reminderModel.find({ taskId: meetingId });

      for (const reminder of reminders) {
        // Cancel the old scheduled job
        await agenda.cancel({ "data.reminderId": reminder._id });
      }
    }
    
    await reminderModel.deleteMany({taskId: meetingId})
    await meetingModel.findByIdAndDelete({ _id: meetingId });

    res.status(200).send({
      success: true,
      message: "Meeting deleted successfully!",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occured while delete meeting!",
      error: error,
    });
  }
};




















// Delete Meeting If Date Expire
// export const deleteExpireMeeting = async (req, res) => {
//   try {
//     const currentDate = moment().format("YYYY-MM-DD");

//     const result = await meetingModel.deleteMany({
//       date: { $lt: currentDate },
//     });

//     res.status(200).send({
//       success: true,
//       message: `${result.deletedCount} expired meeting(s) deleted.`,
//     });
//   } catch (error) {
//     console.log("Error", error);
//     res.status(500).send({
//       success: false,
//       message: "Error occured while delete expire meetings!",
//       error: error,
//     });
//   }
// };

// Schedule the task to run daily at midnight
// cron.schedule("30 23 * * *", () => {
//   console.log("Running task scheduler for recurring tasks...");
//   deleteExpireMeeting();
// });
