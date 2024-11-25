import activityModel from "../models/activityModel.js";

import moment from "moment";

// Get All Activity
export const fetchActivities = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = date
      ? moment(date, "YYYY-MM-DD").startOf("day").toDate()
      : moment().startOf("day").toDate();

    const nextDay = moment(targetDate).add(1, "day").toDate();

    // Query activities for the specified date range
    const activities = await activityModel
      .find({
        createdAt: {
          $gte: targetDate,
          $lt: nextDay,
        },
      })
      .populate({
        path: "user",
        select: "name avatar role",
        populate: {
          path: "role",
          select: "name",
        },
      });

    res.status(200).send({
      success: true,
      message: "Activities fetched successfully!",
      activities: activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching activities!",
      error: error.message,
    });
  }
};
