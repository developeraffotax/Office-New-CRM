import mongoose from "mongoose";
import hrProductModel from "../models/hrProductModel.js";

// Keep only valid, unique department ids
const normalizeDepartments = (departments) => {
  if (!Array.isArray(departments)) return [];
  const ids = departments.map((d) => String(d?._id || d));
  return [...new Set(ids)].filter((id) => mongoose.isValidObjectId(id));
};

// Create Product
export const createHrProduct = async (req, res) => {
  try {
    const { name, departments } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Product name is required" });
    }

    // Optional: check if already exists (because of unique: true)
    const existing = await hrProductModel.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists!",
      });
    }

    const product = await hrProductModel.create({
      name: name.trim(),
      departments: normalizeDepartments(departments),
    });

    await product.populate("departments", "departmentName");

    res.status(200).send({
      success: true,
      message: "Product created successfully!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occurred while creating product, please try again!",
    });
  }
};

// Update Product
export const updateHrProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, departments } = req.body;

    const product = await hrProductModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found!",
      });
    }

    // Optional: prevent duplicate name on update
    if (name) {
      const existing = await hrProductModel.findOne({
        name: name.trim(),
        _id: { $ne: productId },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists!",
        });
      }
    }

    const update = { name: name?.trim() || product.name };

    // Only touch departments when the client actually sent them
    if (departments !== undefined) {
      update.departments = normalizeDepartments(departments);
    }

    const updatedProduct = await hrProductModel
      .findByIdAndUpdate(productId, update, { new: true })
      .populate("departments", "departmentName");

    res.status(200).send({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occurred while updating product, please try again!",
    });
  }
};

// Fetch All Products
export const fetchHrProducts = async (req, res) => {
  try {
    const products = await hrProductModel
      .find({})
      .populate("departments", "departmentName")
      .sort({ name: 1 })
      .lean();

    res.status(200).send({
      success: true,
      message: "Product list!",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occurred while fetching products, please try again!",
    });
  }
};

// Delete Product (unchanged)
export const deleteHrProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await hrProductModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found!",
      });
    }

    await hrProductModel.findByIdAndDelete(productId);

    res.status(200).send({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error occurred while deleting product, please try again!",
    });
  }
};