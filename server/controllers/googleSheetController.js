import * as sheetService from "../services/googleSheet.service.js";
import { isAdmin } from "../utils/checkPermission.js";

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error("[google-sheets]", err);
    res.status(err.status || 500).send({
      success: false,
      message: err.status ? err.message : "Something went wrong",
    });
  }
};

/* ---------------- admin ---------------- */

export const createSheet = handle(async (req, res) => {
  const userId =   req.user.user._id;
  const sheet = await sheetService.createSheet(req.body, userId);
  res.status(201).send({ success: true, message: "Sheet created", sheet });
});

export const updateSheet = handle(async (req, res) => {
  const sheet = await sheetService.updateSheet(req.params.id, req.body);
  res.send({ success: true, message: "Sheet updated", sheet });
});

export const deleteSheet = handle(async (req, res) => {
  await sheetService.deleteSheet(req.params.id);
  res.send({ success: true, message: "Sheet deleted" });
});

export const getAllSheets = handle(async (req, res) => {
  const sheets = await sheetService.listAllSheets();
  res.send({ success: true, sheets });
});

export const getAssignableUsers = handle(async (req, res) => {
  const users = await sheetService.listAssignableUsers();
  res.send({ success: true, users });
});

/* ---------------- any signed-in user ---------------- */

export const getMySheets = handle(async (req, res) => {
    const userId =   req.user.user._id;
    const is_admin = isAdmin(req)
  const sheets = await sheetService.listSheetsForUser(
    userId,
    is_admin,
  );
  res.send({ success: true, sheets });
});

export const getSheet = handle(async (req, res) => {
    const userId =   req.user.user._id;
    const is_admin = isAdmin(req)
  const sheet = await sheetService.getSheetForUser(
    req.params.id,
    userId,
    is_admin,
  );
  res.send({ success: true, sheet });
});