// createWonAtColumn.js
import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";

// Make sure to import your DateRangePopover component here
// import DateRangePopover from "path/to/DateRangePopover";

export const createWonAtColumn = () => ({
  accessorKey: "wonAt",
  header: "Won At",
  Header: ({ column }) => {
    const [filterValue, setFilterValue] = useState("");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [showPopover, setShowPopover] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      if (filterValue === "Custom Range") {
        column.setFilterValue(dateRange);
      } else {
        column.setFilterValue(filterValue);
      }
      //eslint-disable-next-line
    }, [dateRange, filterValue]);

    const handleFilterChange = (e) => {
      const val = e.target.value;
      setFilterValue(val);
      if (val === "Custom Range") {
        setShowPopover(true);
      } else {
        setShowPopover(false);
      }
    };

    const handleRangeChange = (key, value) => {
      setDateRange((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <div className="flex flex-col gap-[2px] relative">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            setFilterValue("");
            setDateRange({ from: "", to: "" });
            column.setFilterValue("");
          }}
        >
          Won At
        </span>

        <select
          ref={selectRef}
          value={filterValue}
          onChange={handleFilterChange}
          className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {column.columnDef.filterSelectOptions.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
          <option value="Custom Range">Custom Date</option>
        </select>

        {showPopover && (
          <DateRangePopover
            anchorRef={selectRef}
            onChange={handleRangeChange}
            onClose={() => setShowPopover(false)}
          />
        )}
      </div>
    );
  },
  Cell: ({ cell }) => {
    const wonAt = cell.getValue();

    return (
      <div className="w-full">
        <p className="px-1">
          {wonAt ? format(new Date(wonAt), "dd-MMM-yyyy") : "-"}
        </p>
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    if (!cellValue) return false;
    const cellDate = new Date(cellValue);

    // Handle Custom Date Range
    if (typeof filterValue === "object" && filterValue !== null) {
      if (filterValue.from && filterValue.to) {
        const fromDate = new Date(filterValue.from);
        const toDate = new Date(filterValue.to);
        // Set toDate to the end of the day to ensure inclusive filtering
        toDate.setHours(23, 59, 59, 999);
        return cellDate >= fromDate && cellDate <= toDate;
      }
      return true; // If custom range is selected but dates aren't picked yet, show all
    }

    // Handle standard dropdown options
    const today = new Date();
    switch (filterValue) {
      case "Today":
        return cellDate.toDateString() === today.toDateString();
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return cellDate.toDateString() === yesterday.toDateString();
      }
      case "Last 7 days": {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return cellDate >= sevenDaysAgo && cellDate <= today;
      }
      case "Last 15 days": {
        const fifteenDaysAgo = new Date(today);
        fifteenDaysAgo.setDate(today.getDate() - 15);
        return cellDate >= fifteenDaysAgo && cellDate <= today;
      }
      case "Last 30 days": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return cellDate >= thirtyDaysAgo && cellDate <= today;
      }
      case "Last 60 days": {
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(today.getDate() - 60);
        return cellDate >= sixtyDaysAgo && cellDate <= today;
      }
      case "Last 12 months": {
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        return cellDate >= lastYear && cellDate <= today;
      }
      default:
        return false;
    }
  },
  filterSelectOptions: [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 15 days",
    "Last 30 days",
    "Last 60 days",
    "Last 12 months",
  ],
  filterVariant: "custom",
  size: 115,
  minSize: 80,
  maxSize: 140,
  grow: false,
});

export default createWonAtColumn;