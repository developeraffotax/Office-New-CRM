import qs from "qs";
import axios from "axios";
import dotenv from "dotenv";

// Dotenv Config
dotenv.config();

// Get Affotax Access Token
const getAccessToken = async () => {
  try {
    var data = qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: process.env.REFRESH_TOKEN,
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

    const response = await axios(config);
    var accessToken = await response.data.access_token;

    console.log("Access token1:", accessToken);

    return accessToken;
  } catch (error) {
    console.log("Error in access token:", error);
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
    var accessToken = "";
    var fromEmail = "";

    console.log("Access token:", getAccessToken);

    if (emailData.company_name === "Affotax") {
      accessToken = await getAccessToken();
      fromEmail = "Affotax <info@affotax.com>";
    } else if (emailData.company_name === "Outsource") {
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
