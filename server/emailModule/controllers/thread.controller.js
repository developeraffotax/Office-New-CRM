import EmailMessage from "../models/EmailMessage.js";
import EmailThread from "../models/EmailThread.js";
 

 

/**
 * -----------------------------------------
 * GET Thread Details
 * -----------------------------------------
 * GET /api/email/thread/:threadId/:company?page=1&limit=10
 */
// export const getThreadDetails = async (req, res) => {
//   try {
//     const { threadId, company } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     if (!threadId || !company) {
//       return res.status(400).json({
//         success: false,
//         message: "threadId and company are required",
//       });
//     }

//     // 🔥 Use your existing helper
//     const gmailClient = await getGmailClient(company);

//     const threadData = await fetchThreadMessages({
//       gmailClient,
//       threadId,
//       page: Number(page),
//       limit: Number(limit),
//     });

//     if (!threadData) {
//       return res.status(404).json({
//         success: false,
//         message: "No messages found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: threadData,
//     });
//   } catch (error) {
//     console.error("getThreadDetails error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch thread",
//     });
//   }
// };















