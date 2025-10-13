import screenshotModel from "../models/screenshotModel.js";




// takeScreenshot
export const takeScreenshot = async (req, res) => {
  try {
    const { timestamp, userId} = req.body;
    const s3Key = req.file.key || req.file.filename; // Adjusted for local storage
    const s3Url = req.file.location || `${req.protocol}://${req.get('host')}/uploads/screenshots/${userId}/${s3Key}`; // Adjusted for local storage

    console.log("Received screenshot upload:", req.file);
    // const activity = req.body.activity;
    // console.log("Activity data💙💚💚💛💛🧡🧡❤❤:", activity);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const doc = await screenshotModel.create({
      userId,
       
      timestamp: timestamp ? new Date(timestamp) : new Date(),
       
      s3Key,
      s3Url,
    });
    
    res.status(201).json({ success: true, id: doc._id, s3Url });
  } catch (e) {
    console.error("Error in Controller takeScreenshot:", e);
    res.status(500).json({ error: "Upload failed" });
  }
};
