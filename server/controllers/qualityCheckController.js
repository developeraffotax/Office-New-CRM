import qualityCheckModel from "../models/qualityCheckModel.js";

// Create Quality Check
export const createQuality = async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).send({
        success: false,
        message: "Task is required!",
      });
    }

    const qualityCheck = await qualityCheckModel.create({
      task,
    });

    res.status(200).send({
      success: true,
      message: "Quality check create successfully!",
      qualityCheck: qualityCheck,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error create quality check!",
      error: error,
    });
  }
};

// Get All Quality Check
export const getAllQualityChecks = async (req, res) => {
  try {
    const qualityChecks = await qualityCheckModel.find({});

    res.status(200).send({
      success: true,
      message: "All quality check list!",
      qualityChecks: qualityChecks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error get all quality checks!",
      error: error,
    });
  }
};

// Delete Quality Check
export const deleteQualityCheck = async (req, res) => {
  try {
    const qualityCheckId = req.params.id;

    if (!qualityCheckId) {
      return res.status(400).send({
        success: false,
        message: "Quality Check Id is required!",
      });
    }

    const qualityCheck = await qualityCheckModel.findByIdAndDelete({
      _id: qualityCheckId,
    });

    res.status(200).send({
      success: true,
      message: "Quality check deleted successfully!",
      qualityCheck: qualityCheck,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error delete quality check!",
      error: error,
    });
  }
};
