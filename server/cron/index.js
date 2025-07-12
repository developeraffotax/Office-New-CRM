import cron from "node-cron";
import { setWatch } from "../utils/setWatch.js";
import { getSentReceivedCountsPerThread } from "../controllers/ticketController.js";
import { sendDatatoGoogleSheet } from "../utils/googleSheet.js";

export const setupCronJobs = () => {
  // Every 6 days at midnight
  cron.schedule("0 0 */6 * *", () => {
    console.log("🕒 Running setWatch every 6 days...");
    setWatch();
  });

  // Daily at 11:00 PM
  cron.schedule("0 23 * * *", () => {
    console.log("🕒 Running getSentReceivedCountsPerThread at 11 PM...");
    getSentReceivedCountsPerThread();
  });

  // Daily at 11:45 PM
  cron.schedule("45 23 * * *", () => {
    console.log("🕒 Running sendDatatoGoogleSheet at 11:45 PM...");
    sendDatatoGoogleSheet();
  });

  // Run immediately once at startup
  sendDatatoGoogleSheet();
  setWatch();
  getSentReceivedCountsPerThread();
};
