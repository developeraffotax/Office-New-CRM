// // workers/initialSync.worker.js

// import dotenv from "dotenv";
// import path from "path";

// dotenv.config();

 

// import { Worker } from "bullmq";
// import { connection } from "../../../utils/ioredis.js";

// import { getGmailClient } from "../../services/gmail.service.js";
// import { persistThread } from "../../services/persistThread.js";

// /**
//  * Start Gmail sync worker
//  */
// const startWorker = async () => {
//   // Wait for Redis to be ready
//   if (connection.status !== "ready") {
//     console.log("⏳ Waiting for Redis to be ready...");
//     await new Promise((resolve) => connection.once("ready", resolve));
//   }

//   console.log("👷‍♂️ Gmail sync worker started and listening for jobs...");

//   new Worker(
//     "gmail-sync-all",
//     async ({ data }) => {
//       const { companyName } = data;
//       console.log(`📩 Processing Gmail sync for company: ${companyName}`);

//       const gmail = await getGmailClient(companyName);

//       let pageToken;
//       let threadCount = 0;

//       do {
//         const res = await gmail.users.threads.list({
//           userId: "me",
//           q: "in:inbox",
//           maxResults: 50, // you can reduce for testing
//           pageToken,
//         });

//         const threads = res.data.threads || [];
//         console.log(`⏳ Fetched ${threads.length} threads from Gmail`);

//         for (const { id: threadId } of threads) {
//           try {
//             await persistThread({ threadId, companyName });
//             threadCount++;
//             console.log(`✅ Thread persisted: ${threadId}`);
//           } catch (err) {
//             console.error("❌ Failed to persist thread", threadId, err);
//           }
//         }

//         pageToken = res.data.nextPageToken;
//       } while (pageToken);

//       console.log(`✅ Completed job for ${companyName}. Total threads processed: ${threadCount}`);
//     },
//     {
//       connection,
    
//     }
//   );
// };

// // Start the worker
// startWorker();

 