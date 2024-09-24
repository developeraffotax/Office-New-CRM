import qs from "qs";
import axios from "axios";
import dotenv from "dotenv";

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

    if (emailData.company === "Affotax") {
      accessToken = await getAccessToken();
      fromEmail = "Affotax <info@affotax.com>";
    } else if (emailData.company === "Outsource") {
      accessToken = await getOutsourceAccessToken();
      fromEmail = "Outsource Accountings <admin@outsourceaccountings.co.uk>";
    }

    const emailMessageParts = [];

    emailMessageParts.push("From: " + fromEmail);
    emailMessageParts.push("To: " + emailData.email);
    emailMessageParts.push("Subject: " + emailData.subject);
    emailMessageParts.push("MIME-Version: 1.0");
    emailMessageParts.push(
      'Content-Type: multipart/mixed; boundary="boundary_example"'
    );
    emailMessageParts.push("");

    emailMessageParts.push("--boundary_example");
    emailMessageParts.push('Content-Type: text/html; charset="UTF-8"');
    emailMessageParts.push("Content-Transfer-Encoding: 7bit");
    emailMessageParts.push("");
    emailMessageParts.push(emailData.message);
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

// Get All Emails

export const getAllEmails = async (ticketsList) => {
  try {
    const accessToken = await getAccessToken();
    const outSourcingAccessToken = await getOutsourceAccessToken();

    if (!accessToken || !outSourcingAccessToken) {
      getAllEmails(ticketsList);
    } else {
      let detailedThreads = await Promise.all(
        ticketsList.map(async (thread) => {
          const response = await getDetailedThreads(
            thread.threadId,
            thread.companyName === "Affotax"
              ? accessToken
              : thread.companyName === "Outsource"
              ? outSourcingAccessToken
              : ""
          );
          return response;
        })
      );

      // Filter out null values (skipped thread IDs)
      detailedThreads = detailedThreads.filter((thread) => thread !== null);

      const unreadCount = detailedThreads.reduce((count, thread) => {
        if (thread.readStatus === "Unread") {
          return count + 1;
        }
        return count;
      }, 0);

      return {
        detailedThreads: detailedThreads,
        unreadCount: unreadCount,
      };
    }
  } catch (error) {
    console.log("Error while get all email's to Gmail", error);
  }
};

// Get Thread Details
const getDetailedThreads = async (threadId, accessToken) => {
  try {
    const config = {
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(config);
    const threadData = response.data;

    const latestMessage = threadData.messages[threadData.messages.length - 1];
    const date = new Date(parseInt(latestMessage.internalDate));
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    const subject =
      threadData.messages[0]?.payload.headers.find(
        (header) => header.name.toLowerCase() === "subject"
      )?.value || "No Subject Found";
    const readStatus = threadData.messages[
      threadData.messages.length - 1
    ]?.labelIds?.includes("UNREAD")
      ? "Unread"
      : threadData.messages[threadData.messages.length - 1]?.labelIds?.includes(
          "SENT"
        )
      ? "Sent"
      : "Read" || "No Status Found";

    const recipientHeaders = threadData.messages[0]?.payload.headers.filter(
      (header) => ["to", "cc", "bcc"].includes(header.name.toLowerCase())
    );
    const recipients =
      recipientHeaders?.map((header) => header.value) || "No Recipient Found";

    const decryptedMessages = await Promise.all(
      threadData.messages.map(async (message) => {
        let decodedMessage = "";

        if (message.payload.body?.data) {
          decodedMessage = Buffer.from(message.payload.body.data, "base64")
            .toString("utf-8")
            .replace(/(\r\n|\r|\n)/g, "<br/>")
            .split("\n\n")[0]
            .replace(/On .*/, "");
        } else if (message.payload.parts && message.payload.parts.length > 0) {
          for (const part of message.payload.parts) {
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

        const sentByMe = [
          "info@affotax.com",
          "Affotax Team <info@affotax.com>",
          "Affotax <info@affotax.com>",
          "Outsource Accountings <admin@outsourceaccountings.co.uk>",
          "admin@outsourceaccountings.co.uk",
        ].includes(
          message.payload.headers.find(
            (header) => header.name.toLowerCase() === "from"
          )?.value || ""
        );

        const attachments = (message.payload.parts || []).filter(
          (part) => part.filename && part.body?.attachmentId
        );

        const messageAttachments = attachments.map((attachment) => ({
          attachmentId: attachment.body.attachmentId,
          attachmentMessageId: message.id,
          attachmentFileName: attachment.filename,
        }));

        return {
          ...message,
          payload: {
            ...message.payload,
            body: {
              ...message.payload.body,
              data: decodedMessage,
              sentByMe: sentByMe,
              messageAttachments: messageAttachments,
            },
          },
        };
      })
    );

    return {
      decryptedMessages: decryptedMessages,
      threadData: threadData,
      threadId: threadId,
      subject: subject,
      readStatus: readStatus,
      recipients: recipients,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  } catch (error) {
    console.log("Error while getting Thread details:", error);
    if (error.response && error.response.status === 404) {
      // Mail not found, skip this thread ID
      return [];
    } else {
      throw new Error(error.message);
    }
  }
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

    const response = await axios(config);
    const data = response.data;

    console.log("Reponse:", data);
    return data;
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
    emailMessageParts.push(message);
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

    await axios(config);

    return "Success";
  } catch (error) {
    console.log("Error while mark thread as read!", error);
  }
};
