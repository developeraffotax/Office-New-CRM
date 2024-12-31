import QuickListModel from "../models/QuickListModel.js";

// Create Quick List
export const createQuickList = async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.user._id;

    if (!description) {
      return res.status(400).send({
        success: false,
        message: "Description is required!",
      });
    }

    const quickList = await QuickListModel.create({
      description,
      user: userId,
    });

    res.status(200).send({
      success: true,
      message: "Quick List created successfully!",
      quickList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while creating quick list!",
      error: error,
    });
  }
};

// Get All Quick Lists
export const getAllQuickLists = async (req, res) => {
  try {
    const userId = req.user.user._id;
    console.log("userId:", userId);
    const quickList = await QuickListModel.findOne({
      user: req.user.user._id,
    });

    res.status(200).send({
      success: true,
      message: "Quick list",
      quickList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all quick lists!",
      error: error,
    });
  }
};

// Get Single Quick List
export const getSingleQuickList = async (req, res) => {
  try {
    const quickListId = req.params.id;
    if (!quickListId) {
      return res.status(400).send({
        success: false,
        message: "Quick List Id is required!",
      });
    }

    const quickList = await QuickListModel.findById(quickListId);

    if (!quickList) {
      return res.status(400).send({
        success: false,
        message: "Quick List not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single quick list retrieved successfully!",
      quickList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single quick list!",
      error: error,
    });
  }
};

// Update Quick List
export const updateQuickList = async (req, res) => {
  try {
    const quickListId = req.params.id;
    const { description } = req.body;

    if (!quickListId) {
      return res.status(400).send({
        success: false,
        message: "Quick List Id is required!",
      });
    }

    const quickList = await QuickListModel.findByIdAndUpdate(
      { _id: quickListId },
      { $set: { description } },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Quick List updated successfully!",
      quickList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update quick list!",
      error: error,
    });
  }
};

// Delete Quick List
export const deleteQuickList = async (req, res) => {
  try {
    const quickListId = req.params.id;

    if (!quickListId) {
      return res.status(400).send({
        success: false,
        message: "Quick List Id is required!",
      });
    }

    const isExisting = await QuickListModel.findById({ _id: quickListId });

    if (!isExisting) {
      return res.status(400).send({
        success: false,
        message: "Quick List not found!",
      });
    }

    await QuickListModel.findByIdAndDelete({ _id: quickListId });

    res.status(200).send({
      success: true,
      message: "Quick List deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete quick list!",
      error: error,
    });
  }
};
