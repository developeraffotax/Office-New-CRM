import mongoose from "mongoose";

export const getHeader = (headers, name) =>
  headers.find(h => h.name === name)?.value || "";



export function extractAttachments(payload) {
  const attachments = [];

  function walk(parts = []) {
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size || 0
        });
      }
      if (part.parts) walk(part.parts);
    }
  }

  walk(payload.parts);
  return attachments;
}




// export function categorizeEmail({ from, subject, to }) {
//   const s = subject.toLowerCase();

//   if (to.some(e => e.email.includes("support@")) || s.includes("help"))
//     return "support";

//   if (s.includes("pricing") || s.includes("quote") || s.includes("demo"))
//     return "lead";

//   return "other";
// }



export function parseEmail(headerValue) {
  if (!headerValue) return { name: "", email: "" };

  // Regex to match: "Name <email>" or just email
  const match = headerValue.match(/(.*)<(.+)>/);

  if (match) {
    return {
      name: match[1].trim().replace(/(^"|"$)/g, ""), // remove quotes
      email: match[2].trim()
    };
  } else {
    return {
      name: "",
      email: headerValue.trim()
    };
  }
}



 

export function parseEmailList(headerValue) {
  if (!headerValue) return [];

  // Gmail headers can be comma-separated
  return headerValue
    .split(",")
    .map(part => parseEmail(part.trim()))
    .filter(e => e.email); // remove empty
}










// export const buildUnassignedFilter = (field) => {
//   if (field === "userId") {
//     return [
//       { userId: { $exists: false } },
//       { userId: null },
//     ];
//   }

//   if (field === "category") {
//     return [
//       { category: { $exists: false } },
//       { category: null },
//       { category: "" },
//     ];
//   }

//   return [];
// };





// filters.js
export const buildFilterQuery = (filters) => {
  const andFilters = [];


  // Company filter
  if (filters.companyName) {
    andFilters.push({ companyName: filters.companyName });
  }


  // User filter
  if (filters.userId) {
    if (filters.userId === "unassigned") {
      andFilters.push({ $or: [{ userId: { $exists: false } }, { userId: null }] });
    } else if (mongoose.Types.ObjectId.isValid(filters.userId)) {
      andFilters.push({ userId: new mongoose.Types.ObjectId(filters.userId) });
    }
  }

  // Category filter
  if (filters.category) {
    if (filters.category === "unassigned") {
      andFilters.push({ $or: [{ category: { $exists: false } }, { category: null }, { category: "" }] });
    } else {
      andFilters.push({ category: filters.category });
    }
  }
  

  // Folder filter
  if (filters.folder === "inbox") andFilters.push({ hasInboxMessage: true });
  if (filters.folder === "sent") andFilters.push({ hasSentMessage: true });

  // Unread
  if (filters.unreadOnly === "true") andFilters.push({ unreadCount: { $gt: 0 } });

  // Date filter
  const dateField = filters.folder === "sent" ? "lastMessageAtSent" : "lastMessageAtInbox";
  if (filters.startDate || filters.endDate) {
    const dateQuery = {};
    if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
    if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);
    andFilters.push({ [dateField]: dateQuery });
  }

  // Search
  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    andFilters.push({
      $or: [
        { subject: searchRegex },
        { "participants.email": searchRegex },
        { "participants.name": searchRegex },
      ],
    });
  }

 

  // If no $and, return {} to match everything
  if (andFilters.length === 0) return {};
  if (andFilters.length === 1) return andFilters[0];
  return { $and: andFilters };
};


