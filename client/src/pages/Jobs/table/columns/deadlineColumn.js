
import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { useEffect, useMemo, useRef, useState, memo } from "react";
import toast from "react-hot-toast";
import { DEFAULT_DATE_FILTERS } from "../../constants";

import {
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";



export const deadlineColumn = ({ handleUpdateDates }) => ({
  id: "Deadline",
  // accessorKey: "job.jobDeadline",
 
  accessorFn: (row) => row.job?.jobDeadline || "",
 
  Header: ({ column }) => (
    <DateHeader column={column} />
  ),

  Cell: (props) => (
    <DateCell
      {...props}
      handleUpdateDates={handleUpdateDates}
    />
  ),

  // ❌ REMOVE client filterFn
  // filterFn: DateFilterFn,

  enableColumnFilter: true,

  size: 100,
  minSize: 80,
  maxSize: 140,
  grow: false,
});








const DateHeader = memo(({ column }) => {
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  const [showPopover, setShowPopover] =
    useState(false);

  const selectRef = useRef(null);

  // ✅ Send filter to MRT (SERVER SIDE)
  useEffect(() => {
    if (filterValue === "Custom Range") {
      if (dateRange.from && dateRange.to) {
        column.setFilterValue({
          type: "range",
          from: dateRange.from,
          to: dateRange.to,
        });
      }
    } else if (filterValue) {
      column.setFilterValue({
        type: "preset",
        value: filterValue,
      });
    } else {
      column.setFilterValue(undefined);
    }
  }, [filterValue, dateRange]);

  // Reset when cleared externally
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

    setShowPopover(
      val === "Custom Range"
    );
  };

  return (
    <div className="flex flex-col gap-[2px] relative">
      <span
        className="ml-1 cursor-pointer"
        title="Clear Filter"
        onClick={() => {
          setFilterValue("");
          setDateRange({
            from: "",
            to: "",
          });

          column.setFilterValue(undefined);
        }}
      >
        Deadline
      </span>

      <select
        ref={selectRef}
        value={filterValue}
        onChange={handleChange}
        className="h-[1.8rem] w-full rounded-md border border-gray-200 text-sm font-normal outline-none"
      >
        <option value="">
          Select
        </option>

        {DEFAULT_DATE_FILTERS.map(
          (opt) => (
            <option
              key={opt}
              value={opt}
            >
              {opt}
            </option>
          )
        )}

        <option value="Custom Range">
          Custom Date
        </option>
      </select>

      {showPopover && (
        <DateRangePopover
          anchorRef={selectRef}
          value={dateRange}
          onChange={(key, val) =>
            setDateRange((p) => ({
              ...p,
              [key]: val,
            }))
          }
          onClose={() =>
            setShowPopover(false)
          }
        />
      )}
    </div>
  );
});





const DateCell = memo(
  ({ cell, row, handleUpdateDates }) => {
    const initialDate = useMemo(() => {
      const d = new Date(
        cell.getValue()
      );

      return isNaN(d)
        ? ""
        : d.toISOString().split("T")[0];
    }, [cell]);

    const [date, setDate] =
      useState(initialDate);

    const [editing, setEditing] =
      useState(false);

    const commitChange = (value) => {
      const parsed = new Date(value);

      if (isNaN(parsed)) {
        toast.error(
          "Please enter a valid date"
        );
        return;
      }

      setDate(value);

      handleUpdateDates(
        row.original._id,
        value,
        "jobDeadline"
      );

      setEditing(false);
    };

    return (
      <div className="w-full">
        {!editing ? (
          <p
            className="cursor-pointer"
            onDoubleClick={() =>
              setEditing(true)
            }
          >
            {date
              ? format(
                  new Date(date),
                  "dd-MMM-yyyy"
                )
              : "-"}
          </p>
        ) : (
          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            onBlur={(e) =>
              commitChange(
                e.target.value
              )
            }
            className="h-[2rem] w-full text-xs text-center rounded-md border"
          />
        )}
      </div>
    );
  }
);




















export const deadlineInColumn = () => ({
  id: "deadlineIn",

  header: "Deadline In",

  accessorFn: (row) => {
    const deadline =
      row.job?.jobDeadline;

    if (!deadline) return null;

    return differenceInCalendarDays(
      startOfDay(new Date(deadline)),
      startOfDay(new Date())
    );
  },

  Cell: ({ cell }) => {
    const days = cell.getValue();

    if (days === null) {
      return (
        <span className="text-gray-400">
          -
        </span>
      );
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
          days > 0
            ? "bg-green-100 text-green-700"
            : days === 0
            ? "bg-orange-100 text-orange-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {days > 0
          ? `${days}d left`
          : days === 0
          ? "Today"
          : `${Math.abs(days)}d overdue`}
      </span>
    );
  },

  size: 120,
  minSize: 110,
  maxSize: 140,
  grow: false,
});