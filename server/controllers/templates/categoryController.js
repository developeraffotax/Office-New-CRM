import categoryModel from "../../models/templates/categoryModel.js";

// Create Category

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Category name is required!",
      });
    }

    const category = await categoryModel.create({ name, type });

    res.status(200).send({
      success: true,
      message: "Category created successfully!",
      category: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create category!",
      error: error,
    });
  }
};

// Get All Category
export const getAllCategory = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ type: { $ne: "faq" } })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Categories list!",
      categories: categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all categories!",
      error: error,
    });
  }
};

export const getAllFAQCategory = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ type: "faq" })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Categories list!",
      categories: categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all categories!",
      error: error,
    });
  }
};

// Get Single Category
export const getSingleCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).send({
        success: false,
        message: "Category id is required!",
      });
    }

    const category = await categoryModel.findById({ _id: categoryId });

    res.status(200).send({
      success: true,
      message: "Single category!",
      category: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single category!",
      error: error,
    });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!categoryId) {
      return res.status(400).send({
        success: false,
        message: "Category id is required!",
      });
    }

    const category = await categoryModel.findByIdAndUpdate(
      { _id: categoryId },
      { name: name },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Category update successfully!",
      category: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update category!",
      error: error,
    });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).send({
        success: false,
        message: "Category id is required!",
      });
    }

    await categoryModel.findByIdAndDelete(categoryId);

    res.status(200).send({
      success: true,
      message: "Category delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete category!",
      error: error,
    });
  }
};
