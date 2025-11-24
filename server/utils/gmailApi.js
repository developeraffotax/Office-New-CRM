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

// Get All Emails

export const getAllEmails = async (ticketsList) => {
  try {
    const accessToken = await getAccessToken();
    const outSourcingAccessToken = await getOutsourceAccessToken();

    if (!accessToken || !outSourcingAccessToken) {
      console.log("No access token found");
      return;
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
      detailedThreads = detailedThreads?.filter((thread) => thread !== null);

      const unreadCount = detailedThreads?.reduce((count, thread) => {
        if (thread?.readStatus === "Unread") {
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
    throw error;
  }
};
















/**
 * Strip Gmail quotes and previous messages
 */
const stripQuotedText = (html) => {
  if (!html) return html;

  // Remove Gmail quotes
  html = html.replace(/<div class="gmail_quote">([\s\S]*?)<\/div>/gi, "");

  // Remove blockquotes used in replies
  html = html.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "");

  // Remove lines like "On DATE, NAME wrote:"
  html = html.replace(/^On .* wrote:$/gim, "");

  // Remove lines starting with > (common plain-text reply)
  html = html.replace(/^>.*$/gm, "");

  return html.trim();
};



/**
 * ---------------------------
 * Base64 Helpers
 * ---------------------------
 */

const base64UrlToBase64 = (b64url) => {
  if (!b64url) return b64url;
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
};

/**
 * Fetch attachment binary data (base64url → normal base64)
 */
const fetchAttachmentData = async (messageId, attachmentId, accessToken) => {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const base64url = response.data?.data || "";
    return base64UrlToBase64(base64url);
  } catch (err) {
    console.error("Error fetching attachment data:", err?.message);
    return null;
  }
};

/**
 * ---------------------------
 * Main: Get Thread Details
 * ---------------------------
 */

const getDetailedThreads = async (threadId, accessToken) => {
  try {
    const response = await axios({
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const threadData = response.data;

    const latestMessage = threadData.messages[threadData.messages.length - 1];
    const date = new Date(parseInt(latestMessage.internalDate));

    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    const subject =
      threadData.messages[0]?.payload.headers.find(
        (h) => h.name.toLowerCase() === "subject"
      )?.value || "No Subject Found";

    const readStatus = latestMessage.labelIds?.includes("UNREAD")
      ? "Unread"
      : latestMessage.labelIds?.includes("SENT")
      ? "Sent"
      : "Read";

    /**
     * ---------------------------
     * Determine Recipients
     * ---------------------------
     */
    const recipientHeaders = threadData.messages[0]?.payload.headers.filter(
      (header) => ["to", "cc", "bcc"].includes(header.name.toLowerCase())
    );

    let recipients =
      recipientHeaders?.map((header) => header.value) || ["No Recipient Found"];

    // If first email is your own, replace with sender email
    if (
      recipients[0] === "info@affotax.com" ||
      recipients[0] === "Affotax <info@affotax.com>"
    ) {
      const fromHeader = threadData.messages[0]?.payload.headers.find(
        (h) => h.name.toLowerCase() === "from"
      );

      const input = fromHeader?.value || "";
      const match = input.match(/<(.+?)>/);
      const email = match ? match[1] : input;

      recipients = [email];
    }

    /**
     * ---------------------------
     * Process Messages
     * ---------------------------
     */

    const decryptedMessages = await Promise.all(
      threadData.messages.map(async (message) => {
        let decodedMessage = "";

        /**
         * ---------------------------
         * Flatten Gmail Parts
         * ---------------------------
         */
        const flattenParts = (parts = []) => {
          const out = [];
          for (const p of parts) {
            out.push(p);
            if (p.parts && p.parts.length) out.push(...flattenParts(p.parts));
          }
          return out;
        };

        const parts = message.payload.parts?.length
          ? flattenParts(message.payload.parts)
          : [];

        /**
         * ---------------------------
         * Decode HTML Body
         * ---------------------------
         */
        if (message.payload.body?.data) {
          const b64 = base64UrlToBase64(message.payload.body.data);
          try {
            decodedMessage = Buffer.from(b64, "base64").toString("utf-8");
          } catch {
            decodedMessage = Buffer.from(
              message.payload.body.data,
              "base64"
            ).toString("utf-8");
          }
        } else {
          for (const part of parts) {
            if (part.mimeType === "text/html" && part.body?.data) {
              const b64 = base64UrlToBase64(part.body.data);
              decodedMessage += Buffer.from(b64, "base64").toString("utf-8");
            }
          }
        }

        /**
         * ---------------------------
         * Extract Attachments
         * ---------------------------
         */
        const attachments = [];

        for (const part of parts) {
          const contentIdHeader = part.headers?.find(
            (h) => h.name.toLowerCase() === "content-id"
          )?.value;

          const dispositionHeader = part.headers?.find(
            (h) => h.name.toLowerCase() === "content-disposition"
          )?.value;

          const isInline =
            (dispositionHeader &&
              dispositionHeader.toLowerCase().includes("inline")) ||
            !!contentIdHeader;

          // Case 1: Attachment with attachmentId
          if (part.filename && part.body?.attachmentId) {
            let inlineDataUrl = null;

            if (isInline) {
              const fetchedBase64 = await fetchAttachmentData(
                message.id,
                part.body.attachmentId,
                accessToken
              );

              if (fetchedBase64) {
                inlineDataUrl = `data:${part.mimeType};base64,${fetchedBase64}`;
              }
            }

            attachments.push({
              attachmentId: part.body.attachmentId,
              attachmentMessageId: message.id,
              attachmentFileName: part.filename,
              attachmentHeaders: part.headers || [],
              mimeType: part.mimeType,
              isInline,
              contentId: contentIdHeader?.replace(/[<>]/g, "") || null,
              dataUrl: inlineDataUrl,
            });
          }

          // Case 2: Image inline with body.data
          else if (part.mimeType?.startsWith("image/") && part.body?.data) {
            const b64 = base64UrlToBase64(part.body.data);
            const dataUrl = `data:${part.mimeType};base64,${b64}`;

            attachments.push({
              attachmentId: null,
              attachmentMessageId: message.id,
              attachmentFileName:
                part.filename || `inline.${part.mimeType.split("/")[1]}`,
              attachmentHeaders: part.headers || [],
              mimeType: part.mimeType,
              isInline: true,
              contentId: contentIdHeader?.replace(/[<>]/g, "") || null,
              dataUrl,
            });
          }
        }

        /**
         * ---------------------------
         * Replace cid: images
         * ---------------------------
         */
        if (decodedMessage.includes("cid:")) {
          decodedMessage = decodedMessage.replace(
            /src=(["'])?cid:([^"'\s>]+)\1?/gi,
            (match, quote, cid) => {
              const cidStripped = cid.replace(/[<>]/g, "");
              const found = attachments.find(
                (a) => a.isInline && a.contentId === cidStripped
              );

              return found?.dataUrl
                ? `src="${found.dataUrl}"`
                : match;
            }
          );
        }

        /**
         * ---------------------------
         * Make images responsive
         * ---------------------------
         */
        decodedMessage = decodedMessage.replace(
          /<img([^>]*?)\/?>/gi,
          (tag, attrs) => {
            if (/style\s*=/.test(attrs)) {
              if (!/max-width:/.test(attrs)) {
                return tag.replace(
                  /style\s*=\s*(['"])(.*?)\1/,
                  (m, q, style) =>
                    `style=${q}${style} max-width:100%; height:auto;${q}`
                );
              }
              return tag;
            }

            return `<img ${attrs} style="max-width:100%;height:auto;" />`;
          }
        );

        /**
         * ---------------------------
         * FINAL CLEANUP PASS
         * ---------------------------
         */

        // Add spacing to <p>
        decodedMessage = decodedMessage.replace(
          /<p([^>]*)>/gi,
          `<p$1 style="margin:0 0 14px;line-height:1.6;">`
        );

        // Convert plaintext '>' quotes → blockquotes
        decodedMessage = stripQuotedText(decodedMessage);

        // Option B: Detect if message is truly plain text
        const hasHtmlStructure = /<(p|div|br|blockquote|table|li|ul|ol|span)[\s>]/i.test(
          decodedMessage
        );

        if (!hasHtmlStructure) {
          decodedMessage = `<p style="margin:0 0 14px;line-height:1.6;">${decodedMessage}</p>`;
        }

        // newline → <br>
        decodedMessage = decodedMessage
          .replace(/\n\s*\n/g, "<br><br>")
          .replace(/\n/g, "<br>");

        /**
         * ---------------------------
         * Sent By Me
         * ---------------------------
         */
        const fromHeader = message.payload.headers.find(
          (h) => h.name.toLowerCase() === "from"
        )?.value;

        const sentByMe = [
          "info@affotax.com",
          "Affotax Team <info@affotax.com>",
          "Affotax <info@affotax.com>",
          "Outsource Accountings <admin@outsourceaccountings.co.uk>",
          "admin@outsourceaccountings.co.uk",
        ].includes(fromHeader);

        return {
          ...message,
          payload: {
            ...message.payload,
            body: {
              ...message.payload.body,
              data: decodedMessage,
              sentByMe,
              messageAttachments: attachments,
            },
          },
        };
      })
    );

    return {
      decryptedMessages,
      threadData,
      threadId,
      subject,
      readStatus,
      recipients,
      formattedDate,
      formattedTime,
    };
  } catch (error) {
    console.log("Error while getting Thread details:", error);

    if (error.response?.status === 404) return [];
    if (error.response?.status === 429) return;

    throw error;
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
