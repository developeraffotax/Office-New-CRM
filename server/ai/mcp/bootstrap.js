// Register the CRM models the tools look up by name, then connect Mongo.
export async function bootCrm() {
  await import("../../models/userModel.js");
  await import("../../models/roleModel.js");
  await import("../../models/taskModel.js");
  await import("../../models/jobsModel.js");
  await import("../../models/leadModel.js");
  await import("../../models/ticketModel.js");
  const { connectDB } = await import("../../config/db.js");
  await connectDB();
}
