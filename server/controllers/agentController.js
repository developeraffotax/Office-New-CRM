import { addScreenshotJob } from "../jobs/queues/screenshotQueue.js";
import screenshotModel from "../models/screenshotModel.js";
import { getFileUrl, getUploadPresignedUrl, listFiles } from "../utils/s3/s3Actions.js";











export const takeScreenshot = async (req, res) => {
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: "No file uploaded" });
    // }

    //const { s3Key, timestamp, userId, activeWindow, activity } = req.body;
    const { s3Key, timestamp,  activeWindow, activity } = req.body;

     const userId = req.user?.user?._id;
    

    const s3Url = await getFileUrl(s3Key);
    console.log("THE USER ID IS ", userId)
    const data = {
      s3Key,
      s3Url,
      timestamp,
      userId,
      activeWindow,
      activity
    }
    // Queue the job
    const job = await addScreenshotJob(data);

    res.status(202).json({ success: true, message: "Screenshot queued for processing" });
  } catch (e) {
    console.error("Error in takeScreenshot controller:", e);
    res.status(500).json({ error: "Failed to queue screenshot" });
  }
};




// get request to get the presigned url
export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.query;
    const userId = req.user?.user?._id || "unknown";
console.log("THE USER ID IS>> ", userId)
    if (!fileName || !fileType)
      return res.status(400).json({ error: "Missing fileName or fileType" });

    const { uploadUrl, key, ts } = await getUploadPresignedUrl( fileName, fileType, userId, );
    res.status(200).json({ uploadUrl, key, ts });
  } catch (err) {
    console.error("❌ Error generating pre-signed URL:", err);
    res.status(500).json({ error: "Failed to generate pre-signed URL" });
  }
};
















 









export const getAllScreenshots = async (req, res) => {

  // try {


  //   const files = await listFiles();
  //   console.log("FILES ARE", files)
  //   res.json(files);


  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }










}

































export const getUserScreenshots = async (req, res) => {
  const userId = req.params.userId;
  const { date } = req.query; // single date from frontend

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const query = {
      userId
    };

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    query.timestamp = { $gte: startOfDay, $lte: endOfDay };

    const screenshots = await screenshotModel
      .find(query)
      .sort({ timestamp: -1 });

    const results = await Promise.all(
      screenshots.map(async (shot) => ({
        ...shot.toObject(),
        signedUrl: await getFileUrl(shot.s3Key),
      }))
    );

    console.log("✅ Fetched screenshots:", results.length);

    res.json(results);
  } catch (err) {
    console.error("❌ Failed to fetch screenshots:", err);
    res.status(500).json({ error: "Failed to fetch screenshots" });
  }
};
