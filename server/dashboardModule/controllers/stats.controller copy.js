import jobsModel from "../../models/jobsModel.js";
import { buildJobsQuery } from "../utils/buildJobsQuery.js"; // update path

export const getUniqueClientJobs = async (req, res) => {
  try {
    const { jobName, ...filters } = req.query;

    // Ignore jobName exactly like your previous implementation
    const matchQuery = buildJobsQuery(filters);

    const [result] = await jobsModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: "$companyName",
        },
      },
      {
        $count: "count",
      },
    ]);

    res.status(200).json({
      success: true,
      uniqueClients: result?.count || 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch unique client count.",
      error: error.message,
    });
  }
};