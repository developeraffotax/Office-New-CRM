import moment from "moment";
import ExcelJS from "exceljs";
import screenshotModel from "../models/screenshotModel.js";
import timerModel from "../models/timerModel.js";
import userModel from "../models/userModel.js";

// ---------- Color helpers ----------
const getActivityColor = (percent) => {
  if (percent >= 50) return "FFC6EFCE";
  if (percent >= 20) return "FFFFEB9C";
  return "FFFFC7CE";
};
const getActivityFontColor = (percent) => {
  if (percent >= 50) return "FF006100";
  if (percent >= 20) return "FF9C6500";
  return "FF9C0006";
};

const formatWorkedTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ---------- Group screenshots by day ----------
const groupScreenshotsByDay = (sortedShots) => {
  const dayMap = {};
  sortedShots.forEach((shot) => {
    const dayKey = moment(shot.timestamp).format("YYYY-MM-DD");
    if (!dayMap[dayKey]) dayMap[dayKey] = [];
    dayMap[dayKey].push(shot);
  });
  return dayMap;
};

// ---------- Group timers by day, sum worked minutes ----------
const groupTimersByDay = (timers) => {
  const dayMap = {};

  timers.forEach((t) => {
    const dayKey = moment(t.date).format("YYYY-MM-DD");

    const start = t.startTime ? moment(t.startTime) : null;
    let end = t.endTime ? moment(t.endTime) : null;

    if (!start || !start.isValid()) return;
    if (t.isRunning) end = moment();
    if (!end || !end.isValid()) return;

    const mins = end.diff(start, "minutes", true);
    if (!dayMap[dayKey]) dayMap[dayKey] = 0;
    dayMap[dayKey] += mins;
  });

  return dayMap;
};

// ---------- Build per-day aggregate rows from raw screenshots/timers ----------
// Shared by: single-user range/week report AND the all-users weekly report.
const buildDailyRows = (screenshots, timers) => {
  const shotsByDay = groupScreenshotsByDay(screenshots);
  const timerMinsByDay = groupTimersByDay(timers);

  return Object.keys(shotsByDay)
    .sort((a, b) => moment(a).valueOf() - moment(b).valueOf())
    .map((dayKey) => {
      const shots = shotsByDay[dayKey];
      const withActivity = shots.filter((s) => s.activity);

      const avg = (key) =>
        withActivity.length
          ? Math.round(
              withActivity.reduce((sum, s) => sum + (s.activity[key] || 0), 0) /
                withActivity.length
            )
          : 0;

      return {
        dayKey,
        date: moment(dayKey).format("DD MMM YYYY"),
        dayName: moment(dayKey).format("ddd"),
        overall: avg("overallActivityPercent"),
        keyboard: avg("keyboardActivityPercent"),
        mouse: avg("mouseActivityPercent"),
        count: shots.length,
        workedMins: Math.floor(timerMinsByDay[dayKey] || 0),
      };
    });
};

// ---------- Group daily rows by month (used for filterType: "range") ----------
const groupDailyRowsByMonth = (dailyRows) => {
  const monthMap = {};
  dailyRows.forEach((row) => {
    const monthKey = moment(row.dayKey).format("YYYY-MM");
    if (!monthMap[monthKey]) monthMap[monthKey] = [];
    monthMap[monthKey].push(row);
  });
  return Object.keys(monthMap)
    .sort((a, b) => moment(a, "YYYY-MM").valueOf() - moment(b, "YYYY-MM").valueOf())
    .map((monthKey) => ({
      label: moment(monthKey, "YYYY-MM").format("MMMM YYYY"),
      rows: monthMap[monthKey],
    }));
};

// ---------- Group daily rows by ISO week (used for filterType: "week") ----------
const groupDailyRowsByWeek = (dailyRows) => {
  const weekMap = {};
  dailyRows.forEach((row) => {
    const m = moment(row.dayKey);
    const weekStart = m.clone().startOf("isoWeek");
    const weekKey = weekStart.format("YYYY-MM-DD");
    if (!weekMap[weekKey]) {
      weekMap[weekKey] = {
        start: weekStart,
        end: weekStart.clone().endOf("isoWeek"),
        rows: [],
      };
    }
    weekMap[weekKey].rows.push(row);
  });
  return Object.keys(weekMap)
    .sort((a, b) => moment(a).valueOf() - moment(b).valueOf())
    .map((weekKey) => {
      const { start, end, rows } = weekMap[weekKey];
      return {
        label: `Week of ${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`,
        rows,
      };
    });
};

// ---------- Render one "block" (a month, a week, or a user) into the sheet ----------
// group = { label: string, rows: dailyRow[] }
// showDayName renders headers as "Mon\n06 Jul 2026" instead of just the date.
const renderGroupBlock = (sheet, group, { NUM_COLS, showDayName = false, isLast = false }) => {
  // ---- Block title banner ----
  const titleRow = sheet.addRow([group.label]);
  sheet.mergeCells(titleRow.number, 1, titleRow.number, NUM_COLS);
  titleRow.getCell(1).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  titleRow.height = 20;
  titleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7F9CC7" } };
  });

  // ---- Date header row ----
  const headerValues = group.rows.map((d) =>
    showDayName ? `${d.dayName}\n${d.date}` : d.date
  );
  const headerRow = sheet.addRow(["Date", ...headerValues]);
  headerRow.height = showDayName ? 34 : 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: showDayName };
    cell.border = {
      top: { style: "thin", color: { argb: "FFB0B0B0" } },
      bottom: { style: "thin", color: { argb: "FFB0B0B0" } },
    };
  });

  // ---- Metric rows ----
  const addMetricRow = (label, values, { colorCode = false, isPercent = false } = {}) => {
    const row = sheet.addRow([label, ...values]);
    row.getCell(1).font = { bold: true, color: { argb: "FF2F5597" } };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

    values.forEach((val, i) => {
      const cell = row.getCell(i + 2);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = { bottom: { style: "hair", color: { argb: "FFE0E0E0" } } };
      if (isPercent) cell.numFmt = '0"%"';
      if (colorCode) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: getActivityColor(val) } };
        cell.font = { color: { argb: getActivityFontColor(val) }, bold: true };
      }
    });
    return row;
  };

  addMetricRow("Worked Time", group.rows.map((d) => formatWorkedTime(d.workedMins)));
  addMetricRow("Overall %", group.rows.map((d) => d.overall), { colorCode: true, isPercent: true });
  addMetricRow("Keyboard %", group.rows.map((d) => d.keyboard), { isPercent: true });
  addMetricRow("Mouse %", group.rows.map((d) => d.mouse), { isPercent: true });
  addMetricRow("Screenshots", group.rows.map((d) => d.count));

  // ---- Total summary row for this block ----
  const totalOverall = Math.round(
    group.rows.reduce((sum, d) => sum + d.overall, 0) / group.rows.length
  );
  const totalWorked = group.rows.reduce((sum, d) => sum + d.workedMins, 0);
  const totalShots = group.rows.reduce((sum, d) => sum + d.count, 0);

  const totalRow = sheet.addRow([
    `${group.label} Total  —  Avg Overall: ${totalOverall}%  |  Worked: ${formatWorkedTime(
      totalWorked
    )}  |  Screenshots: ${totalShots}`,
  ]);
  sheet.mergeCells(totalRow.number, 1, totalRow.number, NUM_COLS);
  totalRow.getCell(1).font = { italic: true, bold: true, color: { argb: "FF2F5597" } };
  totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

  if (!isLast) sheet.addRow([]);
};

export const exportActivityReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filterType, date, startDate, endDate } = req.query;

    const user = await userModel.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const employee = user.name || user.username || user.email || "";

    // ---------- Build date range ----------
    let rangeStart, rangeEnd;
    if (filterType === "day") {
      rangeStart = moment(date).startOf("day");
      rangeEnd = moment(date).endOf("day");
    } else {
      rangeStart = moment(startDate).startOf("day");
      rangeEnd = moment(endDate).endOf("day");
    }

    const reportDate =
      filterType === "day"
        ? rangeStart.format("DD MMM YYYY")
        : `${rangeStart.format("DD MMM YYYY")} - ${rangeEnd.format("DD MMM YYYY")}`;

    // ---------- Fetch data ----------
    const [screenshots, timers] = await Promise.all([
      screenshotModel
        .find({
          userId,
          timestamp: { $gte: rangeStart.toDate(), $lte: rangeEnd.toDate() },
        })
        .sort({ timestamp: 1 })
        .lean(),
      timerModel
        .find({
          clientId: userId,
          date: { $gte: rangeStart.toDate(), $lte: rangeEnd.toDate() },
        })
        .lean(),
    ]);

    if (!screenshots.length) {
      return res.status(404).json({ message: "No screenshots found for this range" });
    }

    // ---------- Total worked time ----------
    let totalWorkedTimeInMins = 0;
    timers.forEach((timer) => {
      const start = timer?.startTime ? moment(timer.startTime) : null;
      let end = timer?.endTime ? moment(timer.endTime) : null;

      if (!start || !start.isValid()) return;
      if (timer.isRunning) end = moment();
      if (!end || !end.isValid()) return;

      totalWorkedTimeInMins += end.diff(start, "minutes", true);
    });
    totalWorkedTimeInMins = Math.floor(totalWorkedTimeInMins);

    const avgActivity = Math.round(
      screenshots.reduce((sum, s) => sum + (s.activity?.overallActivityPercent || 0), 0) /
        screenshots.length
    );

    // "week" behaves like "range" but groups by ISO week and shows day names
    const isRange = filterType === "range" || filterType === "week";

    // ---------- Per-day rows (range/week mode) ----------
    const dailyRows = isRange ? buildDailyRows(screenshots, timers) : [];

    // ---------- Group into periods (weeks or months) ----------
    const periodGroups = isRange
      ? filterType === "week"
        ? groupDailyRowsByWeek(dailyRows)
        : groupDailyRowsByMonth(dailyRows)
      : [];

    const maxDaysInAnyPeriod = periodGroups.reduce(
      (max, g) => Math.max(max, g.rows.length),
      0
    );

    // ---------- Workbook ----------
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Activity Tracker";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Activity Report", {
      views: [{ state: "frozen", ySplit: 8 }],
    });

    sheet.columns = isRange
      ? [
          { key: "metric", width: 18 },
          ...Array.from({ length: maxDaysInAnyPeriod }, (_, i) => ({
            key: `day${i}`,
            width: 14,
          })),
        ]
      : [
          { key: "time", width: 22 },
          { key: "application", width: 24 },
          { key: "windowTitle", width: 40 },
          { key: "overall", width: 12 },
          { key: "keyboardPct", width: 12 },
          { key: "mousePct", width: 12 },
          { key: "keyboardCount", width: 14 },
          { key: "mouseCount", width: 12 },
        ];

    const NUM_COLS = sheet.columns.length;

    // ---------- Title ----------
    sheet.mergeCells(1, 1, 1, NUM_COLS);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = "Employee Activity Report";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 30;
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } };
    });

    // ---------- Summary ----------
    const summaryLabelStyle = { font: { bold: true, color: { argb: "FF2F5597" } } };
    const summaryValueStyle = {
      font: { color: { argb: "FF333333" } },
      alignment: { horizontal: "left" },
    };
    const addSummaryRow = (label, value) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).style = summaryLabelStyle;
      row.getCell(2).style = summaryValueStyle;
      sheet.mergeCells(row.number, 2, row.number, NUM_COLS);
    };

    addSummaryRow("Employee:", employee);
    addSummaryRow("Date:", reportDate);
    addSummaryRow("Worked Time:", formatWorkedTime(totalWorkedTimeInMins));
    addSummaryRow("Avg Activity %:", `${avgActivity}%`);
    addSummaryRow("Total Screenshots:", screenshots.length);

    sheet.addRow([]);

    // ---------- Data rows ----------
    if (isRange) {
      periodGroups.forEach((group, idx) => {
        renderGroupBlock(sheet, group, {
          NUM_COLS,
          showDayName: filterType === "week",
          isLast: idx === periodGroups.length - 1,
        });
      });
    } else {
      const headerRow = sheet.addRow([
        "Time", "Application", "Window Title", "Overall %", "Keyboard %", "Mouse %", "Keyboard Count", "Mouse Count",
      ]);
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFB0B0B0" } },
          bottom: { style: "thin", color: { argb: "FFB0B0B0" } },
        };
      });

      screenshots.forEach((shot, idx) => {
        const overall = shot.activity?.overallActivityPercent ?? 0;
        const keyboardPct = shot.activity?.keyboardActivityPercent ?? 0;
        const mousePct = shot.activity?.mouseActivityPercent ?? 0;

        const row = sheet.addRow([
          moment(shot.timestamp).format("DD MMM YYYY hh:mm:ss A"),
          shot.activeWindow?.application || "",
          shot.activeWindow?.title || "",
          overall, keyboardPct, mousePct,
          shot.activity?.keyboardCount ?? 0,
          shot.activity?.mouseCount ?? 0,
        ]);

        if (idx % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
          });
        }

        const overallCell = row.getCell(4);
        overallCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: getActivityColor(overall) } };
        overallCell.font = { color: { argb: getActivityFontColor(overall) }, bold: true };

        row.getCell(4).numFmt = '0"%"';
        row.getCell(5).numFmt = '0"%"';
        row.getCell(6).numFmt = '0"%"';

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
          cell.border = { bottom: { style: "hair", color: { argb: "FFE0E0E0" } } };
        });
      });
    }

    // ---------- Send file ----------
    const filename = `Activity_Report_${employee}_${reportDate}.xlsx`.replace(/\s+/g, "_");

    res.setHeader( "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" );
    res.setHeader( "Access-Control-Expose-Headers", "Content-Disposition" );
    res.setHeader( "Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Failed to export activity report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// ---------- Weekly report for ALL users (one detailed block per employee) ----------
export const exportWeeklyReportAllUsers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const rangeStart = moment(startDate).startOf("day");
    const rangeEnd = moment(endDate).endOf("day");
    const reportDate = `${rangeStart.format("DD MMM YYYY")} - ${rangeEnd.format("DD MMM YYYY")}`;

    // NOTE: adjust this filter if you only want a subset of users (e.g. role/status/team)
    const users = await userModel.find({}).lean();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // ---------- Build one block per user ----------
    const userBlocks = [];

    for (const user of users) {
      const [screenshots, timers] = await Promise.all([
        screenshotModel
          .find({
            userId: user._id,
            timestamp: { $gte: rangeStart.toDate(), $lte: rangeEnd.toDate() },
          })
          .sort({ timestamp: 1 })
          .lean(),
        timerModel
          .find({
            clientId: user._id,
            date: { $gte: rangeStart.toDate(), $lte: rangeEnd.toDate() },
          })
          .lean(),
      ]);

      if (!screenshots.length) continue; // skip users with no activity this week

      const dailyRows = buildDailyRows(screenshots, timers);
      const employee = user.name || user.username || user.email || "Unknown";

      userBlocks.push({ label: employee, rows: dailyRows });
    }

    if (!userBlocks.length) {
      return res.status(404).json({ message: "No activity found for this week" });
    }

    const maxDaysInAnyBlock = userBlocks.reduce((max, b) => Math.max(max, b.rows.length), 0);

    // ---------- Workbook ----------
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Activity Tracker";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Weekly Report - All Users", {
      views: [{ state: "frozen", ySplit: 5 }],
    });

    sheet.columns = [
      { key: "metric", width: 18 },
      ...Array.from({ length: maxDaysInAnyBlock }, (_, i) => ({
        key: `day${i}`,
        width: 14,
      })),
    ];

    const NUM_COLS = sheet.columns.length;

    // ---------- Title ----------
    sheet.mergeCells(1, 1, 1, NUM_COLS);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = "Weekly Activity Report — All Users";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 30;
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } };
    });

    // ---------- Summary ----------
    const summaryLabelStyle = { font: { bold: true, color: { argb: "FF2F5597" } } };
    const summaryValueStyle = {
      font: { color: { argb: "FF333333" } },
      alignment: { horizontal: "left" },
    };
    const addSummaryRow = (label, value) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).style = summaryLabelStyle;
      row.getCell(2).style = summaryValueStyle;
      sheet.mergeCells(row.number, 2, row.number, NUM_COLS);
    };
    addSummaryRow("Week:", reportDate);
    addSummaryRow("Total Employees:", userBlocks.length);

    sheet.addRow([]);

    // ---------- One detailed block per user ----------
    userBlocks.forEach((block, idx) => {
      renderGroupBlock(sheet, block, {
        NUM_COLS,
        showDayName: true,
        isLast: idx === userBlocks.length - 1,
      });
    });

    // ---------- Send file ----------
    const filename = `Weekly_Activity_Report_All_Users_${reportDate}.xlsx`.replace(/\s+/g, "_");

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Failed to export weekly all-users report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};