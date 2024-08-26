import jobsModel from "../models/jobsModel.js";
import taskModel from "../models/taskModel.js";
import timerModel from "../models/timerModel.js";
import timerStatusModel from "../models/timerStatusModel.js";

// Start Timer
export const startTimer = async (req, res) => {
  try {
    const { clientId, jobId, note } = req.body;
    const startTime = new Date().toISOString();

    const newTimer = new timerModel({ clientId, jobId, note, startTime });
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
    const { note } = req.body;
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
      { endTime: endTime, note: note },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Timer Stop",
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
    const { jobId } = req.query;

    const timer = await timerModel.findOne({ jobId }).sort({ createdAt: -1 });

    if (!timer) {
      return res.status(404).json({ message: "No timer found" });
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
    const totalTimeInSeconds = (endTime - startTime) / 1000;

    let responseMessage;
    // if (totalTimeInSeconds < 60) {
    //   responseMessage = `${totalTimeInSeconds.toFixed(0)} s`;
    // } else
    if (totalTimeInSeconds < 3600) {
      const totalTimeInMinutes = totalTimeInSeconds / 60;
      responseMessage = `${totalTimeInMinutes.toFixed(0)}m`;
    } else {
      const totalTimeInHours = totalTimeInSeconds / 3600;
      responseMessage = `${totalTimeInHours.toFixed(0)}h`;
    }
    // Update Time in Job
    await jobsModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { totalTime: responseMessage } },
      { new: true }
    );

    // Update Total Time in Task
    await taskModel.findByIdAndUpdate(
      { _id: jobId },
      { $set: { estimate_Time: responseMessage } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Total time calculated successfully!",
      totalTime: responseMessage,
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
