import moment from "moment";
import ExcelJS from "exceljs";
import screenshotModel from "../../models/screenshotModel.js";
import timerModel from "../../models/timerModel.js";
import userModel from "../../models/userModel.js";

/* ============================================================
   COLOR / FORMAT UTILS
   ============================================================ */
export const getActivityColor = (percent) => {
  if (percent >= 50) return "FFC6EFCE";
  if (percent >= 20) return "FFFFEB9C";
  return "FFFFC7CE";
};

export const getActivityFontColor = (percent) => {
  if (percent >= 50) return "FF006100";
  if (percent >= 20) return "FF9C6500";
  return "FF9C0006";
};

export const formatWorkedTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/* ============================================================
   DATA FETCHING
   ============================================================ */
export const fetchUserActivityData = async (userId, rangeStart, rangeEnd) => {
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
  return { screenshots, timers };
};

// filter lets the caller scope which users get included (role, isActive, team, etc.)
export const fetchAllUsers = async (filter = {}) => userModel.find(filter).lean();

export const getEmployeeName = (user) => user.name || user.username || user.email || "Unknown";

/* ============================================================
   STATS / SUMMARY
   ============================================================ */
export const calculateWorkedMinutes = (timers) => {
  let totalMins = 0;
  timers.forEach((timer) => {
    const start = timer?.startTime ? moment(timer.startTime) : null;
    let end = timer?.endTime ? moment(timer.endTime) : null;

    if (!start || !start.isValid()) return;
    if (timer.isRunning) end = moment();
    if (!end || !end.isValid()) return;

    totalMins += end.diff(start, "minutes", true);
  });
  return totalMins;
};

export const calculateAvgActivity = (screenshots) => {
  if (!screenshots.length) return 0;
  return Math.round(
    screenshots.reduce((sum, s) => sum + (s.activity?.overallActivityPercent || 0), 0) /
      screenshots.length
  );
};

export const createSummary = (screenshots, timers) => ({
  totalWorkedTimeInMins: Math.floor(calculateWorkedMinutes(timers)),
  avgActivity: calculateAvgActivity(screenshots),
  totalScreenshots: screenshots.length,
});

/* ============================================================
   DAILY ROWS — per-day aggregation, the building block for
   week/month/team grouping
   ============================================================ */
export const getDailyRows = (screenshots, timers) => {
  const shotsByDay = {};
  screenshots.forEach((shot) => {
    const dayKey = moment(shot.timestamp).format("YYYY-MM-DD");
    if (!shotsByDay[dayKey]) shotsByDay[dayKey] = [];
    shotsByDay[dayKey].push(shot);
  });

  const timerMinsByDay = {};
  timers.forEach((t) => {
    const dayKey = moment(t.date).format("YYYY-MM-DD");
    const start = t.startTime ? moment(t.startTime) : null;
    let end = t.endTime ? moment(t.endTime) : null;

    if (!start || !start.isValid()) return;
    if (t.isRunning) end = moment();
    if (!end || !end.isValid()) return;

    if (!timerMinsByDay[dayKey]) timerMinsByDay[dayKey] = 0;
    timerMinsByDay[dayKey] += end.diff(start, "minutes", true);
  });

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

// Ensures every day in [rangeStart, rangeEnd] has a row, even if no
// screenshots/timers exist for it — those days get explicit zero values
// instead of being silently skipped (e.g. an absent employee, or a day
// with no activity at all).
export const fillMissingDays = (dailyRows, rangeStart, rangeEnd) => {
  const rowsByDay = {};
  dailyRows.forEach((row) => {
    rowsByDay[row.dayKey] = row;
  });

  const filled = [];
  let cursor = moment(rangeStart).startOf("day");
  const end = moment(rangeEnd).startOf("day");

  while (cursor.isSameOrBefore(end, "day")) {
    const dayKey = cursor.format("YYYY-MM-DD");
    if (rowsByDay[dayKey]) {
      filled.push(rowsByDay[dayKey]);
    } else {
      filled.push({
        dayKey,
        date: cursor.format("DD MMM YYYY"),
        dayName: cursor.format("ddd"),
        overall: 0,
        keyboard: 0,
        mouse: 0,
        count: 0,
        workedMins: 0,
      });
    }
    cursor = cursor.add(1, "day");
  }

  return filled;
};

/* ============================================================
   GROUPING
   Each grouping function returns: [{ label, rows: dailyRow[] }]
   which is the shape buildGroupedWorkbook / renderGroupBlock expect.
   ============================================================ */
export const groupByMonth = (dailyRows) => {
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

export const groupByWeek = (dailyRows) => {
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

// One block per employee. `userBlocks` is [{ label: employeeName, rows: dailyRows }]
// This is mostly a pass-through — kept as its own function so the controller/service
// boundary stays consistent with groupByMonth/groupByWeek, and so validation or
// sorting (e.g. alphabetical, by total worked time) has one obvious place to live.
export const groupByUser = (userBlocks, { sortBy = null } = {}) => {
  const blocks = [...userBlocks];
  if (sortBy === "name") {
    blocks.sort((a, b) => a.label.localeCompare(b.label));
  } else if (sortBy === "workedTime") {
    const totalWorked = (b) => b.rows.reduce((sum, r) => sum + r.workedMins, 0);
    blocks.sort((a, b) => totalWorked(b) - totalWorked(a));
  }
  return blocks;
};

/* ============================================================
   WORKBOOK BUILDING
   ============================================================ */
const styleTitleRow = (sheet, numCols, text) => {
  sheet.mergeCells(1, 1, 1, numCols);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = text;
  titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 30;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } };
  });
};

// summaryRows: [ [label, value], ... ]
const addSummaryRows = (sheet, numCols, summaryRows) => {
  const summaryLabelStyle = { font: { bold: true, color: { argb: "FF2F5597" } } };
  const summaryValueStyle = {
    font: { color: { argb: "FF333333" } },
    alignment: { horizontal: "left" },
  };
  summaryRows.forEach(([label, value]) => {
    const row = sheet.addRow([label, value]);
    row.getCell(1).style = summaryLabelStyle;
    row.getCell(2).style = summaryValueStyle;
    sheet.mergeCells(row.number, 2, row.number, numCols);
  });
  sheet.addRow([]);
};

// Renders one "block" — a month, a week, or a user — as:
// title banner -> date header row -> metric rows -> total row
const renderGroupBlock = (sheet, group, { numCols, showDayName = false, isLast = false }) => {
  const titleRow = sheet.addRow([group.label]);
  sheet.mergeCells(titleRow.number, 1, titleRow.number, numCols);
  titleRow.getCell(1).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  titleRow.height = 20;
  titleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7F9CC7" } };
  });

  const headerValues = group.rows.map((d) => (showDayName ? `${d.dayName}\n${d.date}` : d.date));
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
  };

  addMetricRow("Worked Time", group.rows.map((d) => formatWorkedTime(d.workedMins)));
  addMetricRow("Overall %", group.rows.map((d) => d.overall), { colorCode: true, isPercent: true });
  addMetricRow("Keyboard %", group.rows.map((d) => d.keyboard), { isPercent: true });
  addMetricRow("Mouse %", group.rows.map((d) => d.mouse), { isPercent: true });
  addMetricRow("Screenshots", group.rows.map((d) => d.count));

  const totalOverall = Math.round(group.rows.reduce((sum, d) => sum + d.overall, 0) / group.rows.length);
  const totalWorked = group.rows.reduce((sum, d) => sum + d.workedMins, 0);
  const totalShots = group.rows.reduce((sum, d) => sum + d.count, 0);

  const totalRow = sheet.addRow([
    `${group.label} Total  —  Avg Overall: ${totalOverall}%  |  Worked: ${formatWorkedTime(
      totalWorked
    )}  |  Screenshots: ${totalShots}`,
  ]);
  sheet.mergeCells(totalRow.number, 1, totalRow.number, numCols);
  totalRow.getCell(1).font = { italic: true, bold: true, color: { argb: "FF2F5597" } };
  totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

  if (!isLast) sheet.addRow([]);
};

// Used for: week, month, team-week — anything rendered as stacked blocks
// with day columns. groups: [{ label, rows }]
export const buildGroupedWorkbook = ({
  title,
  sheetName = "Activity Report",
  summaryRows,
  groups,
  showDayName = false,
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Activity Tracker";
  workbook.created = new Date();

  const maxDaysInAnyGroup = groups.reduce((max, g) => Math.max(max, g.rows.length), 0);

  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: summaryRows.length + 3 }],
  });

  sheet.columns = [
    { key: "metric", width: 18 },
    ...Array.from({ length: maxDaysInAnyGroup }, (_, i) => ({ key: `day${i}`, width: 14 })),
  ];
  const numCols = sheet.columns.length;

  styleTitleRow(sheet, numCols, title);
  addSummaryRows(sheet, numCols, summaryRows);

  groups.forEach((group, idx) => {
    renderGroupBlock(sheet, group, { numCols, showDayName, isLast: idx === groups.length - 1 });
  });

  return workbook;
};

// Used for: team-week — a pivoted grid. Rows are days (with day name + date),
// columns are users, and each cell combines worked time + overall activity %
// for that user on that day (e.g. "6h 30m / 72%"), color-coded by the %.
// Assumes every block in `userBlocks` has been through fillMissingDays with the
// same range, so all blocks share the same day sequence in the same order.
export const buildTeamMatrixWorkbook = ({
  title,
  sheetName = "Weekly Report - All Users",
  summaryRows,
  userBlocks,
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Activity Tracker";
  workbook.created = new Date();

  const days = userBlocks[0]?.rows || [];

  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", xSplit: 1, ySplit: summaryRows.length + 3 }],
  });

  sheet.columns = [
    { key: "date", width: 16 },
    ...userBlocks.map((_, i) => ({ key: `user${i}`, width: 20 })),
  ];
  const numCols = sheet.columns.length;

  styleTitleRow(sheet, numCols, title);
  addSummaryRows(sheet, numCols, summaryRows);

  // Header row: one column per user
  const headerRow = sheet.addRow(["Date", ...userBlocks.map((b) => b.label)]);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFB0B0B0" } },
      bottom: { style: "thin", color: { argb: "FFB0B0B0" } },
    };
  });

  // One row per day, one cell per user
  days.forEach((_, dayIdx) => {
    const dayMeta = userBlocks[0].rows[dayIdx];
    const row = sheet.addRow([
      `${dayMeta.dayName}\n${dayMeta.date}`,
      ...userBlocks.map((block) => {
        const d = block.rows[dayIdx];
        return `${formatWorkedTime(d.workedMins)} / ${d.overall}%`;
      }),
    ]);
    row.height = 30;
    row.getCell(1).font = { bold: true, color: { argb: "FF2F5597" } };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };

    userBlocks.forEach((block, colIdx) => {
      const d = block.rows[dayIdx];
      const cell = row.getCell(colIdx + 2);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = { bottom: { style: "hair", color: { argb: "FFE0E0E0" } } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: getActivityColor(d.overall) } };
      cell.font = { color: { argb: getActivityFontColor(d.overall) }, bold: true };
    });
  });

  // Weekly total row per user
  const totalsRow = sheet.addRow([
    "Weekly Total",
    ...userBlocks.map((block) => {
      const totalWorked = block.rows.reduce((sum, d) => sum + d.workedMins, 0);
      const avgOverall = Math.round(
        block.rows.reduce((sum, d) => sum + d.overall, 0) / block.rows.length
      );
      return `${formatWorkedTime(totalWorked)} / ${avgOverall}%`;
    }),
  ]);
  totalsRow.getCell(1).font = { italic: true, bold: true, color: { argb: "FF2F5597" } };
  totalsRow.eachCell((cell, colNumber) => {
    cell.border = { top: { style: "thin", color: { argb: "FFB0B0B0" } } };
    if (colNumber === 1) return;
    cell.font = { bold: true, color: { argb: "FF2F5597" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  return workbook;
};

// Used for: single-day report — the flat screenshot-by-screenshot table
export const buildFlatWorkbook = ({ title, sheetName = "Activity Report", summaryRows, screenshots }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Activity Tracker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: summaryRows.length + 3 }],
  });

  sheet.columns = [
    { key: "time", width: 22 },
    { key: "application", width: 24 },
    { key: "windowTitle", width: 40 },
    { key: "overall", width: 12 },
    { key: "keyboardPct", width: 12 },
    { key: "mousePct", width: 12 },
    { key: "keyboardCount", width: 14 },
    { key: "mouseCount", width: 12 },
  ];
  const numCols = sheet.columns.length;

  styleTitleRow(sheet, numCols, title);
  addSummaryRows(sheet, numCols, summaryRows);

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

  return workbook;
};