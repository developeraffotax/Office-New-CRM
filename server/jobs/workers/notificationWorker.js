import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Worker } from "bullmq";
import { connection as redis } from "../../utils/ioredis.js";

import userModel from "../../models/userModel.js";
import notificationModel from "../../models/notificationModel.js";
import { connectDB } from "../../config/db.js";
import { getSocketEmitter } from "../../utils/getSocketEmitter.js";
import EmailThread from "../../emailModule/models/EmailThread.js";
import roleModel from "../../models/roleModel.js";

// ---------------------------
// CONNECT MONGO
// ---------------------------
await connectDB();
console.log("✅ MongoDB connected for worker");

// ---------------------------
// INIT SOCKET.IO
// ---------------------------
const io = await getSocketEmitter();
console.log("🔗 Worker Socket.IO Redis Adapter initialized");

// ---------------------------
// GENERIC SOCKET NOTIFICATION
// ---------------------------
const sendSocketNotification = async (
  notification,
  payload,
  userId,
  type = "ticket",
) => {
  if (!userId) return;

  const sockets = await redis.smembers(`sockets:user:${userId.toString()}`);
  if (!sockets || sockets.length === 0) return;

  for (const socketId of sockets) {
    io.to(socketId).emit("newNotification", { notification });

    // For tickets, emit additional ticket info
    if (type === "ticket" && payload?._id) {
      io.to(socketId).emit("ticket-updated", {
        ticketId: payload._id,
        status: payload.status,
        unreadCount: payload.unreadCount,
      });
    }
  }
};

// ---------------------------
// PROCESS NOTIFICATION JOB (GENERIC)
// ---------------------------
const processNotificationJob = async (job) => {
  const { type, payload } = job.data;

  if (!type || !payload) return true;

  switch (type) {
    case "ticket": {
      // Ticket notification
      const { ticket } = payload;
      if (!ticket) return true;

      const jobHolder = await userModel.findOne({ name: ticket.jobHolder });
      // const lastMessageSentBy = await userModel.findOne({ name: ticket.lastMessageSentBy, });

      const recipients = [];
      if (jobHolder)
        recipients.push({
          user: jobHolder,
          title: "Reply to a ticket received",
        });
      // if (
      //   lastMessageSentBy &&
      //   lastMessageSentBy._id.toString() !== jobHolder?._id?.toString()
      // ) {
      //   recipients.push({
      //     user: lastMessageSentBy,
      //     title: "Reply to a ticket received",
      //   });
      // }

      for (const { user, title } of recipients) {
        const notification = await notificationModel.create({
          title,
          redirectLink: `/ticket/detail/${ticket._id}`,
          description: `You've received a response to a ticket with the subject "${ticket.subject}" from "${ticket.companyName}" and client "${ticket.clientName}".`,
          taskId: ticket._id,
          userId: user._id,
          type: "ticket_received",
          entityType: "ticket",
        });

        await sendSocketNotification(notification, ticket, user._id, "ticket");
      }
      break;
    }

    case "inbox": {
      // Inbox / email notification
      const { threadId, senderEmail } = payload;

      const thread = await EmailThread.findOne({ threadId: threadId }).lean();

      if (!thread) return true;

      const myEmail =
        thread.companyName === "affotax"
          ? "info@affotax.com"
          : "Admin@outsourceaccountings.co.uk";

      // ONLY notify if sender is not the current user
      if (senderEmail.toLowerCase() === myEmail.toLowerCase()) return true;

      const notification = await notificationModel.create({
        title: `New email received: ${thread?.subject}`,
        redirectLink: `/mail?folder=inbox&companyName=${thread?.companyName}`,

        description: `${thread?.snippet || "You have received a new email"}
          ✔ Subject: ${thread?.subject}
          ✔ From: ${senderEmail}
          `,
        taskId: threadId,
        userId: thread.userId,
        type: "email_received",
        entityType: "mailbox",
        // meta: { receivedAt },
      });

      await sendSocketNotification(
        notification,
        thread,
        thread?.userId,
        "inbox",
      );
      break;
    }

    case "quote": {
      const { threadId, senderEmail, subject, companyName } = payload;

      const adminRole = await roleModel.findOne({ name: "Admin" });
      if (!adminRole) return true;

      const admins = await userModel
        .find({
          role: adminRole._id,
          isActive: true,
        })
        .select("_id");

      if (!admins.length) return true;

      const now = new Date();

      const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true, });
      const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", });

      // 🔥 Create notifications in parallel
      const notifications = await Promise.all(
        admins.map((admin) =>
          notificationModel.create({
            title: `New Quote Request!`,
            redirectLink: `/mail?folder=inbox&companyName=${companyName}`,
            description: `🔥 NEW QUOTE
              📩 Subject  : ${subject || "No Subject"}
              📅 Received : ${time} | ${date}`,
            taskId: threadId,
            userId: admin._id,
            type: "email_received",
            entityType: "mailbox",
          }),
        ),
      );

      // 🔥 Send socket notifications
      await Promise.all(
        notifications.map((notification) =>
          sendSocketNotification(
            notification,
            payload,
            notification.userId,
            "quote",
          ),
        ),
      );

      break;
    }


    case "whatsapp": {
      const { _id, companyName, phone, profileName, lastMessage, userId, } = payload;

      if (!userId) return true;

      const notification = await notificationModel.create({
        title: "New Whatsapp Message Received",
        redirectLink: `/whatsapp/${_id}?companyName=${companyName}&search=${phone}`,
        description: `New Message | ${companyName}
                    ✔ From: ${profileName || phone || "N/A"}
                    ✔ Message: ${lastMessage || "No messages yet"}
              `,
        taskId: `${phone}`,
        userId: userId,
        type: "conversation_assigned",
        entityType: `whatsapp`,
      });

      await sendSocketNotification(
        notification,
        payload,
        userId,
        "whatsapp"
      );

      break;
    }

    default:
      console.warn(`⚠️ Unknown notification type: ${type}`);
  }

  return true;
};










// ---------------------------
// INIT WORKER
// ---------------------------
const initNotificationWorker = () => {
  const worker = new Worker("notificationQueue", processNotificationJob, {
    connection: redis,
  });

  worker.on("completed", (job) => {
    console.log(`✅ Notification job completed: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Notification job failed: ${job.id}`, err);
  });

  console.log("🚀 Notification worker started...");
  return worker;
};

initNotificationWorker();
