import officeShiftModel from "../models/officeShiftModel.js";

 



export const getShift = async (req, res) => {
  try {
    const shift = await officeShiftModel.findOne({ isActive: true });

    if (!shift) {
      return res.status(404).send({
        success: false,
        message: "No shift configured",
      });
    }

    return res.status(200).send({
      success: true,
      shift,
    });
  } catch (error) {
    console.error("Get Shift Error:", error);

    return res.status(500).send({
      success: false,
      message: "Error fetching shift",
      error: error.message,
    });
  }
};












export const updateShift = async (req, res) => {
  try {
    const { startTime, endTime, isActive } = req.body;

    // basic validation
    if (!startTime || !endTime) {
      return res.status(400).send({
        success: false,
        message: "startTime and endTime are required",
      });
    }

    const shift = await officeShiftModel.findOneAndUpdate(
      { isActive: true },
      {
        startTime,
        endTime,
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (!shift) {
      return res.status(404).send({
        success: false,
        message: "Shift not found or could not be created",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Shift updated successfully",
      shift,
    });
  } catch (error) {
    console.error("Update Shift Error:", error);

    return res.status(500).send({
      success: false,
      message: "Internal server error while updating shift",
      error: error.message,
    });
  }
};