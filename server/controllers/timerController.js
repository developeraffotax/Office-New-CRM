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
    } = req.body;
    const startTime = new Date().toISOString();

    const user = req.user.user.name;

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
    });
    await newTimer.save();

    const updatedJob = await jobsModel.findByIdAndUpdate(
      jobId,
      { createdAt: new Date() },
      { new: true }
    );

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

// Get Total Time
// export const totalTime = async (req, res) => {
//   try {
//     const timerId = req.params.id;
//     const { jobId } = req.query;

//     if (!timerId) {
//       return res.status(400).send({
//         success: false,
//         message: "Timer Id is required!",
//       });
//     }

//     const timer = await timerModel.findById({ _id: timerId });
//     if (!timer) {
//       return res.status(400).send({
//         success: false,
//         message: "Timer not found!",
//       });
//     }

//     if (!timer.startTime || !timer.endTime) {
//       return res.status(400).json({ message: "Timer has not ended" });
//     }

//     const startTime = new Date(timer.startTime);
//     const endTime = new Date(timer.endTime);
//     const totalTimeInSeconds = (endTime - startTime) / 1000;

//     let newTime;
//     if (totalTimeInSeconds < 3600) {
//       const totalTimeInMinutes = totalTimeInSeconds / 60;
//       newTime = `${totalTimeInMinutes.toFixed(0)}m`;
//     } else {
//       const totalTimeInHours = totalTimeInSeconds / 3600;
//       newTime = `${totalTimeInHours.toFixed(0)}h`;
//     }

//     const job = await jobsModel.findById(jobId);

//     if (job) {
//       // Update Time in Job
//       await jobsModel.findByIdAndUpdate(
//         { _id: jobId },
//         { $set: { totalTime: newTime } },
//         { new: true }
//       );
//     }

//     const task = await taskModel.findById(jobId);

//     if (task) {
//       // Update Total Time in Task
//       await taskModel.findByIdAndUpdate(
//         { _id: jobId },
//         { $set: { estimate_Time: newTime } },
//         { new: true }
//       );
//     }

//     res.status(200).send({
//       success: true,
//       message: "Total time calculated successfully!",
//       totalTime: responseMessage,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in total time controller",
//       error,
//     });
//   }
// };
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

      await jobsModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { totalTime: updatedJobTime } },
        { new: true }
      );
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

      await taskModel.findByIdAndUpdate(
        { _id: jobId },
        { $set: { estimate_Time: updatedTaskTime } },
        { new: true }
      );
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
    const { userId, taskName, pageName, taskLink, taskId } = req.body;
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
        message: "Timer task is already exist!",
      });
    }

    const timerStatus = await timerStatusModel.create({
      userId,
      taskName,
      pageName,
      taskLink,
      taskId,
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
    const timerStatus = await timerStatusModel.findOne({ userId: userId });

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
