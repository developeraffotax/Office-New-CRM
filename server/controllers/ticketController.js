import jobsModel from "../models/jobsModel.js";
import ticketModel from "../models/ticketModel.js";
import { sendEmailWithAttachments } from "../utils/gmailApi.js";

// Create Ticket \
export const sendEmail = async (req, res) => {
  try {
    const { clientId, company, subject, message } = req.body;

    const userName = req.user.user.name;
    const client = await jobsModel.findById(clientId);

    if (!client.email) {
      return res.status(400).send({
        success: false,
        message: "Client email not found!",
      });
    }

    if (!client) {
      return res.status(400).send({
        success: false,
        message: "Client not found!",
      });
    }

    var company_email = "";
    if (company === "Affotax") {
      company_email = "info@affotax.com";
    } else if (company === "Outsource") {
      company_email = "admin@outsourceaccountings.co.uk";
    }

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      content: file.buffer.toString("base64"),
    }));

    const emailData = {
      email: client.email,
      subject: subject,
      message: message,
      attachments: attachments,
      company: company,
      company_email: company_email,
    };

    const resp = await sendEmailWithAttachments(emailData);

    const threadId = resp.data.threadId;

    const sendEmail = await ticketModel.create({
      companyName: client.companyName,
      clientName: client.clientName,
      company: company,
      jobHolder: userName,
      subject: subject,
      mailThreadId: threadId,
      lastMessageSentBy: userName,
    });

    res.status(200).send({
      success: true,
      message: "Email send successfully!",
      email: sendEmail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create tickets!",
      error: error,
    });
  }
};
