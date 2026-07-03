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
import dayjs from "dayjs";



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

  handleExportActivity,
  isExporting,

  isUserAdmin,
  hasAllPermission
}) {
  const handlePrevDay = () =>
    setSelectedDate(selectedDate.subtract(1, "day"));
  const handleNextDay = () =>
    setSelectedDate(selectedDate.add(1, "day"));


 

// Add inside Filters component, near the top:
const applyPreset = (preset) => {
  const today = dayjs();

  switch (preset) {
    case "thisMonth":
      setStartDate(today.startOf("month"));
      setEndDate(today.endOf("month"));
      break;
    case "lastMonth": {
      const lastMonth = today.subtract(1, "month");
      setStartDate(lastMonth.startOf("month"));
      setEndDate(lastMonth.endOf("month"));
      break;
    }
    case "lastQuarter": {
      const quarterStart = today.subtract(3, "month").startOf("month");
      setStartDate(quarterStart);
      setEndDate(today.endOf("day"));
      break;
    }
    case "thisYear":
      setStartDate(today.startOf("year"));
      setEndDate(today.endOf("day"));
      break;
    default:
      break;
  }
};


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


                  {/* PRESET QUICK-SELECT BUTTONS */}
    <Box sx={{ display: "flex", gap: 1 }}>
      {[
        { label: "This Month", value: "thisMonth" },
        { label: "Last Month", value: "lastMonth" },
        { label: "Last Quarter", value: "lastQuarter" },
        { label: "This Year", value: "thisYear" },
      ].map((preset) => (
        <Button
          key={preset.value}
          size="small"
          onClick={() => applyPreset(preset.value)}
          sx={{
            textTransform: "none",
            fontSize: 12,
            px: 1.5,
            borderRadius: 2,
            backgroundColor: "#fff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            "&:hover": { backgroundColor: "#f9fafb" },
          }}
        >
          {preset.label}
        </Button>
      ))}
    </Box>

    
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
       <div className="flex gap-2 items-center">

{(isUserAdmin || hasAllPermission) && <button
  onClick={handleExportActivity}
  disabled={isExporting}
  className="group flex items-center justify-center px-4 py-2 bg-white hover:bg-neutral-50 disabled:hover:bg-white text-neutral-700 hover:text-neutral-900 disabled:text-neutral-400 text-sm font-medium rounded-xl border border-neutral-200 hover:border-neutral-300 disabled:border-neutral-200 shadow-sm transition-all duration-200 ease-in-out outline-none disabled:cursor-not-allowed disabled:opacity-70"
>
  {isExporting ? (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ) : (
    <svg
      className="mr-2 text-neutral-400 group-hover:text-neutral-600 transform group-hover:translate-y-0.5 transition-transform duration-200 ease-in-out"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  )}
  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
</button>}
         <h1 className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl shadow font-semibold text-gray-900">

             

          
          <img src="affostaff.png" alt="AffoStaff" className="w-6 h-6" />
          AffoStaff <span className="text-gray-600 font-medium">| Activity Monitoring</span>
        </h1>


       </div>
      </div>
    </LocalizationProvider>
  );
}

