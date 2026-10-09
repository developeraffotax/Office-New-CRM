import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Chart from "react-apexcharts";
import {
  Box,
  Stack,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BarChartIcon from "@mui/icons-material/BarChart";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import ManualRangePicker from "./ManualRangePicker";
import QuickFilterMenu from "./QuickFilterMenu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import { SummaryTile } from "./SummaryTile";

dayjs.extend(isSameOrBefore);

const DEFAULT_LABEL = "This Month";
const getDefaultRange = () => [
  dayjs().startOf("month"),
  dayjs().endOf("month"),
];

// ---- fixed Y axis window: 9:00 AM -> 11:00 PM, expressed in minutes-since-midnight ----
const Y_AXIS_MIN = 9 * 60; // 540
const Y_AXIS_MAX = 23 * 60; // 1380
const REFERENCE_LINE_1 = 11 * 60 + 30; // 11:30 AM -> 690
const REFERENCE_LINE_2 = 20 * 60; // 8:00 PM -> 1200

// ---- time helpers -----------------------------------------------------
const timeToMinutes = (isoString) => {
  const d = dayjs(isoString);
  if (!d.isValid()) return null;
  return d.hour() * 60 + d.minute() + d.second() / 60;
};

const formatMinutesLabel = (minutes) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes))
    return "";
  return dayjs()
    .startOf("day")
    .add(Math.round(minutes), "minute")
    .format("hh:mm A");
};

const formatDuration = (startMin, endMin) => {
  if (startMin == null || endMin == null) return "";
  const diff = Math.max(0, Math.round(endMin - startMin));
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

// Fill every calendar day in [start, end] with its attendance row, or a
// synthetic "holiday" placeholder when nothing was recorded that day.
const buildFullDayList = (attendance, start, end) => {
  if (!start || !end) return [];
  const byDate = new Map();
  attendance.forEach((d) => byDate.set(dayjs(d.date).format("YYYY-MM-DD"), d));

  const days = [];
  let cursor = start.startOf("day");
  const last = end.startOf("day");
  while (cursor.isSameOrBefore(last, "day")) {
    const key = cursor.format("YYYY-MM-DD");
    if (byDate.has(key)) {
      days.push({ ...byDate.get(key), isHoliday: false });
    } else {
      days.push({
        date: cursor.toISOString(),
        checkIn: null,
        checkOut: null,
        sessionCount: 0,
        isHoliday: true,
      });
    }
    cursor = cursor.add(1, "day");
  }
  return days;
};

// Shared dashed reference lines (11:30 AM / 8:00 PM) — same meaning on
// every chart type since Y is always "minutes since midnight".
const referenceYAnnotations = [
  {
    y: REFERENCE_LINE_1,
    borderColor: "#7d7d7d",
    strokeDashArray: 8,
    borderWidth: 2,

    // label: {
    //   text: "11:30 AM",
    //   position: "left",
    //   offsetY: -4,
    //   style: { fontSize: "10px", color: "#64748B", background: "transparent" },
    // },
  },
  {
    y: REFERENCE_LINE_2,
    borderColor: "#7d7d7d",
    strokeDashArray: 8,
    borderWidth: 2,
    // label: {
    //   text: "8:00 PM",
    //   position: "left",
    //   offsetY: -4,
    //   style: { fontSize: "10px", color: "#64748B", background: "transparent" },
    // },
  },
];

const DELTA_POSITION = "above";
const TARGET_MINUTES = 8 * 60;
// true  -> sum of session lengths (breaks excluded)
// false -> first check-in to last check-out
const USE_SESSION_SUM = true;
// true -> past weekdays with no record count as -8h in the total
const COUNT_ABSENT_AS_SHORT = false;

const DELTA_GREEN = "#16A34A";
const DELTA_RED = "#DC2626";
const DELTA_NEUTRAL = "#64748B";

const deltaColor = (m) =>
  m == null ? DELTA_NEUTRAL : m >= 0 ? DELTA_GREEN : DELTA_RED;

// compact label for the axis: "+1h20m", "-45m", "+2h"
const formatSigned = (mins) => {
  if (mins == null) return "";
  const r = Math.round(mins);
  const abs = Math.abs(r);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const body = h && m ? `${h}h${m}m` : h ? `${h}h` : `${m}m`;
  return `${r >= 0 ? "+" : "-"}${body}`;
};

// const SummaryTile = ({ label, value, color }) => (
//   <Box
//     sx={{
//       px: 2,
//       py: 1,
//       border: "1px solid #e5e7eb",
//       borderRadius: 2,
//       bgcolor: "#fff",
//     }}
//   >
//     <Typography variant="caption" color="text.secondary">
//       {label}
//     </Typography>
//     <Typography
//       variant="h6"
//       fontWeight={700}
//       sx={{ color: color || "text.primary", lineHeight: 1.2 }}
//     >
//       {value}
//     </Typography>
//   </Box>
// );

export default function EmployeeInOutChart() {
  const navigate = useNavigate();

  const [plotLayout, setPlotLayout] = useState({ left: 0, width: 0 });

  const syncPlotLayout = useCallback((chartContext) => {
    const g = chartContext?.w?.globals;
    if (!g) return;
    const left = Math.round(g.translateX);
    const width = Math.round(g.gridWidth);
    setPlotLayout((prev) =>
      prev.left === left && prev.width === width ? prev : { left, width },
    );
  }, []);

  const [users, setUsers] = useState([]);
  const [jobHolderName, setJobHolderName] = useState("");
  const [dateRange, setDateRange] = useState(getDefaultRange());
  const [activeLabel, setActiveLabel] = useState(DEFAULT_LABEL);
  const [chartType, setChartType] = useState("bar"); // "bar" | "area" | "line"

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const isFilterActive =
    activeLabel !== DEFAULT_LABEL ||
    (users[0] && jobHolderName !== users[0]?.name);

  const handleMonthChange = (direction) => {
    const currentStart = dateRange?.[0] || dayjs().startOf("month");

    const newMonth =
      direction === "prev"
        ? currentStart.subtract(1, "month")
        : currentStart.add(1, "month");

    const newRange = [newMonth.startOf("month"), newMonth.endOf("month")];

    setDateRange(newRange);
    setActiveLabel(newMonth.format("MMMM YYYY"));
  };

  // Users for the dropdown
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
        );
        const list = data?.users || [];
        setUsers(list);
        if (list.length) setJobHolderName((prev) => prev || list[0]?.name);
      } catch (error) {
        console.log(error);
      }
    };
    getAllUsers();
  }, []);

  // Fetch daily attendance whenever employee/range changes
  useEffect(() => {
    if (!jobHolderName || !dateRange?.[0] || !dateRange?.[1]) return;

    const getUserDailyAttendance = async () => {
      setLoading(true);
      try {
        const start = dateRange[0].format("YYYY-MM-DD");
        const end = dateRange[1].format("YYYY-MM-DD");
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/fetch/user-daily-attendance/${jobHolderName}/${start}/${end}`,
        );
        setAttendance(data?.attendance || []);
      } catch (error) {
        console.log(error);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };
    getUserDailyAttendance();
  }, [jobHolderName, dateRange]);

  const handleQuickFilterSelect = (label, range) => {
    setActiveLabel(label);
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setDateRange(getDefaultRange());
    setActiveLabel(DEFAULT_LABEL);
  };

  // Every day in range, real attendance or synthetic holiday
  const mergedAttendance = useMemo(
    () => buildFullDayList(attendance, dateRange?.[0], dateRange?.[1]),
    [attendance, dateRange],
  );

  // Build both the range-bar dataset and the trend dataset from the
  // merged (gap-filled) list.
  const { rangeBarData, trendCheckIn, trendCheckOut, summary } = useMemo(() => {
    const rangeBar = [];
    const trendIn = [];
    const trendOut = [];
    let totalDelta = 0;
    let workedTotal = 0;
    let daysWorked = 0;

    mergedAttendance.forEach((day) => {
      const dayTs = dayjs(day.date).startOf("day").valueOf();
      const label = dayjs(day.date).format("DD MMM");

      if (day.isHoliday) {
        const dow = dayjs(day.date).day();
        const isWeekend = dow === 0 || dow === 6;

        const countAsShort =
          COUNT_ABSENT_AS_SHORT &&
          !isWeekend &&
          dayjs(day.date).isBefore(dayjs(), "day");
        const delta = countAsShort ? -TARGET_MINUTES : null;
        if (countAsShort) totalDelta += delta;

        rangeBar.push({
          x: label,
          y: [REFERENCE_LINE_1, REFERENCE_LINE_2],
          fillColor: isWeekend ? "#94A3B8" : "#7F1D1D",
          meta: { date: day.date, isHoliday: true, isWeekend, delta },
        });
        trendIn.push({
          x: dayTs,
          y: null,
          meta: { isHoliday: true, isWeekend },
        });
        trendOut.push({
          x: dayTs,
          y: null,
          meta: { isHoliday: true, isWeekend },
        });
        return;
      }

      const inMin = timeToMinutes(day.checkIn);
      const outMin = timeToMinutes(day.checkOut);
      const spanMin = inMin !== null && outMin !== null ? outMin - inMin : null;

      const workedMin = Math.round(
        USE_SESSION_SUM && day.workedMinutes > 0
          ? day.workedMinutes
          : spanMin ?? 0,
      );
      const delta = spanMin !== null ? workedMin - TARGET_MINUTES : null;

      if (delta !== null) {
        totalDelta += delta;
        workedTotal += workedMin;
        daysWorked += 1;
      }

      if (inMin !== null && outMin !== null) {
        rangeBar.push({
          x: label,
          y: [Math.round(inMin), Math.round(outMin)],
          meta: {
            date: day.date,
            sessions: day.sessionCount,
            isHoliday: false,
            workedMin,
            delta,
          },
        });
      }
      if (inMin !== null) {
        trendIn.push({
          x: dayTs,
          y: Math.round(inMin),
          meta: { sessions: day.sessionCount },
        });
      }
      if (outMin !== null) {
        trendOut.push({
          x: dayTs,
          y: Math.round(outMin),
          meta: { sessions: day.sessionCount },
        });
      }
    });

    return {
      rangeBarData: rangeBar,
      trendCheckIn: trendIn,
      trendCheckOut: trendOut,
      summary: { totalDelta, workedTotal, daysWorked },
    };
  }, [mergedAttendance]);

  const isRangeView = chartType === "bar";

  const series = isRangeView
    ? [{ name: "Work Hours", data: rangeBarData }]
    : [
        { name: "Check In", data: trendCheckIn },
        { name: "Check Out", data: trendCheckOut },
      ];

  const chartOptions = useMemo(() => {
    if (isRangeView) {
      return {
        chart: {
          type: "rangeBar",
          toolbar: { show: true },
          fontFamily: "inherit",
          events: { mounted: syncPlotLayout, updated: syncPlotLayout },
        },
        colors: ["#325ea8", "#6366F1"],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 6,
            columnWidth: "42%",
            dataLabels: {
              orientation: "vertical",
            },
          },
        },
        // dataLabels: {
        //   enabled: true,

        //   formatter: (val, opts) => {
        //     const point =
        //       opts?.w?.config?.series?.[0]?.data?.[opts.dataPointIndex];

        //     if (point?.meta?.isHoliday) {
        //       return point.meta.isWeekend ? "Off" : "Absent";
        //     }

        //     if (Array.isArray(point?.y)) {
        //       const [inMin, outMin] = point.y;
        //       return formatDuration(inMin, outMin);
        //     }

        //     return formatMinutesLabel(val);
        //   },

        //   offsetY: 0,

        //   style: {
        //     fontSize: "10px",
        //     fontWeight: 600,
        //     colors: ["#ffffff"],
        //   },
        // },


        dataLabels: {
  enabled: true,

  formatter: (val, opts) => {
    const point =
      opts?.w?.config?.series?.[0]?.data?.[opts.dataPointIndex];

    if (point?.meta?.isHoliday) {
      return point.meta.isWeekend ? "Off" : "Absent";
    }

    // worked time (sum of sessions), not first-in → last-out
    if (point?.meta?.workedMin != null) {
      return formatDuration(0, point.meta.workedMin);
    }

    return formatMinutesLabel(val);
  },

  offsetY: 0,

  style: {
    fontSize: "10px",
    fontWeight: 600,
    colors: ["#ffffff"],
  },
},



        grid: { borderColor: "#e5e7eb" },
        xaxis: {
          type: "category",
          title: { text: "Date", style: { fontWeight: 600 } },
          labels: { rotate: -45, trim: false },
        },
        yaxis: {
          min: Y_AXIS_MIN,
          max: Y_AXIS_MAX,
          tickAmount: 14, // ~1 hour steps across the fixed window
          labels: { formatter: (val) => formatMinutesLabel(val) },
          title: { text: "Time", style: { fontWeight: 600 } },
        },
        annotations: { yaxis: referenceYAnnotations },
        tooltip: {
          custom: ({ dataPointIndex, w }) => {
            const point = w?.config?.series?.[0]?.data?.[dataPointIndex];
            if (!point) return "";
            const date = dayjs(point.meta?.date).format("DD MMM YYYY");
            if (point.meta?.isHoliday) {
              return `
                      <div class="px-3 py-2 text-xs">
                        <div class="font-semibold">${date}</div>
                        <div>${
                          point.meta.isWeekend
                            ? "Weekend"
                            : "Absent — no attendance recorded"
                        }</div>
                      </div>
                    `;
            }
            const [inMin, outMin] = point.y;
            const sessions = point.meta?.sessions;
            return `
              <div class="px-3 py-2 text-xs">
                <div class="font-semibold">${date}</div>
                <div>In: ${formatMinutesLabel(inMin)}</div>
                <div>Out: ${formatMinutesLabel(outMin)}</div>
                <div>Duration: ${formatDuration(inMin, outMin)}</div>
                ${
                  point.meta?.delta != null
                    ? `<div>Worked: ${formatDuration(
                        0,
                        point.meta.workedMin,
                      )}</div>
<div style="color:${deltaColor(point.meta.delta)};font-weight:600">
  ${point.meta.delta >= 0 ? "Extra" : "Short"}: ${formatDuration(
                        0,
                        Math.abs(point.meta.delta),
                      )}
</div>`
                    : ""
                }
                ${sessions > 1 ? `<div>${sessions} sessions merged</div>` : ""}
              </div>
            `;
          },
        },
      };
    }

    // area / line trend view
    return {
      chart: {
        type: chartType,
        toolbar: { show: true },
        fontFamily: "inherit",
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => formatMinutesLabel(val),
        offsetY: -6,
        style: { fontSize: "10px", fontWeight: 600 },
        background: { enabled: false },
      },
      colors: ["#22C55E", "#EF4444"],
      stroke: {
        curve: "smooth",
        width: chartType === "area" ? 2 : 3,
        connectNulls: false,
      },
      fill:
        chartType === "area"
          ? {
              type: "gradient",
              gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
            }
          : { type: "solid" },
      markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
      grid: { borderColor: "#e5e7eb" },
      xaxis: {
        type: "datetime",
        min: dateRange?.[0]?.startOf("day").valueOf(),
        max: dateRange?.[1]?.endOf("day").valueOf(),
        labels: { format: "dd MMM" },
        title: { text: "Date", style: { fontWeight: 600 } },
      },
      yaxis: {
        min: Y_AXIS_MIN,
        max: Y_AXIS_MAX,
        tickAmount: 7,
        labels: { formatter: (val) => formatMinutesLabel(val) },
        title: { text: "Time", style: { fontWeight: 600 } },
      },
      annotations: {
        yaxis: referenceYAnnotations,
        // xaxis: holidayAnnotations,
      },
      legend: { position: "top" },
      tooltip: {
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const point =
            w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex];
          if (!point || point.y === null) return "";
          const label = w.config.series[seriesIndex].name;
          const date = dayjs(point.x).format("DD MMM YYYY");
          const time = formatMinutesLabel(point.y);
          const sessions = point.meta?.sessions;
          return `
            <div class="px-3 py-2 text-xs">
              <div class="font-semibold">${date}</div>
              <div>${label}: ${time}</div>
              ${sessions > 1 ? `<div>${sessions} sessions that day</div>` : ""}
            </div>
          `;
        },
      },
    };
  }, [chartType, dateRange, isRangeView, rangeBarData, syncPlotLayout]);

  const expectedMin = summary.daysWorked * TARGET_MINUTES;
  const isExtra = summary.totalDelta >= 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2} sx={{ width: "100%", p: 4 }}>
        {/* <Stack direction="row" alignItems="center" spacing={1}>
          
          <Typography variant="h5" fontWeight={600}>
            Employee In / Out
          </Typography>
        </Stack> */}

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="start"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            alignItems="center"
            useFlexGap
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleMonthChange("prev")}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  p: 0,
                }}
              >
                <ChevronLeftIcon />
              </Button>

              <ManualRangePicker
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setActiveLabel("Custom Range");
                }}
              />

              <Button
                variant="outlined"
                size="small"
                onClick={() => handleMonthChange("next")}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  p: 0,
                }}
              >
                <ChevronRightIcon />
              </Button>
            </Stack>

            <QuickFilterMenu
              activeLabel={activeLabel}
              onSelect={handleQuickFilterSelect}
            />

            {isFilterActive && (
              <Button
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            alignItems="center"
            useFlexGap
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="employee-select-label">Employee</InputLabel>
              <Select
                labelId="employee-select-label"
                value={jobHolderName}
                label="Employee"
                onChange={(e) => setJobHolderName(e.target.value)}
              >
                {users.map((u) => (
                  <MenuItem key={u._id} value={u.name}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newValue) => newValue && setChartType(newValue)}
              size="small"
            >
              <ToggleButton value="bar">
                <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
                Bar View
              </ToggleButton>
              <ToggleButton value="area">
                <StackedLineChartIcon fontSize="small" sx={{ mr: 1 }} />
                Area View
              </ToggleButton>
              <ToggleButton value="line">
                <ShowChartIcon fontSize="small" sx={{ mr: 1 }} />
                Line View
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            {chartType === "bar" ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 1,
                    bgcolor: "#6366F1",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Work Span (Check In → Check Out)
                </Typography>
              </Stack>
            ) : (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "#22C55E",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Check In
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "#EF4444",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Check Out
                  </Typography>
                </Stack>
              </>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 1,
                  bgcolor: "#94A3B8",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Weekend / Off
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 1,
                  bgcolor: "#7F1D1D",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Absent
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Card variant="outlined" sx={{ background: "#F9FAFB" }}>
          <CardContent>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 400,
                }}
              >
                <CircularProgress size={28} />
              </Box>
            ) : mergedAttendance.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 400,
                }}
              >
                <Typography color="text.secondary">
                  Select an employee and date range.
                </Typography>
              </Box>
            ) : (
              <>
                {isRangeView && plotLayout.width > 0 && rangeBarData.length < 35 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 28,
                      mb: 0.5,
                    }}
                  >
                    {/* left gutter, same width as the Y axis */}
                    <Box
                      sx={{
                        width: plotLayout.left,
                        flexShrink: 0,
                        p: 1,
                        textAlign: "right",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        
                      >
                        Short / Extra
                      </Typography>
                    </Box>

                    {/* one cell per bar, same total width as the plot area */}
                    <Box
                      sx={{
                        display: "flex",
                        width: plotLayout.width,
                        flexShrink: 0,
                      }}
                    >
                      {rangeBarData.map((p) => (
                        <Box
                          key={p.x}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {p.meta?.delta != null && (
                            <Box
                              sx={{
                                px: rangeBarData.length > 20 ? 0.25 : 0.75,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: deltaColor(p.meta.delta),
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 600,
                                lineHeight: 1.3,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatSigned(p.meta.delta)}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Chart
                  key={chartType}
                  options={chartOptions}
                  series={series}
                  type={isRangeView ? "rangeBar" : chartType}
                  height={600}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",

            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(8, 1fr)",
            },
          }}
        >
          <SummaryTile
            label="Days worked"
            value={summary.daysWorked}
            hint={activeLabel}
            accent="#6366F1"
            icon={<EventAvailableRoundedIcon fontSize="small" />}
          />

          <SummaryTile
            label="Total worked"
            value={formatDuration(0, summary.workedTotal)}
            progress={
              expectedMin ? (summary.workedTotal / expectedMin) * 100 : 0
            }
            accent="#325ea8"
            icon={<AccessTimeRoundedIcon fontSize="small" />}
          />

          <SummaryTile
            label="Expected"
            value={formatDuration(0, expectedMin)}
            hint="8h per working day"
            accent="#64748B"
            icon={<FlagRoundedIcon fontSize="small" />}
          />

          <SummaryTile
            tinted
            label={isExtra ? "Extra time" : "Short time"}
            value={formatSigned(summary.totalDelta)}
            hint={activeLabel}
            accent={deltaColor(summary.totalDelta)}
            icon={
              isExtra ? (
                <TrendingUpRoundedIcon fontSize="small" />
              ) : (
                <TrendingDownRoundedIcon fontSize="small" />
              )
            }
          />
        </Box>
      </Stack>
    </LocalizationProvider>
  );
}
