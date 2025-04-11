import { JWT } from "google-auth-library";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import gmailModel from "../models/gmailModel.js";

export async function setWatch() {
  // // Get __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Path for Credentials
  const CREDENTIALS_PATH = path.join( __dirname, "..", "creds", "service-pubsub.json" );

  // Scopes you need
  const SCOPES = [ "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/pubsub", ];

  // Create a JWT client using the Service Account key
  const jwtClient = new JWT({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
    subject: "info@affotax.com",
  });

  try {
    await jwtClient.authorize();

    const gmail = google.gmail({ version: "v1", auth: jwtClient, });

    const request = {
      labelIds: ["INBOX"],
      topicName: "projects/affotax-crm/topics/ticket-push", // The Google Cloud Pub/Sub topic
      
    };

    const response = await gmail.users.watch({
        userId: "me", // Use the target user's email instead of service account
        requestBody: request,
        
        
    });

    await gmailModel.create({
      last_history_id: response.data.historyId
    })

    
    console.log("Watch request created successfully", response.data);
  } catch (error) {
    console.error("Error setting up watch request:", error);
  }
}
