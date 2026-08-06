import jobsModel from "../../models/jobsModel.js";
import { statsRegistry } from "../charts/stats.registry.js";
import { getStatsData } from "../services/stats.service.js";
import { parseDateRange, applyFilters } from "../utils/chartHelpers.js";





export const getStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);

    
const definitions = Object.entries(statsRegistry).map(([key, definition]) => {
  if (definition.type === "computed") {
    return {
      key,
      definition,
    };
  }

  return {
    key,
    definition,
    params: {
      Model: definition.Model,
      dateField: definition.dateField,
      valueConfig: definition.valueConfig,
      start,
      end,
      matchQuery: applyFilters(
        { ...definition.baseMatch },
        req.query,
        definition.allowedFilters
      ),
    },
  };
});

    const stats = await getStatsData(definitions);

    res.status(200).json({
      success: true,

      filters: {
        start,
        end,
      },

      stats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






























 
 

export const getUniqueClientJobsStats = async (req, res) => {
  try {
  const { start, end } = parseDateRange(req.query);
 const matchQuery= applyFilters( { }, req.query, [["jobHolder", "job.jobHolder"], ["source", "source"]], );


 console.log("matchQuery", matchQuery);
    const [result] = await jobsModel.aggregate([
      {
        $match: {
            ...matchQuery,
            status :  { $eq: "process" },
            "job.jobStatus": { $ne: "Inactive" },
            currentDate: {$lte: new Date(end), $gte: new Date(start)},

        },
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