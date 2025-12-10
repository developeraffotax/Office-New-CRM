import UserSettings from "../models/userSettingsModel.js";

// GET /settings/:userId
export const getSettings = async (req, res) => {
    const userId = getUserId(req)
  if (!userId) sendResponse(res, 404, "User not found!");

  try {
    const settings = await UserSettings.findOne({ user: userId });

    if (!settings) {
      const newSettings = await UserSettings.create({ user: userId });
      return sendResponse(res, 201, "New Settings Created!", newSettings);
    }

     sendResponse(res, 200, "Settings Fetched!", settings);
  } catch (error) {
    sendResponse(res, 500, error.message || "Failed to update!");
  }
};





// UPDATE /settings/:userId
export const updateSettings = async (req, res) => {
    const userId = getUserId(req)
  if (!userId) sendResponse(res, 404, "User not found!");

  try {
    const settings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: req.body },
      { new: true, upsert: true }
    );

    sendResponse(res, 201, "Settings Updated!", settings);
  } catch (error) {
    sendResponse(res, 500, error.message || "Failed to update!");
  }
};




const getUserId = (req) => req?.user?.user?._id;

const sendResponse = (res, statusCode, message, settings = null) => res .status(statusCode) .json({ success: statusCode === 200 || statusCode === 201, message, settings, });
