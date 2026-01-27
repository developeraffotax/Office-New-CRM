import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

 
import { Worker } from "bullmq";
import { createRedisClient, connection as redis } from "../../utils/ioredis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server as SocketIOServer } from "socket.io";
import userModel from "../../models/userModel.js";
import notificationModel from "../../models/notificationModel.js";
import { connectDB } from "../../config/db.js";

 

// ---------------------------
// CONNECT MONGO
// ---------------------------
await connectDB();
console.log("✅ MongoDB connected for worker");

// ---------------------------
// INIT SOCKET.IO WITH REDIS ADAPTER
// ---------------------------
const pubClient = createRedisClient();
const subClient = createRedisClient();

await Promise.all([
  new Promise((res) => pubClient.once("ready", res)),
  new Promise((res) => subClient.once("ready", res)),
]);

const io = new SocketIOServer(); // no HTTP server
io.adapter(createAdapter(pubClient, subClient));
console.log("🔗 Worker Socket.IO Redis Adapter initialized");

// ---------------------------
// HELPER: SEND SOCKET NOTIFICATION
// ---------------------------
const sendSocketNotification = async (notification, ticket, userId) => {
  if (!userId) return;

  const sockets = await redis.smembers(`sockets:user:${userId.toString()}`);
  if (!sockets || sockets.length === 0) return;

  for (const socketId of sockets) {
    io.to(socketId).emit("newNotification", { notification });
    io.to(socketId).emit("ticket-updated", {
      ticketId: ticket._id,
      status: ticket.status,
      unreadCount: ticket.unreadCount,
    });
  }
};

// ---------------------------
// PROCESS NOTIFICATION JOB
// ---------------------------
const processNotificationJob = async (job) => {
  const { ticket } = job.data;

  const lastMessageSentBy = await userModel.findOne({ name: ticket.lastMessageSentBy });
  const jobHolder = await userModel.findOne({ name: ticket.jobHolder });

  // Notification to jobHolder
  if (jobHolder) {
    const notification1 = await notificationModel.create({
      title: "Reply to a ticket received",
      redirectLink: `/ticket/detail/${ticket._id}`,
      description: `You've received a response to a ticket with the subject "${ticket.subject}" from "${ticket.companyName}" and client "${ticket.clientName}".`,
      taskId: ticket._id,
      userId: jobHolder._id,
      type: "ticket_received",
    });
    await sendSocketNotification(notification1, ticket, jobHolder._id);
  }

  // Notification to lastMessageSentBy if different
  if (lastMessageSentBy && lastMessageSentBy._id.toString() !== jobHolder?._id?.toString()) {
    const notification2 = await notificationModel.create({
      title: "Reply to a ticket received",
      redirectLink: `/ticket/detail/${ticket._id}`,
      description: `You've received a response to a ticket with the subject "${ticket.subject}" from "${ticket.companyName}" and client "${ticket.clientName}".`,
      taskId: ticket._id,
      userId: lastMessageSentBy._id,
      type: "ticket_received",
    });
    await sendSocketNotification(notification2, ticket, lastMessageSentBy._id);
  }

  return true;
};

// ---------------------------
// INIT WORKER
// ---------------------------
const initNotificationWorker = () => {
  const worker = new Worker("notificationQueue", processNotificationJob, { connection: redis });

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
