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

// ---------- Group daily rows by month ----------
const groupDailyRowsByMonth = (dailyRows) => {
  const monthMap = {};
  dailyRows.forEach((row) => {
    const monthKey = moment(row.date, "DD MMM YYYY").format("YYYY-MM");
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

    const isRange = filterType === "range";

    // ---------- Per-day rows (range mode) ----------
    let dailyRows = [];
    if (isRange) {
      const shotsByDay = groupScreenshotsByDay(screenshots);
      const timerMinsByDay = groupTimersByDay(timers);

      dailyRows = Object.keys(shotsByDay)
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
            date: moment(dayKey).format("DD MMM YYYY"),
            overall: avg("overallActivityPercent"),
            keyboard: avg("keyboardActivityPercent"),
            mouse: avg("mouseActivityPercent"),
            count: shots.length,
            workedMins: Math.floor(timerMinsByDay[dayKey] || 0),
          };
        });
    }

    // ---------- Group into months (range mode only) ----------
    const monthGroups = isRange ? groupDailyRowsByMonth(dailyRows) : [];
    const maxDaysInAnyMonth = monthGroups.reduce(
      (max, m) => Math.max(max, m.rows.length),
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
          ...Array.from({ length: maxDaysInAnyMonth }, (_, i) => ({
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

      monthGroups.forEach((month, monthIdx) => {
        // ---- Month title banner ----
        const titleRow = sheet.addRow([month.label]);
        sheet.mergeCells(titleRow.number, 1, titleRow.number, NUM_COLS);
        titleRow.getCell(1).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        titleRow.height = 20;
        titleRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7F9CC7" } };
        });

        // ---- Date header row for this month ----
        const headerRow = sheet.addRow(["Date", ...month.rows.map((d) => d.date)]);
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

        // ---- Metric rows for this month ----
        addMetricRow("Worked Time", month.rows.map((d) => formatWorkedTime(d.workedMins)));
        addMetricRow("Overall %", month.rows.map((d) => d.overall), { colorCode: true, isPercent: true });
        addMetricRow("Keyboard %", month.rows.map((d) => d.keyboard), { isPercent: true });
        addMetricRow("Mouse %", month.rows.map((d) => d.mouse), { isPercent: true });
        addMetricRow("Screenshots", month.rows.map((d) => d.count));

        // ---- Month total summary row ----
        const monthAvgOverall = Math.round(
          month.rows.reduce((sum, d) => sum + d.overall, 0) / month.rows.length
        );
        const monthTotalWorked = month.rows.reduce((sum, d) => sum + d.workedMins, 0);
        const monthTotalShots = month.rows.reduce((sum, d) => sum + d.count, 0);

        const totalRow = sheet.addRow([
          `${month.label} Total  —  Avg Overall: ${monthAvgOverall}%  |  Worked: ${formatWorkedTime(
            monthTotalWorked
          )}  |  Screenshots: ${monthTotalShots}`,
        ]);
        sheet.mergeCells(totalRow.number, 1, totalRow.number, NUM_COLS);
        totalRow.getCell(1).font = { italic: true, bold: true, color: { argb: "FF2F5597" } };
        totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

        if (monthIdx < monthGroups.length - 1) sheet.addRow([]);
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