import axios from "axios";
import jobsModel from "../models/jobsModel.js";
import messageModel from "../models/messageModel.js";
import ticketModel from "../models/ticketModel.js";
import { getSingleEmail, sendEmailWithAttachments } from "../utils/gmailApi.js";

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
      clientId: clientId,
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

// Get ALl Email

export const getAllSendTickets = async (req, res) => {
  try {
    const emails = await ticketModel
      .find({ state: { $ne: "complete" } })
      .select(
        "clientId companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy createdAt"
      );

    res.status(200).send({
      success: true,
      message: "All email list!",
      emails: emails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get emails!",
      error: error,
    });
  }
};

// Get Single Email detail

export const getSingleEmailDetail = async (req, res) => {
  try {
    const { mailThreadId, company } = req.body;

    if (!mailThreadId || !company) {
      return res.status(400).json({
        success: false,
        message: "mailThreadId and company are required",
      });
    }

    const ticketDetail = {
      threadId: mailThreadId,
      companyName: company,
    };

    // Fetch the email thread details based on the mailThreadId
    const threadDetails = await getSingleEmail(ticketDetail);

    if (!threadDetails || threadDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No email found for this mailThreadId",
      });
    }

    // Process and return the email details along with attachments
    res.status(200).json({
      success: true,
      emailDetails: threadDetails,
    });
  } catch (error) {
    console.log("Error while getting single email details:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting email details!",
      error: error,
    });
  }
};

// Update Ticket
export const updateTickets = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { jobDate, state } = req.body;

    const existingTicket = await ticketModel.findById(ticketId);
    if (!existingTicket) {
      return res.status(400).send({
        success: false,
        message: "Ticket not found!",
      });
    }

    const ticket = await ticketModel.findByIdAndUpdate(
      {
        _id: existingTicket._id,
      },
      { jobDate: jobDate || existingTicket.jobDate },
      { state: state || existingTicket.state },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Ticket update successfully!",
      ticket: ticket,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update ticket!",
      error: error,
    });
  }
};

// Delete Ticket
export const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      return res.status(400).send({
        success: false,
        message: "Ticket not found!",
      });
    }

    await ticketModel.findByIdAndDelete(ticket._id);

    res.status(200).send({
      success: true,
      message: "Ticket deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete ticket!",
      error: error,
    });
  }
};
