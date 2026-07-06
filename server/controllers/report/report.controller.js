import moment from "moment";
import userModel from "../../models/userModel.js";
import roleModel from "../../models/roleModel.js";
import * as reportService from "./report.service.js";

const sendWorkbook = async (res, workbook, filename) => {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(/\s+/g, "_")}"`);
  await workbook.xlsx.write(res);
  res.end();
};

/* ============================================================
   DAY — single user, flat screenshot-by-screenshot table
   Query: date
   ============================================================ */
const buildDailyWorkbook = async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  const user = await userModel.findById(userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const rangeStart = moment(date).startOf("day");
  const rangeEnd = moment(date).endOf("day");
  const reportDate = rangeStart.format("DD MMM YYYY");
  const employee = reportService.getEmployeeName(user);

  const { screenshots, timers } = await reportService.fetchUserActivityData(userId, rangeStart, rangeEnd);
  if (!screenshots.length) return res.status(404).json({ message: "No screenshots found for this range" });

  const summary = reportService.createSummary(screenshots, timers);

  const workbook = reportService.buildFlatWorkbook({
    title: "Employee Activity Report",
    summaryRows: [
      ["Employee:", employee],
      ["Date:", reportDate],
      ["Worked Time:", reportService.formatWorkedTime(summary.totalWorkedTimeInMins)],
      ["Avg Activity %:", `${summary.avgActivity}%`],
      ["Total Screenshots:", summary.totalScreenshots],
    ],
    screenshots,
  });

  await sendWorkbook(res, workbook, `Activity_Report_${employee}_${reportDate}.xlsx`);
};

/* ============================================================
   WEEK — single user, grouped by ISO week, day names shown
   Query: startDate, endDate
   ============================================================ */
const buildWeeklyWorkbook = async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  const user = await userModel.findById(userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const rangeStart = moment(startDate).startOf("day");
  const rangeEnd = moment(endDate).endOf("day");
  const reportDate = `${rangeStart.format("DD MMM YYYY")} - ${rangeEnd.format("DD MMM YYYY")}`;
  const employee = reportService.getEmployeeName(user);

  const { screenshots, timers } = await reportService.fetchUserActivityData(userId, rangeStart, rangeEnd);
  if (!screenshots.length) return res.status(404).json({ message: "No screenshots found for this range" });

  const summary = reportService.createSummary(screenshots, timers);
  const dailyRows = reportService.getDailyRows(screenshots, timers);
  const filledRows = reportService.fillMissingDays(dailyRows, rangeStart, rangeEnd);
  const groups = reportService.groupByWeek(filledRows);

  const workbook = reportService.buildGroupedWorkbook({
    title: "Employee Activity Report",
    summaryRows: [
      ["Employee:", employee],
      ["Date:", reportDate],
      ["Worked Time:", reportService.formatWorkedTime(summary.totalWorkedTimeInMins)],
      ["Avg Activity %:", `${summary.avgActivity}%`],
      ["Total Screenshots:", summary.totalScreenshots],
    ],
    groups,
    showDayName: true,
  });

  await sendWorkbook(res, workbook, `Activity_Report_${employee}_${reportDate}.xlsx`);
};

/* ============================================================
   MONTH — single user, grouped by calendar month
   Query: startDate, endDate  (can span multiple months)
   ============================================================ */
const buildMonthlyWorkbook = async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  const user = await userModel.findById(userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const rangeStart = moment(startDate).startOf("day");
  const rangeEnd = moment(endDate).endOf("day");
  const reportDate = `${rangeStart.format("DD MMM YYYY")} - ${rangeEnd.format("DD MMM YYYY")}`;
  const employee = reportService.getEmployeeName(user);

  const { screenshots, timers } = await reportService.fetchUserActivityData(userId, rangeStart, rangeEnd);
  if (!screenshots.length) return res.status(404).json({ message: "No screenshots found for this range" });

  const summary = reportService.createSummary(screenshots, timers);
  const dailyRows = reportService.getDailyRows(screenshots, timers);
  const groups = reportService.groupByMonth(dailyRows);

  const workbook = reportService.buildGroupedWorkbook({
    title: "Employee Activity Report",
    summaryRows: [
      ["Employee:", employee],
      ["Date:", reportDate],
      ["Worked Time:", reportService.formatWorkedTime(summary.totalWorkedTimeInMins)],
      ["Avg Activity %:", `${summary.avgActivity}%`],
      ["Total Screenshots:", summary.totalScreenshots],
    ],
    groups,
    showDayName: false,
  });

  await sendWorkbook(res, workbook, `Activity_Report_${employee}_${reportDate}.xlsx`);
};

/* ============================================================
   TEAM-WEEK — all users, one detailed block per employee
   Query: startDate, endDate
   ============================================================ */
const buildWeeklyTeamWorkbook = async (req, res) => {
  const { startDate, endDate, layout = "grid" } = req.query; // layout: "grid" | "blocks"
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required" });
  }

  const rangeStart = moment(startDate).startOf("day");
  const rangeEnd = moment(endDate).endOf("day");
  const reportDate = `${rangeStart.format("DD MMM YYYY")} - ${rangeEnd.format("DD MMM YYYY")}`;

  // NOTE: scope this filter (role/isActive/team) so it doesn't pull every account in the DB
  const adminRole = await roleModel.findOne({ name: "Admin" }).select("_id").lean();
  const users = await reportService.fetchAllUsers({isActive:true, role: { $ne: adminRole._id }});
  if (!users.length) return res.status(404).json({ message: "No users found" });

  const userBlocks = [];
  for (const user of users) {
    const { screenshots, timers } = await reportService.fetchUserActivityData(user._id, rangeStart, rangeEnd);

    // Always include the user, even with no activity at all — their days
    // are filled with explicit zeros rather than the user being dropped.
    const dailyRows = reportService.getDailyRows(screenshots, timers);
    const filledRows = reportService.fillMissingDays(dailyRows, rangeStart, rangeEnd);
    userBlocks.push({ label: reportService.getEmployeeName(user), rows: filledRows });
  }

  const groups = reportService.groupByUser(userBlocks, { sortBy: "name" });

  const workbook =
    layout === "blocks"
      ? reportService.buildGroupedWorkbook({
          title: "Weekly Activity Report — All Users",
          sheetName: "Weekly Report - All Users",
          summaryRows: [
            ["Week:", reportDate],
            ["Total Employees:", groups.length],
          ],
          groups,
          showDayName: true,
        })
      : reportService.buildTeamMatrixWorkbook({
          title: "Weekly Activity Report — All Users",
          sheetName: "Weekly Report - All Users",
          summaryRows: [
            ["Week:", reportDate],
            ["Total Employees:", groups.length],
          ],
          userBlocks: groups,
        });

  await sendWorkbook(res, workbook, `Weekly_Activity_Report_All_Users_${reportDate}.xlsx`);
};

/* ============================================================
   ENTRY POINT
   ============================================================ */
export const exportActivityReport = async (req, res) => {
  try {
    const { reportType } = req.query;

    switch (reportType) {
      case "day":
        return await buildDailyWorkbook(req, res);

      case "week":
        return await buildWeeklyWorkbook(req, res);

      case "month":
        return await buildMonthlyWorkbook(req, res);

      case "team-week":
        return await buildWeeklyTeamWorkbook(req, res);

      default:
        return res.status(400).json({ message: "Invalid or missing reportType" });
    }
  } catch (error) {
    console.error("❌ Failed to export activity report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};