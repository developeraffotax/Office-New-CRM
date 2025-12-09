




import mongoose from "mongoose";
import Ticket from "./models/ticketModel.js";
import Task from "./models/taskModel.js";
import Lead from "./models/leadModel.js";
import Job from "./models/jobsModel.js";
import { generateRef } from "./utils/generateRef.js";

async function backfillRefs() {
  try {
    await mongoose.connect(
      "mongodb+srv://developeraffotax:developer%402024%24@cluster0.aodvoa5.mongodb.net/test_newcrmoffice"
    );
    console.log("MongoDB connected ✅");

    // ----- TASKS -----
    try {
      const tasks = await Task.find({  });
      if (tasks.length > 0) {
        const bulkOps = [];
        for (const t of tasks) {
          const ref = await generateRef("task");
          bulkOps.push({
            updateOne: {
              filter: { _id: t._id },
              update: { $set: { taskRef: ref } },
            },
          });
        }
        if (bulkOps.length > 0) {
          await Task.bulkWrite(bulkOps);
        }
      }
      console.log("Task refs added:", tasks.length);
    } catch (err) {
      console.error("Error updating tasks:", err);
    }

    // ----- TICKETS -----
    try {
      const tickets = await Ticket.find({ });
      if (tickets.length > 0) {
        const bulkOps = [];
        for (const tk of tickets) {
          const ref = await generateRef("ticket");
          bulkOps.push({
            updateOne: {
              filter: { _id: tk._id },
              update: { $set: { ticketRef: ref } },
            },
          });
        }
        if (bulkOps.length > 0) {
          await Ticket.bulkWrite(bulkOps);
        }
      }
      console.log("Ticket refs added:", tickets.length);
    } catch (err) {
      console.error("Error updating tickets:", err);
    }

    // ----- JOBS -----
    try {
      const jobs = await Job.find({ });
      if (jobs.length > 0) {
        const bulkOps = [];
        for (const job of jobs) {
          const ref = await generateRef("job");
          bulkOps.push({
            updateOne: {
              filter: { _id: job._id },
              update: { $set: { jobRef: ref } },
            },
          });
        }
        if (bulkOps.length > 0) {
          await Job.bulkWrite(bulkOps);
        }
      }
      console.log("Job refs added:", jobs.length);
    } catch (err) {
      console.error("Error updating jobs:", err);
    }

    // ----- LEADS -----
    try {
      const leads = await Lead.find({ });
      if (leads.length > 0) {
        const bulkOps = [];
        for (const lead of leads) {
          const ref = await generateRef("lead");
          bulkOps.push({
            updateOne: {
              filter: { _id: lead._id },
              update: { $set: { leadRef: ref } },
            },
          });
        }
        if (bulkOps.length > 0) {
          await Lead.bulkWrite(bulkOps);
        }
      }
      console.log("Lead refs added:", leads.length);
    } catch (err) {
      console.error("Error updating leads:", err);
    }

  } catch (err) {
    console.error("MongoDB connection error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected ✅");
    process.exit();
  }
}

// Run the script
backfillRefs();




























// import mongoose from "mongoose";
// import Ticket from "./models/ticketModel.js";
// import Task from "./models/taskModel.js";
// import Lead from "./models/leadModel.js";
// import Job from "./models/jobsModel.js";
// import { generateRef } from "./utils/generateRef.js";

// async function backfillRefs() {
//   try {
//     await mongoose.connect(
//       "mongodb+srv://developeraffotax:developer%402024%24@cluster0.aodvoa5.mongodb.net/test_newcrmoffice"
//     );
//     console.log("MongoDB connected ✅");

//     // ----- TASKS -----
//     try {
//       const tasks = await Task.find({ taskRef: { $exists: false } });
//       if (tasks.length > 0) {
//         const bulkOps = [];
//         for (const t of tasks) {
//           const ref = await generateRef("task");
//           bulkOps.push({
//             updateOne: {
//               filter: { _id: t._id },
//               update: { $set: { taskRef: ref } },
//             },
//           });
//         }
//         if (bulkOps.length > 0) {
//           await Task.bulkWrite(bulkOps);
//         }
//       }
//       console.log("Task refs added:", tasks.length);
//     } catch (err) {
//       console.error("Error updating tasks:", err);
//     }

//     // ----- TICKETS -----
//     try {
//       const tickets = await Ticket.find({ ticketRef: { $exists: false } });
//       if (tickets.length > 0) {
//         const bulkOps = [];
//         for (const tk of tickets) {
//           const ref = await generateRef("ticket");
//           bulkOps.push({
//             updateOne: {
//               filter: { _id: tk._id },
//               update: { $set: { ticketRef: ref } },
//             },
//           });
//         }
//         if (bulkOps.length > 0) {
//           await Ticket.bulkWrite(bulkOps);
//         }
//       }
//       console.log("Ticket refs added:", tickets.length);
//     } catch (err) {
//       console.error("Error updating tickets:", err);
//     }

//     // ----- JOBS -----
//     try {
//       const jobs = await Job.find({ jobRef: { $exists: false } });
//       if (jobs.length > 0) {
//         const bulkOps = [];
//         for (const job of jobs) {
//           const ref = await generateRef("job");
//           bulkOps.push({
//             updateOne: {
//               filter: { _id: job._id },
//               update: { $set: { jobRef: ref } },
//             },
//           });
//         }
//         if (bulkOps.length > 0) {
//           await Job.bulkWrite(bulkOps);
//         }
//       }
//       console.log("Job refs added:", jobs.length);
//     } catch (err) {
//       console.error("Error updating jobs:", err);
//     }

//     // ----- LEADS -----
//     try {
//       const leads = await Lead.find({ leadRef: { $exists: false } });
//       if (leads.length > 0) {
//         const bulkOps = [];
//         for (const lead of leads) {
//           const ref = await generateRef("lead");
//           bulkOps.push({
//             updateOne: {
//               filter: { _id: lead._id },
//               update: { $set: { leadRef: ref } },
//             },
//           });
//         }
//         if (bulkOps.length > 0) {
//           await Lead.bulkWrite(bulkOps);
//         }
//       }
//       console.log("Lead refs added:", leads.length);
//     } catch (err) {
//       console.error("Error updating leads:", err);
//     }

//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//   } finally {
//     await mongoose.disconnect();
//     console.log("MongoDB disconnected ✅");
//     process.exit();
//   }
// }

// // Run the script
// backfillRefs();
