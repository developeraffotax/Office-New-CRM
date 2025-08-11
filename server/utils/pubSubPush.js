import { PubSub } from "@google-cloud/pubsub";
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import ticketModel from "../models/ticketModel.js";
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";
import gmailModel from "../models/gmailModel.js";
import { io, onlineUsers } from "../index.js";

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for Credentials
const CREDENTIALS_PATH = path.join(
  __dirname,
  "..",
  "creds",
  "service-pubsub.json"
);

// Scopes you need
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/pubsub",
];
// Create a JWT client using the Service Account key
const jwtClient = new JWT({
  keyFile: CREDENTIALS_PATH,
  scopes: SCOPES,
  subject: "info@affotax.com",
});

export async function gmailWebhookHandler(req, res) {
  const { message } = req.body;

  console.log("MESSAGE", message);

  try {
    const data = Buffer.from(message.data, "base64").toString();
    const { historyId } = JSON.parse(data);
    console.log("DATA:>>>", data);
    await jwtClient.authorize();
    const gmail = google.gmail({ version: "v1", auth: jwtClient });

    const lastDoc = await gmailModel.findOne({}).sort({ _id: -1 });
    // 1. Get History
    const historyResponse = await gmail.users.history.list({
      userId: "me",
      startHistoryId: lastDoc.last_history_id,
      historyTypes: ["messageAdded"],
    });

    await gmailModel.create({
      last_history_id: historyResponse.data.historyId,
    });

    const history = historyResponse.data.history;

    if (history && history.length > 0) {
      for (const item of history) {
        if (item.messagesAdded && item.messagesAdded.length > 0) {
          for (const message of item.messagesAdded) {
            const messageId = message.message.id;

            const threadId = message.message.threadId;

            const emailResponse = await gmail.users.messages.get({
              userId: "me",
              id: messageId,
              format: "metadata", // Request only metadata for efficiency
              metadataHeaders: ["From"], // Specify the headers you need
            });

            const headers = emailResponse.data.payload.headers;
            const fromHeader = headers.find((header) => header.name === "From");

            console.log("fromHeader", fromHeader);

            const text = fromHeader ? fromHeader.value : null;

            // Regular expression to extract email address inside angle brackets
            const pattern = /<([^>]+)>/;

            // Search for the email
            const senderEmail = text.match(pattern)[1];

            console.log("SenderEmail>>>>>", senderEmail);

            // Replace 'your_email@example.com' with the actual email address
            const yourEmail = "info@affotax.com";

            if (senderEmail && senderEmail !== yourEmail) {
              const ticket = await findTicketByThreadId(threadId);
              console.log("TICKET", ticket);

              if (ticket) {
                await createNotification(ticket);
              } else {
                console.log("TICKET NOT FOUND");
              }
            }
          }
        }
      }
    } else {
      console.log("No new messages related to historyId:", historyId);
    }

    res.status(200).send("Notification received");
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).send("Error processing message");
  }
}



const findTicketByThreadId = async (threadId) => {
  const ticket = await ticketModel.findOne({ mailThreadId: threadId });
  return ticket;
};



const findUsersToNotify = async (ticket) => {
  const lastMessageSentBy = await userModel.findOne({
    name: ticket.lastMessageSentBy,
  });
  const jobHolder = await userModel.findOne({ name: ticket.jobHolder });

  return { lastMessageSentBy, jobHolder };
};











const sendSocketNotification = (notification, userId) => {
  const toSocketIds = onlineUsers.get(userId?.toString());

  if (toSocketIds && toSocketIds.size > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("newNotification", {
        notification,
      });
    }
  }
}




const createNotification = async (ticket) => {
  const { lastMessageSentBy, jobHolder } = await findUsersToNotify(ticket);

  

  const notification1 = await notificationModel.create({
    title: "Reply to a ticket received",
    redirectLink: `/ticket/detail/${ticket._id}`,
    description: `You've received a response to a ticket with the subject "${ticket.subject}" from the company "${ticket.companyName}" and the client's name "${ticket.clientName}".`,
    taskId: ticket._id,
    userId: jobHolder?._id,
    type: "ticket_received"
  });

  sendSocketNotification(notification1, jobHolder?._id);




  

  if(jobHolder?._id?.toString() !== lastMessageSentBy?._id?.toString()) {
    const notification2 = await notificationModel.create({
      title: "Reply to a ticket received",
      redirectLink: `/ticket/detail/${ticket._id}`,
      description: `You've received a response to a ticket with the subject "${ticket.subject}" from the company "${ticket.companyName}" and the client's name "${ticket.clientName}".`,
      taskId: ticket._id,
      userId: lastMessageSentBy?._id,
      type: "ticket_received"
    });

    sendSocketNotification(notification2, lastMessageSentBy?._id);
  }


  



};






