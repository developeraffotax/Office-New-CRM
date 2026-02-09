import { scheduleNotification } from "../../utils/customFns/scheduleNotification.js";
import { getOtherParticipantEmail, isSelfAssignment } from "./utils.js";






export const createNotification = async (req, updatedThread) => {
  const payload = {
    title: "New Thread Assigned",
    redirectLink: `/mail?folder=inbox&companyName=${updatedThread?.companyName}`,
    description: `${req.user.user.name} assigned you a new Thread | ${updatedThread?.companyName}
          ✔ Subject: ${updatedThread?.subject}
          ✔ From: ${getOtherParticipantEmail(updatedThread?.participants, updatedThread?.companyName === "affotax" ? "info@affotax.com" : "Admin@outsourceaccountings.co.uk")}
          `,
    taskId: `${updatedThread._id}`,
    userId: updatedThread.userId,
    type: "thread_assigned",
    entityType: `mailbox`,
  };


  console.log({
    res: req.user?.user?._id !== updatedThread.userId,
    reqId: req.user?.user?._id,
    up: updatedThread.userId
  })
  scheduleNotification(true, payload);
};




// export const createNotificationForInboxReceive = async ( updatedThread) => {
//   const payload = {
//     title: "New Email Received",
//     redirectLink: `/mail?folder=inbox&companyName=${updatedThread?.companyName}`,
//     description: `New Email Received | ${updatedThread?.companyName}
//           ✔ Subject: ${updatedThread?.subject}
//           ✔ From: ${getOtherParticipantEmail(updatedThread?.participants, updatedThread?.companyName === "affotax" ? "info@affotax.com" : "Admin@outsourceaccountings.co.uk")}
//           `,
//     taskId: `${updatedThread._id}`,
//     userId: updatedThread.userId,
//     type: "inbox_receive",
//     entityType: `mailbox`,
//   };

 
//   scheduleNotification(true, payload);
// };






