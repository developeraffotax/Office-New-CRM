import mongoose from "mongoose";
import GoogleSheet from "../models/googlesheetmodel.js";
import User from "../models/userModel.js";

const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

/**
 * Accepts either a plain URL or a pasted <iframe ... src="..."> snippet.
 * Only https://docs.google.com/spreadsheets/... is allowed, so admins can't
 * accidentally (or intentionally) embed arbitrary sites inside the CRM.
 */
export const normalizeEmbedUrl = (input = "") => {
  let raw = String(input).trim();

  const iframeMatch = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch) raw = iframeMatch[1];
  raw = raw.replace(/&amp;/g, "&");

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw httpError(400, "Please enter a valid URL");
  }

  const valid =
    url.protocol === "https:" &&
    url.hostname === "docs.google.com" &&
    url.pathname.startsWith("/spreadsheets/");

  if (!valid) {
    throw httpError(
      400,
      "Only Google Sheets links (https://docs.google.com/spreadsheets/...) are allowed",
    );
  }
  return url.href;
};

const cleanUserIds = (ids = []) =>
  [...new Set((Array.isArray(ids) ? ids : []).map(String))].filter((id) =>
    mongoose.isValidObjectId(id),
  );

/* ---------------- admin ---------------- */

export const createSheet = async (payload, createdBy) => {
  const { name, embedUrl, users, isActive } = payload;
  if (!name?.trim()) throw httpError(400, "Sheet name is required");

  const sheet = await GoogleSheet.create({
    name: name.trim(),
    embedUrl: normalizeEmbedUrl(embedUrl),
    users: cleanUserIds(users),
    isActive: isActive !== false,
    createdBy,
  });
  return sheet.populate("users", "name email");
};

export const updateSheet = async (id, payload) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Invalid sheet id");

  const sheet = await GoogleSheet.findById(id);
  if (!sheet) throw httpError(404, "Sheet not found");

  if (payload.name !== undefined) {
    if (!payload.name.trim()) throw httpError(400, "Sheet name is required");
    sheet.name = payload.name.trim();
  }
  if (payload.embedUrl !== undefined) {
    sheet.embedUrl = normalizeEmbedUrl(payload.embedUrl);
  }
  if (payload.users !== undefined) sheet.users = cleanUserIds(payload.users);
  if (payload.isActive !== undefined) sheet.isActive = Boolean(payload.isActive);

  await sheet.save();
  return sheet.populate("users", "name email");
};

export const deleteSheet = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Invalid sheet id");
  const sheet = await GoogleSheet.findByIdAndDelete(id);
  if (!sheet) throw httpError(404, "Sheet not found");
};

export const listAllSheets = () =>
  GoogleSheet.find()
    .populate("users", "name email")
    .sort({ name: 1 })
    .lean();

export const listAssignableUsers = () =>
  User.find({ isActive: true, role: {$ne : '671243d0c5711a84a01874e1'}  }).select("name email").sort({ name: 1 }).lean();

/* ---------------- any signed-in user ---------------- */

// Sidebar list: admins get every sheet, users only the active ones assigned to them.
export const listSheetsForUser = (userId, isAdmin) => {
  const filter = isAdmin ? {} : { users: userId, isActive: true };
  return GoogleSheet.find(filter).select("name isActive").sort({ name: 1 }).lean();
};

export const getSheetForUser = async (id, userId, isAdmin) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Invalid sheet id");

  const sheet = await GoogleSheet.findById(id).lean();
  if (!sheet) throw httpError(404, "Sheet not found");

  if (!isAdmin) {
    const assigned = sheet.users.some((u) => String(u) === String(userId));
    if (!assigned || !sheet.isActive) {
      throw httpError(403, "You don't have access to this sheet");
    }
  }
  return { _id: sheet._id, name: sheet.name, embedUrl: sheet.embedUrl };
};