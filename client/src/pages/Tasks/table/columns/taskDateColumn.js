




import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { useEffect, useMemo, useRef, useState, memo } from "react";
import toast from "react-hot-toast";

const START_DATE_FILTERS = [
  "Expired",
  "Yesterday",
  "Today",
  "Tomorrow",
  "In 7 days",
  "In 15 days",
  "In 30 Days",
  "In 60 Days",
];

export const taskDateColumn = (ctx) => ({
  accessorKey: "taskDate",

  Header: ({ column }) => <StartDateHeader column={column} />,

  Cell: (props) => <StartDateCell {...props} ctx={ctx} />,

  size: 100,
  minSize: 90,
  maxSize: 110,
  grow: false,
});

/* ---------------- HEADER ---------------- */

const StartDateHeader = memo(({ column }) => {
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showPopover, setShowPopover] = useState(false);

  const selectRef = useRef(null);

  // ✅ Push filter to MRT (server-side format)
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
        Task Date
      </span>

      <select
        ref={selectRef}
        value={filterValue}
        onChange={handleChange}
        className="h-[1.8rem] w-full rounded-md border border-gray-200 font-normal outline-none"
      >
        <option value="">Select</option>

        {START_DATE_FILTERS.map((opt) => (
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
          onChange={(key, val) =>
            setDateRange((p) => ({
              ...p,
              [key]: val,
            }))
          }
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
});

/* ---------------- CELL ---------------- */

const StartDateCell = memo(({ cell, row, ctx }) => {
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

    ctx.updateAlocateTask(row.original._id, "", "","" ,value);

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
          className="h-[2rem] w-full text-center rounded-md border outline-none"
        />
      )}
    </div>
  );
});



 

 