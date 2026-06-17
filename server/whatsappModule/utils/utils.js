import mongoose from "mongoose";

 

// ─── Helpers ───────────────────────────────────────────────────────────────

const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const unassignedFilter = () => ({ $or: [{ userId: { $exists: false } }, { userId: null }] });

// ─── Filter builders ───────────────────────────────────────────────────────

const applyScalarFilters = (filters) => {
  const clauses = [];

  if (filters.companyName)  clauses.push({ companyName: filters.companyName });
  if (filters.starred === "true") clauses.push({ isStarred: true });
  if (filters.status)       clauses.push({ status: filters.status });
  if (filters.lastMessageBy) clauses.push({ lastMessageBy: filters.lastMessageBy });

  return clauses;
};

const applyCategoryFilter = (filters) => {
  if (!filters.category) return null;

  if (filters.category === "unassigned") {
    return { $or: [{ category: { $exists: false } }, { category: null }, { category: "" }] };
  }

  return { category: filters.category };
};

const applyDateFilter = (filters) => {
  if (!filters.startDate && !filters.endDate) return null;

  const dateQuery = {};
  if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
  if (filters.endDate)   dateQuery.$lte = new Date(filters.endDate);

  return { lastMessageAt: dateQuery };
};

const applySearchFilter = (filters) => {
  if (!filters.search?.trim()) return null;

  const searchRegex = new RegExp(filters.search.trim(), "i");
  return {
    $or: [
      { phone: searchRegex },
      { profileName: searchRegex },
      { lastMessage: searchRegex },
    ],
  };
};

const applyUnreadFilter = (userId) => ({
  $expr: {
    $gt: [
      "$totalInboundMessages",
      {
        $ifNull: [
          {
            $let: {
              vars: {
                userRead: {
                  $first: {
                    $filter: {
                      input: "$readBy",
                      as: "r",
                      cond: { $eq: ["$$r.userId", toObjectId(userId)] },
                    },
                  },
                },
              },
              in: "$$userRead.readInboundCount",
            },
          },
          0,
        ],
      },
    ],
  },
});

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

export const buildWhatsappFilterQuery = (req) => {
  const user = req?.user?.user;
  // console.log("USER ACCESS", user.role.access);

  const whatsappPermission = user.role?.access?.find(
    (a) => a.permission === "Whatsapp",
  );
  const hasUnassignedPermission = whatsappPermission?.subRoles?.includes("Unassigned");
  const isAdmin    = user?.role?.name === "Admin";
  const isTeamLead = user?.isTeamLead;
  const juniors    = user?.juniors || [];

  const filters    = req.query;

  const andFilters = [
    ...applyScalarFilters(filters),
    applyUserAssignmentFilter(filters, { isAdmin, isTeamLead, user, hasUnassignedPermission, juniors }),
    applyCategoryFilter(filters),
    filters.unreadOnly === "true" ? applyUnreadFilter(user._id) : null,
    applyDateFilter(filters),
    applySearchFilter(filters),
  ].filter(Boolean);

  if (andFilters.length === 0) return {};
  if (andFilters.length === 1) return andFilters[0];
  return { $and: andFilters };
};
























































































































// export const buildWhatsappFilterQuery2 = (req) => {
//   const user = req?.user?.user;

//   console.log("USER ACCESS", user.role.access);

//   const whatsappPermission = user.role?.access?.find(
//     (access) => access.permission === "Whatsapp",
//   );
//   const hasUnassignedPermission =
//     whatsappPermission?.subRoles?.includes("Unassigned");

//   const isAdmin = user?.role?.name === "Admin";
//   const isTeamLead = user?.isTeamLead;
//   const juniors = user?.juniors || [];

//   const filters = req.query;
//   const andFilters = [];

//   /*
//   ==========================================
//   Company
//   ==========================================
//   */
//   if (filters.companyName) {
//     andFilters.push({
//       companyName: filters.companyName,
//     });
//   }

//   if (filters.starred === "true") {
//     andFilters.push({
//       isStarred: true,
//     });
//   }

//   /*
//   ==========================================
//   Status
//   ==========================================
//   */
//   if (filters.status) {
//     andFilters.push({
//       status: filters.status,
//     });
//   }

//   /*
//   ==========================================
//   Last Message By
//   ==========================================
//   */
//   if (filters.lastMessageBy) {
//     andFilters.push({
//       lastMessageBy: filters.lastMessageBy, // me | client
//     });
//   }

//   /*
//   ==========================================
//   User Assignment
//   ==========================================
//   */

//   if (isAdmin && filters.userId) {
//     if (filters.userId === "unassigned") {
//       andFilters.push({
//         $or: [{ userId: { $exists: false } }, { userId: null }],
//       });
//     } else if (mongoose.Types.ObjectId.isValid(filters.userId)) {
//       andFilters.push({
//         userId: new mongoose.Types.ObjectId(filters.userId),
//       });
//     }
//   }

//   if (!isAdmin) {
//     const selfId = new mongoose.Types.ObjectId(user._id);

//     const requestingUnassigned = filters.userId === "unassigned";

//     if (requestingUnassigned) {
//       if (!hasUnassignedPermission) {
//         throw new Error("Unauthorized");
//       }

//       andFilters.push({
//         $or: [{ userId: { $exists: false } }, { userId: null }],
//       });
//     } else if (isTeamLead) {
//       if (isTeamLead) {
//         const selfId = new mongoose.Types.ObjectId(user._id);

//         const juniorIds = (juniors || [])
//           .filter((id) => mongoose.Types.ObjectId.isValid(id))
//           .map((id) => new mongoose.Types.ObjectId(id));

//         // Team lead selected a specific user
//         if (filters.userId && mongoose.Types.ObjectId.isValid(filters.userId)) {
//           andFilters.push({
//             userId: new mongoose.Types.ObjectId(filters.userId),
//           });
//         } else {
//           const visibleUsers = [selfId, ...juniorIds];

//           // Team lead default view
//           if (hasUnassignedPermission) {
//             andFilters.push({
//               $or: [
//                 {
//                   userId: {
//                     $in: visibleUsers,
//                   },
//                 },
//                 { userId: null },
//                 { userId: { $exists: false } },
//               ],
//             });
//           } else {
//             andFilters.push({
//               userId: {
//                 $in: visibleUsers,
//               },
//             });
//           }
//         }
//       }
//     } else {
//       andFilters.push({
//         userId: selfId,
//       });
//     }
//   }

//   /*
//   ==========================================
//   Category
//   ==========================================
//   */

//   if (filters.category) {
//     if (filters.category === "unassigned") {
//       andFilters.push({
//         $or: [
//           { category: { $exists: false } },
//           { category: null },
//           { category: "" },
//         ],
//       });
//     } else {
//       andFilters.push({
//         category: filters.category,
//       });
//     }
//   }

//   /*
//   ==========================================
//   Unread (Per User)
//   ==========================================
//   */

//   if (filters.unreadOnly === "true") {
//     const userIdObj = new mongoose.Types.ObjectId(user._id);

//     andFilters.push({
//       $expr: {
//         $gt: [
//           "$totalInboundMessages",
//           {
//             $ifNull: [
//               {
//                 $let: {
//                   vars: {
//                     userRead: {
//                       $first: {
//                         $filter: {
//                           input: "$readBy",
//                           as: "r",
//                           cond: {
//                             $eq: ["$$r.userId", userIdObj],
//                           },
//                         },
//                       },
//                     },
//                   },
//                   in: "$$userRead.readInboundCount",
//                 },
//               },
//               0,
//             ],
//           },
//         ],
//       },
//     });
//   }
//   /*
//   ==========================================
//   Date Range
//   ==========================================
//   */

//   if (filters.startDate || filters.endDate) {
//     const dateQuery = {};

//     if (filters.startDate) {
//       dateQuery.$gte = new Date(filters.startDate);
//     }

//     if (filters.endDate) {
//       dateQuery.$lte = new Date(filters.endDate);
//     }

//     andFilters.push({
//       lastMessageAt: dateQuery,
//     });
//   }

//   /*
//   ==========================================
//   Search
//   ==========================================
//   */

//   if (filters.search?.trim()) {
//     const searchRegex = new RegExp(filters.search.trim(), "i");

//     andFilters.push({
//       $or: [
//         { phone: searchRegex },
//         { profileName: searchRegex },
//         { lastMessage: searchRegex },
//       ],
//     });
//   }

//   /*
//   ==========================================
//   Final Query
//   ==========================================
//   */

//   if (andFilters.length === 0) return {};

//   if (andFilters.length === 1) {
//     return andFilters[0];
//   }

//   return {
//     $and: andFilters,
//   };
// };



























export const normalizeEmail = (raw = "") => {
  if (!raw) return "";

  // Match email inside < > OR plain email
  const match = raw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  return match ? match[1].toLowerCase().trim() : "";
};

export const getOtherParticipantEmail = (
  participants = [],
  myEmail = "info@affotax.com",
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
};
