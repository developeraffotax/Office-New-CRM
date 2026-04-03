import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/userModel.js";
import EmailThread from "./emailModule/models/EmailThread.js";
import { connectDB } from "./config/db.js";
 

const runMigration = async () => {
  try {
    connectDB()

    console.log("Migration started...");

    // Get all users who should have read tracking
    const users = await User.find({}, { _id: 1, isActive: true });

    const bulkOps = [];

    const cursor = EmailThread.find({}).cursor();

    for (let thread = await cursor.next(); thread != null; thread = await cursor.next()) {

      const updates = [];

      for (const user of users) {

        // let lastReadAt = null;

        // if (thread.lastMessageAtInbox) {

        //   if (thread.unreadCount === 0) {
        //     // Already read
        //     lastReadAt = thread.lastMessageAtInbox;

        //   } else {
        //     // Unread
        //     lastReadAt = new Date(
        //       thread.lastMessageAtInbox.getTime() - 1000
        //     );
        //   }

        // }

        updates.push({
          userId: user._id,
          lastReadAt: new Date(),
        });
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: thread._id },
          update: {
            $set: { readBy: updates },
          },
        },
      });

      // Run in batches
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