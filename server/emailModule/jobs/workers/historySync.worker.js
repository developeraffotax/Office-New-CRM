// import { Worker } from "bullmq";
// import { connection } from "../../utils/ioredis.js";
// import { getGmailClient } from "../services/gmail.service.js";
// import { persistThread } from "../services/persistThread.js";

// const startWorker = async () => {
//   console.log("👷‍♂️ Gmail sync worker starting");
//   if (connection.status !== "ready") {
//     await new Promise(resolve => connection.once("ready", resolve));
//   }

//   console.log("👷‍♂️ Gmail sync worker started");

//   new Worker(
//     "gmail-sync-all",
//     async ({ data }) => {
//       const { companyName } = data;
//       console.log("📩 Processing job for company:", companyName);

//       const gmail = await getGmailClient(companyName);
//       let pageToken;

//       do {
//         const res = await gmail.users.threads.list({
//           userId: "me",
//           q: "in:inbox",
//           maxResults: 10, // smaller for testing
//           pageToken,
//         });

//         for (const { id: threadId } of res.data.threads || []) {
//           try {
//             await persistThread({ threadId, companyName });
//             console.log("✅ Thread persisted:", threadId);
//           } catch (err) {
//             console.error("❌ Failed to persist thread", threadId, err);
//           }
//         }

//         pageToken = res.data.nextPageToken;
//       } while (pageToken);
//     },
//     { connection }
//   );
// };

// startWorker();
