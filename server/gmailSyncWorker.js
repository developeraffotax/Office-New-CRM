import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import cron from "node-cron";
import ticketModel from "./models/ticketModel.js";
import { getAllEmails } from "./utils/gmailApi.js";
import { getLatestSentMessageByUs } from "./utils/gmailWorkerUtlity.js";

const ourEmails = ["info@affotax.com", "admin@outsourceaccountings.co.uk"];

// ─────────────────────────────────────
// SYNC FUNCTION
// ─────────────────────────────────────
const syncGmail = async () => {
  console.log("⏳ Running Gmail Sync Job...");

  try {
    const ticketsList = await ticketModel.find(
      { mailThreadId: { $exists: true, $ne: "" }, state: "progress" },
      { _id: 1, mailThreadId: 1, company: 1 }
    );

    if (!ticketsList.length) {
      console.log("⚠️ No tickets with threadId found.");
      return;
    }

    const { detailedThreads } = await getAllEmails(ticketsList);
    if (!detailedThreads) {
      console.log("⚠️ No thread details found.");
      return;
    }

    for (const thread of detailedThreads) {
      const messages = thread.threadData?.messages || [];
      if (!messages.length) continue;

      const lastMessageStatus = thread.readStatus;
      const latestSentMsg = getLatestSentMessageByUs(messages, ourEmails);

      const ticket = await ticketModel.findOne({ mailThreadId: thread.threadId });
      if (!ticket) continue;

      console.log(`Processing threadId: ${thread.threadId}, Ticket: ${ticket._id}`);

      const updates = { status: lastMessageStatus };

      if (latestSentMsg) {
        const lastSentTs = new Date(parseInt(latestSentMsg.internalDate));
        if (!ticket.lastMessageSentTime || new Date(ticket.lastMessageSentTime) < lastSentTs) {
          updates.lastMessageSentTime = lastSentTs;
        }
      }

      if (Object.keys(updates).length > 0) {
        await ticketModel.findByIdAndUpdate(ticket._id, updates);
      } else {
        console.log(`ℹ️ Nothing to update for ticket ${ticket._id}`);
      }
    }

    console.log("🎉 Gmail Sync Job Completed Successfully.");
  } catch (err) {
    console.error("❌ Gmail Sync Job Failed:", err?.response?.data || err?.message);
  }
};

// ─────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────
const startWorker = async () => {
  try {
    await connectDB(); // ✅ Wait for DB to connect before doing anything
    console.log("📬 Gmail Sync Worker Started...");

    // Run immediately
    await syncGmail();

    // Schedule cron
    cron.schedule("0 2 * * *", async () => {
      await syncGmail();
    });
  } catch (err) {
    console.error("❌ Worker failed to start:", err);
    process.exit(1);
  }
};

startWorker();
