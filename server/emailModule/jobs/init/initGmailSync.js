// services/initialGmailSync.js
import dotenv from "dotenv";
dotenv.config();


import { getGmailClient } from "../../services/gmail.service.js";
import { persistThread } from "../../services/persistThread.js";
import { connectDB } from "../../../config/db.js";
 

/**
 * Directly sync Gmail threads for a company
 * @param {string} companyName
 */
export const syncGmailThreads = async (companyName) => {
  try {
    console.log(`👷‍♂️ Starting Gmail sync for company: ${companyName}`);

     try {
        // 1️⃣ Connect to MongoDB
        await connectDB();
        console.log("✅ MongoDB connected for Gmail History Sync Worker");
      } catch (err) {
        console.error("❌ Failed to connect MongoDB:", err);
        process.exit(1);
      }


    const gmail = await getGmailClient(companyName);

    let pageToken;
    let threadCount = 0;

    do {
      const res = await gmail.users.threads.list({
          userId: "me",
          q: "after:2025/01/01 (in:inbox OR in:sent)",
          maxResults: 50, // adjust as needed
          pageToken,
        });

      const threads = res.data.threads || [];
      console.log(`⏳ Fetched ${threads.length} threads from Gmail`);

      for (const { id: threadId } of threads) {
        try {
          await persistThread({ threadId, companyName });
          threadCount++;
          console.log(`✅ Thread persisted: ${threadId}`);
        } catch (err) {
          console.error(`❌ Failed to persist thread ${threadId}:`, err.message);
        }
      }

      pageToken = res.data.nextPageToken;
    } while (pageToken);

    console.log(`✅ Gmail sync completed for ${companyName}. Total threads processed: ${threadCount}`);
    return threadCount;
  } catch (err) {
    console.error("❌ Gmail sync failed:", err.message);
    throw err; // propagate if needed
  }
};

// Example usage
(async () => {
  await syncGmailThreads("affotax");
  // await syncGmailThreads("outsource");
})();
