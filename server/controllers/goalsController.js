import goalModel from "../models/goalModel.js";
import jobsModel from "../models/jobsModel.js";
import leadModel from "../models/leadModel.js";
import proposalModel from "../models/proposalModel.js";

// Create Goal
export const createGoal = async (req, res) => {
  try {
    const { subject, achievement, startDate, endDate, goalType, jobHolder } =
      req.body;

    console.log(subject, achievement, startDate, endDate, goalType, jobHolder);

    const goal = await goalModel.create({
      subject,
      achievement,
      startDate,
      endDate,
      goalType,
      jobHolder,
    });

    res.status(200).send({
      success: true,
      message: "Goal create successfully!",
      goal: goal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error create goal!",
      error: error,
    });
  }
};

// Update Goal
export const updateGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const { subject, achievement, startDate, endDate, goalType, jobHolder } =
      req.body;

    const isGoal = await goalModel.findById(goalId);
    if (!isGoal) {
      res.status(400).send({
        success: false,
        message: "Goal not found!",
        error: error,
      });
    }

    const updateGoal = await goalModel.findByIdAndUpdate(
      { _id: isGoal._id },
      {
        subject: subject || isGoal.subject,
        achievement: achievement || isGoal.achievement,
        startDate: startDate || isGoal.startDate,
        endDate: endDate || isGoal.endDate,
        goalType: goalType || isGoal.goalType,
        jobHolder: jobHolder || isGoal.jobHolder,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Goal update successfully!",
      goal: updateGoal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error update goal!",
      error: error,
    });
  }
};

// Get All Goal
export const fetchAllGoal = async (req, res) => {
  try {
    const goals = await goalModel.find({}).populate("jobHolder");
    const clients = await jobsModel.find({});
    const leads = await leadModel.find({});
    const wonleads = await leadModel.find({ status: won });

    res.status(200).send({
      success: true,
      message: "All goal list!",
      goals: goals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error get all goals!",
      error: error,
    });
  }
};

// Get Single Goal
export const fetchSingleGoal = async (req, res) => {
  try {
    const goalId = req.params.id;

    const goal = await goalModel.findById(goalId).populate("jobHolder");

    if (!goal) {
      res.status(400).send({
        success: false,
        message: "Goal not found!",
        error: error,
      });
    }

    res.status(200).send({
      success: true,
      message: "Single goal!",
      goal: goal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetch single goal!",
      error: error,
    });
  }
};

// Update Goal Status
export const updateGoalStatus = async (req, res) => {
  try {
    const goalId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({
        message: "Status is required!",
      });
    }

    const goal = await goalModel.findByIdAndUpdate(
      { _id: goalId },
      { status: status },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Goal status updated!",
      goal: goal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error update goal status!",
      error: error,
    });
  }
};

// Delete Goal
export const deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;

    await goalModel.findByIdAndDelete({ _id: goalId });

    return res.status(200).send({
      success: true,
      message: "Goal delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error delete goal!",
      error: error,
    });
  }
};

// Fetch All Progress
export const fetchAchievedDataByGoalType = async (req, res) => {
  try {
    const goals = await goalModel
      .find({ status: { $ne: "completed" } })
      .populate("jobHolder");

    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        let achievedCount = 0;

        // Get Total Achieved Counts
        if (goal.goalType === "Increase Client") {
          achievedCount = await jobsModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
          });
        } else if (goal.goalType === "Increase Fee") {
          const jobs = await jobsModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(goal.startDate),
                  $lte: new Date(goal.endDate),
                },
              },
            },
            {
              $group: {
                _id: null,
                totalFee: {
                  $sum: {
                    $toDouble: {
                      $cond: {
                        if: { $eq: ["$fee", ""] },
                        then: "0",
                        else: "$fee",
                      },
                    },
                  },
                },
              },
            },
          ]);
          // Total Fee
          achievedCount = jobs.length > 0 ? jobs[0].totalFee : 0;
        } else if (goal.goalType === "Total Lead") {
          achievedCount = await leadModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
          });
        } else if (goal.goalType === "Lead Won") {
          achievedCount = await leadModel.countDocuments({
            status: "won",
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
          });
        } else if (goal.goalType === "Total Proposal") {
          achievedCount = await proposalModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
          });
        }

        // Update achievedCount in the goal object
        return {
          ...goal._doc,
          achievedCount,
        };
      })
    );

    res.status(200).send({
      success: true,
      message: "All goals with achieved counts!",
      goals: updatedGoals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching goals with achieved data!",
      error: error.message,
    });
  }
};

// Fetch All Complete
export const fetchAchievedDataByGoalComplete = async (req, res) => {
  try {
    const goals = await goalModel
      .find({ status: { $ne: "Progress" } })
      .populate("jobHolder");

    const updatedGoals = await Promise.all(
      goals.map(async (goal) => {
        let achievedCount = 0;

        // Get Total Achieved Counts
        if (goal.goalType === "Increase Client") {
          achievedCount = await jobsModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
          });
        } else if (goal.goalType === "Increase Fee") {
          const jobs = await jobsModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(goal.startDate),
                  $lte: new Date(goal.endDate),
                },
              },
            },
            {
              $group: {
                _id: null,
                totalFee: {
                  $sum: {
                    $toDouble: {
                      $cond: {
                        if: { $eq: ["$fee", ""] },
                        then: "0",
                        else: "$fee",
                      },
                    },
                  },
                },
              },
            },
          ]);
          // Total Fee
          achievedCount = jobs.length > 0 ? jobs[0].totalFee : 0;
        } else if (goal.goalType === "Total Lead") {
          achievedCount = await leadModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
          });
        } else if (goal.goalType === "Lead Won") {
          achievedCount = await leadModel.countDocuments({
            status: "won",
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
          });
        } else if (goal.goalType === "Total Proposal") {
          achievedCount = await proposalModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
          });
        }

        // Update achievedCount in the goal object
        return {
          ...goal._doc,
          achievedCount,
        };
      })
    );

    res.status(200).send({
      success: true,
      message: "All goals with achieved counts!",
      goals: updatedGoals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching goals with achieved data!",
      error: error.message,
    });
  }
};
