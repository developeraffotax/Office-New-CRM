import { format } from "date-fns";

import DateRangePopover from "../../../../utlis/DateRangePopover";

import { useEffect, useMemo, useRef, useState, memo } from "react";
import toast from "react-hot-toast";

export const DEFAULT_DATE_FILTERS = [
  "Expired",
  "Today",
  "Tomorrow",
  "In 7 days",
  "In 15 days",
  "30 Days",
  "60 Days",
  "Upcoming",
];

const normalizeDate = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const yearEndColumn = ({ handleUpdateDates }) => ({
  id: "Year_End",
  accessorKey: "job.yearEnd",

  Header: ({ column }) => <DateHeader column={column} />,

  Cell: (props) => (
    <DateCell {...props} handleUpdateDates={handleUpdateDates} />
  ),

  filterFn: DateFilterFn,
  filterVariant: "select",
  filterSelectOptions: DEFAULT_DATE_FILTERS,

  size: 100,
  minSize: 80,
  maxSize: 140,
  grow: false,
});

const DateHeader = memo(({ column }) => {
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showPopover, setShowPopover] = useState(false);
  const selectRef = useRef(null);

  // Sync MRT filter
  useEffect(() => {
    column.setFilterValue(
      filterValue === "Custom Range" ? dateRange : filterValue || undefined,
    );
  }, [filterValue, dateRange, ]);

  // Reset when external clear happens
  useEffect(() => {
    if (!column.getFilterValue()) {
      setFilterValue("");
      setDateRange({ from: "", to: "" });
      setShowPopover(false);
    }
  }, [column.getFilterValue()]);

  const handleChange = (e) => {
    const val = e.target.value;
    setFilterValue(val);
    setShowPopover(val === "Custom Range");
  };

  return (
    <div className="flex flex-col gap-[2px] relative">
      <span
        className="ml-1 cursor-pointer"
        title="Clear Filter"
        onClick={() => {
          setFilterValue("");
          setDateRange({ from: "", to: "" });
          column.setFilterValue(undefined);
        }}
      >
        Year End
      </span>

      <select
        ref={selectRef}
        value={filterValue}
        onChange={handleChange}
        className="h-[1.8rem] w-full rounded-md border border-gray-200 text-sm font-normal"
      >
        <option value="">Select</option>
        {DEFAULT_DATE_FILTERS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="Custom Range">Custom Date</option>
      </select>

      {showPopover && (
        <DateRangePopover
          anchorRef={selectRef}
          value={dateRange}
          onChange={(key, val) => setDateRange((p) => ({ ...p, [key]: val }))}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
});

const DateCell = memo(({ cell, row, handleUpdateDates }) => {
  const initialDate = useMemo(() => {
    const d = new Date(cell.getValue());
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  }, [cell]);

  const [date, setDate] = useState(initialDate);
  const [editing, setEditing] = useState(false);

  const commitChange = (value) => {
    const parsed = new Date(value);
    if (isNaN(parsed)) {
      toast.error("Please enter a valid date");
      return;
    }
    setDate(value);
    handleUpdateDates(row.original._id, value, "yearEnd");
    setEditing(false);
  };

  return (
    <div className="w-full">
      {!editing ? (
        <p className="cursor-pointer" onDoubleClick={() => setEditing(true)}>
          {date ? format(new Date(date), "dd-MMM-yyyy") : "-"}
        </p>
      ) : (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={(e) => commitChange(e.target.value)}
          className="h-[2rem] w-full text-xs text-center rounded-md border"
        />
      )}
    </div>
  );
});

export const DateFilterFn = (row, columnId, filterValue) => {
  const raw = row.getValue(columnId);
  if (!raw) return false;

  const cellDate = normalizeDate(new Date(raw));
  const today = normalizeDate(new Date());

  if (typeof filterValue === "object") {
    const from = new Date(filterValue.from);
    const to = new Date(filterValue.to);
    return cellDate >= from && cellDate <= to;
  }

  const rangeCheck = (days) => {
    const future = new Date(today);
    future.setDate(today.getDate() + days);
    return cellDate > today && cellDate <= future;
  };

  switch (filterValue) {
    case "Expired":
      return cellDate < today;
    case "Today":
      return cellDate.getTime() === today.getTime();
    case "Tomorrow": {
      const t = new Date(today);
      t.setDate(today.getDate() + 1);
      return cellDate.getTime() === t.getTime();
    }
    case "Upcoming":
      return cellDate > today;
    case "In 7 days":
      return rangeCheck(7);
    case "In 15 days":
      return rangeCheck(15);
    case "30 Days":
      return rangeCheck(30);
    case "60 Days":
      return rangeCheck(60);
    default:
      return false;
  }
};
