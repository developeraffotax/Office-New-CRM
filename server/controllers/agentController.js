import mongoose from "mongoose";
import { addScreenshotJob } from "../jobs/queues/screenshotQueue.js";
import screenshotModel from "../models/screenshotModel.js";
import timerModel from "../models/timerModel.js";
import { getFileUrl, getUploadPresignedUrl, listFiles } from "../utils/s3/s3Actions.js";











export const takeScreenshot = async (req, res) => {
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: "No file uploaded" });
    // }

    //const { s3Key, timestamp, userId, activeWindow, activity } = req.body;
    const { s3Key, timestamp,  activeWindow, activity } = req.body;

     const userId = req.user?.user?._id;
    
     console.log("THE ACTIFVE WINDOW IS 💚💚💚", activeWindow)
     console.log("THE ACTIVITY IS 💜💜💜", activity)

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




 
export const getUserDailyActivity = async (req, res) => {
  const userId = req.user?.user?._id;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const targetDate = req.query.date ? new Date(req.query.date) : new Date(); 

    const todayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const todayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await screenshotModel.aggregate([
      {
        $facet: {
          today: [
            {
              $match: {
                userId: userObjectId,
                timestamp: { $gte: todayStart, $lte: todayEnd },
                activity: { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                
                avgKeyboardPercent: { $avg: "$activity.keyboardActivityPercent" },
                avgMousePercent: { $avg: "$activity.mouseActivityPercent" },
                avgOverallPercent: { $avg: "$activity.overallActivityPercent" },
              }
            }
          ],

          yesterday: [
            {
              $match: {
                userId: userObjectId,
                timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd },
                activity: { $exists: true }
              }
            },
            {
              $group: {
                _id: null,
                
                avgKeyboardPercent: { $avg: "$activity.keyboardActivityPercent" },
                avgMousePercent: { $avg: "$activity.mouseActivityPercent" },
                avgOverallPercent: { $avg: "$activity.overallActivityPercent" },
              }
            }
          ]
        }
      }
    ]);

    const todayData = result[0].today[0] || {};
    const yesterdayData = result[0].yesterday[0] || {};

    res.json({
      today: {
        date: todayStart.toISOString().split("T")[0],
        totalKeyboard: todayData.totalKeyboard || 0,
        totalMouse: todayData.totalMouse || 0,
        keyboardActivityPercent: Math.round(todayData.avgKeyboardPercent || 0),
        mouseActivityPercent: Math.round(todayData.avgMousePercent || 0),
        overallActivityPercent: Math.round(todayData.avgOverallPercent || 0),
      },
      yesterday: {
        date: yesterdayStart.toISOString().split("T")[0],
        totalKeyboard: yesterdayData.totalKeyboard || 0,
        totalMouse: yesterdayData.totalMouse || 0,
        keyboardActivityPercent: Math.round(yesterdayData.avgKeyboardPercent || 0),
        mouseActivityPercent: Math.round(yesterdayData.avgMousePercent || 0),
        overallActivityPercent: Math.round(yesterdayData.avgOverallPercent || 0),
      }
    });

  } catch (err) {
    console.error("❌ Failed to calculate user activity:", err);
    res.status(500).json({ error: "Failed to calculate user activity" });
  }
};




 























// GET /timers/:userId?date=YYYY-MM-DD
export const getUserTimers = async (req, res) => {
  const userId = req.params.userId;
  const { date, includeRunning } = req.query; // includeRunning optional

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Build query
    const query = { clientId: userId };

    // If includeRunning is not true, only get finished timers
    if (includeRunning !== "true") {
      query.endTime = { $ne: null };
    }

    // Date filter
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = { $gte: startOfDay, $lte: endOfDay };

    // Fetch timers
    const timers = await timerModel.find(query).sort({ date: 1, startTime: 1 });

    // Calculate total worked time in minutes
    let totalMinutes = 0;
    timers.forEach((timer) => {
      if (timer.startTime) {
        const start = new Date(timer.startTime).getTime();
        let end;

        if (timer.isRunning) {
          // Timer is still running, use current time
          end = Date.now();
        } else if (timer.endTime) {
          end = new Date(timer.endTime).getTime();
        } else {
          return; // skip if no endTime
        }

        totalMinutes += (end - start) / 60000;
      }
    });

    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);




    

    return res.json({
      success: true,
      timers,
      totalWorkedTimeInMins: totalMinutes,
    });
  } catch (err) {
    console.error("❌ Failed to fetch timers:", err);
    return res.status(500).json({ error: "Failed to fetch timers" });
  }
};






















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





// export const getUserTimers = async (req, res) => {
//   const userId = req.params.userId;
//   const { date } = req.query; // single date from frontend

//   try {
//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required" });
//     }

//     const query = {
//       clientId: userId,
//       endTime: { $ne: null }
      
//     };

//     // Default to today if no date provided
//     const targetDate = date ? new Date(date) : new Date();
//     const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

//     query.date = { $gte: startOfDay, $lte: endOfDay };

//     const timers = await timerModel
//           .find(query)
//           .sort({ date: 1 });

    

//     res.json(timers);
//   } catch (err) {
//     console.error("❌ Failed to fetch timers:", err);
//     res.status(500).json({ error: "Failed to fetch timers" });
//   }
// };








 





























// export const getUserTimers = async (req, res) => {
//   const userId = req.params.userId || req.user?.user?._id;
//   const { date } = req.query;

//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }

//   try {
//     // ======================
//     // 1. Fetch timers
//     // ======================
//     const targetDate = date ? new Date(date) : new Date();
//     const startOfDay = new Date(targetDate);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(targetDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     const timers = await timerModel
//       .find({
//         clientId: userId,
//         date: { $gte: startOfDay, $lte: endOfDay },
//       })
//       .sort({ startTime: 1 });

//     // ======================
//     // 2. Calculate total worked time
//     // ======================
//     let totalMinutes = 0;
//     const timerIntervals = []; // store start and end timestamps for each timer

//     timers.forEach((timer) => {
//       if (!timer.startTime) return;

//       const start = new Date(timer.startTime).getTime();
//       let end;

//       if (timer.isRunning) {
//         end = Date.now();
//       } else if (timer.endTime) {
//         end = new Date(timer.endTime).getTime();
//       } else {
//         return;
//       }

//       totalMinutes += (end - start) / 60000;
//       timerIntervals.push({ start, end });
//     });

//     // ======================
//     // 3. Calculate average activity
//     // ======================
//     // Initialize totals
//     let totalKeyboard = 0;
//     let totalMouse = 0;
//     let totalOverall = 0;
//     let totalIntervalsCount = 0;

//     const userObjectId = new mongoose.Types.ObjectId(userId);

//     for (const interval of timerIntervals) {
//       // Get all screenshots within this timer interval
//       const screenshots = await screenshotModel
//         .find({
//           userId: userObjectId,
//           timestamp: { $gte: new Date(interval.start), $lte: new Date(interval.end) },
//           activity: { $exists: true },
//         })
//         .sort({ timestamp: 1 });

//       if (screenshots.length === 0) {
//         // If no screenshots, count 1 interval with 0 activity
//         totalIntervalsCount += 1;
//         continue;
//       }

//       // We calculate activity in 5-min blocks based on screenshots
//       for (let i = 0; i < screenshots.length; i++) {
//         const s = screenshots[i];
//         const nextTimestamp = i < screenshots.length - 1
//           ? new Date(screenshots[i + 1].timestamp).getTime()
//           : interval.end;

//         const duration = (nextTimestamp - new Date(s.timestamp).getTime()) / 60000; // minutes

//         totalKeyboard += (s.activity?.keyboardActivityPercent || 0) * duration;
//         totalMouse += (s.activity?.mouseActivityPercent || 0) * duration;
//         totalOverall += (s.activity?.overallActivityPercent || 0) * duration;
//         totalIntervalsCount += duration;
//       }

//       // Fill the gaps before the first screenshot and after last screenshot
//       const firstScreenshotTime = new Date(screenshots[0].timestamp).getTime();
//       const lastScreenshotTime = new Date(screenshots[screenshots.length - 1].timestamp).getTime();

//       if (firstScreenshotTime > interval.start) {
//         const gapMinutes = (firstScreenshotTime - interval.start) / 60000;
//         totalIntervalsCount += gapMinutes; // zero activity
//       }
//       if (lastScreenshotTime < interval.end) {
//         const gapMinutes = (interval.end - lastScreenshotTime) / 60000;
//         totalIntervalsCount += gapMinutes; // zero activity
//       }
//     }

//     // Avoid division by zero
//     const avgKeyboardPercent = totalIntervalsCount ? totalKeyboard / totalIntervalsCount : 0;
//     const avgMousePercent = totalIntervalsCount ? totalMouse / totalIntervalsCount : 0;
//     const avgOverallPercent = totalIntervalsCount ? totalOverall / totalIntervalsCount : 0;

//     return res.json({
//       success: true,
//       totalWorkedTimeInMins: totalMinutes,
//       avgActivity: {
//         keyboard: Math.round(avgKeyboardPercent),
//         mouse: Math.round(avgMousePercent),
//         overall: Math.round(avgOverallPercent),
//       },
//       timers,
//     });

//   } catch (err) {
//     console.error("❌ Failed to fetch user activity:", err);
//     return res.status(500).json({ error: "Failed to fetch user activity" });
//   }
// };