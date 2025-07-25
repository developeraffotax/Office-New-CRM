import Agenda from "agenda";
import { io, onlineUsers } from "../index.js";
import Reminder from "../models/reminderModel.js";
 
// import { sendFirebaseNotification } from "./utils/firebase.js";

const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });
 


agenda.define("send reminder", async (job) => {
  const { reminderId } = job.attrs.data;
  const reminder = await Reminder.findById(reminderId).populate("userId");

  if (!reminder) return;

  const userId = reminder.userId._id.toString();

  const sockets = onlineUsers.get(userId);


  const payload = {
    _id: reminder._id.toString(),
    title: reminder.title,
    description: reminder.description,
    taskId: reminder.taskId,
    redirectLink: reminder.redirectLink,
    isRead: reminder.isRead,
    isCompleted: reminder.isCompleted,
    scheduledAt: reminder.scheduledAt
  };

  if (sockets && sockets.size > 0) {
    sockets.forEach((socketId) => {
      agenda.io.to(socketId).emit("receive_reminder", payload);
    });
  } 
//   else if (reminder.userId.fcmToken) {
//     // Fallback to Firebase
//     await sendFirebaseNotification(reminder.userId.fcmToken, payload);
//   }
});

// Start agenda
await agenda.start();

export default agenda;
