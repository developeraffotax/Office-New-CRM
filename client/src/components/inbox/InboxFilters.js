import * as React from "react";
import dayjs from "dayjs";
import {
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Menu,
  Divider,
  Box,
  Typography,
  Chip,
  Grow,
  IconButton,
  Tooltip,
  ToggleButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FiCalendar, FiFilter, FiX, FiUser, FiChevronDown, FiLayers, FiRefreshCcw } from "react-icons/fi";
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';


export default function InboxFilters({ filters, setFilters, users = [] }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const hasActiveFilters =
    filters.category || filters.userId || filters.unreadOnly || filters.startDate;

  const applyPreset = (days) => {
    const end = dayjs();
    const start = days === 0 ? end.startOf("day") : end.subtract(days, "day");
    setFilters({
      ...filters,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      page: 1,
    });
    setAnchorEl(null);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      userId: "",
      unreadOnly: false,
      startDate: "",
      endDate: "",
      page: 1,
    });
  };

  const handleUpdate = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  };


  // Common styles for a compact, modern look
  const selectStyle = {
    borderRadius: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f1f3f5",
      borderColor: "#dee2e6",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none", // Remove standard MUI border for a cleaner look
    },
    "& .MuiSelect-select": {
      py: 1,
      fontSize: "0.875rem",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
    },
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: hasActiveFilters ? 2 : 0 }}>

          {/* 1. Category Select */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filters.category || ""}
              displayEmpty
              onChange={(e) => handleUpdate({ category: e.target.value })}
              IconComponent={FiChevronDown}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.7 }}>
                      <FiLayers size={14} />
                      <Typography variant="body2">All Categories</Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiLayers size={14} color="#3b82f6" />
                    <Typography variant="body2">{selected.charAt(0).toUpperCase() + selected.slice(1)}</Typography>
                  </Box>
                );
              }}
              sx={selectStyle}
            >
              <MenuItem value="">
                <Typography variant="body2" fontWeight={600}>All Categories</Typography>
              </MenuItem>
              <MenuItem value="support">Support</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          {/* 2. User Select */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filters.userId || ""}
              displayEmpty
              onChange={(e) => handleUpdate({ userId: e.target.value })}
              IconComponent={FiChevronDown}
              renderValue={(selected) => {
                const user = users.find(u => u._id === selected);
                if (!selected) {
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.7 }}>
                      <FiUser size={14} />
                      <Typography variant="body2">Anyone</Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiUser size={14} color="#10b981" />
                    <Typography variant="body2" noWrap>{user?.name || user?.email || 'User'}</Typography>
                  </Box>
                );
              }}
              sx={selectStyle}
            >
              <MenuItem value="">
                <Typography variant="body2" fontWeight={600}>Anyone</Typography>
              </MenuItem>
              {users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  <Typography variant="body2">{u.name || u.email}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Date Picker Trigger */}
          <Button
            variant="outlined"
            size="medium"
            color="inherit"
            startIcon={<FiCalendar size={16} />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: 'rgba(0,0,0,0.23)',
              px: 2,
              height: 40
            }}
          >
            {filters.startDate ? (
              <Typography variant="body2" fontWeight={500}>
                {dayjs(filters.startDate).format("MMM DD")} — {dayjs(filters.endDate).format("MMM DD")}
              </Typography>
            ) : "Date Range"}
          </Button>

          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

          <Tooltip title="Show Unread Only">
            <ToggleButton
              value="unread"
              size="small"
              selected={filters.unreadOnly}
              onChange={() => handleUpdate({ unreadOnly: !filters.unreadOnly })}
              color="primary"
              sx={{ border: 'none', borderRadius: '8px' }}
            >
              <MarkEmailUnreadIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Reset Action */}
          {hasActiveFilters && (
            <Tooltip title="Reset all filters">
              <Button
                size="small"
                color="inherit"
                onClick={clearFilters}
                startIcon={<FiRefreshCcw size={14} />}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1, }, textTransform: 'none', px: 2 }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Stack>

        {/* Applied Filter Chips Row */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Active Filters:
              </Typography>

              {filters.category && (
                <Chip
                  size="small"
                  label={`Category: ${filters.category}`}
                  onDelete={() => handleUpdate({ category: "" })}
                  sx={{ bgcolor: 'action.selected', fontWeight: 500 }}
                />
              )}

              {filters.userId && (
                <Chip
                  size="small"
                  label={`User: ${users.find((u) => u._id === filters.userId)?.name || "User"}`}
                  onDelete={() => handleUpdate({ userId: "" })}
                  sx={{ bgcolor: 'action.selected', fontWeight: 500 }}
                />
              )}

              {filters.startDate && (
                <Chip
                  size="small"
                  icon={<FiCalendar size={12} />}
                  label={`${dayjs(filters.startDate).format("MMM D")} - ${dayjs(filters.endDate).format("MMM D")}`}
                  onDelete={() => handleUpdate({ startDate: "", endDate: "" })}
                  sx={{ bgcolor: 'action.selected', fontWeight: 500 }}
                />
              )}

              {filters.unreadOnly && (
                <Chip
                  size="small"
                  label="Unread"
                  onDelete={() => handleUpdate({ unreadOnly: false })}
                  sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 500 }}
                />
              )}
            </Stack>
          </>
        )}

        {/* Date Selection Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          TransitionComponent={Grow}
          PaperProps={{
            sx: { borderRadius: 3, mt: 1, boxShadow: '0px 10px 25px rgba(0,0,0,0.1)' }
          }}
        >
          <Box sx={{ p: 2, width: 280 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>Quick Ranges</Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {[{ l: 'Today', v: 0 }, { l: '7D', v: 7 }, { l: '30D', v: 30 }].map((range) => (
                <Button
                  key={range.l}
                  variant="outlined"
                  size="small"
                  onClick={() => applyPreset(range.v)}
                  sx={{ borderRadius: 1.5, mb: 1 }}
                >
                  {range.l}
                </Button>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary" fontWeight={700}>Custom Range</Typography>
            <Stack spacing={2} mt={1}>
              <DatePicker
                label="Start Date"
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(val) => handleUpdate({ startDate: val ? val.toISOString() : "" })}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(val) => handleUpdate({ endDate: val ? val.toISOString() : "" })}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Stack>
          </Box>
        </Menu>
      </Paper>
    </LocalizationProvider>
  );
}