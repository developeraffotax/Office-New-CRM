import mongoose from "mongoose";
import taskModel from "./taskModel.js";

const migrateTasks = async () => {
  try {
    await mongoose.connect("mongodb+srv://developeraffotax:developer%402024%24@cluster0.aodvoa5.mongodb.net/newcrmoffice");

     
    // Bulk update with $toObjectId
    const result = await taskModel.updateMany(
      { "project._id": { $exists: true } },
      [
        {
          $set: {
            project: { $toObjectId: "$project._id" } // convert string -> ObjectId
          }
        }
      ]
    );

    console.log(`✅ Migration complete 🚀
    Matched: ${result.matchedCount}
    Modified: ${result.modifiedCount}`);

    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrateTasks();
