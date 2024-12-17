import meetingModel from "../models/meetingModel.js";
import reminderModel from "../models/reminderModel.js";
import cron from "node-cron";
import moment from "moment";

// Create Meeting
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      results,
      date,
      time,
      color,
      usersList,
      redirectLink,
    } = req.body;

    if (!title || !description || !date || !time) {
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
      date,
      time,
      color,
      usersList,
    });

    if (meeting) {
      const reminders = [];

      for (let user of usersList) {
        const reminder = await reminderModel.create({
          userId: user._id,
          title,
          description,
          taskId: meeting._id,
          date,
          time,
          redirectLink,
        });
        reminders.push(reminder);
      }
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
      date,
      time,
      color,
      usersList,
      redirectLink,
    } = req.body;

    const existingMeeting = await meetingModel.findById(meetingId);

    if (!existingMeeting) {
      return res.status(404).send({
        success: false,
        message: "Meeting not found!",
      });
    }

    const meeting = await meetingModel.findByIdAndUpdate(
      { _id: meetingId },
      {
        title: title || existingMeeting.title,
        description: description || existingMeeting.description,
        results: results || existingMeeting.results,
        date: date || existingMeeting.date,
        time: time || existingMeeting.time,
        color: color || existingMeeting.color,
        usersList: usersList || existingMeeting.usersList,
      },
      { new: true }
    );

    if (meeting) {
      const reminders = [];

      for (let user of usersList) {
        const reminder = await reminderModel.create({
          userId: user._id,
          title: `Update Meeting: ${title}`,
          description,
          taskId: meeting._id,
          date,
          time,
          redirectLink,
        });
        reminders.push(reminder);
      }
    }

    res.status(200).send({
      success: true,
      message: "Meeting updated successfully!",
      meeting: meeting,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error update meeting",
      error: error,
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
      const reminders = [];

      for (let user of meeting.usersList) {
        const reminder = await reminderModel.create({
          userId: user._id,
          title: `Meeting Cancelled: ${meeting.title}`,
          description: meeting.description,
          taskId: meeting._id,
          date: meeting.date,
          time: meeting.time,
          redirectLink: "/meetings",
        });
        reminders.push(reminder);
      }
    }
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
export const deleteExpireMeeting = async (req, res) => {
  try {
    const currentDate = moment().format("YYYY-MM-DD");

    const result = await meetingModel.deleteMany({
      date: { $lt: currentDate },
    });

    res.status(200).send({
      success: true,
      message: `${result.deletedCount} expired meeting(s) deleted.`,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      message: "Error occured while delete expire meetings!",
      error: error,
    });
  }
};

// Schedule the task to run daily at midnight
cron.schedule("30 23 * * *", () => {
  console.log("Running task scheduler for recurring tasks...");
  deleteExpireMeeting();
});
