
 
import { PubSub } from '@google-cloud/pubsub';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// Path for Credentials
const CREDENTIALS_PATH = path.join(
    __dirname,
    "..",
    "config",
    "service-pubsub.json"
  );



const pubSubClient = new PubSub({
    projectId: 'affotax-crm',
    keyFilename: CREDENTIALS_PATH
    });


const subscriptionName = 'projects/affotax-crm/subscriptions/ticket-notification-sub';
 

 
 
export function listenForMessages() {
  const subscription = pubSubClient.subscription(subscriptionName);

  const messageHandler = (message) => {
    console.log(`Received message: ${message.id}`);
    console.log(`Data: ${message.data}`);
    
    // Here, process the notification message, e.g., fetch the email details via Gmail API
    // You can store the email info in your database or trigger another action.

    // Acknowledge the message
    message.ack();
  };

  subscription.on('message', messageHandler);
}


