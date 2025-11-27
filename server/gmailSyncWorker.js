import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import cron from "node-cron";
import ticketModel from "./models/ticketModel.js";
import { getAllEmails } from "./utils/gmailApi.js";
import {
  
  getLatestSentMessageByUs,
  
} from "./utils/gmailWorkerUtlity.js";

// Connect to MongoDB
await connectDB();

console.log("📬 Gmail Sync Worker Started...");

// Your email addresses
const ourEmails = ["info@affotax.com", "admin@outsourceaccountings.co.uk"];

// ─────────────────────────────────────
// SYNC FUNCTION
// ─────────────────────────────────────
const syncGmail = async () => {
  console.log("⏳ Running Gmail Sync Job...");

  try {
    // 1. Fetch valid tickets
    const ticketsList = await ticketModel.find(
      { mailThreadId: { $exists: true, $ne: "" }, state: "progress" },
      { _id: 1, mailThreadId: 1, company: 1 }
    );

    if (!ticketsList.length) {
      console.log("⚠️ No tickets with threadId found.");
      return;
    }

    // 2. Fetch email threads for those tickets
    const { detailedThreads } = await getAllEmails(ticketsList);

    if (!detailedThreads) {
      console.log("⚠️ No thread details found.");
      return;
    }

    // 3. Process each thread
    for (const thread of detailedThreads) {
      const messages = thread.threadData?.messages || [];
      if (!messages.length) continue;

      // Latest message in the thread
      // const latestMsg = messages[messages.length - 1];
       
      // Determine status
      const lastMessageStatus =  thread.readStatus ;

      // 4. Find most recent message SENT BY US
      const latestSentMsg = getLatestSentMessageByUs(messages, ourEmails);

      // 5. Fetch matching ticket
      const ticket = await ticketModel.findOne({
        mailThreadId: thread.threadId,
      });

      if (!ticket) continue;

      console.log(
        `Processing threadId: ${thread.threadId}, Ticket: ${ticket._id}`
      );

      // 6. Prepare update payload
      const updates = { status: lastMessageStatus };

      if (latestSentMsg) {
        const lastSentTs = new Date(parseInt(latestSentMsg.internalDate));

        const shouldUpdate =
          !ticket.lastMessageSentTime ||
          new Date(ticket.lastMessageSentTime) < lastSentTs;

        if (shouldUpdate) {
          updates.lastMessageSentTime = lastSentTs;
        }
      }

      // 7. Update only if needed
      if (Object.keys(updates).length > 0) {
        await ticketModel.findByIdAndUpdate(ticket._id, updates);
      } else {
        console.log(`ℹ️ Nothing to update for ticket ${ticket._id}`);
      }
    }

    console.log("🎉 Gmail Sync Job Completed Successfully.");
  } catch (err) {
    console.error(
      "❌ Gmail Sync Job Failed:",
      err?.response?.data || err?.message
    );
  }
};

// Run on startup
syncGmail();

// Run every 3 hours
cron.schedule("0 2 * * *", async () => {
  await syncGmail();
});
