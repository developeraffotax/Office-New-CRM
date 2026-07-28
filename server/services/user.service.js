import userModel from "../models/userModel.js";
import userRecentModel from "../models/userRecentModel.js";





export const trackUserUsageById = async (req, targetUserId, moduleName) => {
   const ownerId = req?.user?.user?._id;
  await trackUserUsage(ownerId, targetUserId, moduleName);
  
};









export const trackUserUsageByName = async (req, targetUserName, moduleName) => {
  const ownerId = req?.user?.user?._id;
   const targetUserId = await getUserIdByName(targetUserName)
    await trackUserUsage(ownerId, targetUserId, moduleName);
};



// Call whenever the logged-in user (owner) assigns/selects targetUser in a module
export const trackUserUsage = async (ownerId, targetUserId, moduleName) => {
   
  if (!ownerId || !targetUserId || !moduleName) return;
  await userRecentModel.findOneAndUpdate(
    { owner: ownerId, module: moduleName, targetUser: targetUserId },
    { lastUsedAt: new Date() },
    { upsert: true },
  );
};














// Active users, ordered by this owner's recency-of-use in `moduleName`
export const getUsersOrderedForModule = async (ownerId, moduleName, isAdmin) => {
  const users = await userModel
    .find({ isActive: { $ne: false }, name: { $ne: "Admin" } })
    .select("-password -otp -otpExpiry")
    .populate("role")
    .sort({ order: 1 })
    .lean();

  if (!ownerId || !moduleName || !isAdmin) return users;

  const recents = await userRecentModel
    .find({ owner: ownerId, module: moduleName })
    .sort({ lastUsedAt: -1 })
    .select("targetUser")
    .lean();

  const recencyIndex = new Map(
    recents.map((r, i) => [String(r.targetUser), i]),
  );

  return [...users].sort((a, b) => {
    const aIdx = recencyIndex.has(String(a._id))
      ? recencyIndex.get(String(a._id))
      : Infinity;
    const bIdx = recencyIndex.has(String(b._id))
      ? recencyIndex.get(String(b._id))
      : Infinity;
    return aIdx - bIdx; // ties (never used by this owner) keep existing `order`
  });
};








// Call whenever the logged-in user (owner) assigns/selects targetUser in a module
export const getUserIdByName = async (name) => {
  if (!name) return;
  const user = await userModel.findOne({ name: name?.trim() }).select("_id").lean();
  return user._id;
};
