
import gmailHistoryModel from "../models/gmailHistoryModel.js";
import { getGmailClient } from "../emailModule/services/gmail.service.js";

async function setWatch(companyName, topicName) {

  try {
    const gmail = await getGmailClient(companyName);
    const request = {
      labelIds: ["INBOX", "SENT"],
      topicName: topicName, // The Google Cloud Pub/Sub topic

    };
    const response = await gmail.users.watch({
      userId: "me", // Use the target user's email instead of service account
      requestBody: request,
    });
    /**
    * ✅ Store INITIAL historyId
    * ONE doc per company
    */
    await gmailHistoryModel.findOneAndUpdate(
      { companyName},
      {
        last_history_id: response.data.historyId,
      },
      {
        upsert: true,
        new: true,
      }
    );


    console.log("Watch request created successfully", response.data);
  } catch (error) {
    console.error("Error setting up watch request:", error);
  }
}




export const setWatchForAffotax = async () => {
  return await setWatch("affotax", "projects/affotax-crm/topics/ticket-push")
}


export const setWatchForOutsource = async () => {
  return await setWatch("outsource", "projects/crm-gmail-api-393110/topics/ticket-push")
}