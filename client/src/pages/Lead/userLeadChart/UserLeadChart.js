"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
 
dayjs.extend(quarterOfYear);

const MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ];
const SERIES_COLORS  = ["#008FFB", "#14B8A6", "#c2c1be"];  
 
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

export default function UserLeadChart({auth}) {
  const [chartType, setChartType] = useState("bar");

  const [user, setUser] = useState(() => {
    return isAdmin(auth) ? "all" : auth?.user?.name;
  });
  const [users, setUsers] = useState([]);

  const [dateFilter, setDateFilter] = useState("thisYear");
  const [dateRange, setDateRange] = useState(getDateRange("thisYear"));

  const [series, setSeries] = useState([
    { name: "Lead Count", data: [] },
    { name: "Total Value", data: [] },
  ]);

  const clearFilter = () => {
    setDateFilter("thisYear");
    setDateRange(getDateRange("thisYear"));
    setUser((prev) => (isAdmin(auth) ? "all" : auth?.user?.name));
  };

  const getAllUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`
      );

      
      setUsers((prev) => {
        return data?.users?.filter((user) =>
          user.role?.access?.some((item) => item?.permission.includes("Leads"))
        ) || [];
      })

      
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
            user:  user !== "all" ? user : null,
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
          },
        }
      );

      setSeries([
        { name: "Lead Count", data: data.counts },
        { name: "Value", data: data.values },
        // { name: "Target Value", data: [1500, 2000, 2100, 2200, 2300] },
      ]);
    } catch (err) {
      console.error(err);
    }
  }, [user, dateRange ]);



  


  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const options = useMemo(() => {
    const width = chartType === 'bar' ? 0 : 3; // bar width or line width
    return {
      chart: { toolbar: { show: true }, type: chartType,   },
      stroke: { width: [width, width, width], dashArray: [0, 0, 0],  curve: "smooth" },
      xaxis: {
        categories: MONTHS,
      },
      yaxis: [
        {
          title: { text: "Lead Count" },
          labels: {
            formatter: (val) => val.toFixed(0),
            style: { colors: SERIES_COLORS[0] }, // same color as Count series
          },
          min: 0,
        },
        {
          opposite: true,
          title: { text: "Total Value (£)" },
          labels: {
            formatter: (val) => `£${val.toLocaleString()}`,
            style: { colors: SERIES_COLORS[1] }, // same color as Value series
          },
          min: 0,
        },
      ],

       colors: SERIES_COLORS, // blue=leads, green=actual, red=target
      legend: { position: "top" },
      
       dataLabels: {
          enabled: true, // show numbers
          style: {
            colors: chartType !== 'bar' ? SERIES_COLORS : ["#ffffff", "#ffffff", "#ffffff"], // 👈 set custom color
            fontSize: "12px",
            fontWeight: "bold",
          },
           
          background: {
            enabled: chartType !== 'bar', // remove the default white background box

          },
        },




        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.6,
            gradientToColors: ["#3BAEF5", "#2DD4BF", "#E5E5E5"], // lighter matching end colors
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100],
          },
  },
 
    };
  }, [chartType]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{ py: 4, px: 4, boxShadow: 4, borderRadius: 3, bgcolor: "#f9f9f9" }}
      >
        
        {/* Filters */}
        <Box
          display="flex"
          justifyContent="space-between"
          gap={3}
          flexWrap="wrap"
          mb={2}
          sx={{backgroundColor: "#ffffff", borderRadius: 1, boxShadow: 1, py: 2, px: 4}}
        >
          {/* User Filter */}

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
                {isAdmin(auth) && <MenuItem value="all">All Users</MenuItem>}
                {users.map((user) => (
                  <MenuItem value={user.name}>{user.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>




          <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 0, textAlign: "center" }}
        >
          <div className="text-center  ">
            <h2 className="text-2xl font-bold text-gray-800">
              User Lead Statistics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track won leads, values, and progress over time
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
          </div>
        </Typography>


          <div className="flex gap-5 ">
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
                sx={{ minWidth: 180 }}
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

            {/* Apply Button */}
            <Button
              variant="contained"
              color="info"
              onClick={clearFilter}
              sx={{ ml: "auto", height: 40 }}
            >
              Reset
            </Button>
          </div>
        </Box>

        {/* Chart */}
        <CardContent
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <div className="flex justify-end  mb-2 mr-8 ">
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
          <Chart
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
