import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getCurrentMonthYear } from "../../utils/utils";
import toast from "react-hot-toast";

export const createDeadlineColumn = ({  handleUpdateSubscription }) => ({
  accessorKey: "job.deadline",
  header: "Deadline",
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
          Deadline
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
    const deadline = row.original.job.deadline;
    const [date, setDate] = useState(() => {
      const cellDate = new Date(cell.getValue());
      return cellDate.toISOString().split("T")[0];
    });

    const [showDeadline, setShowDeadline] = useState(false);

    const handleDateChange = (newDate) => {
      const dateObj = new Date(newDate);
      if (isNaN(dateObj.getTime())) {
        toast.error("Please enter a valid date.");
        return;
      }
      setDate(newDate);
      handleUpdateSubscription(row.original._id, newDate, "deadline");
      setShowDeadline(false);
    };

    const cellDate = new Date(date);
    const today = new Date();
    const isExpired = cellDate < today;

    return (
      <div className="w-full ">
        {!showDeadline ? (
          <p onDoubleClick={() => setShowDeadline(true)}>
            {deadline && format(new Date(deadline), "dd-MMM-yyyy")}
          </p>
        ) : (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={(e) => handleDateChange(e.target.value)}
            className={`h-[2rem] cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none ${
              isExpired ? "text-red-500" : ""
            }`}
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
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    switch (filterValue) {
      case "Expired":
        return cellDate < startOfToday;
      case "Today":
        return cellDate.toDateString() === today.toDateString();
      case "Tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return cellDate.toDateString() === tomorrow.toDateString();
      }
      case "In 7 days": {
        const in7Days = new Date(today);
        in7Days.setDate(today.getDate() + 7);
        return cellDate <= in7Days && cellDate > today;
      }
      case "In 15 days": {
        const in15Days = new Date(today);
        in15Days.setDate(today.getDate() + 15);
        return cellDate <= in15Days && cellDate > today;
      }
      case "30 Days": {
        const in30Days = new Date(today);
        in30Days.setDate(today.getDate() + 30);
        return cellDate <= in30Days && cellDate > today;
      }
      case "60 Days": {
        const in60Days = new Date(today);
        in60Days.setDate(today.getDate() + 60);
        return cellDate <= in60Days && cellDate > today;
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
    "Expired",
    "Today",
    "Tomorrow",
    "In 7 days",
    "In 15 days",
    "30 Days",
    "60 Days",
    "Custom date",
  ],
  filterVariant: "custom",
  size: 115,
  minSize: 80,
  maxSize: 140,
  grow: false,
});

export default createDeadlineColumn;


