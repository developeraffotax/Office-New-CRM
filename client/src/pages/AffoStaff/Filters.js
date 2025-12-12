import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export default function Filters({
  users,
  selectedUser,
  setSelectedUser,
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  const handlePrevDay = () =>
    setSelectedDate(selectedDate.subtract(1, "day"));
  const handleNextDay = () =>
    setSelectedDate(selectedDate.add(1, "day"));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex justify-between items-center p-8 bg-gradient-to-r from-gray-50 to-slate-200 shadow">

        {/* LEFT SECTION */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          
          {/* Filter Mode Dropdown */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              label="Filter"
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <MenuItem value="day">Single Day</MenuItem>
              <MenuItem value="range">Date Range</MenuItem>
            </Select>
          </FormControl>

          {/* Day Navigation Buttons Only for Single-Day */}
          {filterType === "day" && (
            <>
              <Button
                onClick={handlePrevDay}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <MdArrowBack size={20} />
              </Button>

              <Button
                onClick={handleNextDay}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <MdArrowForward size={20} />
              </Button>
            </>
          )}

          {/* SINGLE DATE PICKER */}
          {filterType === "day" && (
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 130,
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    },
                  },
                },
              }}
            />
          )}

          {/* RANGE PICKERS */}
          {filterType === "range" && (
            <>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(v) => setStartDate(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: 140,
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      },
                    },
                  },
                }}
              />

              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(v) => setEndDate(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: 140,
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      },
                    },
                  },
                }}
              />
            </>
          )}

          {/* USER SELECT */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedUser}
              label="User"
              onChange={(e) => setSelectedUser(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.fullName || user.name || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* RIGHT SIDE */}
        <h1 className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl shadow font-semibold text-gray-900">
          <img src="affostaff.png" alt="AffoStaff" className="w-6 h-6" />
          AffoStaff <span className="text-gray-600 font-medium">| Activity Monitoring</span>
        </h1>
      </div>
    </LocalizationProvider>
  );
}
