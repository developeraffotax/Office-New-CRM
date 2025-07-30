import leadModel from "../models/leadModel.js";
import ticketModel from "../models/ticketModel.js";

export const updateSendReceivedLeads = async () => {
  try {
    const leads = await leadModel.find({ status: "progress" }).lean();

    const updates = [];

    for (const lead of leads) {
      const clientName = lead.clientName?.trim();
      const clientEmail = lead.email?.trim();

      const filter = {
        state: { $ne: "complete" },
      };

      if (clientEmail) {
        filter.email = clientEmail;
      } else if (clientName) {
        filter.clientName = clientName;
      } else {
        continue; // skip if neither exists
      }

      const ticket = await ticketModel.findOne(filter).select("sent received");

      //   const totalSent = tickets.reduce((acc, t) => acc + (t.sent || 0), 0);
      //   const totalReceived = tickets.reduce((acc, t) => acc + (t.received || 0), 0);

      console.log("ticket", ticket);

      if (ticket) {
        updates.push({
          updateOne: {
            filter: { _id: lead._id },
            update: {
              $set: {
                sent: ticket?.sent,
                received: ticket?.received,
              },
            },
          },
        });
      }
    }

    if (updates.length > 0) {
      await leadModel.bulkWrite(updates);
      console.log(
        `[Leads Sync] Updated ${updates.length} leads with sent/received counts.`
      );
    } else {
      console.log("[Leads Sync] No matching leads to update.");
    }
  } catch (err) {
    console.error("Error in updateSendReceivedLeads:", err);
  }
};
