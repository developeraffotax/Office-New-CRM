// import GmailHistory from "../models/gmailHistoryModel.js";

// /**
//  * Acquire a lock per company
//  */
// export async function acquireHistoryLock(companyName) {
//   const now = new Date();
//   const lockExpiry = new Date(now.getTime() - 60_000); // 1 min timeout

//   return GmailHistory.findOneAndUpdate(
//     {
//       companyName,
//       $or: [
//         { lockedAt: null },
//         { lockedAt: { $lt: lockExpiry } },
//       ],
//     },
//     { lockedAt: now },
//     { new: true, upsert: true }
//   );
// }

// /**
//  * Release lock & update historyId
//  */
// export async function updateHistoryAndReleaseLock(
//   companyName,
//   historyId
// ) {
//   await GmailHistory.findOneAndUpdate(
//     { companyName },
//     {
//       lastHistoryId: historyId,
//       lockedAt: null,
//     }
//   );
// }
