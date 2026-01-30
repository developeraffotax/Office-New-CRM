// import ticketModel from "../models/ticketModel.js";
// import { addNotificationJob } from "../jobs/queues/notificationQueue.js";

// /**
//  * Batch unread updates per thread
//  */
// export async function processUnreadThreads(threadIds) {
//   if (!threadIds.length) return;

//   const tickets = await ticketModel.find({
//     mailThreadId: { $in: threadIds },
//   });

//   if (!tickets.length) return;

//   const bulkOps = tickets.map(t => ({
//     updateOne: {
//       filter: { _id: t._id },
//       update: {
//         $set: { status: "Unread" },
//         $inc: { unreadCount: 1 },
//       },
//     },
//   }));

//   await ticketModel.bulkWrite(bulkOps);

//   // fire notifications async (non-blocking)
//   for (const ticket of tickets) {
//     addNotificationJob({ ticket });
//   }
// }
