 
import mongoose from "mongoose";

// ─── Helpers ───────────────────────────────────────────────────────────────

const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const unassignedFilter = () => ({ $or: [{ userId: { $exists: false } }, { userId: null }] });

// ─── Email parsing helpers (unchanged) ─────────────────────────────────────

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

// ─── Filter builders ───────────────────────────────────────────────────────

const applyScalarFilters = (filters) => {
  const clauses = [];

  if (filters.companyName)   clauses.push({ companyName: filters.companyName });
  if (filters.status)        clauses.push({ status: filters.status });
  if (filters.lastMessageBy) clauses.push({ lastMessageBy: filters.lastMessageBy });
  if (filters.starred === "true") clauses.push({ labels: "STARRED" });
  if (filters.mailThreadId)  clauses.push({ threadId: filters.mailThreadId });

  return clauses;
};

const applyCategoryFilter = (filters) => {
  if (!filters.category) return null;

  if (filters.category === "unassigned") {
    return { $or: [{ category: { $exists: false } }, { category: null }, { category: "" }] };
  }

  return { category: filters.category };
};

const applyFolderFilter = (filters) => {
  if (filters.folder === "inbox") return { hasInboxMessage: true };
  if (filters.folder === "sent")  return { hasSentMessage: true, labels: { $nin: ["TRASH"] } };
  return null;
};

const applyUnreadFilter = (filters, userId) => {
  if (filters.unreadOnly !== "true") return null;

  const userIdObj = toObjectId(userId);
  const lastMessageField = filters.folder === "sent" ? "$lastMessageAtSent" : "$lastMessageAtInbox";

  return {
    $expr: {
      $or: [
        // Case 1: user never read → unread
        {
          $eq: [
            {
              $size: {
                $filter: {
                  input: "$readBy",
                  as: "r",
                  cond: { $eq: ["$$r.userId", userIdObj] },
                },
              },
            },
            0,
          ],
        },

        // Case 2: lastReadAt < lastMessageAt → unread
        {
          $lt: [
            {
              $let: {
                vars: {
                  userRead: {
                    $first: {
                      $filter: {
                        input: "$readBy",
                        as: "r",
                        cond: { $eq: ["$$r.userId", userIdObj] },
                      },
                    },
                  },
                },
                in: "$$userRead.lastReadAt",
              },
            },
            lastMessageField,
          ],
        },
      ],
    },
  };
};

const applyDateFilter = (filters) => {
  if (!filters.startDate && !filters.endDate) return null;

  const dateField = filters.folder === "sent" ? "lastMessageAtSent" : "lastMessageAtInbox";
  const dateQuery = {};
  if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
  if (filters.endDate)   dateQuery.$lte = new Date(filters.endDate);

  return { [dateField]: dateQuery };
};

const applySearchFilter = (filters) => {
  if (!filters.search?.trim()) return null;

  const searchRegex = new RegExp(filters.search.trim(), "i");
  return {
    $or: [
      { subject: searchRegex },
      { "participants.email": searchRegex },
      { "participants.name": searchRegex },
    ],
  };
};

// ─── User assignment filter (role-aware) ──────────────────────────────────

const applyUserAssignmentFilter = (filters, { isAdmin, isTeamLead, user, hasUnassignedPermission, juniors }) => {
  const selfId = toObjectId(user._id);
  const requestingUnassigned = filters.userId === "unassigned";

  if (isAdmin) {
    if (requestingUnassigned) return unassignedFilter();
    if (isValidId(filters.userId)) return { userId: toObjectId(filters.userId) };
    return null;
  }

  // Non-admin requesting unassigned
  if (requestingUnassigned) {
    if (!hasUnassignedPermission) throw new Error("Unauthorized");
    return unassignedFilter();
  }

  if (isTeamLead) {
    const juniorIds = juniors
      .filter(isValidId)
      .map(toObjectId);

    // Team lead filtered to a specific user
    if (filters.userId && isValidId(filters.userId)) {
      return { userId: toObjectId(filters.userId) };
    }

    // Team lead default view
    const visibleUsers = [selfId, ...juniorIds];

    if (hasUnassignedPermission) {
      return {
        $or: [
          { userId: { $in: visibleUsers } },
          { userId: null },
          { userId: { $exists: false } },
        ],
      };
    }

    return { userId: { $in: visibleUsers } };
  }

  // Regular user — own conversations only
  return { userId: selfId };
};

// ─── Main export ──────────────────────────────────────────────────────────

export const buildFilterQuery = (req) => {
  const user = req?.user?.user;

  const inboxPermission = user.role?.access?.find(
    (a) => a.permission === "Inbox",
  );
  const hasUnassignedPermission = inboxPermission?.subRoles?.includes("Unassigned");
  const isAdmin    = user?.role?.name === "Admin";
  const isTeamLead = user?.isTeamLead;
  const juniors    = user?.juniors || [];

  const filters = req.query;

  const andFilters = [
    ...applyScalarFilters(filters),
    applyUserAssignmentFilter(filters, { isAdmin, isTeamLead, user, hasUnassignedPermission, juniors }),
    applyCategoryFilter(filters),
    applyFolderFilter(filters),
    applyUnreadFilter(filters, user._id),
    applyDateFilter(filters),
    applySearchFilter(filters),
  ].filter(Boolean);

  if (andFilters.length === 0) return {};
  if (andFilters.length === 1) return andFilters[0];
  return { $and: andFilters };
};











 



// filters.js
export const buildFilterQuery2 = (req) => {

  const user = req?.user?.user;

  const isAdmin = user?.role?.name === "Admin";
  const isTeamLead = user?.isTeamLead;
  const juniors = user?.juniors || [];


  console.log(" THE USER IS ❤️❤️", user)

  const filters = req.query;
  const andFilters = [];


  // Company filter
  if (filters.companyName) {
    andFilters.push({ companyName: filters.companyName });
  }

  if (filters?.status) {
    andFilters.push({ status: filters?.status });
  }

  if (filters?.lastMessageBy) {
    andFilters.push({ lastMessageBy: filters?.lastMessageBy });
  }

  // ⭐ Starred filter
    if (filters?.starred === "true") {
      andFilters.push({ labels: "STARRED" });
    }



    if (filters?.mailThreadId) {
      andFilters.push({ threadId: filters?.mailThreadId });
    }


  // User filter
  if (isAdmin && filters.userId ) {
    if (filters.userId === "unassigned") {
      andFilters.push({ $or: [{ userId: { $exists: false } }, { userId: null }] });
    } else if (mongoose.Types.ObjectId.isValid(filters.userId)) {
      andFilters.push({ userId: new mongoose.Types.ObjectId(filters.userId) });
    }
  }

  if (!isAdmin && isTeamLead) {
    if(filters.userId && mongoose.Types.ObjectId.isValid(filters.userId)) {

      andFilters.push({ userId: new mongoose.Types.ObjectId(filters.userId) });





    } else {
        // Convert self id
      const selfId = new mongoose.Types.ObjectId(user?._id);

      // Convert juniors ids if exist
      const juniorIds = (juniors || [])
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));

      // Include self + juniors
      const allowedUserIds = [selfId, ...juniorIds];

      andFilters.push({
        userId: { $in: allowedUserIds }
      });


    }



}

  if(!isAdmin && !isTeamLead) {
    andFilters.push({ userId: new mongoose.Types.ObjectId(user?._id) });
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
  if (filters.folder === "sent") andFilters.push({ hasSentMessage: true, labels: { $nin: ["TRASH"] } });





 

  // Unread
  // if (filters.unreadOnly === "true") andFilters.push({ unreadCount: { $gt: 0 } });
  // ---------------- Unread (Per User) ----------------

if (filters.unreadOnly === "true") {

  const userIdObj = new mongoose.Types.ObjectId(user?._id);

  const lastMessageField =
    filters.folder === "sent"
      ? "$lastMessageAtSent"
      : "$lastMessageAtInbox";

  andFilters.push({
    $expr: {
      $or: [

        // Case 1: user never read → unread
        {
          $eq: [
            {
              $size: {
                $filter: {
                  input: "$readBy",
                  as: "r",
                  cond: {
                    $eq: ["$$r.userId", userIdObj],
                  },
                },
              },
            },
            0,
          ],
        },

        // Case 2: lastReadAt < lastMessageAt → unread
        {
          $lt: [
            {
              $let: {
                vars: {
                  userRead: {
                    $first: {
                      $filter: {
                        input: "$readBy",
                        as: "r",
                        cond: {
                          $eq: ["$$r.userId", userIdObj],
                        },
                      },
                    },
                  },
                },
                in: "$$userRead.lastReadAt",
              },
            },
            lastMessageField,
          ],
        },

      ],
    },
  });

}



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






































export const normalizeEmail = (raw = "") => {
  if (!raw) return "";

  // Match email inside < > OR plain email
  const match = raw.match(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  );

  return match ? match[1].toLowerCase().trim() : "";
};




export const getOtherParticipantEmail = (
  participants = [],
  myEmail = "info@affotax.com"
) => {
  if (!Array.isArray(participants)) return null;

  const normalizedMyEmail = normalizeEmail(myEmail);

  for (const p of participants) {
    const email = normalizeEmail(p?.email);

    if (email && email !== normalizedMyEmail) {
      return email;
    }
  }

  return null;
};




 
export const isSelfAssignment = (user, newUserId) => {
  if (!user?._id) return false;
  if (!newUserId) return false;

  return user._id.toString() === newUserId.toString();
};











export const addParticipant = (map, participant) => {
  if (!participant?.email) return;

  const email = participant.email.toLowerCase();

  const existing = map.get(email);

  if (existing) {
    map.set(email, {
      email,
      name: existing.name || participant.name || "",
    });
  } else {
    map.set(email, {
      email,
      name: participant.name || "",
    });
  }
}