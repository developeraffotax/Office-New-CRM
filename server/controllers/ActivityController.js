import activityModel from "../models/activityModel.js";

import moment from "moment";
import jobsModel from "../models/jobsModel.js";

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














// Create Activity
export const createActivity = async (req, res) => {

  
  const activityText = req.body.activityText || "No activity text provided fron frontend!"
  const entity = req.body.entity;
  const details = req.body.details;

  

  try {
    // const clientJob = await jobsModel.findOne({ _id: jobId });
    // Add Activity Log
    const user = req.user.user;
    
      const response = await activityModel.create({
        user: user._id,
        action: `${user.name.trim()} ${activityText}`,
        entity: entity,
        details: details,
      });
    

    res.status(200).send({
      success: true,
      message: "Activity created successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "An error occurred while creating activity!",
      error: error.message,
    });
  }
};
