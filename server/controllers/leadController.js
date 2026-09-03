import jobsModel from "../models/jobsModel.js";
import leadModel from "../models/leadModel.js";
import proposalModel from "../models/proposalModel.js";
import moment from "moment";
import goalModel from "../models/goalModel.js";
import userModel from "../models/userModel.js";
import ticketModel from "../models/ticketModel.js";
import getJobHolderNames from "../utils/getJobHolderNames.js";
import { buildLeadFilter } from "../utils/buildFilter.js";
import { getAuthUser } from "../utils/getAuthUser.js";
import {
  applyStatusTransition,
  buildBucketKeysAndLabels,
  dateFormatMap,
  logLeadUpdate,
  resolveGroupBy,
} from "./leadController.utils.js";
import {
  recordBulkActivity,
  snapshotEntities,
} from "../services/activityLog/bulkActivityService.js";
import { getAllLeadsService } from "../services/lead/leadService.js";

// Create Lead
export const createLead = async (req, res) => {
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).send({
      success: false,
      message: "Invalid User!",
    });
  }

  try {
    const {
      companyName,
      clientName,
      jobHolder,
      department,
      source,
      brand,
      lead_Source,
      followUpDate,
      JobDate,
      Note,
      stage,
      status,
      value,
      number,
      email,
      phoneNumber,

      yearEnd,
      jobDeadline,
    } = req.body;

    const lead = await leadModel.create({
      companyName,
      clientName,
      jobHolder: jobHolder || user.name,
      department,
      source,
      brand,
      lead_Source,
      followUpDate,
      JobDate,
      Note,
      stage,
      status,
      value,
      number,
      email,
      phoneNumber,

      yearEnd,
      jobDeadline,
      createdBy: user._id,
    });

    res.status(200).send({
      success: true,
      message: "Lead create successfully!",
      lead: lead,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create lead!",
      error: error,
    });
  }
};

// Update Lead
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const userId = req.user.user._id;
    // const { companyName, clientName, jobHolder, department, source, brand, lead_Source, followUpDate, JobDate, Note, stage, status, value, number, yearEnd, jobDeadline } = req.body;

    const updates = req.body;

    const allowedUpdates = [
      "leadCreatedAt",
      "companyName",
      "clientName",
      "jobHolder",
      "leadUser",
      "department",
      "source",
      "brand",
      "lead_Source",
      "followUpDate",
      "JobDate",
      "Note",
      "stage",
      "status",
      "value",
      "number",
      "yearEnd",
      "jobDeadline",
      "email",
    ]; // Whitelist of allowed fields
    const updateKeys = Object.keys(updates);

    // Optional: Validate fields
    const isValidUpdate = updateKeys.every((key) =>
      allowedUpdates.includes(key),
    );
    if (!isValidUpdate) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fields in update!" });
    }

    const lead = await leadModel.findById(leadId);

    if (!lead) {
      res.status(400).send({
        success: false,
        message: "Lead not found!",
      });
    }

    const beforeSnapshot = lead.toObject();

    // Only update tickets if lead status is being changed to 'won' or 'lost'
    // if (updates.status && (updates.status === 'won' || updates.status === 'lost')) {
    //   await ticketModel.updateMany(
    //     { clientName: lead.clientName, state: { $ne: "complete" } },
    //     { $set: { state: "complete" } }
    //   );
    // }

    // if (updates.status && (updates.status === 'progress')) {
    //   await ticketModel.updateMany(
    //     { clientName: lead.clientName, state: { $eq: "complete" } },
    //     { $set: { state: "progress" } }
    //   );
    // }

    if (updates.status) {
      applyStatusTransition(updates, userId);
    }

    const updataLead = await leadModel.findByIdAndUpdate(
      { _id: leadId },
      updates,
      { new: true },
    );

    const updatedKeys = Object.keys(updates);
    await logLeadUpdate(
      leadId,
      beforeSnapshot,
      updataLead.toObject(),
      updatedKeys,
      userId,
    );

    res.status(200).send({
      success: true,
      message: "Lead update successfully!",
      lead: updataLead,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update lead!",
      error: error,
    });
  }
};

// Get All Progress Leads
export const getAllProgressLead = async (req, res) => {
  try {
    const filter = await buildLeadFilter(req, "progress");

    const leads = await leadModel.find(filter);

    res.status(200).send({
      success: true,
      message: "All progress lead list!",
      leads: leads,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get progress leads!",
      error: error,
    });
  }
};

// Get All Won Leads
export const getAllWonLead = async (req, res) => {
  try {
    const filter = await buildLeadFilter(req, "won");

    const leads = await leadModel.find(filter);

    res.status(200).send({
      success: true,
      message: "All won lead list!",
      leads: leads,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get won leads!",
      error: error,
    });
  }
};

// Get All Lost Leads
export const getAlllostLead = async (req, res) => {
  const role = req.user?.user?.role?.name;
  const userName = req.user?.user?.name;
  try {
    const filter = await buildLeadFilter(req, "lost");

    const leads = await leadModel.find(filter);

    res.status(200).send({
      success: true,
      message: "All lost lead list!",
      leads: leads,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get lost leads!",
      error: error,
    });
  }
};

// Get Single Lead
export const getSingleLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    const lead = await leadModel.findById(leadId);

    res.status(200).send({
      success: true,
      message: "Single lead!",
      lead: lead,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single lead!",
      error: error,
    });
  }
};

// Delete Lead and update related tickets
export const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    // Find the lead
    const lead = await leadModel.findById(leadId);

    if (!lead) {
      return res.status(400).send({
        success: false,
        message: "Lead not found!",
      });
    }

    // Update related tickets to 'complete'
    await ticketModel.updateMany(
      { clientName: lead.clientName, state: { $ne: "complete" } },
      { $set: { state: "complete" } },
    );

    // Delete the lead
    await leadModel.findByIdAndDelete(leadId);

    res.status(200).send({
      success: true,
      message: "Lead deleted and related tickets marked as complete!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting lead!",
      error: error.message,
    });
  }
};

// <------------Dashboard---------->
export const getdashboardLead = async (req, res) => {
  try {
    const totalleads = await leadModel
      .find({})
      .select("lead_Source status createdAt");
    const totalProposal = await proposalModel.find().select("source createdAt");
    // Active Leads
    const activeleadsTotal = await leadModel
      .find({ status: { $ne: "lost" } })
      .select("lead_Source status createdAt");
    //Proposal
    const proposalLead = await proposalModel
      .find({ lead: "Yes" })
      .select("source createdAt");
    const proposalClient = await proposalModel
      .find({ client: "Yes" })
      .select("source createdAt");
    const progressleads = await leadModel.find({ status: { $eq: "progress" } });
    const wonleads = await leadModel.find({ status: { $eq: "won" } });
    const clients = await jobsModel
      .find({ "job.jobStatus": "Inactive" })
      .select("createdAt  updatedAt");

    res.status(200).send({
      success: true,
      message: "All progress lead list!",
      salesData: {
        totalPLLead: [activeleadsTotal, proposalLead],
        totalLeads: totalleads,
        totalProposals: totalProposal,
        activeleadsTotal: activeleadsTotal,
        proposalLead: proposalLead,
        proposalClient: proposalClient,
        progressleads: progressleads,
        wonleads: wonleads,
        inactiveClients: clients,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get dashboard leads!",
      error: error,
    });
  }
};

// Get Available Tickets Number (name + email aware)

// export const getAvailableTicketsNum = async (req, res) => {
//   const status = req.query.status || "progress";

//   try {
//     // 1. Fetch leads with clientName + email
//     const leads = await leadModel
//       .find({ status })
//       .select("clientName email -_id");

//     // Extract unique names and emails
//     const clientNames = [...new Set(leads.map(l => l.clientName?.trim()).filter(Boolean))];
//     const clientEmails = [...new Set(leads.map(l => l.email?.trim()).filter(Boolean))];

//     console.log("CLIENT Names", clientNames)
//     console.log("clientEmails clientEmails", clientEmails)

//     // 2. Get ticket counts grouped by BOTH clientName and email
//     const ticketsAgg = await ticketModel.aggregate([
//       {
//         $match: {
//           state: { $ne: "complete" },
//           $or: [
//             { clientName: { $in: clientNames } },
//             { email: { $in: clientEmails } }
//           ]
//         }
//       },
//       {
//         $group: {
//           _id: {
//             clientName: "$clientName",
//             email: "$email"
//           },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // 3. Build a combined map (clientName → ticket count)
//     const ticketMap = {};

//     leads.forEach(lead => {
//       const name = lead.clientName;
//       const email = lead.email;

//       const match = ticketsAgg.find(
//         t =>
//           (t._id.clientName === name && name) ||
//           (t._id.email === email && email)
//       );

//       ticketMap[name] = match ? match.count : 0;
//     });

//     return res.status(200).send({
//       success: true,
//       message: "Client ticket counts (name + email aware)",
//       ticketMap
//     });

//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error while getting client ticket counts!",
//       error
//     });
//   }
// };

// Get Available Tickets Number (name aware)

export const getAvailableTicketsNum = async (req, res) => {
  const status = req.query.status || "progress";

  try {
    // 1. Get unique client names from leads
    const leads = await leadModel.find({ status }).select("clientName -_id");

    const clientNames = [
      ...new Set(leads.map((l) => l.clientName).filter(Boolean)),
    ];

    // 2. Group tickets by clientName in one fast query

    const match = {
      clientName: { $in: clientNames },
    };

    if (status === "progress") {
      match.state = { $eq: "progress" };
    }

    const ticketCounts = await ticketModel.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$clientName",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Convert aggregation to a lookup map
    const ticketMap = {};
    clientNames.forEach((name) => {
      const found = ticketCounts.find((tc) => tc._id === name);
      ticketMap[name] = found ? found.count : 0;
    });

    return res.status(200).send({
      success: true,
      message: "Client ticket counts",
      ticketMap,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error while fetching ticket counts",
      error,
    });
  }
};























// companyName,
// clientName,
// jobHolder,
// department,
// source,
// brand,
// lead_Source,
// followUpDate,
// JobDate,
// Note,
// stage,
// status,
// value,
// number,

// Update Bulk Leads
export const updateBulkLeads = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const { rowSelection, updates } = req.body;

    if (!rowSelection || !Array.isArray(rowSelection) || rowSelection.length === 0) {
      return res.status(400).send({ success: false, message: "No jobs selected for update." });
    }

    let updateData = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value) updateData[key] = value;
    });

    if (updateData.status) {
      applyStatusTransition(updateData, userId);
    }
    const updatedKeys = Object.keys(updateData);

    const beforeLeads = await snapshotEntities(leadModel, rowSelection);

    const updatedLeads = await leadModel.updateMany(
      { _id: { $in: rowSelection } },
      { $set: updateData }
    );

    if (updatedLeads.modifiedCount === 0) {
      return res.status(404).send({ success: false, message: "No leads were updated." });
    }

    const afterLeads = await snapshotEntities(leadModel, rowSelection);

    await recordBulkActivity({
      entityType: "Lead",
      beforeDocs: beforeLeads,
      afterDocs: afterLeads,
      updatedKeys,
      performedBy: userId,
    });

    res.status(200).send({
      success: true,
      message: "Leads updated successfully!",
      updatedLeads,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update bulk leads!",
      error: error,
    });
  }
};

const leadSources = [
  "Upwork",
  "Fiverr",
  "PPH",
  "Referral",
  "Partner",
  "Google",
  "Facebook",
  "LinkedIn",
  "CRM",
  "Existing",
  "Other",
];

export const getLeadStats = async (req, res) => {
  try {
    const { start, end, status, lead_Source, department, groupBy } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required",
      });
    }

    const startDate = moment(start).startOf("day");
    const endDate = moment(end).endOf("day");
    const groupUnit = resolveGroupBy(groupBy, startDate, endDate);

    let matchQuery = {
      leadCreatedAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    };

    if (status && status !== "all") {
      matchQuery.status = status;
    }

    if (lead_Source && lead_Source !== "all") {
      if (lead_Source === "Other") {
        matchQuery.$or = [
          { lead_Source: { $exists: false } },
          {
            lead_Source: { $nin: leadSources.filter((src) => src !== "Other") },
          },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }

    if (department && department !== "all") {
      matchQuery.department = department;
    }

    const stats = await leadModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormatMap[groupUnit],
              date: "$leadCreatedAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statsMap = {};
    stats.forEach((s) => {
      statsMap[s._id] = s.count;
    });

    // Walk the range in the same unit, building matching keys + display labels
    const keys = [];
    const labels = [];
    let current = startDate.clone();

    if (groupUnit === "day") {
      while (current.isSameOrBefore(endDate, "day")) {
        keys.push(current.format("YYYY-MM-DD"));
        labels.push(current.format("DD MMM"));
        current.add(1, "day");
      }
    } else if (groupUnit === "week") {
      current = current.clone().startOf("isoWeek");
      while (current.isSameOrBefore(endDate, "day")) {
        keys.push(
          `${current.isoWeekYear()}-W${String(current.isoWeek()).padStart(2, "0")}`,
        );
        const weekEnd = current.clone().endOf("isoWeek");
        labels.push(
          `${current.format("DD MMM")} - ${weekEnd.format("DD MMM")}`,
        );
        current.add(1, "week");
      }
    } else {
      // month
      current = current.clone().startOf("month");
      while (current.isSameOrBefore(endDate, "day")) {
        keys.push(current.format("YYYY-MM"));
        labels.push(current.format("MMM YYYY"));
        current.add(1, "month");
      }
    }

    const data = keys.map((k) => statsMap[k] || 0);

    res.json({
      success: true,
      filters: { start, end, status: status || "all", groupBy: groupUnit },
      labels,
      series: [{ name: "Leads", data }],
    });
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLeadStatusStats = async (req, res) => {
  try {
    const { start, end, lead_Source, department } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Match query
    const matchQuery = {
      leadCreatedAt: { $gte: startDate, $lte: endDate },
    };

    // Lead Source filter
    if (lead_Source && lead_Source !== "all") {
      if (lead_Source === "Other") {
        // Match leads where lead_Source is missing or not in the predefined list
        matchQuery.$or = [
          { lead_Source: { $exists: false } },
          {
            lead_Source: { $nin: leadSources.filter((src) => src !== "Other") },
          },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }
    if (department && department !== "all") {
      matchQuery.department = department;
    }

    // Aggregate by status
    const stats = await leadModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to object for easy mapping
    const statsMap = {};
    stats.forEach((s) => {
      statsMap[s._id] = s.count;
    });

    res.json({
      success: true,
      filters: { start, end },
      series: [
        statsMap["progress"] || 0,
        statsMap["won"] || 0,
        statsMap["lost"] || 0,
      ],
      labels: ["Progress", "Won", "Lost"],
    });
  } catch (error) {
    console.error("Error fetching lead status stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLeadStatsWonLost = async (req, res) => {
  try {
    const { start, end, lead_Source, department, groupBy } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required",
      });
    }

    const startDate = moment(start).startOf("day");
    const endDate = moment(end).endOf("day");
    const groupUnit = resolveGroupBy(groupBy, startDate, endDate);

    const matchQuery = {
      leadCreatedAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    };

    if (lead_Source && lead_Source !== "all") {
      if (lead_Source === "Other") {
        matchQuery.$or = [
          { lead_Source: { $exists: false } },
          {
            lead_Source: { $nin: leadSources.filter((src) => src !== "Other") },
          },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }

    if (department && department !== "all") {
      matchQuery.department = department;
    }

    // Always aggregate at daily granularity first — we roll up to week/month after
    const stats = await leadModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$leadCreatedAt" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const wonDailyMap = {};
    const lostDailyMap = {};

    stats.forEach((s) => {
      if (s._id.status === "won") wonDailyMap[s._id.date] = s.count;
      else if (s._id.status === "lost") lostDailyMap[s._id.date] = s.count;
    });

    const { keys, labels } = buildBucketKeysAndLabels(
      startDate,
      endDate,
      groupUnit,
    );

    let wonData, lostData;

    if (groupUnit === "day") {
      wonData = keys.map((k) => wonDailyMap[k] || 0);
      lostData = keys.map((k) => lostDailyMap[k] || 0);
    } else {
      // Roll daily counts up into week/month buckets by checking which
      // bucket each individual day falls into
      wonData = new Array(keys.length).fill(0);
      lostData = new Array(keys.length).fill(0);

      const bucketRanges = keys.map((_, i) => {
        if (groupUnit === "week") {
          const bucketStart = startDate
            .clone()
            .startOf("isoWeek")
            .add(i, "week");
          return {
            start: bucketStart,
            end: bucketStart.clone().endOf("isoWeek"),
          };
        }
        const bucketStart = startDate.clone().startOf("month").add(i, "month");
        return { start: bucketStart, end: bucketStart.clone().endOf("month") };
      });

      const allDates = new Set([
        ...Object.keys(wonDailyMap),
        ...Object.keys(lostDailyMap),
      ]);
      allDates.forEach((dateStr) => {
        const day = moment(dateStr, "YYYY-MM-DD");
        const idx = bucketRanges.findIndex((r) =>
          day.isBetween(r.start, r.end, "day", "[]"),
        );
        if (idx === -1) return;
        wonData[idx] += wonDailyMap[dateStr] || 0;
        lostData[idx] += lostDailyMap[dateStr] || 0;
      });
    }

    res.json({
      success: true,
      filters: { start, end, groupBy: groupUnit },
      labels,
      series: [
        { name: "Won", data: wonData },
        { name: "Lost", data: lostData },
      ],
    });
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLeadConversionStats = async (req, res) => {
  try {
    const { start, end, lead_Source, department } = req.query;

    // Optional filters
    const matchQuery = {};
    if (start && end) {
      matchQuery.leadCreatedAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    // Lead Source filter
    if (lead_Source && lead_Source !== "all") {
      if (lead_Source === "Other") {
        // Match leads where lead_Source is missing or not in the predefined list
        matchQuery.$or = [
          { lead_Source: { $exists: false } },
          {
            lead_Source: { $nin: leadSources.filter((src) => src !== "Other") },
          },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }

    if (department && department !== "all") {
      matchQuery.department = department;
    }

    // Count total, won, lost
    const [stats] = await leadModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] } },
          progress: {
            $sum: { $cond: [{ $eq: ["$status", "progress"] }, 1, 0] },
          },
          // Average conversion time
          avgConversionMs: {
            $avg: {
              $cond: [
                { $eq: ["$status", "won"] },
                {
                  $subtract: ["$wonAt", "$leadCreatedAt"],
                },
                null,
              ],
            },
          },
        },
      },
    ]);

    if (!stats) {
      return res.json({
        success: true,
        stats: { total: 0, won: 0, lost: 0, progress: 0, conversionRate: 0 },
      });
    }

    // Conversion = Won / Total * 100
    const conversionRate =
      stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(2) : 0;

    // Convert ms → days
    const avgConversionDays = stats.avgConversionMs
      ? (stats.avgConversionMs / (1000 * 60 * 60 * 24)).toFixed(1)
      : 0;

    res.json({
      success: true,
      filters: { start, end },
      stats: {
        total: stats.total,
        won: stats.won,
        lost: stats.lost,
        progress: stats.progress,
        conversionRate: Number(conversionRate), // percentage
        avgConversionDays: Number(avgConversionDays), // ⭐ new KPI
      },
    });
  } catch (error) {
    console.error("Error fetching conversion stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getWonLeadData = async ( req, res) => {

//     try {
//     const { user, startDate, endDate } = req.query;

//     const filters = { status: "won" };

//     if (user) {
//       filters.jobHolder = user;
//     }

//     if (startDate && endDate) {
//       filters.leadCreatedAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//       const leads = await leadModel.aggregate([
//         { $match: filters },
//         {
//           $group: {
//             _id: { $month: "$leadCreatedAt" },
//             count: { $sum: 1 },
//             totalValue: {
//               $sum: {
//                 $cond: [
//                   {
//                     $and: [
//                       { $ne: ["$value", ""] },        // not empty string
//                       { $ne: ["$value", null] },      // not null
//                     ],
//                   },
//                   { $toDouble: "$value" }, // convert when valid
//                   0, // otherwise add 0
//                 ],
//               },
//             },
//           },
//         },
//         { $sort: { "_id": 1 } },
//       ]);

//     // Initialize arrays for 12 months
//     const counts = Array(12).fill(0);
//     const values = Array(12).fill(0);

//     leads.forEach((item) => {
//       counts[item._id - 1] = item.count;
//       values[item._id - 1] = item.totalValue;
//     });

//     res.json({counts, values });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error" });
//   }

// }

// export const getWonLeadData = async (req, res) => {
//   try {
//     const { user, startDate, endDate } = req.query;

//     const filters = { status: "won" };

//     const fetchedUser = await userModel.findOne({ name: user }).lean();

//     if (user) {
//       filters.jobHolder = user;
//     }

//     if (startDate && endDate) {
//       filters.leadCreatedAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     // --- Get leads data ---
//     const leads = await leadModel.aggregate([
//       { $match: filters },
//       {
//         $group: {
//           _id: { $month: "$leadCreatedAt" },
//           count: { $sum: 1 },
//           totalValue: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $ne: ["$value", ""] }, // not empty string
//                     { $ne: ["$value", null] }, // not null
//                   ],
//                 },
//                 { $toDouble: "$value" }, // convert when valid
//                 0, // otherwise add 0
//               ],
//             },
//           },
//         },
//       },
//       { $sort: { "_id": 1 } },
//     ]);

//     // --- Initialize arrays for 12 months ---
//     const counts = Array(12).fill(0);
//     const values = Array(12).fill(0);
//     const targetValues = Array(12).fill(0);
//     const targetCounts = Array(12).fill(0);

//     leads.forEach((item) => {
//       counts[item._id - 1] = item.count;
//       values[item._id - 1] = item.totalValue;
//     });

//     // if(!fetchedUser) {
//     //   return res.json({ counts, values, targetValues, targetCounts  });
//     // }
//     // --- Fetch goals (monthly goals) ---
//     const goalFilters = { goalType: "Target Lead Value"};
//     if (user) {
//       goalFilters.jobHolder = fetchedUser._id;
//     }
//     if (startDate && endDate) {
//       goalFilters.startDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     const goals = await goalModel.find(goalFilters).lean();

//     goals.forEach((goal) => {
//       if (goal.startDate) {
//         const monthIndex = new Date(goal.startDate).getMonth(); // 0–11
//         targetValues[monthIndex] += goal.achievement || 0;
//         // targetCounts[monthIndex] += goal.achievement || 0;
//       }
//     });

//     res.json({ counts, values, targetValues, targetCounts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error" });
//   }
// };

const getWeekRangeLabel = (year, week) => {
  const monday = moment().isoWeekYear(year).isoWeek(week).startOf("isoWeek");
  const sunday = moment(monday).endOf("isoWeek");
  return `${monday.format("MMM D")} – ${sunday.format("MMM D")}`;
};

// export const getWonLeadData = async (req, res) => {
//   try {
//     const { user, startDate, endDate, view = "monthly" } = req.query;

//     const filters = { status: "won" };

//     let fetchedUser = null;
//     let teamLeads = [];

//     if (user && user !== "All") {
//       fetchedUser = await userModel
//         .findOne({ name: user })
//         .select("name juniors isTeamLead")
//         .populate("juniors", "name") // avoids second query
//         .lean();

//       if (fetchedUser) {
//         if (fetchedUser.isTeamLead) {
//           const juniorNames = fetchedUser.juniors?.map((j) => j.name) || [];

//           filters.jobHolder = {
//             $in: [fetchedUser.name, ...juniorNames],
//           };
//         } else {
//           filters.jobHolder = fetchedUser.name;
//         }
//       }
//     }

//     if (user && user === "All") {
//       teamLeads = await userModel
//         .find({ isTeamLead: true })
//         .select("name isTeamLead juniors")
//         .populate("juniors", "name")
//         .lean();

//       // Team lead names
//       const teamLeadsNames = teamLeads.map((user) => user.name);

//       // Juniors names (flattened)
//       const juniorsNames = teamLeads
//         .flatMap((user) => user.juniors || [])
//         .map((junior) => junior.name);

//       // Combine both
//       const allNames = [...teamLeadsNames, ...juniorsNames];

//       filters.jobHolder = {
//         $in: allNames,
//       };
//     }

//     if (startDate && endDate) {
//       filters.leadCreatedAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     // -------------------------
//     // Determine grouping
//     // -------------------------
//     let groupId;
//     let sortStage;

//     if (view === "weekly") {
//       groupId = {
//         year: { $isoWeekYear: "$leadCreatedAt" },
//         week: { $isoWeek: "$leadCreatedAt" },
//       };
//       sortStage = { "_id.year": 1, "_id.week": 1 };
//     } else {
//       groupId = {
//         year: { $year: "$leadCreatedAt" },
//         month: { $month: "$leadCreatedAt" },
//       };
//       sortStage = { "_id.year": 1, "_id.month": 1 };
//     }

//     // -------------------------
//     // Aggregate Leads
//     // -------------------------
//     const leads = await leadModel.aggregate([
//       { $match: filters },
//       {
//         $group: {
//           _id: groupId,
//           count: { $sum: 1 },
//           totalValue: {
//             $sum: {
//               $cond: [
//                 { $and: [{ $ne: ["$value", ""] }, { $ne: ["$value", null] }] },
//                 { $toDouble: "$value" },
//                 0,
//               ],
//             },
//           },
//         },
//       },
//       { $sort: sortStage },
//     ]);

//     // -------------------------
//     // Initialize Labels & Arrays
//     // -------------------------
//     const labels = [];
//     const counts = [];
//     const values = [];
//     const targetCounts = [];
//     const targetValues = [];

//     if (view === "weekly") {
//       // Generate all weeks in range
//       const start = startDate ? moment(startDate) : moment().startOf("month");
//       const end = endDate ? moment(endDate) : moment().endOf("month");
//       const weekMap = {};
//       let weekIndex = 0;

//       let current = start.clone().startOf("isoWeek");
//       while (current.isSameOrBefore(end)) {
//         const weekYear = current.isoWeekYear();
//         const weekNum = current.isoWeek();
//         const key = `${weekYear}-W${weekNum}`;

//         if (!weekMap[key]) {
//           weekMap[key] = weekIndex++;
//           labels.push(getWeekRangeLabel(weekYear, weekNum));
//           counts.push(0);
//           values.push(0);
//           targetCounts.push(0);
//           targetValues.push(0);
//         }
//         current.add(1, "week");
//       }

//       // Map lead data to week array
//       leads.forEach((item) => {
//         const key = `${item._id.year}-W${item._id.week}`;
//         if (weekMap[key] !== undefined) {
//           counts[weekMap[key]] = item.count;
//           values[weekMap[key]] = item.totalValue;
//         }
//       });
//     } else {
//       // Monthly view: 12 months between start and end
//       const monthMap = {};
//       let monthIndex = 0;
//       const start = startDate
//         ? moment(startDate).startOf("month")
//         : moment().startOf("year");
//       const end = endDate
//         ? moment(endDate).endOf("month")
//         : moment().endOf("year");
//       let current = start.clone();
//       while (current.isSameOrBefore(end)) {
//         const key = `${current.year()}-${current.month() + 1}`; // month 0-indexed
//         if (!monthMap[key]) {
//           monthMap[key] = monthIndex++;
//           labels.push(current.format("MMM YYYY"));
//           counts.push(0);
//           values.push(0);
//           targetCounts.push(0);
//           targetValues.push(0);
//         }
//         current.add(1, "month");
//       }

//       // Map lead data to month array
//       leads.forEach((item) => {
//         const key = `${item._id.year}-${item._id.month}`;
//         if (monthMap[key] !== undefined) {
//           counts[monthMap[key]] = item.count;
//           values[monthMap[key]] = item.totalValue;
//         }
//       });
//     }

//     // -------------------------
//     // Fetch Goals
//     // -------------------------
//     const goalMatch = {
//       goalType: {
//         $in: [
//           "Target Lead Value",
//           "Target Lead Count",
//           "Target Lead Value (Team Lead)",
//           "Target Lead Count (Team Lead)",
//         ],
//       },
//     };
//     if (fetchedUser) goalMatch.jobHolder = fetchedUser._id;
//     if (user === "All")
//       goalMatch.jobHolder = {
//         $in: teamLeads.map((user) => user._id),
//       };

//     if (startDate && endDate)
//       goalMatch.startDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };

//     let goalGroupId;
//     if (view === "weekly") {
//       goalGroupId = {
//         year: { $isoWeekYear: "$startDate" },
//         week: { $isoWeek: "$startDate" },
//         type: "$goalType",
//       };
//     } else {
//       goalGroupId = {
//         year: { $year: "$startDate" },
//         month: { $month: "$startDate" },
//         type: "$goalType",
//       };
//     }

//     const goals = await goalModel.aggregate([
//       { $match: goalMatch },
//       {
//         $group: {
//           _id: goalGroupId,
//           total: { $sum: { $ifNull: ["$achievement", 0] } },
//         },
//       },
//     ]);

//     // Map goals to label index
//     goals.forEach((goal) => {
//       let labelKey;
//       if (view === "weekly") {
//         labelKey = `${goal._id.year}-W${goal._id.week}`;
//       } else {
//         labelKey = `${goal._id.year}-${goal._id.month}`;
//       }

//       const index = labels.findIndex((_, idx) => {
//         if (view === "weekly")
//           return (
//             labels[idx] === getWeekRangeLabel(goal._id.year, goal._id.week)
//           );
//         else
//           return (
//             labels[idx] ===
//             moment(`${goal._id.year}-${goal._id.month}-01`).format("MMM YYYY")
//           );
//       });

//       if (index !== -1) {
//         if (user === "All") {
//           if (goal._id.type === "Target Lead Value (Team Lead)")
//             targetValues[index] = goal.total;
//           if (goal._id.type === "Target Lead Count (Team Lead)")
//             targetCounts[index] = goal.total;
//         } else {
//           if (
//             (goal._id.type === "Target Lead Value" &&
//               !fetchedUser?.isTeamLead) ||
//             (goal._id.type === "Target Lead Value (Team Lead)" &&
//               fetchedUser?.isTeamLead)
//           )
//             targetValues[index] = goal.total;
//           if (
//             (goal._id.type === "Target Lead Count" &&
//               !fetchedUser?.isTeamLead) ||
//             (goal._id.type === "Target Lead Count (Team Lead)" &&
//               fetchedUser?.isTeamLead)
//           )
//             targetCounts[index] = goal.total;
//         }
//       }
//     });

//     return res.json({ labels, counts, values, targetCounts, targetValues });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error" });
//   }
// };

// export const getWonLeadStats = async (req, res) => {
//   try {
//     const { user, startDate, endDate } = req.query;

//     const filters = { status: "won" };

//     let fetchedUser = null;
//     let teamLeads = [];

//     if (user && user !== "All") {
//       fetchedUser = await userModel
//         .findOne({ name: user })
//         .select("name juniors isTeamLead")
//         .populate("juniors", "name") // avoids second query
//         .lean();

//       if (fetchedUser) {
//         if (fetchedUser.isTeamLead) {
//           const juniorNames = fetchedUser.juniors?.map((j) => j.name) || [];

//           filters.jobHolder = {
//             $in: [fetchedUser.name, ...juniorNames],
//           };
//         } else {
//           filters.jobHolder = fetchedUser.name;
//         }
//       }
//     }

//     if (user && user === "All") {
//       teamLeads = await userModel
//         .find({ isTeamLead: true })
//         .select("name isTeamLead juniors")
//         .populate("juniors", "name")
//         .lean();

//       // Team lead names
//       const teamLeadsNames = teamLeads.map((user) => user.name);

//       // Juniors names (flattened)
//       const juniorsNames = teamLeads
//         .flatMap((user) => user.juniors || [])
//         .map((junior) => junior.name);

//       // Combine both
//       const allNames = [...teamLeadsNames, ...juniorsNames];

//       filters.jobHolder = {
//         $in: allNames,
//       };
//     }

//     if (startDate && endDate) {
//       filters.leadCreatedAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     // --- Total values from leads ---
//     const leadsAgg = await leadModel.aggregate([
//       { $match: filters },
//       {
//         $group: {
//           _id: null,
//           totalValue: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $ne: ["$value", ""] }, // not empty string
//                     { $ne: ["$value", null] }, // not null
//                   ],
//                 },
//                 { $toDouble: "$value" },
//                 0,
//               ],
//             },
//           },

//           totalCount: { $sum: 1 }, // ✅ count of leads
//         },
//       },
//     ]);

//     const totalValues = leadsAgg.length > 0 ? leadsAgg[0].totalValue : 0;
//     const totalCount = leadsAgg.length > 0 ? leadsAgg[0].totalCount : 0;

//     // --- Total targeted values (goals) ---
//     let targetValues = 0;
//     let targetCount = 0;

//     const goalFilters = {};
//     if (user && user !== "All") {
//       goalFilters.jobHolder = fetchedUser._id;
//     }

//     if (user === "All")
//       goalFilters.jobHolder = {
//         $in: teamLeads.map((user) => user._id),
//       };

//     if (startDate && endDate) {
//       goalFilters.startDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     // fetch both types of goals
//     const goals = await goalModel.find(goalFilters).lean();

//     if (user === "All") {
//       targetValues = goals
//         .filter((g) => g.goalType === "Target Lead Value (Team Lead)")
//         .reduce((acc, g) => acc + (g.achievement || 0), 0);

//       targetCount = goals
//         .filter((g) => g.goalType === "Target Lead Count (Team Lead)")
//         .reduce((acc, g) => acc + (g.achievement || 0), 0);
//     } else {
//       targetValues = goals
//         .filter(
//           (g) =>
//             (g.goalType === "Target Lead Value" && !fetchedUser?.isTeamLead) ||
//             (g.goalType === "Target Lead Value (Team Lead)" &&
//               fetchedUser?.isTeamLead),
//         )
//         .reduce((acc, g) => acc + (g.achievement || 0), 0);

//       targetCount = goals
//         .filter(
//           (g) =>
//             (g.goalType === "Target Lead Count" && !fetchedUser?.isTeamLead) ||
//             (g.goalType === "Target Lead Count (Team Lead)" &&
//               fetchedUser?.isTeamLead),
//         )
//         .reduce((acc, g) => acc + (g.achievement || 0), 0);
//     }

//     return res.json({
//       totalValues,
//       targetValues,

//       totalCount,
//       targetCount,
//       // percentage calculations are better done in frontend
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server Error" });
//   }
// };






















































































































































































































































































































































































































// NOTE: keep your existing imports from the original file —
// userModel, leadModel, goalModel, moment, getWeekRangeLabel.
// Only the two exported controllers (and the new buildLabels helper) changed.


























































/**
 * Builds the full label list (weekly or monthly) for the requested range,
 * plus a lookup map from "period key" -> label index. This is now the single
 * source of truth for aligning every user's series onto the same x-axis,
 * replacing the old string-based label matching (which was fragile).
 */
function buildLabels(view, startDate, endDate) {
  const labels = [];
  const periodKeys = {}; // e.g. "2026-W32" or "2026-8" -> index in labels

  if (view === "weekly") {
    const start = startDate ? moment(startDate) : moment().startOf("month");
    const end = endDate ? moment(endDate) : moment().endOf("month");
    let current = start.clone().startOf("isoWeek");

    while (current.isSameOrBefore(end)) {
      const weekYear = current.isoWeekYear();
      const weekNum = current.isoWeek();
      const key = `${weekYear}-W${weekNum}`;

      if (!(key in periodKeys)) {
        periodKeys[key] = labels.length;
        labels.push(getWeekRangeLabel(weekYear, weekNum));
      }
      current.add(1, "week");
    }
  } else {
    const start = startDate
      ? moment(startDate).startOf("month")
      : moment().startOf("year");
    const end = endDate ? moment(endDate).endOf("month") : moment().endOf("year");
    let current = start.clone();

    while (current.isSameOrBefore(end)) {
      const key = `${current.year()}-${current.month() + 1}`;

      if (!(key in periodKeys)) {
        periodKeys[key] = labels.length;
        labels.push(current.format("MMM YYYY"));
      }
      current.add(1, "month");
    }
  }

  return { labels, periodKeys };
}

/**
 * Normalizes the "users" query param. Accepts:
 *  - ?users=Alice,Bob        (comma separated string)
 *  - ?users=Alice&users=Bob  (array, express parses repeated keys as array)
 *  - ?user=Alice             (legacy single-user param, still supported)
 * Falls back to ["All"] if nothing was sent.
 */
function parseRequestedUsers(query) {
  let requested = query.users ?? query.user ?? "All";

  if (typeof requested === "string") {
    requested = requested
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(requested)) requested = [requested];
  if (requested.length === 0) requested = ["All"];

  return requested;
}

/**
 * Resolves each requested name into:
 *  - label: display name for the series/card
 *  - jobHolderNames: names to match against leadModel.jobHolder
 *  - goalJobHolderIds: user _ids to match against goalModel.jobHolder
 *  - goalTypeSuffix: "" or " (Team Lead)" — picks which goalType to read
 *
 * "All" is resolved once against every team lead (+ their juniors) so it
 * behaves exactly like it did before, just now as one entry among possibly
 * several selected users.
 */
async function resolveUsers(requestedUsers) {
  const allTeamLeads = await userModel
    .find({ isTeamLead: true })
    .select("name isTeamLead juniors")
    .populate("juniors", "name")
    .lean();

  const resolved = await Promise.all(
    requestedUsers.map(async (name) => {
      if (name === "All") {
        const teamLeadNames = allTeamLeads.map((u) => u.name);
        const juniorNames = allTeamLeads
          .flatMap((u) => u.juniors || [])
          .map((j) => j.name);

        return {
          label: "All",
          jobHolderNames: [...teamLeadNames, ...juniorNames],
          goalJobHolderIds: allTeamLeads.map((u) => u._id),
          goalTypeSuffix: " (Team Lead)",
        };
      }

      const fetchedUser = await userModel
        .findOne({ name })
        .select("name juniors isTeamLead")
        .populate("juniors", "name")
        .lean();

      if (!fetchedUser) return null;

      const juniorNames = fetchedUser.juniors?.map((j) => j.name) || [];

      return {
        label: fetchedUser.name,
        jobHolderNames: fetchedUser.isTeamLead
          ? [fetchedUser.name, ...juniorNames]
          : [fetchedUser.name],
        goalJobHolderIds: [fetchedUser._id],
        goalTypeSuffix: fetchedUser.isTeamLead ? " (Team Lead)" : "",
      };
    })
  );

  return resolved.filter(Boolean);
}

// -------------------------
// Chart data: one series per selected user
// -------------------------
export const getWonLeadData = async (req, res) => {
  try {
    const { startDate, endDate, view = "monthly" } = req.query;

    const requestedUsers = parseRequestedUsers(req.query);
    const resolvedUsers = await resolveUsers(requestedUsers);

    const { labels, periodKeys } = buildLabels(view, startDate, endDate);

    const groupId =
      view === "weekly"
        ? {
            year: { $isoWeekYear: "$leadCreatedAt" },
            week: { $isoWeek: "$leadCreatedAt" },
          }
        : {
            year: { $year: "$leadCreatedAt" },
            month: { $month: "$leadCreatedAt" },
          };

    const goalGroupId =
      view === "weekly"
        ? {
            year: { $isoWeekYear: "$startDate" },
            week: { $isoWeek: "$startDate" },
            type: "$goalType",
          }
        : {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
            type: "$goalType",
          };

    const series = await Promise.all(
      resolvedUsers.map(async (ru) => {
        const leadFilters = {
          status: "won",
          jobHolder: { $in: ru.jobHolderNames },
        };
        if (startDate && endDate) {
          leadFilters.leadCreatedAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }

        const leadsAgg = await leadModel.aggregate([
          { $match: leadFilters },
          {
            $group: {
              _id: groupId,
              count: { $sum: 1 },
              totalValue: {
                $sum: {
                  $cond: [
                    { $and: [{ $ne: ["$value", ""] }, { $ne: ["$value", null] }] },
                    { $toDouble: "$value" },
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const counts = new Array(labels.length).fill(0);
        const values = new Array(labels.length).fill(0);

        leadsAgg.forEach((item) => {
          const key =
            view === "weekly"
              ? `${item._id.year}-W${item._id.week}`
              : `${item._id.year}-${item._id.month}`;
          const idx = periodKeys[key];
          if (idx !== undefined) {
            counts[idx] = item.count;
            values[idx] = item.totalValue;
          }
        });

        // Goals for this specific user/team
        const countType = `Target Lead Count${ru.goalTypeSuffix}`;
        const valueType = `Target Lead Value${ru.goalTypeSuffix}`;

        const goalMatch = {
          goalType: { $in: [countType, valueType] },
          jobHolder: { $in: ru.goalJobHolderIds },
        };
        if (startDate && endDate) {
          goalMatch.startDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }

        const goalsAgg = await goalModel.aggregate([
          { $match: goalMatch },
          {
            $group: {
              _id: goalGroupId,
              total: { $sum: { $ifNull: ["$achievement", 0] } },
            },
          },
        ]);

        const targetCounts = new Array(labels.length).fill(0);
        const targetValues = new Array(labels.length).fill(0);

        goalsAgg.forEach((g) => {
          const key =
            view === "weekly"
              ? `${g._id.year}-W${g._id.week}`
              : `${g._id.year}-${g._id.month}`;
          const idx = periodKeys[key];
          if (idx === undefined) return;

          if (g._id.type === countType) targetCounts[idx] = g.total;
          if (g._id.type === valueType) targetValues[idx] = g.total;
        });

        return { user: ru.label, counts, values, targetCounts, targetValues };
      })
    );

    return res.json({ labels, series });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// -------------------------
// Summary stats: one entry per selected user
// -------------------------
export const getWonLeadStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const requestedUsers = parseRequestedUsers(req.query);
    const resolvedUsers = await resolveUsers(requestedUsers);

    const stats = await Promise.all(
      resolvedUsers.map(async (ru) => {
        const leadFilters = {
          status: "won",
          jobHolder: { $in: ru.jobHolderNames },
        };
        if (startDate && endDate) {
          leadFilters.leadCreatedAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }

        const leadsAgg = await leadModel.aggregate([
          { $match: leadFilters },
          {
            $group: {
              _id: null,
              totalValue: {
                $sum: {
                  $cond: [
                    { $and: [{ $ne: ["$value", ""] }, { $ne: ["$value", null] }] },
                    { $toDouble: "$value" },
                    0,
                  ],
                },
              },
              totalCount: { $sum: 1 },
            },
          },
        ]);

        const totalValues = leadsAgg[0]?.totalValue || 0;
        const totalCount = leadsAgg[0]?.totalCount || 0;

        const countType = `Target Lead Count${ru.goalTypeSuffix}`;
        const valueType = `Target Lead Value${ru.goalTypeSuffix}`;

        const goalFilters = {
          goalType: { $in: [countType, valueType] },
          jobHolder: { $in: ru.goalJobHolderIds },
        };
        if (startDate && endDate) {
          goalFilters.startDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }

        const goals = await goalModel.find(goalFilters).lean();

        const targetValues = goals
          .filter((g) => g.goalType === valueType)
          .reduce((acc, g) => acc + (g.achievement || 0), 0);

        const targetCount = goals
          .filter((g) => g.goalType === countType)
          .reduce((acc, g) => acc + (g.achievement || 0), 0);

        return {
          user: ru.label,
          totalValues,
          targetValues,
          totalCount,
          targetCount,
        };
      })
    );

    return res.json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};






































// controllers/leadController.js — pass the new param through
export const getAllLeads = async (req, res) => {
  try {
    const { brand, fields, page, limit, stage, status, search, sortBy, sortOrder } = req.query;

    if (!brand) {
      return res.status(400).json({ message: "companyName / brand is required" });
    }

    const result = await getAllLeadsService({
      brand,
      fields,
      page,
      limit,
      stage,
      status,
      search,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("getAllLeads error:", err);
    return res.status(500).json({ message: "Failed to fetch leads" });
  }
};