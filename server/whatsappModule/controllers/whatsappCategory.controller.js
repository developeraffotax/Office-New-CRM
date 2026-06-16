import WhatsappCategory from "../models/WhatsappCategory.js";

/**
 * Create category
 */
export const createWhatsappCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ message: "Name and color are required" });
    }

    const category = await WhatsappCategory.create({
      name: name.toLowerCase(),
      color,
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all categories
 */
export const getWhatsappCategories = async (req, res, next) => {
  try {
    const categories = await WhatsappCategory.find().sort({ createdAt: 1 });

    res.json(categories);
  } catch (err) {
    next(err);
  }
};

/**
 * Update category
 */
export const updateWhatsappCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const category = await WhatsappCategory.findOneAndUpdate(
      { _id: id },
      { name, color },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete category
 */
export const deleteWhatsappCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await WhatsappCategory.findOneAndDelete({
      _id: id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};
