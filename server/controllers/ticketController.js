import axios from "axios";
import jobsModel from "../models/jobsModel.js";
import messageModel from "../models/messageModel.js";
import ticketModel from "../models/ticketModel.js";
import {
  deleteEmail,
  emailReply,
  getAllEmailInbox,
  getAllEmails,
  getAttachments,
  getSingleEmail,
  markThreadAsRead,
  sendEmailWithAttachments,
} from "../utils/gmailApi.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

// Create Ticket \
export const sendEmail = async (req, res) => {
  try {
    const { clientId, company, subject, message, email } = req.body;

    const userName = req.user.user.name;
    let client;

    if (clientId) {
      client = await jobsModel.findById(clientId);
    }

    if ((clientId && !client?.email) || (email && !email)) {
      return res.status(400).send({
        success: false,
        message: "Client email not found!",
      });
    }

    console.log("email:", email);

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
      email: clientId ? client.email : email,
      subject: subject,
      message: message,
      attachments: attachments,
      company: company,
      company_email: company_email,
    };

    const resp = await sendEmailWithAttachments(emailData);

    const threadId = resp.data.threadId;

    const sendEmail = await ticketModel.create({
      clientId: clientId || "",
      companyName: (clientId && client?.companyName) || "",
      clientName: (clientId && client?.clientName) || "",
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

// export const getAllSendTickets = async (req, res) => {
//   try {
//     const emails = await ticketModel
//       .find({ state: { $ne: "complete" } })
//       .select(
//         "clientId companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy createdAt"
//       );

//     const ticketsList = emails.map((email) => ({
//       threadId: email.mailThreadId,
//       companyName: email.company,
//     }));

//     const emailData = await getAllEmails(ticketsList);

//     // emailData.detailedThreads.forEach(async (email) => {
//     //   const matchingTicket = ticketModel.find(
//     //     (ticket) => ticket.mailThreadId === email.threadId
//     //   );
//     // });

//     // for (const email of emailData.detailedThreads) {
//     //   const matchingTicket = await ticketModel.findOne({
//     //     mailThreadId: email.threadId,
//     //   });

//     //   if (matchingTicket) {
//     //     let newStatus = "Unread";
//     //     if (email.readStatus === "Sent") {
//     //       newStatus = "Send";
//     //     } else if (email.readStatus === "Unread") {
//     //       newStatus = "Unread";
//     //     } else if (email.readStatus === "Read") {
//     //       newStatus = "Read";
//     //     }

//     //     await ticketModel.updateOne(
//     //       { mailThreadId: email.threadId },
//     //       {
//     //         $set: {
//     //           status: newStatus,
//     //         },
//     //       },
//     //       { new: true }
//     //     );

//     //     console.log(
//     //       `Updated ticket ${matchingTicket._id} with new status: ${newStatus}`
//     //     );
//     //   } else {
//     //     console.log(`No matching ticket found for threadId: ${email.threadId}`);
//     //   }
//     // }

//     const notification = await notificationModel.create({
//       title: "Reply to a ticket received",
//       redirectLink: "/tickets",
//       description: `You've received a response to a ticket with the subject "${email.subject}`,
//       taskId: `${tasks._id}`,
//       userId: notiUser._id,
//     });

//     res.status(200).send({
//       success: true,
//       message: "All email list!",
//       emails: emails,
//       emailData: emailData,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error while get emails!",
//       error: error,
//     });
//   }
// };

export const getAllSendTickets = async (req, res, next) => {
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


    
    const ticketsList = emails.map((email) => ({
      threadId: email.mailThreadId,
      companyName: email.company,
    }));

    const emailData = await getAllEmails(ticketsList);

    for (const email of emailData.detailedThreads) {
      const matchingTicket = await ticketModel.findOne({
        mailThreadId: email?.threadId,
      });

      if (matchingTicket) {
        let newStatus = "Unread";

        if (email.readStatus === "Sent") {
          newStatus = "Send";
        } else if (email.readStatus === "Unread") {
          newStatus = "Unread";
        } else if (email.readStatus === "Read") {
          newStatus = "Read";
        }

        await ticketModel.updateOne(
          { mailThreadId: email.threadId },
          {
            $set: {
              status: newStatus,
            },
          },
          { new: true }
        );
        // console.log(
        //   `Updated ticket ${matchingTicket._id} with new status: ${newStatus}`
        // );

        const user = await userModel.findOne({
          name: matchingTicket.lastMessageSentBy,
        });

        // Create a notification
        if (email.readStatus === "Unread") {
          const notiUser = user._id;

          await notificationModel.create({
            title: "Reply to a ticket received",
            redirectLink: `/ticket/detail/${matchingTicket._id}`,
            description: `You've received a response to a ticket with the subject "${matchingTicket.subject}" from the company "${matchingTicket.companyName}" and the client's name "${matchingTicket.clientName}".`,
            taskId: matchingTicket._id,
            userId: notiUser,
          });
        }
      } else {
        console.log(`No matching ticket found for threadId: ${email.threadId}`);
      }
    }
  } catch (error) {
    // next(error);
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting emails!",
      error: error,
    });
  }
};

// Get Single Email detail

export const getSingleEmailDetail = async (req, res) => {
  try {
    const { ticketId, mailThreadId, company } = req.params;

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

    // console.log("threadDetails:", threadDetails);

    await ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      { status: threadDetails.readStatus },
      { new: true }
    );

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
    const { jobDate, state, jobHolder } = req.body;

    console.log("State:", state);

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
      {
        jobDate: jobDate || existingTicket.jobDate,
        state: state ? state : existingTicket.state,
        jobHolder: jobHolder ? jobHolder : existingTicket.jobHolder,
      },

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

// Single Ticket
export const singleTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await ticketModel.findById(ticketId);

    if (!ticket) {
      return res.status(400).send({
        success: false,
        message: "Ticket not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single ticket!",
      ticket: ticket,
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

// Get Attachments
export const getTicketAttachments = async (req, res) => {
  try {
    const { attachmentId, messageId, companyName } = req.params;

    const resp = await getAttachments(attachmentId, messageId, companyName);

    res.send(resp);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get email attachments!",
      error: error,
    });
  }
};

// Ticket Reply
export const sendTicketReply = async (req, res) => {
  try {
    const userName = req.user.user.name;
    const {
      ticketId,
      company,
      threadId,
      messageId,
      message,
      subject,
      emailSendTo,
    } = req.body;

    console.log(
      "Reply Detail:",
      ticketId,
      company,
      threadId,
      messageId,
      message,
      subject,
      emailSendTo
    );

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      content: file.buffer.toString("base64"),
    }));

    const emailData = {
      company: company,
      threadId: threadId,
      messageId: messageId,
      message: message,
      subject: subject,
      emailSendTo: emailSendTo,
      attachments: attachments,
    };

    await emailReply(emailData);

    if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
      await ticketModel.findByIdAndUpdate(
        ticketId,
        { lastMessageSentBy: userName },
        { new: true }
      );
    } else {
      console.log("Invalid ticketId");
    }

    res.status(200).send({
      success: true,
      message: "Email reply successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messaeg: "Error while send ticket reply!",
      error: error,
    });
  }
};

// Mark As Read
export const markAsRead = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { messageId, companyName } = req.body;

    if (!companyName) {
      return;
    }

    // console.log("Thread Detail:", messageId, companyName);

    await markThreadAsRead(messageId, companyName);

    await ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      { status: "Read" },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Email Read",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while mark as read!",
      error: error,
    });
  }
};

// Get Comments
export const singleTicketComments = async (req, res) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId) {
      return res.status(400).send({
        success: false,
        message: "Ticket Id is required!",
      });
    }

    const ticketComments = await ticketModel
      .findById({ _id: ticketId })
      .select("comments");

    res.status(200).send({
      success: true,
      comments: ticketComments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single ticket comment!",
      error: error,
    });
  }
};

// Get Complete Tickets
export const getCompleteTickets = async (req, res) => {
  try {
    const emails = await ticketModel
      .find({ state: { $ne: "progress" } })
      .select(
        "clientId companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy createdAt"
      );

    res.status(200).send({
      success: true,
      message: "All complete email list!",
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

// Get ALl Inbox Data
export const getAllInbox = async (req, res) => {
  try {
    const { selectedCompany, pageNo, type } = req.params;
    console.log(selectedCompany, pageNo, type);
    const reponse = await getAllEmailInbox(selectedCompany, pageNo, type);

    res.status(200).send({
      success: true,
      message: "All Inbox",
      email: reponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get all email inbox data!",
      error: error,
    });
  }
};

// Delete Email from Inbox
export const deleteinboxEmail = async (req, res) => {
  try {
    const { id, companyName } = req.params;

    if (!companyName) {
      return res.status(400).send({
        success: false,
        message: "Company name is required!",
      });
    }

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Email id is required!",
      });
    }

    await deleteEmail(id, companyName);

    res.status(200).send({
      success: true,
      message: "Email delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete email!",
      error: error,
    });
  }
};

export const deleteMultipleEmail = async (req, res) => {
  try {
    const { companyName } = req.params;
    const { ids } = req.body;

    if (!companyName) {
      return res.status(400).send({
        success: false,
        message: "Company name is required!",
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Email id is required!",
      });
    }

    const deletionResults = await Promise.all(
      ids.map((id) => deleteEmail(id, companyName))
    );

    // await deleteEmail(id, companyName);

    res.status(200).send({
      success: true,
      message: "Email delete successfully!",
      deletionResults,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete email!",
      error: error,
    });
  }
};

// Get Inbox Detail
export const getInboxDetail = async (req, res) => {
  try {
    const { mailThreadId, company } = req.params;

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

// Inbox Mark As Read
export const markAsReadInboxEmail = async (req, res) => {
  try {
    const { messageId, companyName } = req.body;

    // console.log("Thread Detail:", messageId, companyName);

    await markThreadAsRead(messageId, companyName);

    res.status(200).send({
      success: true,
      message: "Email Read",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while mark as read inbox!",
      error: error,
    });
  }
};

// Assign Email to Employees
export const assignEmail = async (req, res) => {
  try {
    const { companyName, clientName, company, jobHolder, subject, threadId } =
      req.body;

    const userName = req.user.user.name;
    // const client = await jobsModel.findById(clientId);

    const sendEmail = await ticketModel.create({
      // clientId: clientId,
      companyName: companyName,
      clientName: clientName,
      company: company,
      jobHolder: jobHolder,
      subject: subject,
      mailThreadId: threadId,
      lastMessageSentBy: userName,
    });

    res.status(200).send({
      success: true,
      message: "Email allocate successfully!",
      ticket: sendEmail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while allocate email!",
      error: error,
    });
  }
};

export const getDashboardTickets = async (req, res) => {
  try {
    const emails = await ticketModel
      .find({ state: { $ne: "complete" } })
      .select("jobHolder  createdAt");

    res.status(200).send({
      success: true,
      message: "All email list!",
      emails: emails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting emails!",
      error: error,
    });
  }
};
