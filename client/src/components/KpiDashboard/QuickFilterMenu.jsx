import { useState } from "react";
import { Button, Menu, MenuItem, ListSubheader } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { getQuickDateRanges } from "./utils/quickDateRanges";

const WEEKLY_LABELS = ["This Week", "Last Week"];
const MONTHLY_LABELS = ["This Month", "Last Month"];
const QUARTERLY_LABELS = ["This Quarter", "Last Quarter"];
const YEARLY_LABELS = ["This Year", "Last Year", "This Financial Year", "Last Financial Year"];

// showWeekly: opt-in, so pages that don't pass it (e.g. the chart dashboard) look exactly as before
export default function QuickFilterMenu({ activeLabel, onSelect, showWeekly = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const allFilters = getQuickDateRanges();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (label) => {
    onSelect(label, allFilters[label]);
    handleClose();
  };

  const renderGroup = (title, labels) => [
    <ListSubheader sx={{ m: 0, borderBottom: 0.5, borderColor: "#d3d3d3" }} key={`${title}-header`}>
      {title}
    </ListSubheader>,
    ...labels.map((label) => (
      <MenuItem key={label} selected={label === activeLabel} onClick={() => handleSelect(label)}>
        {label}
      </MenuItem>
    )),
  ];

  return (
    <>
      <Button variant="outlined" startIcon={<FilterAltIcon />} onClick={handleClick}>
        {activeLabel}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {showWeekly && renderGroup("🗓️ Weekly Filters", WEEKLY_LABELS)}
        {renderGroup("📆 Monthly Filters", MONTHLY_LABELS)}
        {renderGroup("📉 Quarterly Filters", QUARTERLY_LABELS)}
        {renderGroup("📅 Yearly Filters", YEARLY_LABELS)}
      </Menu>
    </>
  );
}