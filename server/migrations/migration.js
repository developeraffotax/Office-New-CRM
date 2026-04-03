import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/userModel.js";
import EmailThread from "../emailModule/models/EmailThread.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]); // force IPv4 DNS

const ADMIN_USER_ID = "66cc48db9875942c91de45ac"; // replace with your real admin ObjectId RASHID ID

const runMigration = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://developeraffotax:developer%402024%24@cluster0.aodvoa5.mongodb.net/test_newcrmoffice`,
      { serverSelectionTimeoutMS: 30000, family: 4 }
    );

    console.log("Migration started...");

    const cursor = EmailThread.find({}).cursor();
    const bulkOps = [];

    for (let thread = await cursor.next(); thread != null; thread = await cursor.next()) {
      // Start fresh readBy array
      const readBy = [
        { userId: new mongoose.Types.ObjectId(ADMIN_USER_ID), lastReadAt: new Date() },
      ];

      // Include assigned user if exists and is not admin
      if (thread.userId && thread.userId.toString() !== ADMIN_USER_ID) {
        readBy.push({ userId: thread.userId, lastReadAt: new Date() });
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: thread._id },
          update: { $set: { readBy } },
        },
      });

      // Execute in batches to avoid memory issues
      if (bulkOps.length === 500) {
        await EmailThread.bulkWrite(bulkOps);
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length) {
      await EmailThread.bulkWrite(bulkOps);
    }

    console.log("Migration completed.");
    process.exit();
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();