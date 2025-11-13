import React from "react";
import {
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export default function Filters({
  users,
  selectedUser,
  setSelectedUser,
  selectedDate,
  setSelectedDate,
}) {
  const handlePrevDay = () => setSelectedDate(selectedDate.subtract(1, "day"));
  const handleNextDay = () => setSelectedDate(selectedDate.add(1, "day"));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(90deg, #f5f7fa, #e4e9f0)",
           
        }}
      >
        {/* Prev Day */}
        <Button
          onClick={handlePrevDay}
          sx={{
            minWidth: 40,
            minHeight: 40,
            borderRadius: 2,
            backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          <MdArrowBack size={20} />
        </Button>

        {/* Next Day */}
        <Button
          onClick={handleNextDay}
          sx={{
            minWidth: 40,
            minHeight: 40,
            borderRadius: 2,
            backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          <MdArrowForward size={20} />
        </Button>

        {/* Date Picker */}
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

        {/* User Select */}
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
              "&:hover": { backgroundColor: "#f9f9f9" },
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
    </LocalizationProvider>
  );
}
