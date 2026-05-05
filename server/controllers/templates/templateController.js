import templateModel from "../../models/templates/templateModel.js";

// Create Template
export const createTemplate = async (req, res) => {
  try {
    const { name, description, template, category, userList } = req.body;

    console.log("template", template);

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
  const userId = req.user?.user?._id;
  const role = req.user?.user?.role?.name;
  // const userName =  req.user?.user?.name;

  try {
    const filters = {};

    if (role !== "Admin") {
      filters["userList._id"] = userId;
    }

    const templates = await templateModel.find(filters).lean();

    res.status(200).send({
      success: true,
      message: "Template List!",
      templates: templates,
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
      { new: true },
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

// export const bulkUpdateTemplates = async (req, res) => {
//   try {
//     const templates = req.body;

//     if (!Array.isArray(templates) || templates.length === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "Templates array is required!",
//       });
//     }

//     const bulkOps = templates.map((item) => {
//       if (!item._id) {
//         throw new Error("Each template must have an _id");
//       }

//       return {
//         updateOne: {
//           filter: { _id: item._id },
//           update: {
//             $set: {
//               ...(item.name && { name: item.name }),
//               ...(item.description && { description: item.description }),
//               ...(item.template && { template: item.template }),
//               ...(item.category && { category: item.category }),
//               ...(item.userList && { userList: item.userList }),
//             },
//           },
//         },
//       };
//     });

//     const result = await templateModel.bulkWrite(bulkOps);

//     return res.status(200).send({
//       success: true,
//       message: "Templates updated successfully!",
//       result,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error in bulk update",
//       error: error.message,
//     });
//   }
// };

// export const bulkUpdateTemplates = async (req, res) => {
//   try {
//     const templates = req.body;

//     if (!Array.isArray(templates) || templates.length === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "Templates array is required!",
//       });
//     }

//     const bulkOps = templates.map((item) => {
//       if (!item._id) {
//         throw new Error("Each template must have an _id");
//       }

//       const update = {};

//       // -------- BASIC FIELDS --------
//       if (item.name) update.name = item.name;
//       if (item.description) update.description = item.description;
//       if (item.template) update.template = item.template;
//       if (item.category) update.category = item.category;

//       const updateQuery = {};

//       // -------- SET (REPLACE) --------
//       if (Object.keys(update).length > 0) {
//         updateQuery.$set = update;
//       }

//       // -------- USER REPLACE --------
//       if (item.userList) {
//         updateQuery.$set = {
//           ...(updateQuery.$set || {}),
//           userList: item.userList,
//         };
//       }

//       // -------- ADD USERS --------
//       if (item.addUsers && item.addUsers.length > 0) {
//         updateQuery.$addToSet = {
//           userList: { $each: item.addUsers },
//         };
//       }

//       // -------- REMOVE USERS --------
//       if (item.removeUsers && item.removeUsers.length > 0) {
//         updateQuery.$pull = {
//           userList: {
//             _id: { $in: item.removeUsers },
//           },
//         };
//       }

//       return {
//         updateOne: {
//           filter: { _id: item._id },
//           update: updateQuery,
//         },
//       };
//     });

//     const result = await templateModel.bulkWrite(bulkOps);

//     return res.status(200).send({
//       success: true,
//       message: "Bulk update successful",
//       result,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error in bulk update",
//       error: error.message,
//     });
//   }
// };

export const bulkUpdateTemplates = async (req, res) => {
  try {
    const templates = req.body;

    if (!Array.isArray(templates) || templates.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Templates array is required!",
      });
    }

    const bulkOps = templates.map((item) => {
      if (!item._id) {
        throw new Error("Each template must have an _id");
      }

      const updateQuery = {};
      const setFields = {};

      // -------- BASIC FIELDS --------
      if (item.name) setFields.name = item.name;
      if (item.description) setFields.description = item.description;
      if (item.template) setFields.template = item.template;
      if (item.category) setFields.category = item.category;

      // -------- USER REPLACE --------
      if (item.userList) {
        setFields.userList = item.userList.map((u) => ({
          _id: u._id,
          name: u.name,
        }));
      }

      if (Object.keys(setFields).length > 0) {
        updateQuery.$set = setFields;
      }

      // -------- ADD USERS --------
      if (item.addUsers && item.addUsers.length > 0) {
        updateQuery.$addToSet = {
          userList: {
            $each: item.addUsers.map((u) => ({
              _id: u._id,
              name: u.name,
            })),
          },
        };
      }

      // -------- REMOVE USERS --------
      if (item.removeUsers && item.removeUsers.length > 0) {
        updateQuery.$pull = {
          userList: {
            _id: { $in: item.removeUsers },
          },
        };
      }

      return {
        updateOne: {
          filter: { _id: item._id },
          update: updateQuery,
        },
      };
    });

    const result = await templateModel.bulkWrite(bulkOps);

    return res.status(200).send({
      success: true,
      message: "Bulk update successful",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in bulk update",
      error: error.message,
    });
  }
};
