// ai/middleware/aiAuth.js — adapter between YOUR auth and the AI module.
//
// Your requiredSignIn leaves req.user = the decoded JWT ({ id, ... }) and your Users.role is an ObjectId.
// The AI module needs, on req.user:  _id (ObjectId), role (the Role NAME, e.g. "Admin"), name, email.
// This does the same JWT check as requiredSignIn, then loads the user and role name. Models are looked up
// by name ("Users", "Role") so there are no import paths to get wrong.
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import { isAdminRole } from "../config.js";

const roleNames = new Map(); // roleId → { name, at }   (roles rarely change; avoids a query per request)
const ROLE_TTL = 60_000;

async function roleName(roleId) {
  const key = String(roleId);
  const hit = roleNames.get(key);
  if (hit && Date.now() - hit.at < ROLE_TTL) return hit.name;
  const role = await mongoose.model("Role").findById(roleId).select("name").lean();
  const name = role?.name ?? "";
  roleNames.set(key, { name, at: Date.now() });
  return name;
}

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : header; // your app sends it raw
  if (!token) return res.status(401).json({ success: false, message: "JWT_Token must be provided!" });

  let decoded;
  try {
    decoded = JWT.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid JWT Token" });
  }

  try {
    const user = await mongoose.model("Users").findById(decoded.id).select("name email role team isActive").lean();
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: "Unauthorized Access! User not found or inactive." });
    }
    req.user = {
      ...decoded, // keeps `id`, so any shared code still works
      _id: user._id,
      id: String(user._id),
      name: user.name,
      email: user.email,
      team: user.team,
      roleId: String(user.role),
      role: await roleName(user.role), // the Role NAME, used for knowledge access and the admin profile
    };
    next();
  } catch (err) {
    console.error("[ai auth]", err);
    res.status(500).json({ success: false, message: "Could not verify your account." });
  }
}

export const requireAdmin = (req, res, next) =>
  isAdminRole(req.user?.role) ? next() : res.status(403).json({ success: false, message: "Forbidden! User does not have admin privileges." });
