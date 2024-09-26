import leadModel from "../models/leadModel.js";

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
    } = req.body;

    const lead = await leadModel.findById(leadId);

    if (!lead) {
      res.status(400).send({
        success: false,
        message: "Lead not found!",
      });
    }

    const updataLead = await leadModel.findByIdAndUpdate(
      { _id: leadId },
      {
        companyName: companyName ? companyName : lead.companyName,
        clientName: clientName ? clientName : lead.clientName,
        jobHolder: jobHolder ? jobHolder : lead.jobHolder,
        department: department ? department : lead.department,
        source: source ? source : lead.source,
        brand: brand ? brand : lead.brand,
        lead_Source: lead_Source ? lead_Source : lead.lead_Source,
        followUpDate: followUpDate ? followUpDate : lead.followUpDate,
        JobDate: JobDate ? JobDate : lead.JobDate,
        Note: Note ? Note : lead.Note,
        stage: stage ? stage : lead.stage,
        status: status ? status : lead.status,
      },
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
    const leads = await leadModel
      .find({ status: { $eq: "progress" } })
      .sort({ createdAt: -1 });

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
    const leads = await leadModel
      .find({ status: { $eq: "won" } })
      .sort({ createdAt: -1 });

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
  try {
    const leads = await leadModel
      .find({ status: { $eq: "lost" } })
      .sort({ createdAt: -1 });

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
