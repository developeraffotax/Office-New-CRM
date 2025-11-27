import qs from "qs";
import axios from "axios";
import dotenv from "dotenv";
import { processMessage } from "./gmailApiHelpers/processMessage.js";
import { getLatestMessageStatus } from "./gmailWorkerUtlity.js";

// Dotenv Config
dotenv.config();

// Get Affotax Access Token
const getAccessToken = async () => {
  try {
    const data = qs.stringify({
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

// Outsourcing Access token
const getOutsourceAccessToken = async () => {
  try {
    var data = qs.stringify({
      client_id: process.env.OUTSOURCING_CLIENT_ID,

      client_secret: process.env.OUTSOURCING_CLIENT_SECRET,
      refresh_token: process.env.OUTSOURCING_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.GMAIL_API,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    var response = await axios(config);

    var accessToken = await response.data.access_token;
    return accessToken;
  } catch (error) {
    console.log("Error in access token in outsourcing:", error);
  }
};

// Send Email (With Attachments)
export const sendEmailWithAttachments = async (emailData) => {
  try {
    let accessToken = "";
    let fromEmail = "";

    console.log("emailData:", emailData);

    if (emailData.company === "Affotax") {
      accessToken = await getAccessToken();
      fromEmail = "Affotax <info@affotax.com>";
    } else if (emailData.company === "Outsource") {
      accessToken = await getOutsourceAccessToken();
      fromEmail = "Outsource Accountings <admin@outsourceaccountings.co.uk>";
    }

    const cleanedMessage = emailData.message;

    const trimmedMessage = cleanedMessage.replace(
      /<\/?p>\s*<\/?p>/g,
      "</p><p>"
    );
    const styledMessage = trimmedMessage.replace(
      /<p>/g,
      '<p style="margin: 0; padding: 0;">'
    );

    const emailMessageParts = [];






    emailMessageParts.push("From: " + fromEmail);
    emailMessageParts.push("To: " + emailData.email);

    const subjectEncoded = Buffer.from(emailData.subject, 'utf-8').toString('base64');
    emailMessageParts.push("Subject: =?UTF-8?B?" + subjectEncoded + "?=");

    
    // emailMessageParts.push("Subject: " + emailData.subject);
    emailMessageParts.push("MIME-Version: 1.0");
    emailMessageParts.push(
      'Content-Type: multipart/mixed; boundary="boundary_example"'
    );
    emailMessageParts.push("");

    emailMessageParts.push("--boundary_example");
    emailMessageParts.push('Content-Type: text/html; charset="UTF-8"');
    emailMessageParts.push("Content-Transfer-Encoding: 7bit");
    emailMessageParts.push("");
    emailMessageParts.push(styledMessage.trim());
    emailMessageParts.push("");

    // Attachments
    if (emailData.attachments && emailData.attachments.length > 0) {
      for (const attachment of emailData.attachments) {
        emailMessageParts.push("--boundary_example");
        emailMessageParts.push("Content-Type: application/octet-stream");
        emailMessageParts.push(
          'Content-Disposition: attachment; filename="' +
            attachment.filename +
            '"'
        );
        emailMessageParts.push("Content-Transfer-Encoding: base64");
        emailMessageParts.push("");
        emailMessageParts.push(attachment.content);
        emailMessageParts.push("");
      }
    }

    emailMessageParts.push("--boundary_example--");

    const emailMessage = emailMessageParts.join("\n");
    const encodedMessage = Buffer.from(emailMessage).toString("base64");

    const config = {
      method: "post",
      url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        raw: encodedMessage,
      }),
    };

    const resp = await axios(config);
    return resp;
  } catch (error) {
    console.log("Error while send email!:", error);
  }
};








 

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const getAllEmails = async (ticketsList) => {
  try {
    const accessToken = await getAccessToken();
    const outsourcingToken = await getOutsourceAccessToken();

    if (!accessToken && !outsourcingToken) {
      console.log("⚠️ Both access tokens missing — skipping Gmail sync!");
      return { detailedThreads: [], unreadCount: 0 };
    }

    const detailedThreads = [];

    for (const ticket of ticketsList) {
      const { mailThreadId, company } = ticket;

      // Pick token based on company
      const token = company === "Affotax" ? accessToken : company === "Outsource" ? outsourcingToken : null;

      if (!token) {
        console.log(
          `⚠️ No token for ticket ${mailThreadId} with company ${company}`
        );
        continue;
      }

      try {
        // Fetch thread details with retry support
        const thread = await getDetailedThreads(mailThreadId, token);
        detailedThreads.push(thread);
      } catch (err) {
        console.log(
          `❌ Failed to fetch thread ${mailThreadId} with company ${company}`,
          err?.response?.data || err.message
        );
      }

      // ⭐ CRITICAL: slow down requests to avoid 429
      await sleep(200); // 100–200ms recommended by Google
    }

    // Count unread
    const unreadCount = detailedThreads.filter(
      (t) => t.readStatus === "Unread"
    ).length;

    return { detailedThreads, unreadCount };
  } catch (error) {
    console.log(
      "❌ Error while getting all emails from Gmail:",
      error?.response?.data || error.message
    );
    throw error;
  }
};





























 
 
/**
 * ---------------------------
 * Main: Get Thread Details
 * ---------------------------
 */

const getDetailedThreads = async (threadId, accessToken) => {
  const { data: threadData } = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });



  const latestMessage = threadData.messages[threadData.messages.length - 1];
  const date = new Date(parseInt(latestMessage.internalDate));
  console.log("Latest Message latestMessagelatestMessagelatestMessagelatestMessagelatestMessage:", latestMessage);
  const decryptedMessages = await Promise.all(threadData.messages.map(msg => processMessage(msg, accessToken)));

  // Determine status
  const ourEmails = ["info@affotax.com", "admin@outsourceaccountings.co.uk"];
    const lastMessageStatus = getLatestMessageStatus(latestMessage, ourEmails)


  
    const recipientHeaders = threadData.messages[0]?.payload.headers.filter(
      (header) => ["to", "cc", "bcc"].includes(header.name.toLowerCase())
    );
    let recipients =
      recipientHeaders?.map((header) => header.value) || "No Recipient Found";


    // Logic to get the right recepient email if the first message is send by client

    if(recipients[0] === 'info@affotax.com' || recipients[0] === 'Affotax <info@affotax.com>') {

      const recipientHeaders = threadData.messages[0]?.payload.headers.filter(
        (header) => ["from"].includes(header.name.toLowerCase())
      );

      recipients = recipientHeaders?.map((header) => header.value) || "No Recipient Found";


      const input = recipients[0];
      const match = input.match(/<(.+?)>/);
      const email = match ? match[1] : input;


      recipients[0] = email;

    }


  return {
    decryptedMessages,
    threadData,
    threadId,
    subject: threadData.messages[0]?.payload.headers.find(h => h.name.toLowerCase() === "subject")?.value || "No Subject Found",
    readStatus: lastMessageStatus,
    recipients: recipients, // Simplified, you can reuse your logic
    formattedDate: date.toLocaleDateString(),
    formattedTime: date.toLocaleTimeString(),
    latestMessageId: latestMessage?.id || "",
  };
};





















// Get Single Email Detail based on It's Thread Id

export const getSingleEmail = async (ticketDetail) => {
  try {
    const accessToken = await getAccessToken();
    const outSourcingAccessToken = await getOutsourceAccessToken();
    let response;

    if (ticketDetail.companyName === "Affotax") {
      response = await getDetailedThreads(ticketDetail.threadId, accessToken);
    } else {
      response = await getDetailedThreads(
        ticketDetail.threadId,
        outSourcingAccessToken
      );
    }

    return response;
  } catch (error) {
    console.log("Error in getSingleEmail:", error);
    throw new Error("Error while fetching email details");
  }
};

// Get Attachments

export const getAttachments = async (attachmentId, messageId, companyName) => {
  try {
    console.log("Send Attachment data:", attachmentId, messageId, companyName);
    let accessToken = "";

    if (companyName === "Affotax") {
      accessToken = await getAccessToken();
    } else {
      accessToken = await getOutsourceAccessToken();
    }

    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;

    const config = {
      method: "get",
      url: url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer",
    };

    let response = await axios(config);
    const attachmentData = response.data;

    // Determine the file format based on the attachment's MIME type
    const contentType = response.headers["content-type"];

    return attachmentData;
  } catch (error) {
    console.log("Error while get attachment from gmail!", error);
  }
};

// Email Replay

export const emailReply = async (emailData) => {
  try {
    let accessToken = "";
    let fromEmail = "";

    if (emailData.company === "Affotax") {
      accessToken = await getAccessToken();
      fromEmail = "Affotax <info@affotax.com>";
    } else if (emailData.company === "Outsource") {
      accessToken = await getOutsourceAccessToken();
      fromEmail = "Outsource Accountings <admin@outsourceaccountings.co.uk>";
    }

    const threadId = emailData.threadId;
    const messageId = emailData.messageId;
    const message = emailData.message;
    const subjectToReply = emailData.subject;
    const emailSendTo = emailData.emailSendTo;

    const cleanedMessage = message;

    // Optional cleanup for empty <p> tags
    const trimmedMessage = cleanedMessage.replace(
      /<\/?p>\s*<\/?p>/g,
      "</p><p>"
    );

    // Add inline CSS to <p> tags to remove extra space
    const styledMessage = trimmedMessage.replace(
      /<p>/g,
      '<p style="margin: 0; padding: 0;">'
    );

    const emailMessageParts = [];

    emailMessageParts.push("From: " + fromEmail);
    emailMessageParts.push("To: " + emailSendTo);
    emailMessageParts.push("Subject: " + subjectToReply);
    emailMessageParts.push("MIME-Version: 1.0");
    emailMessageParts.push(
      'Content-Type: multipart/mixed; boundary="boundary_example"'
    );
    emailMessageParts.push("");

    emailMessageParts.push("--boundary_example");
    emailMessageParts.push('Content-Type: text/html; charset="UTF-8"');
    emailMessageParts.push("Content-Transfer-Encoding: 7bit");
    emailMessageParts.push("");
    emailMessageParts.push(styledMessage.trim());
    // emailMessageParts.push("");

    // Attachments
    if (emailData.attachments && emailData.attachments.length > 0) {
      for (const attachment of emailData.attachments) {
        emailMessageParts.push("--boundary_example");
        emailMessageParts.push("Content-Type: application/octet-stream");
        emailMessageParts.push(
          'Content-Disposition: attachment; filename="' +
            attachment.filename +
            '"'
        );
        emailMessageParts.push("Content-Transfer-Encoding: base64");
        emailMessageParts.push("");
        emailMessageParts.push(attachment.content);
        emailMessageParts.push("");
      }
    }

    emailMessageParts.push("--boundary_example--");

    const emailMessage = emailMessageParts.join("\n");
    const encodedMessage = Buffer.from(emailMessage).toString("base64");

    const config = {
      method: "post",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        raw: encodedMessage,
        threadId: threadId,
      }),
    };

    const resp = await axios(config);
    return resp;
  } catch (error) {
    console.log("Error while email reply!", error);
  }
};

// Mark Thread as Read
export const markThreadAsRead = async (messageId, companyName) => {
  try {
    let accessToken = "";
    if (companyName === "Affotax") {
      accessToken = await getAccessToken();
    } else if (companyName === "Outsource") {
      accessToken = await getOutsourceAccessToken();
    }

    var config = {
      method: "post",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        removeLabelIds: ["UNREAD"],
      }),
    };

    const response = await axios(config);

    console.log("Mark as Read:", response.data);

    return "Success";
  } catch (error) {
    console.log("Error while mark thread as read!", error);
  }
};

// Delete Email

export const deleteEmail = async (emailId, companyName) => {
  try {
    let accessToken;

    if (companyName === "Affotax") {
      accessToken = await getAccessToken();
    } else {
      accessToken = await getOutsourceAccessToken();
    }

    const config = {
      method: "delete",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    await axios(config);
    console.log(`Email with ID ${emailId} has been deleted successfully.`);
    return true; // Return true if deletion is successful
  } catch (error) {
    console.error("Error while deleting the email:", error.message);
    return false; // Return false if deletion failed
  }
};

// ------------------------Inbox---------------->
// Decrypt Email Message
const decryptEmail = async (emailData) => {
  let decodedMessage = "";

  if (emailData.payload.body?.data) {
    decodedMessage = Buffer.from(emailData.payload.body.data, "base64")
      .toString("utf-8")
      .replace(/(\r\n|\r|\n)/g, "<br/>")
      .split("\n\n")[0]
      .replace(/On .*/, "");
  } else if (emailData.payload.parts && emailData.payload.parts.length > 0) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        decodedMessage += Buffer.from(part.body.data, "base64").toString(
          "utf-8"
        );
      }
    }
    decodedMessage = decodedMessage.replace(
      /<p class=MsoNormal><o:p>&nbsp;<\/o:p><\/p><div style='border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm'>[\s\S]*?<\/div><p class=MsoNormal>[\s\S]*?<o:p><\/o:p><\/p><\/div>/gs,
      ""
    );
  }

  return decodedMessage;
};

// Get Detailed Email with retry logic (with exponential backoff)
const getDetailedEmail = async (
  emailId,
  accessToken,
  retries = 3,
  backoff = 2000
) => {
  try {
    const config = {
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(config);
    const emailData = response.data;

    const date = new Date(parseInt(emailData.internalDate));
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    const subject =
      emailData.payload.headers.find(
        (header) => header.name.toLowerCase() === "subject"
      )?.value || "No Subject Found";

    const readStatus = emailData.labelIds.includes("UNREAD")
      ? "Unread"
      : emailData.labelIds.includes("SENT")
      ? "Sent"
      : "Read";

    const recipientHeaders = emailData.payload.headers.filter((header) =>
      ["to", "cc", "bcc"].includes(header.name.toLowerCase())
    );
    const recipients =
      recipientHeaders?.map((header) => header.value) || "No Recipient Found";

    const decryptedMessage = await decryptEmail(emailData);

    return {
      decryptedMessage: decryptedMessage,
      emailData: emailData,
      emailId: emailId,
      subject: subject,
      readStatus: readStatus,
      recipients: recipients,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      const retryAfter = error.response.headers["retry-after"];
      const waitTime = retryAfter ? retryAfter * 1000 : backoff;
      console.log(
        `Too many requests. Retrying in ${waitTime / 1000} seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return getDetailedEmail(emailId, accessToken, retries - 1, backoff * 2); // Exponential backoff
    } else {
      console.log("Error while getting email details:", error.message);
      return null;
    }
  }
};

// Fetch emails based on company with pagination
const fetchEmails = async (accessToken, pageNo, type) => {
  let pageSize = 17;
  const startIndex = (pageNo - 1) * pageSize;

  pageSize = pageSize * pageNo;

  console.log("startIndex:", startIndex, pageSize);
  try {
    // const query = "after:2024/10/01";
    const query =
      type === "received"
        ? "in:inbox -label:sent after:2024/10/01"
        : "label:sent OR has:reply after:2024/10/01";
    const config = {
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        maxResults: pageSize,
        start: startIndex,
        fields: "messages(id)",
      },
    };

    const response = await axios(config);
    const emailIds = response.data.messages.map((message) => message.id);

    // Fetch detailed email data for each email ID in parallel
    const emails = await Promise.all(
      emailIds.map(async (emailId) => {
        const detailedEmail = await getDetailedEmail(emailId, accessToken);
        return detailedEmail;
      })
    );

    return emails.filter((email) => email !== null); // Filter out failed emails
  } catch (error) {
    console.log("Error while fetching emails:", error.message);
    return [];
  }
};

// Fetch all emails based on the selected company with pagination
export const getAllEmailInbox = async (selectedCompany, pageNo, type) => {
  try {
    const accessToken = await getAccessToken();
    const outSourcingAccessToken = await getOutsourceAccessToken();

    if (!accessToken || !outSourcingAccessToken) {
      throw new Error("Access tokens are missing.");
    }

    let emails = [];

    if (selectedCompany === "Affotax") {
      emails = await fetchEmails(accessToken, pageNo, type);
    } else if (selectedCompany === "Outsource") {
      emails = await fetchEmails(outSourcingAccessToken, pageNo, type);
    }

    const unreadCount = emails.reduce((count, email) => {
      return email.readStatus === "Unread" ? count + 1 : count;
    }, 0);

    return {
      detailedEmails: emails,
      length: emails.length,
      unreadCount: unreadCount,
    };
  } catch (error) {
    console.log("Error while getting all emails", error);
    return null;
  }
};

// -----------------------------------Error------------------->
// url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?pageToken=${pageNo}&maxResults=${pageSize}`,

// Decrypt Email Message
// const decryptEmail = async (emailData) => {
//   let decodedMessage = "";

//   if (emailData.payload.body?.data) {
//     decodedMessage = Buffer.from(emailData.payload.body.data, "base64")
//       .toString("utf-8")
//       .replace(/(\r\n|\r|\n)/g, "<br/>")
//       .split("\n\n")[0]
//       .replace(/On .*/, "");
//   } else if (emailData.payload.parts && emailData.payload.parts.length > 0) {
//     for (const part of emailData.payload.parts) {
//       if (part.mimeType === "text/html" && part.body?.data) {
//         decodedMessage += Buffer.from(part.body.data, "base64").toString(
//           "utf-8"
//         );
//       }
//     }
//     decodedMessage = decodedMessage.replace(
//       /<p class=MsoNormal><o:p>&nbsp;<\/o:p><\/p><div style='border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm'>[\s\S]*?<\/div><p class=MsoNormal>[\s\S]*?<o:p><\/o:p><\/p><\/div>/gs,
//       ""
//     );
//   }

//   return decodedMessage;
// };

// // Get Detailed Email with retry logic for handling 429 Too Many Requests error
// const getDetailedEmail = async (emailId, accessToken, retries = 3) => {
//   try {
//     const config = {
//       method: "get",
//       url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     };

//     const response = await axios(config);
//     const emailData = response.data;

//     const date = new Date(parseInt(emailData.internalDate));
//     const formattedDate = date.toLocaleDateString();
//     const formattedTime = date.toLocaleTimeString();

//     const subject =
//       emailData.payload.headers.find(
//         (header) => header.name.toLowerCase() === "subject"
//       )?.value || "No Subject Found";

//     const readStatus = emailData.labelIds.includes("UNREAD")
//       ? "Unread"
//       : emailData.labelIds.includes("SENT")
//       ? "Sent"
//       : "Read";

//     const recipientHeaders = emailData.payload.headers.filter((header) =>
//       ["to", "cc", "bcc"].includes(header.name.toLowerCase())
//     );
//     const recipients =
//       recipientHeaders?.map((header) => header.value) || "No Recipient Found";

//     const decryptedMessage = await decryptEmail(emailData);

//     return {
//       decryptedMessage: decryptedMessage,
//       emailData: emailData,
//       emailId: emailId,
//       subject: subject,
//       readStatus: readStatus,
//       recipients: recipients,
//       formattedDate: formattedDate,
//       formattedTime: formattedTime,
//     };
//   } catch (error) {
//     if (error.response?.status === 429 && retries > 0) {
//       const retryAfter = error.response.headers["retry-after"];
//       const waitTime = retryAfter ? retryAfter * 1000 : 2000; // Wait time from Retry-After or default 2 seconds
//       console.log(
//         `Too many requests. Retrying in ${waitTime / 1000} seconds...`
//       );

//       await new Promise((resolve) => setTimeout(resolve, waitTime));
//       return getDetailedEmail(emailId, accessToken, retries - 1);
//     } else {
//       console.log("Error while getting email details:", error.message);
//       return null;
//     }
//   }
// };

// // Fetch emails based on company (Affotax or Outsource) with pagination

// const fetchEmails = async (accessToken, pageNo) => {
//   let pageSize = 17;
//   pageSize = pageNo * pageSize;

//   try {
//     const query = "after:2024/10/01";
//     const config = {
//       method: "get",
//       url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
//         query
//       )}&maxResults=${pageSize}`,
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     };

//     const response = await axios(config);
//     const emailIds = response.data.messages.map((message) => message.id);

//     // Fetch detailed email data for each email ID
//     const emails = await Promise.all(
//       emailIds.map(async (emailId) => {
//         const detailedEmail = await getDetailedEmail(emailId, accessToken);
//         return detailedEmail;
//       })
//     );

//     return emails.filter((email) => email !== null); // Filter out failed emails
//   } catch (error) {
//     console.log("Error while fetching emails:", error.message);
//     return [];
//   }
// };

// // Fetch all emails based on the selected company with pagination
// export const getAllEmailInbox = async (selectedCompany, pageNo) => {
//   try {
//     console.log(selectedCompany, pageNo);
//     const accessToken = await getAccessToken();
//     const outSourcingAccessToken = await getOutsourceAccessToken();

//     if (!accessToken || !outSourcingAccessToken) {
//       throw new Error("Access tokens are missing.");
//     } else {
//       let emails = [];

//       // Fetch emails based on the selected company
//       if (selectedCompany === "Affotax") {
//         emails = await fetchEmails(accessToken, pageNo);
//       } else if (selectedCompany === "Outsource") {
//         emails = await fetchEmails(outSourcingAccessToken, pageNo);
//       }

//       const unreadCount = emails.reduce((count, email) => {
//         if (email.readStatus === "Unread") {
//           return count + 1;
//         }
//         return count;
//       }, 0);

//       // console.log("detailedEmails:", emails, "unreadCount:", unreadCount);

//       return {
//         detailedEmails: emails,
//         length: emails.length,
//         unreadCount: unreadCount,
//       };
//     }
//   } catch (error) {
//     console.log("Error while getting all emails", error);
//     return null;
//   }
// };
