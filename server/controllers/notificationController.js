import notificationModel from "../models/notificationModel.js";
import Conversation from "../whatsappModule/models/WhatsappConversation.js";
import Thread from "../emailModule/models/EmailThread.js";

import moment from "moment";
import { getNotificationCategory } from "../utils/getNotificationCategory.js";




// Get Notifications (Unread from any day + Today's read/unread)
// export const getNotification = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     const startOfDay = moment().startOf("day").toDate();
//     const endOfDay = moment().endOf("day").toDate();

//     const notifications = await notificationModel
//       .find({
//         userId,
//         status: { $in: ["unread", "read"] },
//         $or: [
//           // 🔹 All unread notifications (any date)
//           { status: "unread" },

//           // 🔹 Today's notifications (read + unread)
//           {
//             createdAt: {
//               $gte: startOfDay,
//               $lte: endOfDay,
//             },
//           },
//         ],
//       })
//       .sort({ createdAt: -1 });

//     res.status(200).send({
//       success: true,
//       message: "User notifications (unread + today's activity).",
//       notifications,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in get notifications",
//       error,
//     });
//   }
// };


const ASSIGNEE_LOOKUPS = {
  whatsapp: {
    fetch: (ids) =>
      Conversation.find(
        { _id: { $in: ids } },
        { userId: 1 }
      )
        // .populate("userId", "name avatar")
        .lean(),

    getKey: (doc) => String(doc._id),
  },

  inbox: {
    fetch: (ids) =>
      Thread.find(
        { threadId: { $in: ids } },
        { userId: 1, threadId: 1 }
      )
        // .populate("userId", "name avatar")
        .lean(),

    getKey: (doc) => String(doc.threadId),
  },
};

async function enrichWithAssignee(notifications) {
  const idsByType = {};

  for (const n of notifications) {
    const category = getNotificationCategory(n);

    if (!n.entityId || !ASSIGNEE_LOOKUPS[category]) continue;

    idsByType[category] ??= new Set();
    idsByType[category].add(String(n.entityId));
  }

  const assigneeMaps = {};

  await Promise.all(
    Object.entries(idsByType).map(async ([category, ids]) => {
      const { fetch, getKey } = ASSIGNEE_LOOKUPS[category];

      const docs = await fetch([...ids]);

      assigneeMaps[category] = new Map(
        docs.map((doc) => [
          getKey(doc),
          doc.userId ?? null,
        ])
      );
    })
  );

  return notifications.map((notification) => {
    const category = getNotificationCategory(notification);

    return {
      ...notification,
      currentAssignee: notification.entityId
        ? assigneeMaps[category]?.get(String(notification.entityId)) ?? null
        : null,
    };
  });
}



// Get Today's Notifications
export const getNotification = async (req, res) => {
  try {
    const userId = req.params.id;

     const startOf7Days = moment()
      .subtract(6, "days") // includes today → total 7 days
      .startOf("day")
      .toDate();


    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const notifications = await notificationModel
      .find({
        userId,
        status: { $in: ["unread", "read"] },
        createdAt: {
          $gte: startOf7Days,
          $lte: endOfDay,
        },
      })
      .sort({ createdAt: -1 }).lean();


      const enrichedNotifications = await enrichWithAssignee(notifications);



    res.status(200).send({
      success: true,
      message: "Today's user notifications.",
      notifications: enrichedNotifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error,
    });
  }
};


// Update Notification
export const updateNotification = async (req, res) => {
  try {
    const id = req.params.id;

    const notification = await notificationModel.findByIdAndUpdate(
      { _id: id },
      { status: "read" },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "notification updated!",
      notification: notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};






// Update Notification
export const dismissNotification = async (req, res) => {
  try {
    const id = req.params.id;

    const notification = await notificationModel.findByIdAndUpdate(
      { _id: id },
      { status: "dismissed" },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "notification dismissed!",
      notification: notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};

// Update All Notifications

export const updateAllNotification = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await notificationModel.updateMany(
      { userId: userId, status: { $in: ["unread", "read"] }, },
      { $set: { status: "read" } }
    );

    res.status(200).send({
      success: true,
      message: "Notifications marked as read successfully!",
      notifications: notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};






// Dismiss All Notifications

export const dismissAllNotification = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await notificationModel.updateMany(
      { userId: userId },
      { $set: { status: "dismissed" } }
    );

    res.status(200).send({
      success: true,
      message: "Notifications dismissed successfully!",
      notifications: notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in dismissing notifications",
      error: error,
    });
  }
};




// Get Ticket Notification
export const ticketNotification = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await notificationModel
      .find({
        userId: userId,
        status: "unread",
        title: "Reply to a ticket received",
      })
      .select("title status");

    res.status(200).send({
      success: true,
      message: "All ticket notifications.",
      notifications: notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get ticket notifications",
      error: error,
    });
  }
};



































