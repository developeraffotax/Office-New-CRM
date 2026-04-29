 
import moment from "moment";
import timerModel from "../../models/timerModel.js";  
import { io } from "../../index.js";
import { getOnlineAgents } from "../../utils/onlineStatus.js";
 

export const checkRunningTimers = async () => {
  try {
    // 1. Fetch all currently running timers
     

      const runningTimers = await timerModel.aggregate([
        { $match: { isRunning: true } },

        {
          $lookup: {
            from: "users",
            localField: "clientId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },

        {
          $lookup: {
            from: "roles",
            localField: "user.role",
            foreignField: "_id",
            as: "role"
          }
        },
        { $unwind: "$role" },

        {
          $match: {
            "role.name": { $ne: "Admin" }
          }
        },

        {
          $project: {
            _id: 1,
            clientId: 1,
            task: 1,
            clientName: 1,
            role: 1,
            user: 1
          }
        }
      ]);



    if (!runningTimers.length) {
      console.log("✅ [CRON] No running timers found. Skipping.");
      return;
    }

    

    // 2. Get currently online agents (O(1) lookup via Set)
    const onlineAgents = await getOnlineAgents();
    const onlineAgentsSet = new Set(onlineAgents);

    console.log(`🟢 [CRON] Online agents: ${[...onlineAgentsSet].join(", ") || "none"}`);
    console.log(`⏱  [CRON] Running timers: ${runningTimers.length}`);

    // 3. Find timers whose owner is NOT online (AffoStaff closed)
    const timersToStop = runningTimers.filter(
      (timer) => !onlineAgentsSet.has(timer.clientId.toString())
    );

    if (!timersToStop.length) {
      console.log("✅ [CRON] All timer owners are online. Nothing to stop.");
      return;
    }

    console.log(`🔴 [CRON] Stopping ${timersToStop.length} timer(s) due to AffoStaff being offline.`);

    try {
      const stopTime = new Date().toISOString();

      // Extract only the IDs of timers that need to be stopped
      const timerIdsToStop = timersToStop.map((timer) => timer._id);
      const reasonToStop = "AffoStaff went offline!";
      // Update only the offline timers using $in
      await timerModel.updateMany(
        { _id: { $in: timerIdsToStop }, isRunning: true },
        {
          $set: {
            isRunning: false,
            endTime: stopTime,
            note: reasonToStop,
            autoStoppedReason: reasonToStop,
          },
        }
      );

      console.log(`✅ [CRON] Successfully stopped ${timerIdsToStop.length} timer(s).`);
        console.log(`🕒 [CRON] Timers stopped at: ${new Date().toLocaleString()}`);
      // Notify each affected user via socket
      timersToStop.forEach((timer) => {
        io.to(`user:${timer.clientId}`).emit("timer:autoStopped", {
          reasonToStop: reasonToStop,
          stopTime: new Date().toLocaleString(),
          message: "Your timer was automatically stopped because AffoStaff went offline!",
          task: timer?.task || "",
          clientName: timer?.clientName || "",
        });
      });

      // Notify dashboards to refresh UI
      io.emit("runningTimersUpdate");

    } catch (err) {
      console.error("❌ [CRON] Error stopping timers:", err.message);
    }

  } catch (err) {
    console.error("❌ [CRON] checkRunningTimers crashed:", err.message);
  }
};