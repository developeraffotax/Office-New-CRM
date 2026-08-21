import { useState } from "react";
import { Button, Menu, MenuItem, ListSubheader } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

const getQuarterRange = () => {
  const now = dayjs();
  return [now.startOf("quarter"), now.endOf("quarter")];
};

const getLastQuarterRange = () => {
  const now = dayjs().subtract(1, "quarter");
  return [now.startOf("quarter"), now.endOf("quarter")];
};

const monthlyFilters = {
  "This Month": [dayjs().startOf("month"), dayjs().endOf("month")],
  "Last Month": [
    dayjs().subtract(1, "month").startOf("month"),
    dayjs().subtract(1, "month").endOf("month"),
  ],
};

const quarterlyFilters = {
  "This Quarter": getQuarterRange(),
  "Last Quarter": getLastQuarterRange(),
};

const yearlyFilters = {
  "This Year": [dayjs().startOf("year"), dayjs().endOf("year")],
  "Last Year": [
    dayjs().subtract(1, "year").startOf("year"),
    dayjs().subtract(1, "year").endOf("year"),
  ],
  "This Financial Year": [
    dayjs().subtract(1, "year").startOf("month"),
    dayjs().endOf("month"),
  ],
  "Last Financial Year": [
    dayjs().subtract(2, "year").startOf("month"),
    dayjs().subtract(1, "year").endOf("month"),
  ],
};

const allFilters = { ...monthlyFilters, ...quarterlyFilters, ...yearlyFilters };

export default function QuickFilterMenu({ activeLabel, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (label) => {
    onSelect(label, allFilters[label]);
    handleClose();
  };

  const renderGroup = (title, filters) => [
    <ListSubheader sx={{ m: 0, borderBottom: 0.5, borderColor: "#d3d3d3" }} key={`${title}-header`}>
      {title}
    </ListSubheader>,
    ...Object.keys(filters).map((label) => (
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
        {renderGroup("📆 Monthly Filters", monthlyFilters)}
        {renderGroup("📉 Quarterly Filters", quarterlyFilters)}
        {/* {renderGroup("📅 Yearly Filters", yearlyFilters)} */}
      </Menu>
    </>
  );
}