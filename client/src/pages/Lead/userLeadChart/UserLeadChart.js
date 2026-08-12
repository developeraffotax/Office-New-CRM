"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  ListItemText,
  Chip,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { isAdmin } from "../../../utlis/isAdmin";
import WonLeadStats from "./WonLeadStats";
import ToggleStatsButton from "../ui/ToggleStatsButton";

dayjs.extend(quarterOfYear);

// A distinct color per selected user. Cycles if more users are picked than
// colors defined here — add more hex values if you expect >12 at once.
const PALETTE = [
  "#008FFB",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#22C55E",
  "#3B82F6",
  "#F97316",
  "#06B6D4",
  "#A855F7",
  "#84CC16",
];
const getUserColor = (index) => PALETTE[index % PALETTE.length];

// Shared look for every ToggleButtonGroup in the toolbar (period / metric /
// chart type) so the three read as one consistent control style.
const toggleGroupSx = {
  bgcolor: "#fff",
  border: "1px solid rgba(15,23,42,0.12)",
  borderRadius: 2,
  p: 0.25,
  "& .MuiToggleButton-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1,
    px: 1.75,
    py: 0.85,
    border: "none",
    borderRadius: "6px !important",
    color: "#64748b",
  },
  "& .MuiToggleButton-root.Mui-selected": {
    bgcolor: "#EEF2FF",
    color: "#4338CA",
  },
  "& .MuiToggleButton-root.Mui-selected:hover": {
    bgcolor: "#E0E7FF",
  },
};

// Utility: get start and end dates for filters
const getDateRange = (filter) => {
  const now = dayjs();
  switch (filter) {
    case "thisYear":
      return [now.startOf("year"), now.endOf("year")];
    case "lastYear":
      return [
        now.subtract(1, "year").startOf("year"),
        now.subtract(1, "year").endOf("year"),
      ];
    case "thisMonth":
      return [now.startOf("month"), now.endOf("month")];
    case "lastMonth":
      return [
        now.subtract(1, "month").startOf("month"),
        now.subtract(1, "month").endOf("month"),
      ];
    case "thisQuarter":
      return [now.startOf("quarter"), now.endOf("quarter")];
    case "lastQuarter":
      return [
        now.subtract(1, "quarter").startOf("quarter"),
        now.subtract(1, "quarter").endOf("quarter"),
      ];
    default:
      return [null, null];
  }
};

export default function UserLeadChart({ auth, active1 }) {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("bar");
  const [showStats, setShowStats] = useState(true);

  // Metric being charted. With multiple users on screen at once, plotting
  // count AND value together (like the old dual-axis version) gets unreadable
  // fast, so this picks one measure at a time; both are still available in
  // WonLeadStats and in the raw series data.
  const [metric, setMetric] = useState("value"); // "count" | "value"

  const defaultUsers = () =>
    isAdmin(auth) ? ["All"] : [auth?.user?.name].filter(Boolean);

  const [selectedUsers, setSelectedUsers] = useState(defaultUsers());
  const [users, setUsers] = useState([]);

  const [dateFilter, setDateFilter] = useState("thisYear");
  const [dateRange, setDateRange] = useState(getDateRange("thisYear"));

  const [view, setView] = useState("monthly");
  const [categories, setCategories] = useState([]);
  const [rawSeries, setRawSeries] = useState([]); // [{ user, counts, values, targetCounts, targetValues }]
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const clearFilter = () => {
    setDateFilter("thisYear");
    setView("monthly");
    setDateRange(getDateRange("thisYear"));
    setSelectedUsers(defaultUsers());
  };

  const getAllUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`,
      );

      setUsers((prev) => {
        return (
          data?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission.includes("Leads"),
            ),
          ) || []
        );
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedUsers.length) return;
    try {
      let [start, end] = dateRange;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/userchart/won`,
        {
          params: {
            users: selectedUsers.join(","),
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
            view,
          },
        },
      );

      setCategories(data.labels);
      setRawSeries(data.series || []);
      setHasLoadedOnce(true);
    } catch (err) {
      console.error(err);
    }
  }, [selectedUsers, dateRange, view]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const active = active1 || "All";
    setSelectedUsers(
      isAdmin(auth) ? [active] : [auth?.user?.name].filter(Boolean),
    );
  }, [active1, auth]);

  // "All" is exclusive — picking it clears any other selection, and picking
  // a specific user while "All" is active drops "All" from the selection.
  const handleUserChange = (e) => {
    const val = e.target.value;

    if (val.includes("All") && !selectedUsers.includes("All")) {
      setSelectedUsers(["All"]);
      return;
    }
    if (selectedUsers.includes("All") && val.length > 1) {
      setSelectedUsers(val.filter((v) => v !== "All"));
      return;
    }
    setSelectedUsers(val.length ? val : ["All"]);
  };

  // Build [{ user, target: [...], actual: [...] }] pairs into the flat
  // ApexCharts series list: target series first (hidden by default, same
  // color, dashed/faded), then the actual series, per user — mirrors the
  // original Target/Actual ordering.
  const chartSeries = useMemo(() => {
    const metricKey = metric === "count" ? "counts" : "values";
    const targetKey = metric === "count" ? "targetCounts" : "targetValues";

    const out = [];
    rawSeries.forEach((s, idx) => {
      // Defensive fallbacks — a response missing one of these keys (e.g. a
      // partially-failed request) used to hand ApexCharts an `undefined`
      // data array and crash deep inside its internals.
      const targetData = Array.isArray(s[targetKey])
        ? s[targetKey]
        : new Array(categories.length).fill(0);
      const actualData = Array.isArray(s[metricKey])
        ? s[metricKey]
        : new Array(categories.length).fill(0);

      out.push({
        name: `${s.user} (Target)`,
        data: targetData,
        hidden: true,
        _color: getUserColor(idx),
        _isTarget: true,
      });
      out.push({
        name: s.user,
        data: actualData,
        _color: getUserColor(idx),
        _isTarget: false,
      });
    });
    return out;
  }, [rawSeries, metric, categories]);

  const options = useMemo(() => {
    const isBar = chartType === "bar";

    const dataCount = categories.length;
    let dynamicWidth = "50%";
    if (dataCount === 1) dynamicWidth = "10%";
    else if (dataCount === 2) dynamicWidth = "25%";

    const colors = chartSeries.map((s) => s._color);
    const strokeWidth = chartSeries.map(() => (isBar ? 0 : 3));
    const dashArray = chartSeries.map((s) => (s._isTarget ? 6 : 0));
    const fillOpacity = chartSeries.map((s) => (s._isTarget ? 0.35 : 1));

    return {
      chart: {
        toolbar: { show: true },
        type: chartType,
        animations: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: dynamicWidth,
          borderRadius: 0,
          dataLabels: { position: "top" },
        },
      },
      stroke: { width: strokeWidth, dashArray, curve: "smooth" },
      fill: { opacity: fillOpacity },
      xaxis: { categories },
      yaxis: {
        title: { text: metric === "count" ? "Lead Count" : "Total Value (£)" },
        labels: {
          formatter: (val) => {
            if (val === undefined || val === null || Number.isNaN(val))
              return "";
            return metric === "count"
              ? val.toFixed(0)
              : `£${val.toLocaleString()}`;
          },
        },
        min: 0,
      },
      colors,
      legend: { position: "top" },
      dataLabels: {
        enabled: true,
        offsetY: isBar ? -20 : 0,
        style: {
          colors: isBar ? ["#333"] : colors,
          fontSize: "12px",
          fontWeight: "bold",
        },
        background: { enabled: !isBar },
        formatter: function (val, opts) {
          const { seriesIndex, dataPointIndex, w } = opts;
          // Series are laid out in [target, actual] pairs per user, so every
          // odd index is an "actual" series and its target sits right before it.
          const isTargetSeries = seriesIndex % 2 === 0;
          if (!isTargetSeries) {
            const targetVal =
              w.config.series[seriesIndex - 1]?.data[dataPointIndex];
            if (targetVal) {
              const percent = ((val / targetVal) * 100).toFixed(0);
              return `${val} (${percent}%)`;
            }
          }
          return val;
        },
      },
    };
  }, [chartType, categories, chartSeries, metric]);

  const headerLabel =
    selectedUsers.length === 1
      ? selectedUsers[0]
      : `${selectedUsers.length} users`;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          p: { xs: 2.5, md: 4 },
          bgcolor: "#fafafa",
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: 3,
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.06), 0 12px 24px -12px rgba(15,23,42,0.12)",
        }}
      >
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "flex-start" }}
            spacing={2.5}
            
          >


            <div>
              {showStats && <WonLeadStats users={selectedUsers} dateRange={dateRange} />}
            </div>
          
            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              rowGap={1.5}
              justifySelf={"end"}
              justifyContent="flex-end"
            >


              <ToggleStatsButton 
                showStats={showStats}
                onToggle={() => setShowStats(!showStats)}
              />


              {dateFilter === "custom" && (
                <>


                  <DatePicker
                    label="Start Date"
                    value={dateRange[0]}
                    onChange={(newValue) =>
                      setDateRange([newValue, dateRange[1]])
                    }
                    slotProps={{
                      textField: { size: "small", variant: "outlined" },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={dateRange[1]}
                    onChange={(newValue) =>
                      setDateRange([dateRange[0], newValue])
                    }
                    slotProps={{
                      textField: { size: "small", variant: "outlined" },
                    }}
                  />
                </>
              )}

              <FormControl size="small">
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Filter"
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateFilter(val);
                    if (val !== "custom") {
                      setDateRange(getDateRange(val));
                    } else {
                      setDateRange([null, null]);
                    }
                  }}
                  sx={{ minWidth: 170, bgcolor: "#fff", borderRadius: 2 }}
                >
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="lastYear">Last Year</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="thisQuarter">This Quarter</MenuItem>
                  <MenuItem value="lastQuarter">Last Quarter</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>User Filter</InputLabel>
                <Select
                  multiple
                  value={selectedUsers}
                  label="User Filter"
                  onChange={handleUserChange}
                  renderValue={(selected) =>
                    selected.includes("All") ? (
                      "All Users"
                    ) : (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        rowGap={0.5}
                      >
                        {selected.map((name, i) => (
                          <Chip
                            key={name}
                            size="small"
                            label={name}
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: `${getUserColor(i)}1f`,
                              color: getUserColor(i),
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    )
                  }
                  sx={{ minWidth: 240, bgcolor: "#fff", borderRadius: 2 }}
                >
                  {isAdmin(auth) && (
                    <MenuItem value="All">
                      <Checkbox
                        checked={selectedUsers.includes("All")}
                        size="small"
                      />
                      <ListItemText primary="All Users" />
                    </MenuItem>
                  )}
                  {users.map((u) => (
                    <MenuItem key={u._id || u.name} value={u.name}>
                      <Checkbox
                        checked={selectedUsers.includes(u.name)}
                        size="small"
                      />
                      <ListItemText primary={u.name} />
                      {u?.isTeamLead && (
                        <Chip
                          label="Lead"
                          size="small"
                          sx={{
                            ml: 1,
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: "#DBEAFE",
                            color: "#2563EB",
                          }}
                        />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={clearFilter}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "rgba(15,23,42,0.15)",
                  color: "#334155",
                  bgcolor: "#fff",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                    borderColor: "rgba(15,23,42,0.25)",
                  },
                }}
              >
                Reset
              </Button>
            </Stack>
          </Stack>

         
        </Stack>

        <Divider sx={{ mb: 3, borderColor: "rgba(15,23,42,0.06)" }} />

        <CardContent
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 2,
            border: "1px solid rgba(15,23,42,0.06)",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            p: { xs: 2, sm: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
            sx={{ mb: 3 }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Chip
                  label="Stats"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  {view === "monthly" ? "Monthly" : "Weekly"} ·{" "}
                  {metric === "value" ? "Value" : "Count"}
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.3 }}
              >
                Won Leads{" "}
                <Box
                  component="span"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  – {headerLabel}
                </Box>
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={2}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={metric}
                onChange={(e, val) => val && setMetric(val)}
                sx={toggleGroupSx}
              >
                <ToggleButton value="value">Value</ToggleButton>
                <ToggleButton value="count">Count</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={view}
                onChange={(e, val) => val && setView(val)}
                sx={toggleGroupSx}
              >
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={chartType}
                onChange={(e, val) => val && setChartType(val)}
                sx={toggleGroupSx}
              >
                <ToggleButton value="bar">Bar</ToggleButton>
                <ToggleButton value="line">Line</ToggleButton>
                <ToggleButton value="area">Area</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>

          {hasLoadedOnce ? (
            <Chart
              key={`${chartType}-${metric}-${rawSeries
                .map((s) => s.user)
                .join("|")}`}
              ref={chartRef}
              options={options}
              series={chartSeries}
              type={chartType}
              height={500}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center text-sm text-slate-500 font-medium animate-pulse"
              style={{ height: 500 }}
            >
              Loading chart…
            </div>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
