// /* eslint-disable no-undef */
// /* eslint-disable no-restricted-globals */

// // Import Firebase scripts
// importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
// importScripts(
//   "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js"
// );

// const firebaseConfig = {
//   apiKey: "AIzaSyBbHO5Qtc1df3_nyGDh1GoegLKyirDKXKM",
//   authDomain: "notification-f07a9.firebaseapp.com",
//   projectId: "notification-f07a9",
//   storageBucket: "notification-f07a9.firebasestorage.app",
//   messagingSenderId: "1049322377808",
//   appId: "1:1049322377808:web:8a4910bd9c9d68b3bfb755",
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// // Initialize Firebase Messaging
// const messaging = firebase.messaging();

// // Handle background notifications
// messaging.onBackgroundMessage((payload) => {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message ",
//     payload
//   );

//   // Safely accessing notification properties
//   const notificationTitle = payload.notification?.title || "Default Title";
//   const notificationBody = payload.notification?.body || "Default Body";
//   const notificationIcon = payload.notification?.icon || "./reminder.png";

//   // Define notification options
//   const notificationOptions = {
//     body: notificationBody,
//     icon: notificationIcon,
//   };

//   // Show the notification
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
