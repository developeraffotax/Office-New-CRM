import axios from "axios";
import { GoogleAuth, JWT } from "google-auth-library";
import { google } from "googleapis";
import QueryString from "qs";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getAccessToken = async () => {
    try {
      const data = QueryString.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: "refresh_token",
      });
  
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: process.env.GMAIL_API,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
  
      const response = await axios(config);
      const accessToken = response.data.access_token;
  
      return accessToken;
    } catch (error) {
      console.log("Error in access token:", error);
      throw error;
    }
  };

















// export async function setWatch() {
      
// // Get __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// // Path for Credentials
// const CREDENTIALS_PATH = path.join(
//     __dirname,
//     "..",
//     "config",
//     "service-pubsub.json"
//   );


//   // Authenticate with Google Sheets
// const authenticate = async () => {
//     if (!fs.existsSync(CREDENTIALS_PATH)) {
//       throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}`);
//     }
  
//     const auth = new GoogleAuth({
//       keyFile: CREDENTIALS_PATH,
//       scopes: [
//         'https://www.googleapis.com/auth/gmail.watch',
//         'https://www.googleapis.com/auth/pubsub'
//     ]
//     });
//     return await auth.getClient();
//   };



 
//     try {
 
//         const auth = new GoogleAuth({
//             credentials

//             scopes: [
//               'https://www.googleapis.com/auth/gmail.readonly',
//               'https://www.googleapis.com/auth/gmail.watch',
//               'https://www.googleapis.com/auth/pubsub'
//           ]
//           });

//           const authC = await auth.getClient()

    
//         const gmail = google.gmail({ version: 'v1', auth:authC  });

//         // console.log("gmail is WOKRINGFINE", gmail)
    
//         const request = {
//             labelIds: ['INBOX'],
//             topicName: 'projects/affotax-crm/topics/ticket-notification', // The Google Cloud Pub/Sub topic
//         };

//         const response = await gmail.users.watch({
//             userId: "me", // Use the target user's email instead of service account
//             requestBody: request,
           
//         });

      
//       console.log('Watch request created successfully', response.data);
//     } catch (error) {
//       console.error('Error setting up watch request:', error);
//     }
//   }
  










































export async function setWatch() {
      
    // // Get __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    
    // Path for Credentials
    const CREDENTIALS_PATH = path.join(
        __dirname,
        "..",
        "config",
        "service-pubsub.json"
      );
    
 

// Scopes you need
const SCOPES =  [
           
            'https://www.googleapis.com/auth/gmail.readonly',
           
         ]

// Create a JWT client using the Service Account key
const jwtClient = new JWT({
  keyFile: CREDENTIALS_PATH,
  scopes: SCOPES,
  subject: "info@affotax.com",
  
});
    
    
     
        try {
     
            await jwtClient.authorize();


            const gmail = google.gmail({ version: 'v1', auth:jwtClient  });
        
            const request = {
                labelIds: ['INBOX'],
                topicName: 'projects/affotax-crm/topics/ticket-notification', // The Google Cloud Pub/Sub topic
            };
    
            const response = await gmail.users.watch({
                userId: "me", // Use the target user's email instead of service account
                requestBody: request,
               
            });
 
             
     
          
          console.log('Watch request created successfully', response.data);
        } catch (error) {
          console.error('Error setting up watch request:', error);
        }
      }
      