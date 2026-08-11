import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getCurrentMonthYear } from "../../utils/utils";
import toast from "react-hot-toast";

export const createCompletedAtColumn = ({ handleUpdateSubscription }) => ({
  accessorKey: "completedAt",
  header: "Completed At",
  Header: ({ column }) => {
    const [filterValue, setFilterValue] = useState("");
    const [customDate, setCustomDate] = useState(getCurrentMonthYear());

    useEffect(() => {
      if (filterValue === "Custom date") {
        column.setFilterValue(customDate);
      }
      //eslint-disable-next-line
    }, [customDate, filterValue]);

    const handleFilterChange = (e) => {
      setFilterValue(e.target.value);
      column.setFilterValue(e.target.value);
    };

    const handleCustomDateChange = (e) => {
      setCustomDate(e.target.value);
      column.setFilterValue(e.target.value);
    };
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            setFilterValue("");
            column.setFilterValue("");
          }}
        >
          Completed At
        </span>
        {filterValue === "Custom date" ? (
          <input
            type="month"
            value={customDate}
            onChange={handleCustomDateChange}
            className="h-[1.8rem] font-normal w-full   cursor-pointer rounded-md border border-gray-200 outline-none"
          />
        ) : (
          <select
            value={filterValue}
            onChange={handleFilterChange}
            className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {column.columnDef.filterSelectOptions.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },

  Cell: ({ cell, row }) => {
    const completedAt = cell.getValue();

    // Helper to extract YYYY-MM-DD safely for input[type="date"]
    const getValidIsoDate = (val) => {
      if (!val) return "";
      const d = new Date(val);
      return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    };

    const [date, setDate] = useState(() => getValidIsoDate(completedAt));
    const [showEdit, setShowEdit] = useState(false);

    // Sync input state if table cell data updates externally
    useEffect(() => {
      setDate(getValidIsoDate(completedAt));
    }, [completedAt]);

    const handleDateChange = (newDate) => {
      if (!newDate) {
        setShowEdit(false);
        return;
      }

      const dateObj = new Date(newDate);
      if (isNaN(dateObj.getTime())) {
        toast.error("Please enter a valid date.");
        return;
      }

      setDate(newDate);
      handleUpdateSubscription(row?.original?._id, newDate, "completedAt");
      setShowEdit(false);
    };

    // Safely format display text
    const displayFormattedDate = () => {
      if (!completedAt) return "";
      const dateObj = new Date(completedAt);
      return isNaN(dateObj.getTime()) ? "" : format(dateObj, "dd-MMM-yyyy");
    };

    return (
      <div className="w-full">
        {!showEdit ? (
          <p onDoubleClick={() => setShowEdit(true)} className="cursor-pointer">
            {displayFormattedDate()}
          </p>
        ) : (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={(e) => handleDateChange(e.target.value)}
            className="h-[2rem] cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none"
          />
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    if (!cellValue) return false;
    const cellDate = new Date(cellValue);
    if (filterValue.includes("-")) {
      const [year, month] = filterValue.split("-");
      const cellYear = cellDate.getFullYear().toString();
      const cellMonth = (cellDate.getMonth() + 1).toString().padStart(2, "0");
      return year === cellYear && month === cellMonth;
    }
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
    "Custom date",
  ],
  filterVariant: "custom",
  size: 115,
  minSize: 80,
  maxSize: 140,
  grow: false,
});

export default createCompletedAtColumn;
