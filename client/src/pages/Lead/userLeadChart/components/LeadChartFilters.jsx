import {
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import ToggleStatsButton from "../../ui/ToggleStatsButton"; 
import UserFilterSelect from "../../../../components/KpiDashboard/ui/UserFilterSelect"; // adjust if needed
import { DATE_FILTER_OPTIONS, QUICK_RANGE_FILTERS } from "../constants";

const datePickerSlotProps = {
  textField: { size: "small", variant: "outlined", sx: { width: 130 } },
};

const resetButtonSx = {
  height: 32,
  px: 1.5,
  borderRadius: 1.5,
  textTransform: "none",
  fontWeight: 600,
  borderColor: "rgba(15,23,42,0.12)",
  color: "#475569",
  bgcolor: "#fff",
  "&:hover": {
    bgcolor: "#f1f5f9",
    borderColor: "rgba(15,23,42,0.2)",
  },
};

const quickRangeButtonSx = (isActive) => ({
  minWidth: 32,
  width: 32,
  height: 32,
  p: 0,
  fontSize: 10,
  fontWeight: 700,
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
  users,
  teams,
  selectedUsers,
  onUsersChange,
  onReset,
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      justifyContent="flex-end"
      alignItems="center"
    >
      <ToggleStatsButton showStats={showStats} onToggle={onToggleStats} />

      {dateFilter === "custom" && (
        <>
          <DatePicker
            label="Start"
            value={dateRange[0]}
            onChange={(newValue) => onDateRangeChange([newValue, dateRange[1]])}
            slotProps={datePickerSlotProps}
          />
          <DatePicker
            label="End"
            value={dateRange[1]}
            onChange={(newValue) => onDateRangeChange([dateRange[0], newValue])}
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
          sx={{ bgcolor: "#fff", borderRadius: 1.5 }}
        >
          {DATE_FILTER_OPTIONS.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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

      <FormControl size="small">
        <UserFilterSelect
          users={users}
          teams={teams}
          selected={selectedUsers}
          onChange={onUsersChange}
        />
      </FormControl>

      <Button
        variant="outlined"
        size="small"
        onClick={onReset}
        sx={resetButtonSx}
      >
        Reset
      </Button>
    </Stack>
  );
}