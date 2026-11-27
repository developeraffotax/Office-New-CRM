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

function authError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** The user shape the AI tools expect: _id, id, name, email, team, roleId, role (Role name). */
async function userFromDoc(user, decoded = {}) {
  return {
    ...decoded,
    _id: user._id,
    id: String(user._id),
    name: user.name,
    email: user.email,
    team: user.team,
    roleId: String(user.role),
    role: await roleName(user.role),
  };
}

/** Verify a CRM JWT (Bearer or raw, same as the app) and load the user. Throws with .status 401. */
export async function loadAiUser(token) {
  if (!token) throw authError("JWT_Token must be provided!", 401);
  let decoded;
  try {
    decoded = JWT.verify(token, process.env.JWT_SECRET);
  } catch {
    throw authError("Invalid JWT Token", 401);
  }
  const user = await mongoose.model("Users").findById(decoded.id).select("name email role team isActive").lean();
  if (!user || user.isActive === false) throw authError("Unauthorized Access! User not found or inactive.", 401);
  return userFromDoc(user, decoded);
}

/** Load a user by id (stdio MCP, or a static MCP API key mapped to MCP_USER_ID). Throws with .status. */
export async function loadAiUserById(userId) {
  if (!userId || !mongoose.isValidObjectId(userId)) throw authError("MCP_USER_ID is missing or not a valid user id.", 500);
  const user = await mongoose.model("Users").findById(userId).select("name email role team isActive").lean();
  if (!user || user.isActive === false) throw authError("Unauthorized Access! User not found or inactive.", 401);
  return userFromDoc(user);
}

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : header; // your app sends it raw
  try {
    req.user = await loadAiUser(token);
    next();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error("[ai auth]", err);
    res.status(500).json({ success: false, message: "Could not verify your account." });
  }
}

export const requireAdmin = (req, res, next) =>
  isAdminRole(req.user?.role) ? next() : res.status(403).json({ success: false, message: "Forbidden! User does not have admin privileges." });
