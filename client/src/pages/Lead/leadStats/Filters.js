"use client";

import React, { useState } from "react";
import { LEAD_SOURCES, DEPARTMENTS } from "../constants/dropdownOptions";
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
import { PRESET_FILTERS } from "./hooks/useStatsFilters";

export default function Filters({
  dateRange,
  setDateRange,
  activeLabel,
  lead_Source,
  setLeadSource,
  department,
  setDepartment,
  applyPreset,
  resetFilters,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handlePreset = (label, range) => {
    applyPreset(label, range);
    setAnchorEl(null);
  };

  return (
    <div>
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
              {LEAD_SOURCES.map((el) => (
                <MenuItem key={el} value={el}>{el}</MenuItem>
              ))}
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
              {DEPARTMENTS.map((el) => (
                <MenuItem key={el} value={el}>{el}</MenuItem>
              ))}
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

          {/* Preset Filters */}
          <div>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AiOutlineCalendar />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ textTransform: "none", borderRadius: 1, px: 2 }}
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
              <ListSubheader sx={{ m: 0 }}>⏱️ Recent</ListSubheader>
              {Object.entries(PRESET_FILTERS.recent).map(([label, range]) => (
                <MenuItem key={label} onClick={() => handlePreset(label, range)}>
                  {label}
                </MenuItem>
              ))}

              <ListSubheader sx={{ m: 0 }}>📆 Monthly</ListSubheader>
              {Object.entries(PRESET_FILTERS.monthly).map(([label, range]) => (
                <MenuItem key={label} onClick={() => handlePreset(label, range)}>
                  {label}
                </MenuItem>
              ))}

              <Divider />
              <ListSubheader sx={{ m: 0 }}>📉 Quarterly</ListSubheader>
              {Object.entries(PRESET_FILTERS.quarterly).map(([label, range]) => (
                <MenuItem key={label} onClick={() => handlePreset(label, range)}>
                  {label}
                </MenuItem>
              ))}

              <Divider />
              <ListSubheader sx={{ m: 0 }}>📅 Yearly</ListSubheader>
              {Object.entries(PRESET_FILTERS.yearly).map(([label, range]) => (
                <MenuItem key={label} onClick={() => handlePreset(label, range)}>
                  {label}
                </MenuItem>
              ))}
            </Menu>
          </div>

          {/* Reset */}
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<AiOutlineCloseCircle />}
            onClick={resetFilters}
            sx={{ borderRadius: 1, textTransform: "none", px: 2 }}
          >
            Reset
          </Button>
        </Stack>
      </LocalizationProvider>
    </div>
  );
}
