import labelModel from "../models/labelModel.js";

// Create Label
export const createLabel = async (req, res) => {
  try {
    const { name, color, type } = req.body;
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Label is required!",
      });
    }
    const newLabel = await labelModel.create({ name, color, type });

    res.status(200).send({
      success: true,
      message: "New label added!",
      label: newLabel,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in create label!",
      error,
    });
  }
};

// Get Labels
export const getAllLabelsByJob = async (req, res) => {
  try {
    const labels = await labelModel
      .find({ type: "job" })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All label list!",
      labels: labels,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in get labels!",
      error,
    });
  }
};

export const getAllLabelsByTask = async (req, res) => {
  try {
    const labels = await labelModel
      .find({ type: "task" })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All label list!",
      labels: labels,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in get labels!",
      error,
    });
  }
};

// Delete Label
export const deleteLabel = async (req, res) => {
  try {
    const labelId = req.params.id;
    if (!labelId) {
      return res.status(400).send({
        success: false,
        message: "label id is required!",
      });
    }
    await labelModel.findByIdAndDelete(labelId);

    res.status(200).send({
      success: true,
      message: "label deleted!",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in delete label!",
      error,
    });
  }
};
