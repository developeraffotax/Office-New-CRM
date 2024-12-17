import complainModel from "../models/complainModel.js";

// Create Complain
export const createComplain = async (req, res) => {
  try {
    const {
      company,
      client,
      department,
      assign,
      errorType,
      solution,
      points,
      note,
    } = req.body;

    const complaint = await complainModel.create({
      company,
      client,
      department,
      assign,
      errorType,
      solution,
      points,
      note,
    });

    res.status(200).send({
      success: true,
      message: "Compliant post successfully.",
      complaint: complaint,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create complaint!",
      error: error,
    });
  }
};

// Update Complain
export const updateComplain = async (req, res) => {
  try {
    const complainId = req.params.id;
    const {
      company,
      client,
      department,
      assign,
      errorType,
      solution,
      points,
      note,
      createdAt,
    } = req.body;

    console.log("createdAt:", createdAt);

    const complain = await complainModel.findById({ _id: complainId });
    if (!complain) {
      return res.status(404).send({
        success: false,
        message: "Complain not found!",
      });
    }

    const updateComplaint = await complainModel.findByIdAndUpdate(
      complain._id,
      {
        company: company || complain.company,
        client: client || complain.client,
        department: department || complain.department,
        assign: assign || complain.assign,
        errorType: errorType || complain.errorType,
        solution: solution || complain.solution,
        points: points || complain.points,
        note: note || complain.note,
        createdAt: new Date(createdAt) || complain.createdAt,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Conpliant update successfully.",
      complaint: updateComplaint,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update complaint!",
      error: error,
    });
  }
};

// Get All Complaints
export const fetchAllComplains = async (req, res) => {
  try {
    const complaints = await complainModel
      .find({})
      .populate([
        { path: "assign", select: "name" },
        { path: "errorType" },
        { path: "solution" },
      ]);

    res.status(200).send({
      success: true,
      message: "All Compliants.",
      complaints: complaints,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all complaints!",
      error: error,
    });
  }
};

// Get Complaint
export const fetchSingleComplains = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaint = await complainModel.findById(complaintId);

    res.status(200).send({
      success: true,
      message: "Single complaint.",
      complaint: complaint,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get complaint!",
      error: error,
    });
  }
};

// Delete Complaint
export const deleteComplains = async (req, res) => {
  try {
    const complaintId = req.params.id;

    await complainModel.findByIdAndDelete(complaintId);

    res.status(200).send({
      success: true,
      message: "Complaint deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete complaint!",
      error: error,
    });
  }
};

// Dashboard Complains
export const dashboardComplains = async (req, res) => {
  try {
    const complaints = await complainModel
      .find({})
      .select("assign createdAt")
      .populate([{ path: "assign", select: "name" }]);

    res.status(200).send({
      success: true,
      message: "Dashboard Compliants.",
      complaints: complaints,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all complaints!",
      error: error,
    });
  }
};

// Copy Task
export const copyComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaint = await complainModel.findById(complaintId);

    if (!complaint) {
      return res.status(404).send({
        success: false,
        message: "Complaint not found!",
      });
    }

    const taskData = { ...complaint.toObject() };
    delete taskData._id;
    delete taskData.createdAt;
    delete taskData.updatedAt;
    taskData.note = "";

    const copyComplaint = await complainModel.create(taskData);

    res.status(200).send({
      success: true,
      message: "Complaint copy successfully!",
      copyComplaint: copyComplaint,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occur while copy hr task!",
      error: error,
    });
  }
};
