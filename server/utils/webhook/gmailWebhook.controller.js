// import { getGmailClient } from "../../emailModule/services/gmail.service.js";
// import {
//   acquireHistoryLock,
//   updateHistoryAndReleaseLock,
// } from "../services/gmailHistory.service.js";
// import { processUnreadThreads } from "../services/gmailNotification.service.js";
// import { enqueueThreadSync } from "../services/gmailSync.service.js";

// /* -------- helpers -------- */

// function collectThreadIds(history = []) {
//   const ids = new Set();

//   for (const item of history) {
//     item.messagesAdded?.forEach(m => ids.add(m.message.threadId));
//     item.messagesDeleted?.forEach(m => ids.add(m.message.threadId));

//     [...(item.labelsAdded || []), ...(item.labelsRemoved || [])]
//       .forEach(l => ids.add(l.message.threadId));
//   }

//   return [...ids];
// }

// /* -------- main handler -------- */

// export function gmailWebhookHandler({ companyName, yourEmail }) {
//   return async (req, res) => {
//     try {
//       const { message } = req.body;
//       const decoded = Buffer.from(message.data, "base64").toString();
//       const { historyId } = JSON.parse(decoded);

//       /* 🧵 lock */
//       const historyDoc = await acquireHistoryLock(companyName);
//       if (!historyDoc) {
//         return res.status(200).send("Locked – skipping");
//       }

//       const gmail = await getGmailClient(companyName);

//       const historyResponse = await gmail.users.history.list({
//         userId: "me",
//         startHistoryId: historyDoc.lastHistoryId,
//         historyTypes: [
//           "messageAdded",
//           "messageDeleted",
//           "labelAdded",
//           "labelRemoved",
//         ],
//       });

//       const history = historyResponse.data.history || [];
//       const threadIds = collectThreadIds(history);

//       /* ⚡ batch unread + notifications */
//       await processUnreadThreads(threadIds);

//       /* 📦 sync threads */
//       await enqueueThreadSync(companyName, threadIds);

//       /* ✅ update history + unlock */
//       await updateHistoryAndReleaseLock(
//         companyName,
//         historyResponse.data.historyId
//       );

//       res.status(200).send("Webhook processed");
//     } catch (err) {
//       console.error("Gmail webhook error:", err);
//       res.status(500).send("Webhook failed");
//     }
//   };
// }
