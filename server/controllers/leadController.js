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

// Create Lead
export const createLead = async (req, res) => {

 const user = getAuthUser(req);

 if(!user) {
  return res.status(401).send({
      success: false,
      message: "Invalid User!",
  })
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

      yearEnd,
      jobDeadline
    } = req.body;



    const lead = await leadModel.create({
      companyName,
      clientName,
      jobHolder: user.name,
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

      yearEnd,
      jobDeadline,
      
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
    // const { companyName, clientName, jobHolder, department, source, brand, lead_Source, followUpDate, JobDate, Note, stage, status, value, number, yearEnd, jobDeadline } = req.body;

    const updates = req.body;

     const allowedUpdates = ['leadCreatedAt', 'companyName', 'clientName', 'jobHolder', 'department', 'source', 'brand', 'lead_Source', 'followUpDate', 'JobDate', 'Note', 'stage', 'status', 'value', 'number', 'yearEnd', 'jobDeadline', 'email']; // Whitelist of allowed fields
    const updateKeys = Object.keys(updates);

      // Optional: Validate fields
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
    if (!isValidUpdate) {
        return res.status(400).json({ success: false, message: "Invalid fields in update!"});
    }
     

    console.log("Updates💚💚", updates);



    const lead = await leadModel.findById(leadId);

    if (!lead) {
      res.status(400).send({
        success: false,
        message: "Lead not found!",
      });
    }
 
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



    const updataLead = await leadModel.findByIdAndUpdate(
      { _id: leadId },
      updates,
      { new: true }
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

    console.log("THE FILTER IS ", filter)
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
  const userName =  req.user?.user?.name;
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
      { $set: { state: "complete" } }
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
    const leads = await leadModel
      .find({ status })
      .select("clientName -_id");

    const clientNames = [...new Set(leads
      .map(l => l.clientName)
      .filter(Boolean)
    )];



    
    // 2. Group tickets by clientName in one fast query
 
       

    const match = {
      clientName: { $in: clientNames },
    }

    if(status === "progress") {
      match.state =  { $eq: "progress" }
    }



    const ticketCounts = await ticketModel.aggregate([
      {
        $match: match
      },
      {
        $group: {
          _id: "$clientName",
          count: { $sum: 1 },
        }
      }
    ]);

    
    // 3. Convert aggregation to a lookup map
    const ticketMap = {};
    clientNames.forEach(name => {
      const found = ticketCounts.find(tc => tc._id === name);
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
    const {
      rowSelection,
      updates  // object which contains all the updates values 
      
    } = req.body;

    console.log("Updates",updates)
    console.log("rowSelection",rowSelection)
    if (
      !rowSelection ||
      !Array.isArray(rowSelection) ||
      rowSelection.length === 0
    ) {
      return res.status(400).send({
        success: false,
        message: "No jobs selected for update.",
      });
    }


 

    let updateData = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        updateData[key] = value;
      }
    });

    const updatedLeads = await leadModel.updateMany(
      {
        _id: { $in: rowSelection },
      },
      { $set: updateData },
       
    );

 

    // Check if any leads were updated
    if (updatedLeads.modifiedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No leads were updated.",
      });
    }

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
    const { start, end, status, lead_Source, department } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required",
      });
    }

    const startDate = moment(start).startOf("day");
    const endDate = moment(end).endOf("day");

    let matchQuery = {
      leadCreatedAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    };

    // Status filter
    if (status && status !== "all") {
      matchQuery.status = status;
    }

    // Lead Source filter
    if (lead_Source && lead_Source !== "all") {
      if (lead_Source === "Other") {
        // Match leads where lead_Source is missing or not in the predefined list
        matchQuery.$or = [
          { lead_Source: { $exists: false } },
          { lead_Source: { $nin: leadSources.filter((src) => src !== "Other") } },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }

    if(department && department !== "all") {
      matchQuery.department = department;
    }

    // Aggregation: group by day
    const stats = await leadModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$leadCreatedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert to object for quick lookup
    const statsMap = {};
    stats.forEach((s) => {
      statsMap[s._id] = s.count;
    });

    // Generate all dates between start & end
    const labels = [];
    const data = [];

    let current = startDate.clone();
    while (current.isSameOrBefore(endDate, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      labels.push(dateStr);
      data.push(statsMap[dateStr] || 0);
      current.add(1, "day");
    }

    res.json({
      success: true,
      filters: { start, end, status: status || "all" },
      labels,
      series: [
        {
          name: "Leads",
          data,
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};














 

export const getLeadStatusStats = async (req, res) => {
  try {
    const { start, end,  lead_Source, department  } = req.query;

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
          { lead_Source: { $nin: leadSources.filter((src) => src !== "Other") } },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }
    if(department && department !== "all") {
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
    const { start, end, lead_Source, department  } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required",
      });
    }

    const startDate = moment(start).startOf("day");
    const endDate = moment(end).endOf("day");

    const matchQuery = {
      leadCreatedAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    };


        // Lead Source filter
    if (lead_Source && lead_Source !== "all") {
      if (lead_Source === "Other") {
        // Match leads where lead_Source is missing or not in the predefined list
        matchQuery.$or = [
          { lead_Source: { $exists: false } },
          { lead_Source: { $nin: leadSources.filter((src) => src !== "Other") } },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }

    if(department && department !== "all") {
      matchQuery.department = department;
    }


    // Group by date + status
    const stats = await leadModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$leadCreatedAt" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Prepare maps for won/lost counts by date
    const wonMap = {};
    const lostMap = {};

    stats.forEach((s) => {
      if (s._id.status === "won") {
        wonMap[s._id.date] = s.count;
      } else if (s._id.status === "lost") {
        lostMap[s._id.date] = s.count;
      }
    });

    // Build labels + aligned data arrays
    const labels = [];
    const wonData = [];
    const lostData = [];

    let current = startDate.clone();
    while (current.isSameOrBefore(endDate, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      labels.push(dateStr);
      wonData.push(wonMap[dateStr] || 0);
      lostData.push(lostMap[dateStr] || 0);
      current.add(1, "day");
    }

    res.json({
      success: true,
      filters: { start, end },
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
    const { start, end, lead_Source, department  } = req.query;

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
          { lead_Source: { $nin: leadSources.filter((src) => src !== "Other") } },
          { lead_Source: "" },
          { lead_Source: null },
        ];
      } else {
        matchQuery.lead_Source = lead_Source;
      }
    }

    if(department && department !== "all") {
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
          progress: { $sum: { $cond: [{ $eq: ["$status", "progress"] }, 1, 0] } },
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
    const conversionRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      filters: { start, end },
      stats: {
        total: stats.total,
        won: stats.won,
        lost: stats.lost,
        progress: stats.progress,
        conversionRate: Number(conversionRate), // percentage
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






















































export const getWonLeadData = async (req, res) => {
  try {
    const { user, startDate, endDate } = req.query;

    const filters = { status: "won" };

    const fetchedUser = user
      ? await userModel.findOne({ name: user }).lean()
      : null;

    if (user) {
      filters.jobHolder = user;
    }

    if (startDate && endDate) {
      filters.leadCreatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // --- Get leads data ---
    const leads = await leadModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: { $month: "$leadCreatedAt" },
          count: { $sum: 1 },
          totalValue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$value", ""] },
                    { $ne: ["$value", null] },
                  ],
                },
                { $toDouble: "$value" },
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // --- Initialize arrays for 12 months ---
    const counts = Array(12).fill(0);
    const values = Array(12).fill(0);
    const targetValues = Array(12).fill(0);
    const targetCounts = Array(12).fill(0);

    leads.forEach((item) => {
      counts[item._id - 1] = item.count;
      values[item._id - 1] = item.totalValue;
    });

    // --- Fetch goals using aggregate ---
    
      const matchStage = {
        $match: {
          
          goalType: { $in: ["Target Lead Value", "Target Lead Count"] },
        },
      };


      if (fetchedUser) {
        matchStage.$match.jobHolder = fetchedUser._id;

      }

      if (startDate && endDate) {
        matchStage.$match.startDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const goals = await goalModel.aggregate([
        matchStage,
        {
          $group: {
            _id: {
              month: { $month: "$startDate" },
              type: "$goalType",
            },
            total: { $sum: { $ifNull: ["$achievement", 0] } },
          },
        },
      ]);

      goals.forEach((goal) => {
        const monthIndex = goal._id.month - 1;
        if (goal._id.type === "Target Lead Value") {
          targetValues[monthIndex] = goal.total;
        } else if (goal._id.type === "Target Lead Count") {
          targetCounts[monthIndex] = goal.total;
        }
      });
 
    console.log({ counts, values, targetValues, targetCounts })
    res.json({ counts, values, targetValues, targetCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};









































export const getWonLeadStats = async (req, res) => {
  try {
    const { user, startDate, endDate } = req.query;

    const filters = { status: "won" };

    // find the user (to map goals properly)
    const fetchedUser = user ? await userModel.findOne({ name: user }).lean() : null;

    if (user) {
      filters.jobHolder = user;
    }

    if (startDate && endDate) {
      filters.leadCreatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // --- Total values from leads ---
    const leadsAgg = await leadModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$value", ""] }, // not empty string
                    { $ne: ["$value", null] }, // not null
                  ],
                },
                { $toDouble: "$value" },
                0,
              ],
            },
          },

           totalCount: { $sum: 1 }, // ✅ count of leads
        },
      },
    ]);

    const totalValues = leadsAgg.length > 0 ? leadsAgg[0].totalValue : 0;
     const totalCount = leadsAgg.length > 0 ? leadsAgg[0].totalCount : 0;

    // --- Total targeted values (goals) ---
    let targetValues = 0;
    let targetCount = 0;

     const goalFilters = {};
    if (user) {
      goalFilters.jobHolder = fetchedUser._id;
    }
    if (startDate && endDate) {
      goalFilters.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // fetch both types of goals
    const goals = await goalModel.find(goalFilters).lean();

    targetValues = goals
      .filter((g) => g.goalType === "Target Lead Value")
      .reduce((acc, g) => acc + (g.achievement || 0), 0);

    targetCount = goals
      .filter((g) => g.goalType === "Target Lead Count")
      .reduce((acc, g) => acc + (g.achievement || 0), 0);

    return res.json({
      totalValues,
      targetValues,
      
      totalCount,
      targetCount,
      // percentage calculations are better done in frontend
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
