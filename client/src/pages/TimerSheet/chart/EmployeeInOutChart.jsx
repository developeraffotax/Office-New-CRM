import React, { useEffect, useMemo, useState } from "react";
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

export default function EmployeeInOutChart() {
  const navigate = useNavigate();

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
  const { rangeBarData, trendCheckIn, trendCheckOut, holidayAnnotations } =
    useMemo(() => {
      const rangeBar = [];
      const trendIn = [];
      const trendOut = [];
      const holidays = [];

      mergedAttendance.forEach((day) => {
        const dayTs = dayjs(day.date).startOf("day").valueOf();
        const label = dayjs(day.date).format("DD MMM");
if (day.isHoliday) {
  rangeBar.push({
    x: label,
    y: [REFERENCE_LINE_1, REFERENCE_LINE_2],

    // Dark red holiday bar
    fillColor: "#7F1D1D",

    meta: {
      date: day.date,
      isHoliday: true,
    },
  });

  trendIn.push({
    x: dayTs,
    y: null,
    meta: { isHoliday: true },
  });

  trendOut.push({
    x: dayTs,
    y: null,
    meta: { isHoliday: true },
  });

  return;
}

        const inMin = timeToMinutes(day.checkIn);
        const outMin = timeToMinutes(day.checkOut);

        if (inMin !== null && outMin !== null) {
          rangeBar.push({
            x: label,
            y: [Math.round(inMin), Math.round(outMin)],
            meta: {
              date: day.date,
              sessions: day.sessionCount,
              isHoliday: false,
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
        holidayAnnotations: holidays,
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
        },
        colors: ["#325ea8","#6366F1", ],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 6,
            columnWidth: "42%",
            dataLabels: {
              orientation: "vertical"
            }
            
          },
        },
       dataLabels: {
  enabled: true,

  formatter: (val, opts) => {
    const point =
      opts?.w?.config?.series?.[0]?.data?.[opts.dataPointIndex];

    if (point?.meta?.isHoliday) {
      return "Holiday";
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
                  <div>No attendance recorded</div>
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
  }, [chartType, dateRange, isRangeView, holidayAnnotations]);

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
                  bgcolor: "#D1D5DB",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Holiday / No Attendance
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
              <Chart
                key={chartType}
                options={chartOptions}
                series={series}
                type={isRangeView ? "rangeBar" : chartType}
                height={600}
              />
            )}
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}
