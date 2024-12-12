import affotaxAnalytics from "../models/affotaxAnalytics.js";
import goalModel from "../models/goalModel.js";
import jobsModel from "../models/jobsModel.js";
import leadModel from "../models/leadModel.js";
import proposalModel from "../models/proposalModel.js";
import timerModel from "../models/timerModel.js";
import { fetchSearchAnalytics } from "../utils/websiteImpression.js";

// Create Goal
export const createGoal = async (req, res) => {
  try {
    const {
      subject,
      achievement,
      startDate,
      endDate,
      goalType,
      jobHolder,
      achievedCount,
    } = req.body;

    console.log(achievedCount);

    const goal = await goalModel.create({
      subject,
      achievement,
      startDate,
      endDate,
      goalType,
      jobHolder,
      achievedCount,
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
    const {
      subject,
      achievement,
      startDate,
      endDate,
      goalType,
      jobHolder,
      achievedCount,
    } = req.body;

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
        achievedCount: achievedCount || isGoal.achievedCount,
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
    const goals = await goalModel
      .find({})
      .populate("jobHolder")
      .select("-comments");
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
      .populate("jobHolder")
      .sort({ startDate: 1 });

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
        } else if (goal.goalType === "Proposal Lead") {
          achievedCount = await proposalModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
            lead: "Yes",
          });
        } else if (goal.goalType === "Proposal Client") {
          achievedCount = await proposalModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
            client: "Yes",
          });
        } else if (goal.goalType === "Affotax Clicks") {
          achievedCount = await affotaxAnalytics.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
          });
        } else if (goal.goalType === "Affotax Impressions") {
          achievedCount = await affotaxAnalytics.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
          });
        } else if (goal.goalType === "Manual Goal") {
          const data = await goalModel.findOne({ _id: goal._id });
          achievedCount = data ? data.achievedCount : 0;
        } else if (goal.goalType === "Job Prepared") {
          achievedCount = await jobsModel.countDocuments({
            "job.yearEnd": {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            prepared: goal.jobHolder.name,
            status: "completed",
          });
        } else if (goal.goalType === "Job Review") {
          achievedCount = await jobsModel.countDocuments({
            "job.yearEnd": {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            review: goal.jobHolder.name,
            status: "completed",
          });
        } else if (goal.goalType === "Job Filed") {
          achievedCount = await jobsModel.countDocuments({
            "job.yearEnd": {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            filed: goal.jobHolder.name,
            status: "completed",
          });
        } else if (goal.goalType === "Chargeable Time %") {
          const timerData = await timerModel.find({
            date: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolderName: goal.jobHolder.name,
          });
          const chargeableCount = timerData?.reduce((count, entry) => {
            return entry.activity === "Chargeable" ? count + 1 : count;
          }, 0);
          const nonChargeableCount = timerData?.reduce((count, entry) => {
            return entry.activity === "Non-Chargeable" ? count + 1 : count;
          }, 0);
          const total = chargeableCount + nonChargeableCount;
          const chargeablePercentage = total
            ? (chargeableCount / total) * 100
            : 0;
          achievedCount = chargeablePercentage.toFixed(1);
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
      .populate("jobHolder")
      .select("-comments")
      .sort({ startDate: 1 });

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
        } else if (goal.goalType === "Proposal Lead") {
          achievedCount = await proposalModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
            lead: "Yes",
          });
        } else if (goal.goalType === "Proposal Client") {
          achievedCount = await proposalModel.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolder: goal.jobHolder.name,
            client: "Yes",
          });
        } else if (goal.goalType === "Job Prepared") {
          achievedCount = await jobsModel.countDocuments({
            "job.yearEnd": {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            prepared: goal.jobHolder.name,
            status: "completed",
          });
        } else if (goal.goalType === "Job Review") {
          achievedCount = await jobsModel.countDocuments({
            "job.yearEnd": {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            review: goal.jobHolder.name,
            status: "completed",
          });
        } else if (goal.goalType === "Job Filed") {
          achievedCount = await jobsModel.countDocuments({
            "job.yearEnd": {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            filed: goal.jobHolder.name,
            status: "completed",
          });
        } else if (goal.goalType === "Chargeable Time %") {
          const timerData = await timerModel.find({
            date: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
            jobHolderName: goal.jobHolder.name,
          });
          const chargeableCount = timerData?.reduce((count, entry) => {
            return entry.activity === "Chargeable" ? count + 1 : count;
          }, 0);
          const nonChargeableCount = timerData?.reduce((count, entry) => {
            return entry.activity === "Non-Chargeable" ? count + 1 : count;
          }, 0);
          const total = chargeableCount + nonChargeableCount;
          const chargeablePercentage = total
            ? (chargeableCount / total) * 100
            : 0;
          achievedCount = chargeablePercentage.toFixed(1);
        } else if (goal.goalType === "Affotax Clicks") {
          achievedCount = await affotaxAnalytics.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
          });
        } else if (goal.goalType === "Affotax Impressions") {
          achievedCount = await affotaxAnalytics.countDocuments({
            createdAt: {
              $gte: new Date(goal.startDate),
              $lte: new Date(goal.endDate),
            },
          });
        } else if (goal.goalType === "Manual Goal") {
          const data = await goalModel.findOne({ _id: goal._id });
          achievedCount = data ? data.achievedCount : 0;
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

// Get Comments
export const singleGoalComments = async (req, res) => {
  try {
    const goalId = req.params.id;

    if (!goalId) {
      return res.status(400).send({
        success: false,
        message: "Goal id is required!",
      });
    }

    const goalComments = await goalModel
      .findById({ _id: goalId })
      .select("comments");

    res.status(200).send({
      success: true,
      comments: goalComments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single job!",
      error: error,
    });
  }
};

const main = async () => {
  const data = await fetchSearchAnalytics();
  console.log("Data:", data);
};

// main();
