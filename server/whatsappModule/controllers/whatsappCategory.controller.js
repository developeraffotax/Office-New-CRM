import WhatsappCategory from "../models/WhatsappCategory.js";

 
/**
 * Create category
 */
export const createWhatsappCategory = async (req, res) => {
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
        if (err.code === 11000) {
            return res.status(409).json({ message: "Category already exists" });
        }
        res.status(500).json({ message: err.message });
    }
};










/**
 * Get all categories
 */
export const getWhatsappCategories = async (req, res) => {
    try {

        const categories = await WhatsappCategory.find()
            .sort({ createdAt: 1 });

        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};














/**
 * Update category
 */
export const updateWhatsappCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;


        const category = await WhatsappCategory.findOneAndUpdate(
            { _id: id, },
            { name, color },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};












/**
 * Delete category
 */
export const deleteWhatsappCategory = async (req, res) => {
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
        res.status(500).json({ message: err.message });
    }
};
