import mongoose from "mongoose";
import userModel from "../models/userModel.js";

export const getUserAndJuniorIds = async (userId) => {
  const user = await userModel
    .findById(userId)
    .select("juniors")
    .lean();

  return [
    new mongoose.Types.ObjectId(userId),
    ...(user?.juniors ?? []).map((id) => new mongoose.Types.ObjectId(id)),
  ];
};