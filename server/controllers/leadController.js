import jobsModel from "../models/jobsModel.js";
import leadModel from "../models/leadModel.js";
import proposalModel from "../models/proposalModel.js";

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

     const allowedUpdates = ['companyName', 'clientName', 'jobHolder', 'department', 'source', 'brand', 'lead_Source', 'followUpDate', 'JobDate', 'Note', 'stage', 'status', 'value', 'number', 'yearEnd', 'jobDeadline', 'email']; // Whitelist of allowed fields
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





