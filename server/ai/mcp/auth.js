import { timingSafeEqual } from "node:crypto";
import { isAdminRole } from "../config.js";
import { loadAiUser, loadAiUserById } from "../middleware/aiAuth.js";

function sameSecret(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function tokenFromHeader(header) {
  if (!header) return "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : String(header).trim();
}

function assertAdmin(user) {
  if (!isAdminRole(user.role)) {
    const err = new Error("Forbidden! User does not have admin privileges.");
    err.status = 403;
    throw err;
  }
  return user;
}

/**
 * HTTP caller. A CRM JWT (the same token the app sends) loads that user.
 * If MCP_API_KEY is set and matches, the caller is the admin in MCP_USER_ID.
 */
export async function userFromHttp(req) {
  const token = tokenFromHeader(req.headers.authorization);
  const apiKey = process.env.MCP_API_KEY;
  let user;
  if (apiKey && token && sameSecret(token, apiKey)) {
    if (!process.env.MCP_USER_ID) {
      const err = new Error("MCP_API_KEY is set but MCP_USER_ID is not.");
      err.status = 500;
      throw err;
    }
    user = await loadAiUserById(process.env.MCP_USER_ID);
  } else {
    user = await loadAiUser(token);
  }
  return assertAdmin(user);
}

/** stdio caller. One process, one admin, identified by MCP_USER_ID. */
export async function userFromEnv() {
  const user = await loadAiUserById(process.env.MCP_USER_ID);
  return assertAdmin(user);
}
