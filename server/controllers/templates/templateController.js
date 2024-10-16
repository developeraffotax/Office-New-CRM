import templateModel from "../../models/templates/templateModel.js";

// Create Template
export const createTemplate = async (req, res) => {
  try {
    const { name, description, template, category, userList } = req.body;

    if (!category) {
      return res.status(400).send({
        success: false,
        message: "Category is required!",
      });
    }

    const templateDate = await templateModel.create({
      name,
      description,
      template,
      category,
      userList,
    });

    res.status(200).send({
      success: true,
      message: "template added successfully",
      template: templateDate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create template",
      error: error,
    });
  }
};

// Get All Template
export const getAllTemplate = async (req, res) => {
  try {
    const templateDate = await templateModel.find({});

    res.status(200).send({
      success: true,
      message: "Template List!",
      templates: templateDate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all templates",
      error: error,
    });
  }
};

// Get Single Template
export const getSingleTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;

    if (!templateId) {
      return res.status(400).send({
        success: false,
        message: "Template id is required!",
      });
    }
    const template = await templateModel.findById({ _id: templateId });

    res.status(200).send({
      success: true,
      message: "Template List!",
      template: template,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single templates",
      error: error,
    });
  }
};

// Update Template
export const updateTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const { name, description, template, category, userList } = req.body;

    if (!templateId) {
      return res.status(400).send({
        success: false,
        message: "Template id is required!",
      });
    }

    const isTemplate = await templateModel.findById({ _id: templateId });

    if (!isTemplate) {
      return res.status(400).send({
        success: false,
        message: "Template not found!",
      });
    }

    const templateDate = await templateModel.findByIdAndUpdate(
      { _id: isTemplate._id },
      {
        name,
        description,
        template,
        category,
        userList,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "template update successfully",
      template: templateDate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update template",
      error: error,
    });
  }
};

// Delete Template
export const deleteTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;

    if (!templateId) {
      return res.status(400).send({
        success: false,
        message: "Template id is required!",
      });
    }
    await templateModel.findByIdAndDelete({ _id: templateId });

    res.status(200).send({
      success: true,
      message: "Template deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete template",
      error: error,
    });
  }
};
