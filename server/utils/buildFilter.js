import userModel from "../models/userModel.js";
import getJobHolderNames from "./getJobHolderNames.js";

/**
 * @param {Object} req - Express request
 * @param {"progress" | "won" | "lost"} status
 */
export const buildLeadFilter = async (req, status = "progress") => {
  const filter = {
    status: { $eq: status },
  };

  const _id = req.user?.user?._id;
  const role = req.user?.user?.role?.name;
  const userName = req.user?.user?.name;
  
  // Admin sees all leads for given status
  if (role === "Admin") {
    return filter;
  }

  let includedUsers = [userName];

  const user = await userModel.findById(_id).select("juniors").lean();

  if (user?.juniors?.length) {
    const juniorNames = await getJobHolderNames(user.juniors);
    includedUsers = includedUsers.concat(juniorNames);
  }

  filter.jobHolder = { $in: includedUsers };

 

  return filter;
};
