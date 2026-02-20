"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { isAdmin } from "../../../utlis/isAdmin";
import WonLeadStats from "./WonLeadStats";

dayjs.extend(quarterOfYear);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
//const SERIES_COLORS = ["#008FFB", "#14B8A6", "#F59E0B"];
const SERIES_COLORS = [ "#14B8A6","#008FFB",  "#EF4444", "#F59E0B"];

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
  const initialHideDone = useRef(false);
  const [chartType, setChartType] = useState("bar");

  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);

  const [dateFilter, setDateFilter] = useState("thisYear");
  const [dateRange, setDateRange] = useState(getDateRange("thisYear"));
  const [tableData, setTableData] = useState([]);

  const [view, setView] = useState("monthly");
const [categories, setCategories] = useState([]);


  const [series, setSeries] = useState([
    { name: "Target Count", data: [] },
    { name: "Count", data: [] },

    { name: "Target Value", data: [] },
    { name: "Value", data: [] },
  ]);

  const clearFilter = () => {
    setDateFilter("thisYear");
    setView("monthly");
    setDateRange(getDateRange("thisYear"));
    setUser((prev) => (isAdmin(auth) ? "All" : auth?.user?.name));
  };

  const getAllUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`
      );

      setUsers((prev) => {
        return (
          data?.users?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission.includes("Leads")
            )
          ) || []
        );
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      let [start, end] = dateRange;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/userchart/won`,
        {
          params: {
            user: user !== "All" ? user : null,
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
            view, // 👈 important
          },
        }
      );

      setCategories(data.labels); // 👈 dynamic labels from backend

      setSeries([
        { name: "Target Count", data: data.targetCounts, hidden: true },
        { name: "Count", data: data.counts, hidden: true },
        { name: "Target Value", data: data.targetValues },
        { name: "Value", data: data.values },
      ]);
    } catch (err) {
      console.error(err);
    }
  }, [user, dateRange, view]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const active = active1 || "All";
    setUser((prev) => (isAdmin(auth) ? active : auth?.user?.name));
  }, [active1, auth]);
 

  const options = useMemo(() => {
    const width = chartType === "bar" ? 0 : 3; // bar width or line width
   // Determine width based on data density
  const dataCount = categories.length;
  let dynamicWidth = "50%"; // Default

  if (dataCount === 1) {
    dynamicWidth = "10%"; // Very thin for 1 item
  } else if (dataCount === 2) {
    dynamicWidth = "25%"; // Thin for 2 items
  }
    return {
      chart: { toolbar: { show: true }, type: chartType, },


      // --- FIX FOR WIDE BARS ---
     plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: dynamicWidth, // <--- This acts as your "max width"
        borderRadius: 0,
      },
    },

      stroke: {
        width: [width, width, width, width],
        dashArray: [0, 0, 0, 0],
        curve: "smooth",
      },
      xaxis: {
        categories: categories,
      },
      yaxis: [
        {
          seriesName: "Count",
          title: { text: "Lead Count" },
          labels: {
            formatter: (val) => val.toFixed(0),
            style: { colors: SERIES_COLORS[0] }, // same color as Count series
          },
          min: 0,
        },

        {
          seriesName: "Count",
          show: false,
        },

        {
          seriesName: "Value",
          opposite: true,
          title: { text: "Total Value (£)" },
          labels: {
            formatter: (val) => `£${val.toLocaleString()}`,
            style: { colors: SERIES_COLORS[1] }, // same color as Value series
          },
          min: 0,
        },

        {
          seriesName: "Value",
          show: false,
        },
      ],

      colors: SERIES_COLORS, // blue=leads, green=actual, red=target
      legend: { position: "top",  },

      dataLabels: {
        enabled: true, // show numbers
        style: {
          colors:
            chartType !== "bar"
              ? SERIES_COLORS
              : ["#ffffff", "#ffffff", "#ffffff", "#ffffff"], // 👈 set custom color
          fontSize: "13px",
          fontWeight: "bold",
        },

        background: {
          enabled: chartType !== "bar", // remove the default white background box
        },

        formatter: function (val, opts) {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;

          // Check if this series is currently visible
          const isTargetVisisbleForCount =
            opts.w?.globals?.seriesVisibility?.[0] ?? true;

          // For the "Value" series (index 1)
          if (
            seriesIndex === 1 &&
            chartType !== "bar" &&
            isTargetVisisbleForCount
          ) {
            const targetVal = opts.w.config.series[0].data[dataPointIndex]; // Target Value
            if (targetVal) {
              const percent = ((val / targetVal) * 100).toFixed(1);
              return `${val} (${percent}%)`;
            }
          }

          const isTargetVisisbleForValue =
            opts.w?.globals?.seriesVisibility?.[2] ?? true;
          if (
            seriesIndex === 3 &&
            chartType !== "bar" &&
            isTargetVisisbleForValue
          ) {
            const targetVal = opts.w.config.series[2].data[dataPointIndex]; // Target Value
            if (targetVal) {
              const percent = ((val / targetVal) * 100).toFixed(1);
              return `${val} (${percent}%)`;
            }
          }

          // Default: just show value
          return val;
        },
      },
    };
  }, [chartType, categories]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{ py: 4, px: 4, boxShadow: 4, borderRadius: 3, bgcolor: "#f9f9f9" }}
      >
        <div className="mb-2 w-full  h-[100px]   flex justify-between items-end  gap-5 ">
          {/* Filters */}
           
         

          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
            
           




 

            


            <div className="flex gap-5 w-[75%]  justify-end items-end  h-full px-4 py-2 ">
              {/* Custom Date Pickers */}
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

              {/* Date Filter Dropdown */}
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
                  sx={{ minWidth: 180,   }}
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


                  <div>
              <FormControl size="small">
                <InputLabel>User Filter</InputLabel>
                <Select
                  value={user}
                  label="User Filter"
                  onChange={(e) => {
                    const val = e.target.value;
                    setUser(val);
                  }}
                  sx={{ minWidth: 180 }}
                >
                  {isAdmin(auth) && <MenuItem value="All">All Users</MenuItem>}
                  {users.map((user) => (
                    <MenuItem value={user.name}>{user.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
               </div>


              {/* Apply Button */}
              <Button
                variant="contained"
                color="info"
                onClick={clearFilter}
                sx={{   height: 40 }}
              >
                Reset
              </Button>
            </div>
        

          <WonLeadStats user={user} dateRange={dateRange} />
        </div>

        {/* Chart */}
        <CardContent
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <div className="flex justify-between  px-8 mb-2  ">
<h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
    Stats
  </span>
  <span>
    User Lead Statistics <span className="text-gray-500 font-normal">(Won Leads)</span> – {user}
  </span>
</h2>
            <div>
              <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>
            </div>
          </div>

          

          <Chart
            ref={chartRef}
            options={options}
            series={series}
            type={chartType}
            height={500}
          />
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
