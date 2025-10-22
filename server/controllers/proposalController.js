import goalModel from "../models/goalModel.js";
import proposalModel from "../models/proposalModel.js";
import userModel from "../models/userModel.js";

// Create Proposal
export const createProposal = async (req, res) => {
  try {
    const {
      clientName,
      jobHolder,
      subject,
      mail,
      jobDate,
      deadline,
      source,
      note,
      propos,
      lead,
      client,
      value,
    } = req.body;

    const proposal = await proposalModel.create({
      clientName,
      jobHolder,
      subject,
      mail,
      jobDate,
      deadline,
      source,
      note,
      propos,
      lead,
      client,
      value,
    });

    res.status(200).send({
      success: true,
      message: "Proposal added successfully.",
      proposal: proposal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create proposal!",
      error: error,
    });
  }
};

// Update Proposal
export const updateProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    if (!proposalId) {
      return res.status(400).send({
        success: false,
        message: "Proposal id is required!",
      });
    }

    const {
      clientName,
      jobHolder,
      subject,
      mail,
      jobDate,
      deadline,
      source,
      note,
      propos,
      lead,
      client,
      createdAt,
      value,
    } = req.body;

    console.log(new Date(createdAt));

    const existingProposal = await proposalModel.findById(proposalId);
    if (!existingProposal) {
      return res.status(400).send({
        success: false,
        message: "Proposal not found!",
      });
    }

    const proposal = await proposalModel.findByIdAndUpdate(
      { _id: existingProposal._id },
      {
        clientName: clientName ? clientName : existingProposal.clientName,
        jobHolder: jobHolder ? jobHolder : existingProposal.jobHolder,
        subject: subject ? subject : existingProposal.subject,
        mail: mail ? mail : existingProposal.mail,
        jobDate: jobDate ? jobDate : existingProposal.jobDate,
        deadline: deadline ? deadline : existingProposal.deadline,
        source: source ? source : existingProposal.source,
        note: note,
        propos: propos ? propos : existingProposal.propos,
        lead: lead ? lead : existingProposal.lead,
        client: client ? client : existingProposal.client,
        createdAt: createdAt ? new Date(createdAt) : existingProposal.createdAt,
        value: value || existingProposal.value,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Proposal update successfully.",
      proposal: proposal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update proposal!",
      error: error,
    });
  }
};

// Fetch Proposals
export const fetchProposals = async (req, res) => {
  try {
    const proposals = await proposalModel.find({}).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All proposal list.",
      proposals: proposals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetch proposals!",
      error: error,
    });
  }
};

// Delete Proposal
export const deleteProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    if (!proposalId) {
      return res.status(400).send({
        success: false,
        message: "Proposal id is required!",
      });
    }
    await proposalModel.findByIdAndDelete({
      _id: proposalId,
    });

    res.status(200).send({
      success: true,
      message: "Proposal deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete proposals!",
      error: error,
    });
  }
};
// Copy Proposal
export const copyProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    if (!proposalId) {
      return res.status(400).send({
        success: false,
        message: "Proposal id is required!",
      });
    }

    const existingProposal = await proposalModel.findById(proposalId);
    if (!existingProposal) {
      return res.status(400).send({
        success: false,
        message: "Proposal not found!",
      });
    }

    const proposal = await proposalModel.create({
      clientName: existingProposal.clientName,
      jobHolder: existingProposal.jobHolder,
      subject: "",
      mail: "",
      jobDate: new Date().toISOString(),
      deadline: "",
      source: existingProposal.source,
      note: "",
      propos: existingProposal.propos,
      lead: existingProposal.lead,
      client: existingProposal.client,
    });

    res.status(200).send({
      success: true,
      message: "Proposal copy added successfully.",
      proposal: proposal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create proposal copy!",
      error: error,
    });
  }
};

// Get Single Proposal
export const fetchSingleProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    console.log("PropId:", proposalId);

    const proposal = await proposalModel.findById({ _id: proposalId });

    res.status(200).send({
      success: true,
      message: "Single Proposal",
      proposal: proposal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetch single proposal!",
      error: error,
    });
  }
};





























































export const getWonProposalData = async (req, res) => {
  try {
    const { user, startDate, endDate } = req.query;

    const filters = { };

    const fetchedUser = user
      ? await userModel.findOne({ name: user }).lean()
      : null;

    if (user) {
      filters.jobHolder = user;
    }

    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // --- Get proposals data ---
    const proposals = await proposalModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: { $month: "$createdAt" },
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

    proposals.forEach((item) => {
      counts[item._id - 1] = item.count;
      values[item._id - 1] = item.totalValue;
    });

    // --- Fetch goals using aggregate ---
    
      const matchStage = {
        $match: {
          
          goalType: { $in: ["Target Proposal Value", "Target Proposal Count"] },
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
        if (goal._id.type === "Target Proposal Value") {
          targetValues[monthIndex] = goal.total;
        } else if (goal._id.type === "Target Proposal Count") {
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
















































































// stats





export const getWonProposaStats = async (req, res) => {
  try {
    const { user, startDate, endDate } = req.query;

    const filters = { };

    // find the user (to map goals properly)
    const fetchedUser = user ? await userModel.findOne({ name: user }).lean() : null;

    if (user) {
      filters.jobHolder = user;
    }

    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // --- Total values from leads ---
    const proposalsAgg = await proposalModel.aggregate([
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

    const totalValues = proposalsAgg.length > 0 ? proposalsAgg[0].totalValue : 0;
     const totalCount = proposalsAgg.length > 0 ? proposalsAgg[0].totalCount : 0;

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
      .filter((g) => g.goalType === "Target Proposal Value")
      .reduce((acc, g) => acc + (g.achievement || 0), 0);

    targetCount = goals
      .filter((g) => g.goalType === "Target Proposal Count")
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