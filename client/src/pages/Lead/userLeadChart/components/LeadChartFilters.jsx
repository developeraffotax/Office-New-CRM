import {
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ToggleStatsButton from "../../ui/ToggleStatsButton";
import UserFilterSelect from "../../../../components/KpiDashboard/ui/UserFilterSelect";
import { DATE_FILTER_OPTIONS, QUICK_RANGE_FILTERS } from "../constants";

const datePickerSlotProps = {
  textField: {
    size: "small",
    variant: "outlined",
    sx: {
      width: 132,
      "& .MuiOutlinedInput-root": {
        borderRadius: 1.5,
        bgcolor: "#fff",
        fontSize: 13,
      },
    },
  },
};

const selectSx = {
  bgcolor: "#fff",
  borderRadius: 1.5,
  fontSize: 13,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(15, 23, 42, 0.12)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(15, 23, 42, 0.22)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
};

const resetButtonSx = {
  height: 36,
  minWidth: 36,
  px: 1.25,
  borderRadius: 1.5,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  borderColor: "rgba(15, 23, 42, 0.12)",
  color: "#475569",
  bgcolor: "#fff",
  "&:hover": {
    bgcolor: "#f1f5f9",
    borderColor: "rgba(15, 23, 42, 0.22)",
  },
};

const quickRangeButtonSx = (isActive) => ({
  minWidth: 34,
  width: 34,
  height: 34,
  p: 0,
  fontSize: 11,
  fontWeight: 700,
  borderRadius: 1.25,
  ...(isActive && {
    bgcolor: "primary.main",
    color: "primary.contrastText",
    borderColor: "primary.main",
    "&:hover": {
      bgcolor: "primary.dark",
      borderColor: "primary.dark",
    },
  }),
});

export default function LeadChartFilters({
  showStats,
  onToggleStats,
  dateFilter,
  onDateFilterChange,
  dateRange,
  onDateRangeChange,
  onQuickRangeSelect,
  compare = "none",
  onCompareChange,
  compareOptions = [],
  users,
  teams,
  selectedUsers,
  onUsersChange,
  onReset,
  savedViews,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "rgba(15, 23, 42, 0.08)",
        bgcolor: "#ffffff",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
      >
        {/* ── Date controls ── */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          {dateFilter === "custom" && (
            <>
              <DatePicker
                label="Start"
                value={dateRange[0]}
                onChange={(newValue) =>
                  onDateRangeChange([newValue, dateRange[1]])
                }
                slotProps={datePickerSlotProps}
              />
              <DatePicker
                label="End"
                value={dateRange[1]}
                onChange={(newValue) =>
                  onDateRangeChange([dateRange[0], newValue])
                }
                slotProps={datePickerSlotProps}
              />
            </>
          )}

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Date Filter</InputLabel>
            <Select
              value={dateFilter}
              label="Date Filter"
              onChange={(e) => onDateFilterChange(e.target.value)}
              sx={selectSx}
            >
              {DATE_FILTER_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {compareOptions.length > 0 && (
            <Tooltip
              arrow
              // title="Also include earlier data, in the same unit as your range (e.g. This month + 2 months)"
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Compare with</InputLabel>
                <Select
                  value={compare}
                  label="Compare with"
                  onChange={(e) => onCompareChange?.(e.target.value)}
                  sx={{ bgcolor: "#fff", borderRadius: 1.5 }}
                >
                  <MenuItem value="none">None</MenuItem>
                  {compareOptions.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
          )}

          <ButtonGroup variant="outlined" size="small">
            {QUICK_RANGE_FILTERS.map(({ code, label, filter }) => (
              <Tooltip key={filter} title={label} arrow>
                <Button
                  onClick={() => onQuickRangeSelect(filter)}
                  sx={quickRangeButtonSx(dateFilter === filter)}
                >
                  {code}
                </Button>
              </Tooltip>
            ))}
          </ButtonGroup>
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, borderColor: "rgba(15,23,42,0.1)" }}
        />

        {/* ── Stats toggle + Saved views ── */}
        <Stack direction="row" spacing={1} alignItems="center">
          {savedViews}
        </Stack>

        {/* Spacer pushes User filter to the right */}
        <Stack sx={{ flexGrow: 1 }} />

        <ToggleStatsButton showStats={showStats} onToggle={onToggleStats} />

        {/* ── User filter (right) ── */}
        <FormControl size="small">
          <UserFilterSelect
            users={users}
            teams={teams}
            selected={selectedUsers}
            onChange={onUsersChange}
          />
        </FormControl>

        {/* ── Reset (very left) ── */}
        <Tooltip title="Reset all filters" arrow>
          <Button
            variant="outlined"
            size="small"
            onClick={onReset}
            startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
            sx={{
              color: "#d32f2f",
              borderColor: "#ef9a9a",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 1.5,
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "rgba(211, 47, 47, 0.06)",
              },
            }}
          >
            Reset
          </Button>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
