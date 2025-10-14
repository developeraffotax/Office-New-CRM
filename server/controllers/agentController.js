import screenshotModel from "../models/screenshotModel.js";
import { getFileUrl, listFiles } from "../utils/s3/s3Actions.js";




// takeScreenshot
export const takeScreenshot = async (req, res) => {
  try {
    const { timestamp, userId} = req.body;
    const s3Key = req.file.key || req.file.filename; // Adjusted for local storage
    const s3Url = req.file.location || `${req.protocol}://${req.get('host')}/uploads/screenshots/${userId}/${s3Key}`; // Adjusted for local storage

     
    const activeWindow = req.body.activeWindow;
    const activity = req.body.activity;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const doc = await screenshotModel.create({
      userId,
       
      timestamp: timestamp ? new Date(timestamp) : new Date(),
       
      s3Key,
      s3Url,

      activeWindow: activeWindow ? JSON.parse(activeWindow) : undefined,
      activity: activity ? JSON.parse(activity) : undefined,
    });
    
    res.status(201).json({ success: true, id: doc._id, s3Url });
  } catch (e) {
    console.error("Error in Controller takeScreenshot:", e);
    res.status(500).json({ error: "Upload failed" });
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

 try {
     
    const screenshots = await screenshotModel.find({ userId }).sort({ timestamp: -1 });

    const results = await Promise.all(
      screenshots.map(async (shot) => ({
        ...shot.toObject(),
        signedUrl: await getFileUrl(shot.s3Key),
      }))
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch screenshots" });
  }








}