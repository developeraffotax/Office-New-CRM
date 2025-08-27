import jobsModel from "../models/jobsModel.js";
import leadModel from "../models/leadModel.js";
import proposalModel from "../models/proposalModel.js";
import moment from "moment";

// Create Lead
export const createLead = async (req, res) => {
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
  const role = req.user?.user?.role?.name;
  const userName =  req.user?.user?.name;
  try {

    let filter = { status: { $eq: "progress" } };

    if (role !== "Admin") {
      filter.jobHolder = userName;
    }

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
  const role = req.user?.user?.role?.name;
  const userName =  req.user?.user?.name;
  try {
    let filter = { status: { $eq: "won" } };

    if (role !== "Admin") {
      filter.jobHolder = userName;
    }

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
    let filter = { status: { $eq: "lost" } };

    if (role !== "Admin") {
      filter.jobHolder = userName;
    }

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

// Delete Lead
export const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    const lead = await leadModel.findById(leadId);

    if (!lead) {
      return res.status(400).send({
        success: false,
        message: "Lead not found!",
      });
    }

    await leadModel.findByIdAndDelete({ _id: lead._id });

    res.status(200).send({
      success: true,
      message: "Lead delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete lead!",
      error: error,
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






























































































 

export const getLeadStats = async (req, res) => {
  try {
    const { start, end, status } = req.query;

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
    const { start, end } = req.query;

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
    const { start, end } = req.query;

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
    const { start, end } = req.query;

    // Optional filters
    const matchQuery = {};
    if (start && end) {
      matchQuery.leadCreatedAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
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
