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

import { fileURLToPath } from "url";
import { google } from "googleapis";
import path from "path";
import { JWT } from "google-auth-library";
import getJobHolderNames from "../utils/getJobHolderNames.js";
import TicketActivity from "../models/ticketActivityModel.js";
import { scheduleNotification } from "../utils/customFns/scheduleNotification.js";

// Create Ticket \
export const sendEmail = async (req, res) => {
  try {
    const { clientId, company, subject, message, email, jobHolder, clientName, companyName } = req.body;

    console.log("Subject💙💚💛", subject)
    
    const userName = req.user.user.name;

    const jobHolderToAssign = jobHolder ? jobHolder : userName ;
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
      companyName: (clientId && client?.companyName) || companyName || "",
      clientName: (clientId && client?.clientName) || clientName || "",
      company: company,
      jobHolder: jobHolderToAssign,
      subject: subject,
      mailThreadId: threadId,
      lastMessageSentBy: userName,
  

      email: email,
      isManual: clientId ? false : true
    });

    const ticketActivity = await TicketActivity.create({
      ticketId: sendEmail._id,
      userId: req.user.user._id,
      action: "created",
      details: `"${req.user.user.name}" created the ticket with subject "${subject}"
      -- Company: ${company}
      -- Client: ${clientId ? client.clientName :  clientName ? clientName : "N/A"}
      -- Email: ${email}
      `,
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













// export const getAllSendTickets = async (req, res, next) => {
//   try {
    
//     const emails = await ticketModel.find({ state: { $ne: "complete" } }).select( "clientId companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy createdAt" );

//     res.status(200).send({ success: true, message: "All email list!", emails: emails, });


    
//     const ticketsList = emails.map((email) => ({
//       threadId: email.mailThreadId,
//       companyName: email.company,
//     }));

//     const emailData = await getAllEmails(ticketsList);

//     console.log("emailData:", emailData);
//     //NEED TO UPDATE THE BELOW CODE 

   

       
//     for (const email of emailData.detailedThreads) {
       
//       const matchingTicket = await ticketModel.findOne({
//         mailThreadId: email.threadId,
//       });

//       console.log("matchingTicket:", matchingTicket);




//       if (matchingTicket) {
//         let newStatus = "Unread";

//         if (email.readStatus === "Sent") {
//           newStatus = "Send";
//         } else if (email.readStatus === "Unread") {
//           newStatus = "Unread";
//         } else if (email.readStatus === "Read") {
//           newStatus = "Read";
//         }

//         await ticketModel.updateOne(
//           { mailThreadId: email.threadId },
//           {
//             $set: {
//               status: newStatus,
//             },
//           },
//           { new: true }
//         );
//         // console.log(
//         //   `Updated ticket ${matchingTicket._id} with new status: ${newStatus}`
//         // );

//         const user = await userModel.findOne({
//           name: matchingTicket.lastMessageSentBy,
//         });

//         // Create a notification
//         if (email.readStatus === "Unread") {
//           const notiUser = user._id;

//           await notificationModel.create({
//             title: "Reply to a ticket received",
//             redirectLink: `/ticket/detail/${matchingTicket._id}`,
//             description: `You've received a response to a ticket with the subject "${matchingTicket.subject}" from the company "${matchingTicket.companyName}" and the client's name "${matchingTicket.clientName}".`,
//             taskId: matchingTicket._id,
//             userId: notiUser,
//           });
//         }
//       } else {
//         console.log(`No matching ticket found for threadId: ${email.threadId}`);
//       }
//     }

    
    

//   } catch (error) {
//     // next(error);
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error while getting emails!",
//       error: error,
//     });
//   }
// };



























export const getTicketsByClientName = async (req, res, next) => {

  const clientName = req.query.clientName?.trim();
  const clientEmail = req.query.email?.trim();

  console.log("Client Name:", clientName);
  console.log("Client Email:", clientEmail);


  try {





    let filter = { state: { $ne: "complete" } };

    if (clientName) {
      filter.clientName = clientName;
    } else if (clientEmail) {
      filter.email = clientEmail;  
    } else {
      return res.status(400).send({
        success: false,
        message: "Client name or email must be provided",
      });
    }

    const emails = await ticketModel.find(filter).select(
      "clientId companyName clientName company jobHolder subject status jobDate mailThreadId sent received"
    );

    console.log("EMAILs", emails)

    
    
    // const emails = await ticketModel.find({ state: { $ne: "complete" }, clientName: clientName.trim()  }).select( "clientId companyName clientName company jobHolder subject status jobDate mailThreadId " );

    // res.status(200).send({ success: true, message: "All email list!", emails: emails, });


    res.status(200).send({
      success: true,
      message: "Filtered email list!",
      emails,
    });
 

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



















export const updateReadUnreadTickets = async (req, res, next) => {

   
    const role = req.user?.user?.role?.name;
    const userName =  req.user?.user?.name;

    
  try {


    








    let filter = { state: { $ne: "complete" }, };

    if(role !== 'Admin') {
      let includedUsersArr = [userName];



      const user = await userModel.findById(req.user.user._id).select("juniors");
      const juniorsIdsArr = user.juniors;
      
        if(juniorsIdsArr && juniorsIdsArr.length > 0) {

          const juniorsNamesArr = await getJobHolderNames(juniorsIdsArr);
          
          includedUsersArr = includedUsersArr.concat(juniorsNamesArr)
        }

        console.log("INCLUDED USERS 🧡🧡❤", includedUsersArr)
      filter.jobHolder = { $in: includedUsersArr };
    }



    
    
    const emails = await ticketModel.find(filter).select( "sent received jobStatus clientId companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy lastMessageSentTime createdAt" );
    // res.status(200).send({ success: true, message: "All email list!", emails: emails, });
    

     


    // We can comment this one for better performance,, will see it in future.
    const ticketsList = emails.map((email) => ({
      threadId: email.mailThreadId,
      companyName: email.company,
    }));

    const emailData = await getAllEmails(ticketsList);

    // console.log("emailData:", emailData);
    //NEED TO UPDATE THE BELOW CODE 
   

    if(!emailData.detailedThreads) {
      return res.status(400).send({ success: false, message: "No email data found!" });
    }

    const threadIds = emailData.detailedThreads.map(email => {
      if(email?.threadId) {
        return email.threadId;
      }
    });


    const matchingTickets = await ticketModel.find({
      mailThreadId: { $in: threadIds }
    });





    // Map the tickets to the corresponding threadId for easier lookup
      const ticketMap = matchingTickets.reduce((map, ticket) => {
        map[ticket.mailThreadId] = ticket;
        return map;
      }, {});


       
    for (const email of emailData.detailedThreads) {
       
    
      
      
      if(email?.threadId) {  
        const matchingTicket = ticketMap[email.threadId];
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
          
        }  





      } else {
        //console.log(`No matching ticket found for threadId: ${email?.threadId}`);
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

















 

export async function getSentReceivedCountsPerThread() {


 
   // // Get __dirname
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
 
   // Path for Credentials
   const CREDENTIALS_PATH = path.join( __dirname, "..", "creds", "service-pubsub.json" );
 
   // Scopes you need
   const SCOPES = [ "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify",  ];
 
   // Create a JWT client using the Service Account key
   const jwtClient = new JWT({
     keyFile: CREDENTIALS_PATH,
     scopes: SCOPES,
     subject: "info@affotax.com",
   });

   try {

    let filter = { state: { $ne: "complete" } };
  
   const threadIds = await ticketModel.find(filter).select( "mailThreadId" );
    // console.log(threadIds)



   await jwtClient.authorize(); 

    const gmail = google.gmail({ version: 'v1', auth:jwtClient });

    // Get your Gmail address
    //const profile = await gmail.users.getProfile({ userId: 'me' });
    const myEmail = "info@affotax.com";
  
    const results = [];
  
    for (const threadId of threadIds) {
      let sent = 0;
      let received = 0;
  
      try {
        const thread = await gmail.users.threads.get({
          userId: 'me',
          id: threadId.mailThreadId,
          format: 'metadata',
          metadataHeaders: ['From'],
        });
  
        for (const message of thread.data.messages || []) {
          const headers = message.payload.headers || [];
          const fromHeader = headers.find(
            (h) => h.name.toLowerCase() === 'from'
          );
          if (!fromHeader) continue;
  
          const from = fromHeader.value;
  
          if (from.includes(`<${myEmail}>`)) {
            sent++;
          } else {
            received++;
          }
        }
        

        
        results.push({
          threadId:threadId.mailThreadId,
          totalSent: sent,
          totalReceived: received,
        });
      } catch (err) {
        console.error(`Failed to process thread ${threadId.mailThreadId}:`, err.message);
        results.push({
          threadId:threadId.mailThreadId,
          totalSent: 0,
          totalReceived: 0,
          error: err.message,
        });
      }
    }
  
    console.log("RESULT:",results)


    // element structure { threadId: '19528fe4bffd55b6', totalSent: 4, totalReceived: 1 },

    if(results.length > 0) {
    await ticketModel.bulkWrite(
      results.map(el => ({
        updateOne: {
          filter: { mailThreadId: el.threadId },
          update: {
            $set: {
              sent: el.totalSent,
              received: el.totalReceived,
              
              
            }
          }
        }
      }))
    );

  }

    // return results;

    // res.status(200).send({ success: true, message: "Number of Replies!", replies: results, });

    
   } catch (error) {
    console.log("Error occured while getting number of replies", error);
    res.status(500).send({ success: true, message: "Number of Replies!!", error: error, });
   }



}


















































export const getAllSendTickets = async (req, res, next) => {

   
    const role = req.user?.user?.role?.name;
    const userName =  req.user?.user?.name;

    
  try {


    








    let filter = { state: { $ne: "complete" }, };

    if(role !== 'Admin') {
      let includedUsersArr = [userName];



      const user = await userModel.findById(req.user.user._id).select("juniors");
      const juniorsIdsArr = user.juniors;
      
        if(juniorsIdsArr && juniorsIdsArr.length > 0) {

          const juniorsNamesArr = await getJobHolderNames(juniorsIdsArr);
          
          includedUsersArr = includedUsersArr.concat(juniorsNamesArr)
        }

        console.log("INCLUDED USERS 🧡🧡❤", includedUsersArr)
      filter.jobHolder = { $in: includedUsersArr };
    }



    
    
    const emails = await ticketModel.find(filter).select( "sent received jobStatus clientId companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy lastMessageSentTime createdAt" );
    res.status(200).send({ success: true, message: "All email list!", emails: emails, });
    

     


    // // We can comment this one for better performance,, will see it in future.
    // const ticketsList = emails.map((email) => ({
    //   threadId: email.mailThreadId,
    //   companyName: email.company,
    // }));

    // const emailData = await getAllEmails(ticketsList);

    // // console.log("emailData:", emailData);
    // //NEED TO UPDATE THE BELOW CODE 
   

    // if(!emailData.detailedThreads) {
    //   return res.status(400).send({ success: false, message: "No email data found!" });
    // }

    // const threadIds = emailData.detailedThreads.map(email => {
    //   if(email?.threadId) {
    //     return email.threadId;
    //   }
    // });


    // const matchingTickets = await ticketModel.find({
    //   mailThreadId: { $in: threadIds }
    // });





    // // Map the tickets to the corresponding threadId for easier lookup
    //   const ticketMap = matchingTickets.reduce((map, ticket) => {
    //     map[ticket.mailThreadId] = ticket;
    //     return map;
    //   }, {});


       
    // for (const email of emailData.detailedThreads) {
       
    
      
      
    //   if(email?.threadId) {  
    //     const matchingTicket = ticketMap[email.threadId];
    //     if (matchingTicket) {
    //       let newStatus = "Unread";
  
    //       if (email.readStatus === "Sent") {
    //         newStatus = "Send";
    //       } else if (email.readStatus === "Unread") {
    //         newStatus = "Unread";
    //       } else if (email.readStatus === "Read") {
    //         newStatus = "Read";
    //       }
  
    //       await ticketModel.updateOne(
    //         { mailThreadId: email.threadId },
    //         {
    //           $set: {
    //             status: newStatus,
    //           },
    //         },
    //         { new: true }
    //       );
    //       // console.log(
    //       //   `Updated ticket ${matchingTicket._id} with new status: ${newStatus}`
    //       // );
  
    //       // const user = await userModel.findOne({
    //       //   name: matchingTicket.lastMessageSentBy,
    //       // });
  
    //       // Create a notification
    //       // if (email.readStatus === "Unread") {
    //       //   const notiUser = user._id;
  
    //       //   await notificationModel.create({
    //       //     title: "Reply to a ticket received",
    //       //     redirectLink: `/ticket/detail/${matchingTicket._id}`,
    //       //     description: `You've received a response to a ticket with the subject "${matchingTicket.subject}" from the company "${matchingTicket.companyName}" and the client's name "${matchingTicket.clientName}".`,
    //       //     taskId: matchingTicket._id,
    //       //     userId: notiUser,
    //       //   });
    //       // }
    //     }  





    //   } else {
    //     //console.log(`No matching ticket found for threadId: ${email?.threadId}`);
    //   }
    // }

    
    

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

    // if(threadDetails.readStatus === "Unread") {
    //   // Mark the thread as read
    // await markThreadAsRead(threadDetails.latestMessageId, company);
    // }
    

    // const status = threadDetails.readStatus === "Unread" ? "Read" : threadDetails.readStatus ;

    // await ticketModel.findByIdAndUpdate(
    //   { _id: ticketId },
    //   { status: status  },
    //   { new: true }
    // );

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
    //const { jobDate, state, jobHolder, jobStatus } = req.body;
     const updates = req.body; // Dynamic fields from client
    const allowedUpdates = ['jobDate', 'state', 'jobHolder', 'jobStatus', 'clientName', 'companyName']; // Whitelist of allowed fields
    const updateKeys = Object.keys(updates);

      // Optional: Validate fields
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
    if (!isValidUpdate) {
        return res.status(400).json({ success: false, message: "Invalid fields in update!"});
    }

    const existingTicket = await ticketModel.findById(ticketId);
    if (!existingTicket) {
      return res.status(400).send({ success: false, message: "Ticket not found!", });
    }

    const ticket = await ticketModel.findByIdAndUpdate( { _id: existingTicket._id, }, updates, { new: true } );




   // Create Notification
   if(updateKeys.includes('jobHolder') && (req.user?.user?.name !== ticket?.jobHolder)) {  
    const user = await userModel.findOne({ name: ticket.jobHolder });
    
        const payload = {
      title: "New Ticket Assigned",
      redirectLink: "/tickets",
      description: `${req.user.user.name} assigned a new ticket of "${ticket.subject}"`,
      taskId: `${ticket._id}`,
      userId: user._id,
      type: "ticket_assigned",
    }


    scheduleNotification(true, payload)
  }









    const activities = [];

    // Loop through updates to create individual activity logs
    updateKeys.forEach(key => {
      const oldValue = existingTicket[key];
      const newValue = ticket[key];

      if (oldValue !== newValue) {
        activities.push({
          ticketId,
          userId: req.user.user._id,
          action: "updated",
          
          details: `"${req.user.user.name}" updated the "${key}" from "${oldValue}" to "${newValue}"`,
        });
      }
    });


// Save activity logs in parallel
    if (activities.length > 0) {
      await TicketActivity.insertMany(activities);
    }










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
















































// // Update Ticket
// export const updateTickets = async (req, res) => {
//   try {
//     const ticketId = req.params.id;
//     const { jobDate, state, jobHolder, jobStatus } = req.body;

//     console.log("State:", state);

//     const existingTicket = await ticketModel.findById(ticketId);
//     if (!existingTicket) {
//       return res.status(400).send({
//         success: false,
//         message: "Ticket not found!",
//       });
//     }

//     const ticket = await ticketModel.findByIdAndUpdate(
//       {
//         _id: existingTicket._id,
//       },
//       {
//         jobDate: jobDate || existingTicket.jobDate,
//         state: state ? state : existingTicket.state,
//         jobHolder: jobHolder ? jobHolder : existingTicket.jobHolder,
//         jobStatus: jobStatus ? jobStatus : existingTicket.jobStatus,
//       },

//       { new: true }
//     );

//     res.status(200).send({
//       success: true,
//       message: "Ticket update successfully!",
//       ticket: ticket,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error while update ticket!",
//       error: error,
//     });
//   }
// };

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











// Single Ticket
export const singleTicketByMailThreadId = async (req, res) => {
  try {
    const mailThreadId = req.params.id;

    const ticket = await ticketModel.findOne({mailThreadId: mailThreadId})

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


        let updatedTicket = null;


    if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
       updatedTicket = await ticketModel.findByIdAndUpdate(
        ticketId,
        { lastMessageSentBy: userName, lastMessageSentTime: new Date(), status: "Sent" },
        { new: true }
      );

      if (!updatedTicket) {
        return res.status(404).send({
          success: false,
          message: "Ticket not found. Email was sent, but ticket update failed.",
        });
      }
      
    } else {
      console.log("Invalid ticketId");
      return res.status(400).send({
        success: false,
        message: "Invalid ticketId. Email was sent, but ticket update did not occur.",
      });
    }



    const ticketActivity = await TicketActivity.create({
      ticketId: ticketId,
      userId: req.user.user._id,
      action: "replied",
      details: `"${req.user.user.name}" replied to this ticket.
      -- Company: ${company}
      -- Email: ${emailSendTo}
      `,
    });

    res.status(200).send({
      success: true,
      message: "Email reply successfully!",
      updatedTicket: updatedTicket
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

 

    await markThreadAsRead(messageId, companyName);

    const ticket = await ticketModel.findById(ticketId);
    if (!ticket) {
      return res.status(400).send({
        success: false,
        message: "Ticket not found!",
      });
    }

    //const newStatus = ticket.status === "Unread" ? "Read" : ticket.status ;
     if (ticket?.status === "Sent" || ticket?.status === "Read") {
      return res.status(400).send({
        success: false,
        message: "No need to update ticket status!",
      });
    }

    const updatedTicket = await ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      { status: "Read" },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Email Read",
      updatedTicket: updatedTicket
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
  const role = req.user?.user?.role?.name;
  const userName =  req.user?.user?.name
  try {

    if(role === 'Admin') {
      const emails = await ticketModel .find({ state: { $ne: "progress" } }) .select( "clientId jobStatus companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy createdAt received sent" );
      res.status(200).send({ success: true, message: "All complete email list!", emails: emails, });
    } else {
      const emails = await ticketModel .find({ state: { $ne: "progress" }, jobHolder: userName }) .select( "clientId jobStatus companyName clientName company jobHolder subject status jobDate comments._id mailThreadId isOpen lastMessageSentBy createdAt received sent" );
      res.status(200).send({ success: true, message: "All complete email list!", emails: emails, });
    }
   

    
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







































// Update Bulk Tickets
 
export const updateBulkTickets = async (req, res) => {
  try {
    const {
      rowSelection,
      updates  // object which contains all the updates values 
      
    } = req.body;

    console.log("Updates",updates)
    console.log("rowSelection",rowSelection)
    if (
      !rowSelection ||
      !Array.isArray(rowSelection) ||
      rowSelection.length === 0
    ) {
      return res.status(400).send({
        success: false,
        message: "No jobs selected for update.",
      });
    }


 

    let updateData = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        updateData[key] = value;
      }
    });

    const updatedTickets = await ticketModel.updateMany(
      {
        _id: { $in: rowSelection },
      },
      { $set: updateData },
       
    );

 

    // Check if any leads were updated
    if (updatedTickets.modifiedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "No leads were updated.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Tickets updated successfully!",
      updatedTickets,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update bulk tickets!",
      error: error,
    });
  }
};