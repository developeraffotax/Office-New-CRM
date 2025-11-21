import Agenda from "agenda";
import { io } from "../index.js";
// import { connection as redis } from "../utils/ioredis.js";
import Reminder from "../models/reminderModel.js";
import { safeRedisSmembers } from "./safeRedisSmembers.js";

// import { sendFirebaseNotification } from "./utils/firebase.js";

const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

agenda.define("send reminder", async (job) => {
  const { reminderId } = job.attrs.data;
  const reminder = await Reminder.findById(reminderId).populate("userId");

  if (!reminder || !reminder.userId) return;

  const userId = reminder.userId._id.toString();

  // Fetch all socket IDs for this user from Redis
 // const sockets = await redis.smembers(`sockets:user:${userId}`);
  const sockets = await safeRedisSmembers(`sockets:user:${userId}`);

  const payload = {
    _id: reminder._id.toString(),
    title: reminder.title,
    description: reminder.description,
    taskId: reminder.taskId,
    redirectLink: reminder.redirectLink,
    isRead: reminder.isRead,
    isCompleted: reminder.isCompleted,
    scheduledAt: reminder.scheduledAt,
  };

  if (sockets && sockets.length > 0) {
    console.log(`Sending reminder to user:${userId} → sockets:`, sockets);
    for (const socketId of sockets) {
      console.log("Sending to socket: 💜", socketId);
      io.to(socketId).emit("receive_reminder", payload);
    }
  } 
  // else if (reminder.userId.fcmToken) {
  //   // Fallback to Firebase
  //   await sendFirebaseNotification(reminder.userId.fcmToken, payload);
  // }
});

// Start agenda
await agenda.start();

export default agenda;
