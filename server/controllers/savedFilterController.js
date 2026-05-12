import SavedFilter from "../models/savedFilterModel.js";
 

 
export const getSavedFilters = async (req, res) => {
  try {
    const { page } = req.query;
     const userId = req.user.user._id;

    const query = { user: userId };
    if (page) query.page = page;

    const filters = await SavedFilter.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, filters });
  } catch (error) {
    console.error("getSavedFilters error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch saved filters" });
  }
};

 
export const createSavedFilter = async (req, res) => {
  try {
    const { name, filters, page } = req.body;
    const userId = req.user.user._id;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Filter name is required" });
    }

    if (!page) {
      return res.status(400).json({ success: false, message: "Page is required" });
    }

    if (!Array.isArray(filters) || filters.length === 0) {
      return res.status(400).json({ success: false, message: "At least one filter is required" });
    }

    // Prevent duplicate names per user per page
    const existing = await SavedFilter.findOne({ user: userId, name: name.trim(), page });
    if (existing) {
      return res.status(409).json({ success: false, message: `A filter named "${name.trim()}" already exists for this page` });
    }

    const saved = await SavedFilter.create({
      user: userId,
      name: name.trim(),
      page,
      filters,
    });

    res.status(201).json({ success: true, filter: saved });
  } catch (error) {
    console.error("createSavedFilter error:", error);
    res.status(500).json({ success: false, message: "Failed to save filter" });
  }
};

// @desc    Delete a saved filter
// @route   DELETE /api/v1/saved-filters/:id
// @access  Private
export const deleteSavedFilter = async (req, res) => {
  try {
    const { id } = req.params;
     const userId = req.user.user._id;

    const filter = await SavedFilter.findOneAndDelete({ _id: id, user: userId });

    if (!filter) {
      return res.status(404).json({ success: false, message: "Filter not found or not authorized" });
    }

    res.status(200).json({ success: true, message: "Filter deleted successfully" });
  } catch (error) {
    console.error("deleteSavedFilter error:", error);

    // Handle invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid filter ID" });
    }

    res.status(500).json({ success: false, message: "Failed to delete filter" });
  }
};

 