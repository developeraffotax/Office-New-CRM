// import { PubSub } from "@google-cloud/pubsub";
// import { JWT } from "google-auth-library";
// import { google } from "googleapis";
// import path from "path";
// import { fileURLToPath } from "url";
// import ticketModel from "../models/ticketModel.js";
// import userModel from "../models/userModel.js";
// import notificationModel from "../models/notificationModel.js";

// // Get __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Path for Credentials
// const CREDENTIALS_PATH = path.join( __dirname, "..", "config", "service-pubsub.json" );

// const pubSubClient = new PubSub({ projectId: "affotax-crm", keyFilename: CREDENTIALS_PATH, });

// const subscriptionName =
//   "projects/affotax-crm/subscriptions/ticket-notification-sub";


// // Scopes you need
// const SCOPES = [ "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/pubsub", ];
// // Create a JWT client using the Service Account key
// const jwtClient = new JWT({ keyFile: CREDENTIALS_PATH, scopes: SCOPES, subject: "info@affotax.com", });
// export function listenForMessages() {
//   const subscription = pubSubClient.subscription(subscriptionName);

//   const messageHandler = async (message) => {
//     // console.log("THE RECEIVED MESSAGE", message);
//     // console.log(`Received message: ${message.id}`);

//     try {
//       const data = Buffer.from(message.data, "base64").toString();
//       const { historyId } = JSON.parse(data);

//       await jwtClient.authorize();
//       const gmail = google.gmail({ version: "v1", auth: jwtClient });

//       // 1. Get History
//       const historyResponse = await gmail.users.history.list({
//         userId: "me",
//         startHistoryId: historyId,
//       });

//       const history = historyResponse.data.history;

//       if (history && history.length > 0) {
//         for (const item of history) {
//           console.log("ITEM", item.messages);
//           if (item.messages && item.messages.length > 0) {
//             for (const message of item.messages) {
//               // const messageId = addedMessage.message.id;
//               const threadId = message.threadId;

//               console.log("THREAD ID", threadId);

               

//               const ticket = await findTicketByThreadId(threadId);
//               console.log("TICKET", ticket);

//               if (ticket) {
//                 await createNotification(ticket);
//               } else {
//                 console.log("TICKET NOT FOUND");
//               }












//             }
//           }
//         }
//       } else {
//         console.log("No new messages related to historyId:", historyId);
//       }
//     } catch (error) {
//       console.error("Error processing message:", error);
//     } finally {
//       message.ack();
//     }
//   };

//   subscription.on("message", messageHandler);
// }





// const findTicketByThreadId = async (threadId) => {
//   const ticket = await ticketModel.findOne({ mailThreadId: threadId });
//   return ticket;
// }


// const findUsersToNotify = async (ticket) => {
//   const lastMessageSentBy = await userModel.findOne({ name: ticket.lastMessageSentBy });
//   const jobHolder = await userModel.findOne({ name: ticket.jobHolder });
//   return { lastMessageSentBy, jobHolder };
// }



// const createNotification = async (ticket) => {
//   const { lastMessageSentBy, jobHolder } = await findUsersToNotify(ticket);
//   console.log("LAST MESSAGE SENT BY", lastMessageSentBy);
//   console.log("JOB HOLDER", jobHolder);

//   const notification1 = await notificationModel.create({
//     title: "Reply to a ticket received",
//     redirectLink: `/ticket/detail/${ticket._id}`,
//     description: `You've received a response to a ticket with the subject "${ticket.subject}" from the company "${ticket.companyName}" and the client's name "${ticket.clientName}".`,
//     taskId: ticket._id,
//     userId: lastMessageSentBy,
//   });

//   const notification2 = await notificationModel.create({  
//     title: "Reply to a ticket received",
//     redirectLink: `/ticket/detail/${ticket._id}`,
//     description: `You've received a response to a ticket with the subject "${ticket.subject}" from the company "${ticket.companyName}" and the client's name "${ticket.clientName}".`,
//     taskId: ticket._id,
//     userId: jobHolder,
//   });

   
// }


