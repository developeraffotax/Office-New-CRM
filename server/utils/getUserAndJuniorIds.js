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











export const getUserAndJuniorNames = async (userId) => {
  const user = await userModel
    .findById(userId)
    .select("name juniors")
    .populate({
      path: "juniors",
      select: "name -_id",
    })
    .lean();


  const juniorsNames = user?.juniors?.map((junior) => junior.name) ?? [];

  return [user.name, ...juniorsNames ];
};





 