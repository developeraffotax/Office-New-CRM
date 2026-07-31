import { useState } from "react";
import { Button, Popover, Stack, Typography, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

/**
 * MUI's community package only ships a single-value DatePicker — the
 * range picker is a Pro (paid) component. This reproduces antd's
 * RangePicker with two DatePickers in a popover instead.
 *
 * Requires: npm install @mui/x-date-pickers
 * (dayjs is already a dependency of this project, so AdapterDayjs is
 * used — wrap the app/dashboard once in <LocalizationProvider>, see
 * DashboardComponent.jsx)
 */
export default function ManualRangePicker({ value, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [draftStart, setDraftStart] = useState(value ? value[0] : null);
  const [draftEnd, setDraftEnd] = useState(value ? value[1] : null);

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setDraftStart(value ? value[0] : null);
    setDraftEnd(value ? value[1] : null);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleApply = () => {
    if (draftStart && draftEnd) {
      onChange([draftStart, draftEnd]);
    }
    handleClose();
  };

  const label = value
    ? `${value[0].format("DD MMM YYYY")} - ${value[1].format("DD MMM YYYY")}`
    : "Select date range";

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarMonthIcon />}
        onClick={handleOpen}
        sx={{ minWidth: 260, justifyContent: "flex-start" }}
      >
        {label}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Stack spacing={2} sx={{ p: 2, minWidth: 240 }}>
          <Typography variant="subtitle2">Custom range</Typography>
          <DatePicker
            label="Start date"
            value={draftStart}
            onChange={(newValue) => setDraftStart(newValue)}
            maxDate={draftEnd || undefined}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="End date"
            value={draftEnd}
            onChange={(newValue) => setDraftEnd(newValue)}
            minDate={draftStart || undefined}
            slotProps={{ textField: { size: "small" } }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button size="small" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              disabled={!draftStart || !draftEnd}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
