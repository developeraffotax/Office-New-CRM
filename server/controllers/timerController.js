import { io } from "../index.js";
import jobsModel from "../models/jobsModel.js";
import taskModel from "../models/taskModel.js";
import timerModel from "../models/timerModel.js";
import timerStatusModel from "../models/timerStatusModel.js";

// Start Timer
export const startTimer = async (req, res) => {
  try {
    const {
      clientId,
      jobId,
      type,
      department,
      clientName,
      projectName,
      task,
      companyName,
      holiday,
    } = req.body;
    const startTime = new Date().toISOString();

    const user = req.user.user.name;
    const isTimerRunning = await timerModel.findOne({
      clientId: req.user.user._id,
      isRunning: true,
    });

    if (isTimerRunning) {
      return res.status(400).send({
        success: false,
        message: "Timer is already running in another task!",
      });
    }

    const newTimer = new timerModel({
      clientId,
      jobId,
      startTime,
      type,
      department,
      clientName,
      jobHolderName: user,
      projectName,
      task,
      companyName,
      isRunning: true,
      holiday,
    });
    await newTimer.save();

    const updatedJob = await jobsModel.findByIdAndUpdate(
      jobId,
      { createdAt: new Date() },
      { new: true }
    );

    io.emit("runningTimersUpdate");

    res.status(200).send({
      success: true,
      message: "Timer Start",
      timer: newTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in timer!",
      error,
    });
  }
};

// Stop Timer
export const stopTimer = async (req, res) => {
  try {
    const timerId = req.params.id;
    const { note, activity } = req.body;
    const endTime = new Date().toISOString();

    const isExisting = await timerModel.findById({ _id: timerId });
    if (!isExisting) {
      res.status(400).send({
        success: false,
        message: "Timer not found!",
      });
    }

    const updateTimer = await timerModel.findByIdAndUpdate(
      { _id: isExisting._id },
      { endTime: endTime, note: note, activity: activity, isRunning: false },
      { new: true }
    );

    removeStatus(updateTimer._id);

    io.emit("runningTimersUpdate");

    res.status(200).send({
      success: true,
      message: "Timer stoped!",
      timer: updateTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in stop timer!",
      error,
    });
  }
};




// Get Timer Status
export const timerStatus = async (req, res) => {
  try {
    const { jobId, clientId } = req.query;

    const timer = await timerModel.findOne({
      clientId,
      jobId,
      isRunning: true,
      $or: [
        { endTime: { $exists: false } },
        { endTime: null },
        { endTime: "" },
      ],
    });

    if (!timer) {
      return res.status(200).json({ message: "Timer not running!" });
    }

    res.status(200).send({
      success: true,
      message: "Timer Status",
      timer: timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: "error in timer status controller",
      error,
    });
  }
};



 


// Get Running Timer For the User               
export const getRunningTimer = async (req, res) => {
  try {
    const { userId } = req.params;

    const filter = {
      clientId: userId,
      isRunning: true,

    }

    const timer = await timerModel.findOne(filter);



    if (!timer) {
      return res.status(200).json({ message: "Timer not running!" });
    }

    res.status(200).send({
      success: true,
      message: "Timer Status",
      timer: timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: "error in timer status controller",
      error,
    });
  }
};








// Get Total Time(Task & Job)
export const totalTime = async (req, res) => {
  try {
    const timerId = req.params.id;
    const { jobId } = req.query;

    if (!timerId) {
      return res.status(400).send({
        success: false,
        message: "Timer Id is required!",
      });
    }

    const timer = await timerModel.findById({ _id: timerId });
    if (!timer) {
      return res.status(400).send({
        success: false,
        message: "Timer not found!",
      });
    }

    if (!timer.startTime || !timer.endTime) {
      return res.status(400).json({ message: "Timer has not ended" });
    }

    const startTime = new Date(timer.startTime);
    const endTime = new Date(timer.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ message: "Invalid start or end time!" });
    }

    const totalTimeInSeconds = (endTime - startTime) / 1000;

    // Helper function to convert time strings like '2m', '2h' into seconds
    const convertTimeToSeconds = (timeStr) => {
      if (!timeStr || isNaN(parseInt(timeStr))) return 0;

      const timeValue = parseInt(timeStr.slice(0, -1));
      const timeUnit = timeStr.slice(-1);

      if (timeUnit === "m") {
        return timeValue * 60;
      } else if (timeUnit === "h") {
        return timeValue * 3600;
      }
      return 0;
    };

    // Convert seconds back to human-readable time (either minutes or hours)
    const convertSecondsToReadableTime = (seconds) => {
      if (seconds < 3600) {
        const minutes = (seconds / 60).toFixed(0);
        return `${minutes}m`;
      } else {
        const hours = (seconds / 3600).toFixed(0);
        return `${hours}h`;
      }
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    };

    // Update job's total time
    const job = await jobsModel.findById(jobId);

    if (job) {
      const prevJobTimeInSeconds = convertTimeToSeconds(
        job.totalTime === "NaNh" ? "0m" : job.totalTime
      );
      const updatedJobTimeInSeconds = prevJobTimeInSeconds + totalTimeInSeconds;
      const updatedJobTime = convertSecondsToReadableTime(
        updatedJobTimeInSeconds
      );

      const updateJob = await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { totalTime: updatedJobTime } },
        { new: true }
      );

      // Push activity to activities array
      updateJob.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} ⏱️ tracked time from 🕒 "${formatTime(
          startTime
        )}" - to 🕒 "${formatTime(
          endTime
        )}" with a total duration of ⏳ "${convertSecondsToReadableTime(
          totalTimeInSeconds
        )}" in this job.`,
      });

      await updateJob.save();
    }

    // Update task's estimated time
    const task = await taskModel.findById(jobId);

    if (task) {
      const prevTaskTimeInSeconds = convertTimeToSeconds(
        task.estimate_Time === "NaNh" ? "0m" : task.estimate_Time
      );
      const updatedTaskTimeInSeconds =
        prevTaskTimeInSeconds + totalTimeInSeconds;
      const updatedTaskTime = convertSecondsToReadableTime(
        updatedTaskTimeInSeconds
      );

      const updateTask = await taskModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { estimate_Time: updatedTaskTime } },
        { new: true }
      );

      // Push activity to activities array
      updateTask.activities.push({
        user: req.user.user._id,
        activity: `${req.user.user.name} ⏱️ tracked time from 🕒 "${formatTime(
          startTime
        )}" - to 🕒 "${formatTime(
          endTime
        )}" with a total duration of ⏳ "${convertSecondsToReadableTime(
          totalTimeInSeconds
        )}" in this task.`,
      });

      await updateTask.save();
    }

    res.status(200).send({
      success: true,
      message: "Total time calculated and updated successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in total time controller",
      error,
    });
  }
};

// Add Timer Status
export const addTimerStatus = async (req, res) => {
  try {
    const { userId, taskName, pageName, taskLink, taskId, timerId } = req.body;
    if (!userId || !taskName || !pageName || !taskLink) {
      return res.status(400).send({
        success: false,
        message: "All fields required!",
      });
    }

    const isExisting = await timerStatusModel.findOne({ userId: userId });
    if (isExisting) {
      return res.status(400).send({
        success: false,
        message: "Timer task is already running!",
      });
    }

    const timerStatus = await timerStatusModel.create({
      userId,
      taskName,
      pageName,
      taskLink,
      taskId,
      isRunning: true,
      timerId,
    });

    res.status(200).send({
      success: true,
      message: "Timer task status added!",
      timerStatus: timerStatus,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in timer status controller",
      error,
    });
  }
};

// Remove timer Status
export const removeTimerStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User id is required!",
      });
    }

    await timerStatusModel.findOneAndDelete({ userId: userId });

    res.status(200).send({
      success: true,
      message: "Timer status task removed!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in timer status controller",
      error,
    });
  }
};

const removeStatus = async (timerId) => {
  if (!timerId) {
    return res.status(400).send({
      success: false,
      message: "Timer id is required!",
    });
  }

  await timerStatusModel.findOneAndDelete({ timerId: timerId });
};

// Get Task Timer Status
export const getTimerStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User id is required!",
      });
    }
    const timerStatus = await timerStatusModel.findOne({
      userId: userId,
      isRunning: true,
    });

    res.status(200).send({
      success: true,
      message: "Timer status task!",
      timerStatus: timerStatus,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in timer status controller",
      error,
    });
  }
};

// --------------Get All Timers data----------->
export const getAllTimers = async (req, res) => {
  try {
    const timers = await timerModel
      .find({ endTime: { $ne: null } })
      .sort({ date: 1 });

    res.status(200).send({
      success: true,
      message: "All Timers",
      timers: timers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all timers",
      error,
    });
  }
};

// Add Timer Manually

export const addTimerMannually = async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      department,
      clientName,
      projectName,
      task,
      note,
      companyName,
      activity,
    } = req.body;

    const user = req.user.user.name;

    const timer = await timerModel.create({
      date,
      startTime,
      endTime,
      department,
      clientName,
      jobHolderName: user,
      projectName,
      task,
      note,
      companyName,
      type: "Manual",
      activity,
    });
    res.status(200).send({
      success: true,
      message: "Timer added Successfully!",
      timer: timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in add timer manually!",
      error,
    });
  }
};

// Update timer
export const updateTimer = async (req, res) => {
  try {
    const timerId = req.params.id;
    const {
      date,
      startTime,
      endTime,
      department,
      clientName,
      projectName,
      task,
      note,
      companyName,
      activity,
    } = req.body;

    const isExist = await timerModel.findById(timerId);

    if (!isExist) {
      return res.status(400).send({
        success: false,
        message: "Timer not found!",
      });
    }

    const timer = await timerModel.findByIdAndUpdate(
      { _id: timerId },
      {
        date: date || isExist.date,
        startTime: startTime || isExist.startTime,
        endTime: endTime || isExist.endTime,
        companyName: companyName || isExist.companyName,
        department: department || isExist.department,
        clientName: clientName || isExist.clientName,
        projectName: projectName || isExist.projectName,
        task: task || isExist.task,
        note: note || isExist.note,
        activity: activity || isExist.activity,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Timer updated successfully!",
      timer: timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update timer!",
      error,
    });
  }
};

// Delete Timer
export const deleteTimer = async (req, res) => {
  try {
    const timerId = req.params.id;

    await timerModel.findByIdAndDelete(timerId);

    res.status(200).send({
      success: true,
      message: "Timer deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete timer!",
      error,
    });
  }
};

// Get Single Timer
export const singleTimer = async (req, res) => {
  try {
    const timerId = req.params.id;
    const timer = await timerModel.findById(timerId);

    res.status(200).send({
      success: true,
      message: "Single timer!",
      timer: timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in single timer!",
      error,
    });
  }
};

// Update Jobholder name
export const updateJobHolderName = async (req, res) => {
  try {
    const { prevJobHolderName, newJobHolderName } = req.body;

    // Check if both previous and new jobHolderName are provided
    if (!prevJobHolderName || !newJobHolderName) {
      return res.status(400).send({
        success: false,
        message: "Both previous and new jobHolderName must be provided.",
      });
    }

    // Find all timers with the previous jobHolderName and update to the new jobHolderName
    const updatedTimers = await timerModel.updateMany(
      { jobHolderName: prevJobHolderName },
      { $set: { jobHolderName: newJobHolderName } }
    );

    res.status(200).send({
      success: true,
      message: `Updated jobHolderName from ${prevJobHolderName} to ${newJobHolderName} for ${updatedTimers.nModified} timers.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating jobHolderName for timers!",
      error,
    });
  }
};

// All Running Timer
export const runningTimers = async (req, res) => {
  try {
    const timers = await timerModel.find({ isRunning: true });

    res.status(200).send({
      success: true,
      message: "List of running timers!",
      timers: timers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get running timers!",
      error: error,
    });
  }
};

// Update holiday
export const updateHoliday = async (req, res) => {
  try {
    const id = req.params.id;
    const { holiday } = req.body;

    const timer = await timerModel.findById(id);

    if (!timer) {
      return res.status(400).send({
        success: false,
        message: "Timer not found!",
      });
    }

    const updateTimer = await timerModel.findByIdAndUpdate(
      { _id: timer._id },
      { $set: { holiday } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Holiday updated!",
      updateTimer: updateTimer,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while update holiday!",
      error: error,
    });
  }
};

// Get ALL Holidays
export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await timerModel
      .find({
        holiday: { $in: ["Company Holiday", "Personal Holiday"] },
      })
      .select(" date jobHolderName holiday createdAt");

    res.status(200).send({
      success: true,
      message: "All Holiday!",
      holidays: holidays,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while get holidays!",
      error: error,
    });
  }
};

// Get Timers date wise(weekly, monthly, yearly) wise
export const fetchTimersbydate = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // console.log("Dates", startDate, endDate);

    if (!startDate || !endDate) {
      return res.status(400).send({
        success: false,
        message: "StartDate and EndDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const timers = await timerModel
      .find({ endTime: { $ne: null }, date: { $gte: start, $lte: end } })
      .sort({ date: 1 });

    res.status(200).send({
      success: true,
      message: "All Timers",
      timers: timers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all timers",
      error,
    });
  }
};
