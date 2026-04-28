import cron from "node-cron";
import moment from "moment";
import timerModel from "../../models/timerModel.js";
import officeShiftModel from "../../models/officeShiftModel.js";
import { safeRedisSmembers } from "../../utils/safeRedisSmembers.js";
import { io } from "../../index.js";
import { sendSocketEvent } from "../../utils/customFns/emitTaskUpdate.js";
 
 
const scheduledJobs = new Map(); // track active cron jobs by shift ID

export const scheduleShiftEndTimer = async () => {
  try {
    // Clear any previously scheduled jobs
    scheduledJobs.forEach((job) => job.stop());
    scheduledJobs.clear();

    const shift = await officeShiftModel.findOne({ isActive: true });

    if (!shift) {
      console.log("⚪ No active shift found. Skipping cron scheduling.");
      return;
    }

    const [hour, minute] = shift.endTime.split(":").map(Number);

    // Cron expression: runs at exact shift end time daily
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(
      `⏰ Scheduling shift-end job at ${shift.endTime} (cron: "${cronExpression}")`
    );

    const job = cron.schedule(cronExpression, async () => {
      console.log(`🔴 Shift ended at ${shift.endTime}. Stopping all running timers...`);

      try {
        const runningTimers = await timerModel.find({ isRunning: true });

        if (runningTimers.length === 0) {
          console.log("✅ No running timers to stop.");
          return;
        }

        const stopTime = new Date().toISOString();

        await timerModel.updateMany(
          { isRunning: true },
          {
            $set: {
              isRunning: false,
              endTime: stopTime,
              autoStoppedByShift: true, // optional flag for audit
            },
          }
        );

        console.log(`✅ Stopped ${runningTimers.length} timer(s).`);

        // Notify all dashboards
        // io.emit("runningTimersUpdate");

        // Optionally notify each affected user
        runningTimers.forEach((timer) => {
          io.to(`user:${timer.clientId}`).emit("timer:autoStopped", { endTime: stopTime, message: `Your timer was automatically stopped at shift end!`, task: timer?.task || "", clientName: timer?.clientName || "", });
          
          // io.to(`user:${timer.clientId}`).emit("task_updated");
          //io.to(`user:${timer.clientId}`).emit("job_updated");
 


        });

      } catch (err) {
        console.error("❌ Error stopping timers at shift end:", err.message);
      }
    });

    scheduledJobs.set(shift._id.toString(), job);

      

  } catch (err) {
    console.error("❌ Failed to schedule shift-end cron:", err.message);
  }
};

// Call this whenever a shift is updated/created to reschedule
export const rescheduleShiftCron = async () => {
  console.log("🔄 Rescheduling shift-end cron...");
  await scheduleShiftEndTimer();
};