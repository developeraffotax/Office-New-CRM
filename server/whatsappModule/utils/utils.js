import mongoose from "mongoose";

export const buildWhatsappFilterQuery = (req) => {
  const user = req?.user?.user;

  const isAdmin = user?.role?.name === "Admin";
  const isTeamLead = user?.isTeamLead;
  const juniors = user?.juniors || [];

  const filters = req.query;
  const andFilters = [];

  /*
  ==========================================
  Company
  ==========================================
  */
  if (filters.companyName) {
    andFilters.push({
      companyName: filters.companyName,
    });
  }


  if (filters.starred === "true") {
    andFilters.push({
      isStarred: true,
    });
  }

  /*
  ==========================================
  Status
  ==========================================
  */
  if (filters.status) {
    andFilters.push({
      status: filters.status,
    });
  }

  /*
  ==========================================
  Last Message By
  ==========================================
  */
  if (filters.lastMessageBy) {
    andFilters.push({
      lastMessageBy: filters.lastMessageBy, // me | client
    });
  }

  /*
  ==========================================
  User Assignment
  ==========================================
  */

  if (isAdmin && filters.userId) {
    if (filters.userId === "unassigned") {
      andFilters.push({
        $or: [
          { userId: { $exists: false } },
          { userId: null },
        ],
      });
    } else if (mongoose.Types.ObjectId.isValid(filters.userId)) {
      andFilters.push({
        userId: new mongoose.Types.ObjectId(filters.userId),
      });
    }
  }

  if (!isAdmin && isTeamLead) {
    if (
      filters.userId &&
      mongoose.Types.ObjectId.isValid(filters.userId)
    ) {
      andFilters.push({
        userId: new mongoose.Types.ObjectId(filters.userId),
      });
    } else {
      const selfId = new mongoose.Types.ObjectId(user._id);

      const juniorIds = (juniors || [])
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      andFilters.push({
        userId: {
          $in: [selfId, ...juniorIds],
        },
      });
    }
  }

  if (!isAdmin && !isTeamLead) {
    andFilters.push({
      userId: new mongoose.Types.ObjectId(user._id),
    });
  }

  /*
  ==========================================
  Category
  ==========================================
  */

  if (filters.category) {
    if (filters.category === "unassigned") {
      andFilters.push({
        $or: [
          { category: { $exists: false } },
          { category: null },
          { category: "" },
        ],
      });
    } else {
      andFilters.push({
        category: filters.category,
      });
    }
  }

  /*
  ==========================================
  Unread (Per User)
  ==========================================
  */

if (filters.unreadOnly === "true") {
  const userIdObj = new mongoose.Types.ObjectId(user._id);

  andFilters.push({
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
                        cond: {
                          $eq: ["$$r.userId", userIdObj],
                        },
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
}
  /*
  ==========================================
  Date Range
  ==========================================
  */

  if (filters.startDate || filters.endDate) {
    const dateQuery = {};

    if (filters.startDate) {
      dateQuery.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      dateQuery.$lte = new Date(filters.endDate);
    }

    andFilters.push({
      lastMessageAt: dateQuery,
    });
  }

  /*
  ==========================================
  Search
  ==========================================
  */

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(
      filters.search.trim(),
      "i"
    );

    andFilters.push({
      $or: [
        { phone: searchRegex },
        { profileName: searchRegex },
        { lastMessage: searchRegex },
      ],
    });
  }

  /*
  ==========================================
  Final Query
  ==========================================
  */

  if (andFilters.length === 0) return {};

  if (andFilters.length === 1) {
    return andFilters[0];
  }

  return {
    $and: andFilters,
  };
};