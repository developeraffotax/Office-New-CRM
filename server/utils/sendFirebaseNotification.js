// import fetch from "node-fetch";

// export const sendFirebaseNotification = async (fcmToken, data) => {
//   const payload = {
//     to: fcmToken,
//     notification: {
//       title: data.title,
//       body: data.description,
//       click_action: data.redirectLink,
//     },
//     data: {
//       taskId: data.taskId,
//     },
//   };

//   await fetch("https://fcm.googleapis.com/fcm/send", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
//     },
//     body: JSON.stringify(payload),
//   });
// };
