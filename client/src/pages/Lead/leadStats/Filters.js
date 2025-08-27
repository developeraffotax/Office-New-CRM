"use client";

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Divider,
  ListSubheader,
  Stack,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AiOutlineCalendar, AiOutlineCloseCircle } from "react-icons/ai";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);


  const leadSources = [
    "Upwork",
    "Fiverr",
    "PPH",
    "Referral",
    "Partner",
    "Google",
    "Facebook",
    "LinkedIn",
    "CRM",
    "Existing",
    "Other",
  ];

    const departments = [
    "Bookkeeping",
    "Payroll",
    "VAT Return",
    "Accounts",
    "Personal Tax",
    "Company Sec",
    "Address",
    "Billing",
  ];


export default function Filters({
  dateRange,
  setDateRange,
 lead_Source ,
             setLeadSource ,
             department ,
             setDepartment
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeLabel, setActiveLabel] = useState("Last 30 Days");

  const open = Boolean(anchorEl);

  const getQuarterRange = () => {
    const now = dayjs();
    return [now.startOf("quarter"), now.endOf("quarter")];
  };

  const getLastQuarterRange = () => {
    const now = dayjs().subtract(1, "quarter");
    return [now.startOf("quarter"), now.endOf("quarter")];
  };

  // Add this inside your Filters component
const recentFilters = {
  "Last 7 Days": [dayjs().subtract(7, "day"), dayjs()],
  "Last 15 Days": [dayjs().subtract(15, "day"), dayjs()],
  "Last 30 Days": [dayjs().subtract(30, "day"), dayjs()],
};

  const monthlyFilters = {
    "This Month": [dayjs().startOf("month"), dayjs().endOf("month")],
    "Last Month": [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  };

  const quarterlyFilters = {
    "This Quarter": getQuarterRange(),
    "Last Quarter": getLastQuarterRange(),
  };

  const yearlyFilters = {
    "This Year": [dayjs().startOf("year"), dayjs().endOf("year")],
    "Last Year": [
      dayjs().subtract(1, "year").startOf("year"),
      dayjs().subtract(1, "year").endOf("year"),
    ],
    "This Financial Year": [
      dayjs().subtract(1, "year").startOf("month"),
      dayjs().endOf("month"),
    ],
    "Last Financial Year": [
      dayjs().subtract(2, "year").startOf("month"),
      dayjs().subtract(1, "year").endOf("month"),
    ],
  };

  const handlePreset = (label, range) => {
    setDateRange(range);
    setActiveLabel(label);
    setAnchorEl(null);
  };

  const clearFilters = () => {
    setDateRange(recentFilters["Last 30 Days"]);
    setActiveLabel("Last 30 Days");

    setDepartment("");
    setLeadSource("")
     
  };

  return (
    <div className="   ">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={1.5} alignItems="center">


          
          {/* Lead Source Select */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Lead Source</InputLabel>
            <Select
              value={lead_Source}
              label="Lead Source"
              onChange={(e) => setLeadSource(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {
                leadSources.map(el => <MenuItem  key={el} value={el}>{el}</MenuItem>)
              }
            </Select>
          </FormControl>

          {/* Department Select */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              label="Department"
              onChange={(e) => setDepartment(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {
                departments.map(el => <MenuItem key={el} value={el}>{el}</MenuItem>)
              }
              
            </Select>
          </FormControl>








          {/* Date Range Pickers */}
          <DatePicker
            label="Start Date"
            value={dateRange[0]}
            onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
            slotProps={{ textField: { size: "small", variant: "outlined" } }}
          />
          <DatePicker
            label="End Date"
            value={dateRange[1]}
            onChange={(newValue) => setDateRange([dateRange[0], newValue])}
            slotProps={{ textField: { size: "small", variant: "outlined" } }}
          />

          
          {/* Status Filter */}
          {/* <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              MenuProps={{
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
                transformOrigin: { vertical: "top", horizontal: "left" },
                PaperProps: {
                  sx: {
                    mt: 0.5, // little gap
                  },
                },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="progress">Progress</MenuItem>
              <MenuItem value="won">Won</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
            </Select>
          </FormControl> */}









          {/* Preset Filters */}
          <div>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AiOutlineCalendar />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                textTransform: "none",
                borderRadius: 1,
                px: 2,
              }}
            >
              {activeLabel}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >

                 <ListSubheader sx={{ m: 0 }}>⏱️ Recent Filters</ListSubheader>
  {Object.entries(recentFilters).map(([label, range]) => (
    <MenuItem key={label} onClick={() => handlePreset(label, range)}>
      {label}
    </MenuItem>
  ))}



              <ListSubheader sx={{ m: 0 }}>📆 Monthly Filters</ListSubheader>
              {Object.entries(monthlyFilters).map(([label, range]) => (
                <MenuItem
                  key={label}
                  onClick={() => handlePreset(label, range)}
                >
                  {label}
                </MenuItem>
              ))}

              <Divider />
              <ListSubheader sx={{ m: 0 }}>📉 Quarterly Filters</ListSubheader>
              {Object.entries(quarterlyFilters).map(([label, range]) => (
                <MenuItem
                  key={label}
                  onClick={() => handlePreset(label, range)}
                >
                  {label}
                </MenuItem>
              ))}

              <Divider />
              <ListSubheader sx={{ m: 0 }}>📅 Yearly Filters</ListSubheader>
              {Object.entries(yearlyFilters).map(([label, range]) => (
                <MenuItem
                  key={label}
                  onClick={() => handlePreset(label, range)}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<AiOutlineCloseCircle />}
            onClick={clearFilters}
            sx={{ borderRadius: 1, textTransform: "none", px: 2 }}
          >
            Reset
          </Button>
        </Stack>
      </LocalizationProvider>
    </div>
  );
}
