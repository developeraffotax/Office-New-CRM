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
import {
  FiCalendar,
  FiFilter,
  FiX,
  FiUser,
  FiChevronDown,
  FiLayers,
  FiRefreshCcw,
} from "react-icons/fi";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import ManageCategoriesModal from "../categories/ManageCategoriesModal";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { alpha } from "@mui/material/styles";
import { useSelector } from "react-redux";

export default function Filters({
  filters,
  setFilters,
  users = [],
  categories = [],
}) {
  const [isCategoryModal, setIsCategoryModal] = React.useState(false);

  const {
    auth: { user },
  } = useSelector((state) => state.auth);

  const isAdmin = user?.role?.name === "Admin";



  const [searchInput, setSearchInput] = React.useState("");

const prevSearchRef = React.useRef("");

React.useEffect(() => {
  const trimmed = searchInput.trim();

  // ⛔ Ignore whitespace-only typing
  if (!trimmed && !prevSearchRef.current) return;

  const timer = setTimeout(() => {
    // ⛔ No change → no setFilters
    if (trimmed === prevSearchRef.current) return;

    setFilters((prev) => ({
      ...prev,
      search: trimmed,
      page: 1,
    }));

    prevSearchRef.current = trimmed;
  }, 500);

  return () => clearTimeout(timer);
}, [searchInput, setFilters]);


  const [anchorEl, setAnchorEl] = React.useState(null);

  const hasActiveFilters =
    filters.category ||
    filters.userId ||
    filters.unreadOnly ||
    filters.startDate;

  const applyPreset = (days) => {
    const now = dayjs();
    let start;
    let end;

    if (days === 0) {
      // Today
      start = now.startOf("day");
      end = now;
    } else if (days === -1) {
      // Yesterday
      start = now.subtract(1, "day").startOf("day");
      end = now.subtract(1, "day").endOf("day");
    } else {
      // Last N days
      start = now.subtract(days, "day").startOf("day");
      end = now;
    }

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
      // label: "",
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
           
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: hasActiveFilters ? 2 : 0 }}
        >
          <Tooltip title="Manage Categories">
            <IconButton
              onClick={() => setIsCategoryModal(true)}
              size="small"
              sx={{
                borderRadius: "8px",
                bgcolor: isCategoryModal ? "primary.50" : "transparent",
                color: isCategoryModal ? "primary.main" : "grey.600",
                "&:hover": {
                  bgcolor: "primary.100",
                },
              }}
            >
              <LabelOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        opacity: 0.7,
                      }}
                    >
                      <FiLayers size={14} />
                      <Typography variant="body2">All</Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiLayers size={14} color="#3b82f6" />
                    <Typography variant="body2">
                      {selected.charAt(0).toUpperCase() + selected.slice(1)}
                    </Typography>
                  </Box>
                );
              }}
              sx={selectStyle}
            >
              <MenuItem value="">
                <Typography variant="body2" fontWeight={600}>
                  All
                </Typography>
              </MenuItem>
              <MenuItem sx={{
                borderBottom: 1,
                borderColor: "#ddd"
              }} value={"unassigned"}> Unassigned </MenuItem>

              {categories.map(({ name }) => {
                return (
                  <MenuItem value={name}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </MenuItem>
                );
              })}
              
            </Select>
          </FormControl>

          {/* 2. User Select */}
         {
          isAdmin && (
             <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filters.userId || ""}
              displayEmpty
              onChange={(e) => handleUpdate({ userId: e.target.value })}
              IconComponent={FiChevronDown}
              renderValue={(selected) => {
                const user = users.find((u) => u._id === selected);
                console.log("SELECTED", selected)
                if (!selected) {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        opacity: 0.7,
                      }}
                    >
                      <FiUser size={14} />
                      <Typography variant="body2">All</Typography>
                    </Box>
                  );
                }
                if (selected === "unassigned") {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        opacity: 0.7,
                      }}
                    >
                      <FiUser size={14} />
                      <Typography variant="body2">Unassigned</Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiUser size={14} color="#10b981" />
                    <Typography variant="body2" noWrap>
                      {user?.name || user?.email || "User"}
                    </Typography>
                  </Box>
                );
              }}
              sx={selectStyle}
            >
              <MenuItem value="">
                <Typography variant="body2" fontWeight={600}>
                  All
                </Typography>
              </MenuItem>
              <MenuItem sx={{
                borderBottom: 1,
                borderColor: "#ddd"
              }} value={"unassigned"}> Unassigned </MenuItem>
              {users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  <Typography variant="body2">{u.name || u.email}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          )
         }

          {/* Date Picker Trigger */}
          <Button
            variant="outlined"
            size="medium"
            color="inherit"
            startIcon={<FiCalendar size={16} />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "rgba(0,0,0,0.23)",
              px: 2,
              height: 40,
            }}
          >
            {filters.startDate ? (
              <Typography variant="body2" fontWeight={500}>
                {dayjs(filters.startDate).format("MMM DD")} —{" "}
                {dayjs(filters.endDate).format("MMM DD")}
              </Typography>
            ) : (
              "Date Range"
            )}
          </Button>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 24, alignSelf: "center" }}
          />

          <Tooltip title="Show Unread Only">
            <ToggleButton
              value="unread"
              size="small"
              selected={filters.unreadOnly}
              onChange={() => handleUpdate({ unreadOnly: !filters.unreadOnly })}
              color="primary"
              sx={{ border: "none", borderRadius: "8px" }}
            >
              <MarkEmailUnreadIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>

<FormControl size="small" sx={{ minWidth: 300 }}>
  <Box sx={{ position: "relative" }}>
    <input
      type="text"
      placeholder="Search subject, email…"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      style={{
        height: 40,
        width: "100%",
        padding: "0 40px 0 12px", // space for ❌
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        outline: "none",
        fontSize: "0.875rem",
      }}
    />

    {/* Clear Button */}
    {searchInput.trim() && (
      <IconButton
        size="small"
        onClick={() => {
          setSearchInput("");
          // setFilters((prev) => ({
          //   ...prev,
          //   search: "",
          //   page: 1,
          // }));
        }}
        sx={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          color: "grey.500",
          "&:hover": { color: "grey.700" },
        }}
      >
        <FiX size={14} />
      </IconButton>
    )}
  </Box>
</FormControl>

          {/* Spacer */}
          {/* <Box sx={{ flexGrow: 1 }} /> */}

          {/* Reset Action */}
          {hasActiveFilters && (
            <Tooltip title="Reset all filters">
              <Button
                size="small"
                color="inherit"
                onClick={clearFilters}
                startIcon={<FiRefreshCcw size={14} />}
                sx={{
                  opacity: 0.8,
                  "&:hover": { opacity: 1 },
                  textTransform: "none",
                    color: "#1151D1",
                  px: 2,
                }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Stack>

        {/* Applied Filter Chips Row */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mr: 1,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Active Filters:
              </Typography>

              {filters.category && (
                <Chip
                  size="small"
                  label={`Category: ${filters.category}`}
                  onDelete={() => handleUpdate({ category: "" })}
                  sx={{ bgcolor: "action.selected", fontWeight: 500 }}
                />
              )}

             {filters.userId && (
              <Chip
                size="small"
                label={`User: ${
                  filters.userId === "unassigned"
                    ? "unassigned"
                    : users.find((u) => u._id === filters.userId)?.name || "User"
                }`}
                onDelete={() => handleUpdate({ userId: "" })}
                sx={{ bgcolor: "action.selected", fontWeight: 500 }}
              />
            )}

              {filters.startDate && (
                <Chip
                  size="small"
                  icon={<FiCalendar size={12} />}
                  label={`${dayjs(filters.startDate).format("MMM D")} - ${dayjs(
                    filters.endDate,
                  ).format("MMM D")}`}
                  onDelete={() => handleUpdate({ startDate: "", endDate: "" })}
                  sx={{ bgcolor: "action.selected", fontWeight: 500 }}
                />
              )}

              {filters.unreadOnly && (
                <Chip
                  size="small"
                  label="Unread"
                  onDelete={() => handleUpdate({ unreadOnly: false })}
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    fontWeight: 500,
                  }}
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
          // Remove standard background to allow for BackdropFilter
          PaperProps={{
            sx: {
              borderRadius: 4, // More rounded for a modern feel
              mt: 1.5,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: "none", // Removes MUI default elevation overlay
              overflow: "visible",
              "&:before": {
                // Optional: Speech bubble arrow
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                left: 24,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderLeft: "1px solid",
                borderTop: "1px solid",
                borderColor: "divider",
              },
            },
          }}
        >
          <Box sx={{ p: 2.5, width: 300 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mb: 1.5,
                ml: 0.5,
              }}
            >
              Quick Ranges
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
              }}
            >
              {[
                { l: "Today", v: 0 },
                { l: "Yesterday", v: -1 },
                { l: "3D", v: 3 },
                { l: "7D", v: 7 },
              ].map((range) => (
                <Button
                  key={range.l}
                  fullWidth
                  size="small"
                  onClick={() => applyPreset(range.v)}
                  sx={{
                    borderRadius: 2,
                    py: 0.8,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    border: "1px solid transparent",
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.15),
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {range.l}
                </Button>
              ))}
            </Box>

            <Divider sx={{ my: 2.5, opacity: 0.6 }} />

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mb: 1.5,
                ml: 0.5,
              }}
            >
              Custom Range
            </Typography>

            <Stack spacing={2}>
              <DatePicker
                label="Start Date"
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(val) =>
                  handleUpdate({ startDate: val ? val.toISOString() : "" })
                }
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    },
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(val) =>
                  handleUpdate({ endDate: val ? val.toISOString() : "" })
                }
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    },
                  },
                }}
              />
            </Stack>
          </Box>
        </Menu>
      </Paper>

      {
        <ManageCategoriesModal
          open={isCategoryModal}
          onClose={() => setIsCategoryModal(false)}
        />
      }
    </LocalizationProvider>
  );
}
