import userRoute from "./userRoutes.js";
import jobRoute from "./jobsRoutes.js";
import timerRoute from "./timerRoutes.js";
import commentRoute from "./commentRoutes.js";
import projectRoute from "./projectRoutes.js";
import taskRoute from "./taskRoutes.js";
import labelRoute from "./labelRoutes.js";
import categoryRoute from "./templates/categoryRoutes.js";
import templateRoute from "./templates/templateRoutes.js";
import faqRoute from "./templates/faqRoutes.js";
import ticketRoute from "./ticketRoutes.js";
import leadRoute from "./leadRoute.js";
import proposalRoute from "./proposalRoute.js";
import roleRoute from "./roleRoute.js";
import notificationRoute from "./notificationRoutes.js";
import subscriptionRoute from "./subscriptionRoutes.js";
import goalsRoute from "./goalRoutes.js";
import complaintRoute from "./complaintRoutes.js";
import analyticsRoute from "./Analytics.js/customImpressions.js";
import activityRoute from "./ActivityRoutes.js";
import reminderRoute from "./reminderRoutes.js";
import meetingRoute from "./meetingRoutes.js";
import hrRoute from "./hrRoutes.js";
import departmentRoute from "./departmentRoutes.js";
import hrRoleRoutes from "./hrRoleRoutes.js";
import quickListRoute from "./quickListRoute.js";
import qualityListRoute from "./qualityRoutes.js";
import quickReplyTemplateRoutes from "./quickReplyTemplateRoutes.js";
import overviewRoutes from "./overviewRoutes.js";
import subtaskListRoutes from "./subtaskListRoutes.js";

import onedriveRoutes from "./onedriveRoutes.js";
import agentRoutes from "./agentRoutes.js";

 
 

import { requiredSignIn } from "../middlewares/authMiddleware.js";
import { sendDatatoGoogleSheet } from "../utils/googleSheet.js";

export const registerRoutes = (app) => {
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/client", jobRoute);
  app.use("/api/v1/timer", timerRoute);
  app.use("/api/v1/comments", commentRoute);
  app.use("/api/v1/notification", notificationRoute);
  app.use("/api/v1/projects", projectRoute);
  app.use("/api/v1/tasks", taskRoute);
  app.use("/api/v1/label", labelRoute);
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/templates", templateRoute);
  app.use("/api/v1/faqs", faqRoute);
  app.use("/api/v1/tickets", ticketRoute);
  app.use("/api/v1/leads", leadRoute);
  app.use("/api/v1/proposal", proposalRoute);
  app.use("/api/v1/roles", roleRoute);
  app.use("/api/v1/subscriptions", subscriptionRoute);
  app.use("/api/v1/goals", goalsRoute);
  app.use("/api/v1/analytics", analyticsRoute);
  app.use("/api/v1/complaints", complaintRoute);
  app.use("/api/v1/activies", activityRoute);
  app.use("/api/v1/reminders", reminderRoute);
  app.use("/api/v1/meetings", meetingRoute);
  app.use("/api/v1/hr", hrRoute);
  app.use("/api/v1/department", departmentRoute);
  app.use("/api/v1/hrRole", hrRoleRoutes);
  app.use("/api/v1/quicklist", quickListRoute);
  app.use("/api/v1/quicklist", qualityListRoute);

  app.use("/api/v1/subtask-lists", subtaskListRoutes);
  
  app.use("/api/v1/overview", overviewRoutes);

  app.use("/api/v1/googleSheet", sendDatatoGoogleSheet);
  app.use("/api/templates", requiredSignIn, quickReplyTemplateRoutes);

 

  app.use("/api/v1", requiredSignIn, onedriveRoutes);
  app.use("/api/v1/agent", agentRoutes);
};
