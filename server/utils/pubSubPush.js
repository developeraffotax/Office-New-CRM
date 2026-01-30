import ticketModel from "../models/ticketModel.js";
 

import { addNotificationJob } from "../jobs/queues/notificationQueue.js";
import { getGmailClient } from "../emailModule/services/gmail.service.js";
import { gmailSyncQueue } from "../emailModule/jobs/queues/gmailSyncQueue.js";
import gmailHistoryModel from "../models/gmailHistoryModel.js";

/**
 * Get sender email from Gmail message metadata
 */
async function getSenderEmail(gmail, messageId) {
  const emailResponse = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["From"],
  });

  const fromHeader = emailResponse.data.payload.headers.find(h => h.name === "From");
  return fromHeader?.value?.match(/<([^>]+)>/)?.[1];
}

/**
 * Process a single messageAdded event: update ticket and add notification if needed
 */
async function processMessageAdded(gmail, msg, yourEmail) {
  const { id: messageId, threadId } = msg;
  const senderEmail = await getSenderEmail(gmail, messageId);

  if (!senderEmail || senderEmail === yourEmail) return threadId;

  const ticket = await ticketModel.findOneAndUpdate(
    { mailThreadId: threadId },
    { $set: { status: "Unread" }, $inc: { unreadCount: 1 } },
    { new: true }
  );

  if (ticket) {
    await addNotificationJob({ ticket });
  }

  return threadId;
}

/**
 * Collect all threadIds for syncing (messageAdded, messageDeleted, label changes)
 */
function collectThreadIds(item) {
  const threadIds = new Set();

  (item.messagesAdded || []).forEach(({ message }) => threadIds.add(message.threadId));
  (item.messagesDeleted || []).forEach(({ message }) => threadIds.add(message.threadId));
  const labelsChanged = (item.labelsAdded || []).concat(item.labelsRemoved || []);
  labelsChanged.forEach(({ message }) => threadIds.add(message.threadId));

  return threadIds;
}

/**
 * Add Gmail sync job for all threadIds
 */
async function addGmailSyncJob(threadIds, companyName) {
  if (threadIds.size === 0) return;
  await gmailSyncQueue.add("addGmailThread", {
    companyName: companyName,
    threadIds: Array.from(threadIds),
  });
}











/**
 * Main webhook handler
 */
export async function gmailWebhookHandlerForAffotax(req, res) {
  const companyName = "affotax";
  try {
    const { message } = req.body;
    const decodedData = Buffer.from(message.data, "base64").toString();
    const { historyId } = JSON.parse(decodedData);

    const gmail = await getGmailClient(companyName);
    // const lastDoc = await gmailModel.findOne({}).sort({ _id: -1 });
    const lastDoc = await gmailHistoryModel.findOne({ companyName });

    const historyResponse = await gmail.users.history.list({
      userId: "me",
      startHistoryId: lastDoc?.last_history_id,
      historyTypes: ["messageAdded", "messageDeleted", "labelAdded", "labelRemoved"],
    });

    // await gmailModel.create({ last_history_id: historyResponse.data.historyId });

    await gmailHistoryModel.findOneAndUpdate(
      { companyName },
      {
        last_history_id: historyResponse.data.historyId,
         
      },
      {
        upsert: true,   // 👈 create only if missing
        new: true,
      }
    );

    const history = historyResponse.data.history || [];
    const yourEmail = "info@affotax.com";

    const allThreadIds = new Set();
    const notificationPromises = [];

    for (const item of history) {
      console.log("THE ITEM IS ", item)
      if (!item.messagesAdded && !item.messagesDeleted && !item.labelsAdded && !item.labelsRemoved) continue;

      // Process new messages
      if (item.messagesAdded) {
        item.messagesAdded.forEach(({ message: msg }) => {
          notificationPromises.push(processMessageAdded(gmail, msg, yourEmail).then(threadId => {
            if (threadId) allThreadIds.add(threadId);
          }));
        });
      }

      
      // Collect threadIds for other events
      const threadIds = collectThreadIds(item);
      threadIds.forEach(id => allThreadIds.add(id));


      console.log("THE THREAD IDS ARE>>>", threadIds)
    }

    // Wait for all notifications to finish
    await Promise.all(notificationPromises);

    // Add Gmail sync job
    await addGmailSyncJob(allThreadIds, companyName);

    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("Gmail webhook error:", err);
    res.status(500).send("Error processing webhook");
  }
}






export async function gmailWebhookHandlerForOutsource(req, res) {
  const companyName = "outsource";
  try {
    const { message } = req.body;
    const decodedData = Buffer.from(message.data, "base64").toString();
    const { historyId } = JSON.parse(decodedData);

      const gmail = await getGmailClient(companyName);
     const lastDoc = await gmailHistoryModel.findOne({ companyName });

    const historyResponse = await gmail.users.history.list({
      userId: "me",
      startHistoryId: lastDoc?.last_history_id,
      historyTypes: ["messageAdded", "messageDeleted", "labelAdded", "labelRemoved"],
    });

    await gmailHistoryModel.findOneAndUpdate(
      { companyName },
      {
        last_history_id: historyResponse.data.historyId,
         
      },
      {
        upsert: true,   // 👈 create only if missing
        new: true,
      }
    );

    const history = historyResponse.data.history || [];
    const yourEmail = "admin@outsourceaccountings.co.uk";

    const allThreadIds = new Set();
    const notificationPromises = [];

    for (const item of history) {
      console.log("THE ITEM IS ", item)
      if (!item.messagesAdded && !item.messagesDeleted && !item.labelsAdded && !item.labelsRemoved) continue;

      // Process new messages
      if (item.messagesAdded) {
        item.messagesAdded.forEach(({ message: msg }) => {
          notificationPromises.push(processMessageAdded(gmail, msg, yourEmail).then(threadId => {
            if (threadId) allThreadIds.add(threadId);
          }));
        });
      }

      
      // Collect threadIds for other events
      const threadIds = collectThreadIds(item);
      threadIds.forEach(id => allThreadIds.add(id));


      console.log("THE THREAD IDS ARE>>>", threadIds)
    }

    // Wait for all notifications to finish
    await Promise.all(notificationPromises);

    // Add Gmail sync job
    await addGmailSyncJob(allThreadIds, companyName);

    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("Gmail webhook error:", err);
    res.status(500).send("Error processing webhook");
  }
}