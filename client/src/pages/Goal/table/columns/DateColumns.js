import { format } from "date-fns";
import React, { useEffect, useState } from "react";

const getCurrentMonthYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

export const createStartDateColumn = ({ setFormData, handleUpdateData, formData,   }) => ({
  accessorKey: "startDate",
  Header: ({ column }) => {
    const [filterValue, setFilterValue] = useState("");
    const [customDate, setCustomDate] = useState(getCurrentMonthYear());

    useEffect(() => {
      if (filterValue === "Custom date") {
        column.setFilterValue(customDate);
      }
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
      <div className="w-full flex flex-col gap-[2px]">
        <span className="cursor-pointer " title="Clear Filter" onClick={() => {
          setFilterValue("");
          column.setFilterValue("");
        }}>Start Date</span>

        {filterValue === "Custom date" ? (
          <input type="month" value={customDate} onChange={handleCustomDateChange} className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none" />
        ) : (
          <select value={filterValue} onChange={handleFilterChange} className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none">
            <option value="">Select</option>
            {column.columnDef.filterSelectOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        )}
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const startDate = row.original.startDate;
    const [date, setDate] = useState(() => {
      const cellDate = new Date(cell.getValue() || "2024-09-20T12:43:36.002+00:00");
      return cellDate.toISOString().split("T")[0];
    });

    const [showStartDate, setShowStartDate] = useState(false);

    const handleDateChange = (newDate) => {
      setDate(newDate);
      handleUpdateData(row.original._id, { ...formData, startDate: newDate });
      setShowStartDate(false);
    };

    return (
      <div className="w-full flex  ">
        {!showStartDate ? (
          <p onDoubleClick={() => setShowStartDate(true)} className="w-full">
            {startDate ? (
              format(new Date(startDate), "dd-MMM-yyyy")
            ) : (
              <span className="text-white">.</span>
            )}
          </p>
        ) : (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} onBlur={(e) => handleDateChange(e.target.value)} className={`h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none `} />
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
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
  size: 120,
  minSize: 90,
  maxSize: 120,
  grow: false,
});

export const createEndDateColumn = ({ setFormData, handleUpdateData, formData  }) => ({
  accessorKey: "endDate",
  Header: ({ column }) => {
    const [filterValue, setFilterValue] = useState("");
    const [customDate, setCustomDate] = useState(getCurrentMonthYear());

    useEffect(() => {
      if (filterValue === "Custom date") {
        column.setFilterValue(customDate);
      }
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
      <div className="w-full flex flex-col gap-[2px]">
        <span className="cursor-pointer " title="Clear Filter" onClick={() => {
          setFilterValue("");
          column.setFilterValue("");
        }}>End Date</span>

        {filterValue === "Custom date" ? (
          <input type="month" value={customDate} onChange={handleCustomDateChange} className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none" />
        ) : (
          <select value={filterValue} onChange={handleFilterChange} className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none">
            <option value="">Select</option>
            {column.columnDef.filterSelectOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        )}
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const endDate = row.original.endDate;
    const [date, setDate] = useState(() => {
      const cellDate = new Date(cell.getValue() || "2024-09-20T12:43:36.002+00:00");
      return cellDate.toISOString().split("T")[0];
    });

    const [showStartDate, setShowStartDate] = useState(false);

    const handleDateChange = (newDate) => {
      setDate(newDate);
      handleUpdateData(row.original._id, { ...formData, endDate: newDate });
      setShowStartDate(false);
    };

    return (
      <div className="w-full flex  ">
        {!showStartDate ? (
          <p onDoubleClick={() => setShowStartDate(true)} className="w-full">
            {endDate ? (
              format(new Date(endDate), "dd-MMM-yyyy")
            ) : (
              <span className="text-white">.</span>
            )}
          </p>
        ) : (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} onBlur={(e) => handleDateChange(e.target.value)} className={`h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none `} />
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
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
  size: 120,
  minSize: 90,
  maxSize: 120,
  grow: false,
});

export default createStartDateColumn;


