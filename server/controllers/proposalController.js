import proposalModel from "../models/proposalModel.js";

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
      status,
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
      status,
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
      status,
    } = req.body;

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
        note: note ? note : existingProposal.note,
        status: status ? status : existingProposal.status,
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
      status: existingProposal.status,
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
