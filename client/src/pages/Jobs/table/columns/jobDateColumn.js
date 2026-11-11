import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { useEffect, useMemo, useRef, useState, memo } from "react";
import toast from "react-hot-toast";
import { hasSubrole, isAdmin } from "../../../../utlis/checkPermission";

const DEFAULT_DATE_FILTERS = [
  "Expired",
  "Today",
  "Tomorrow",
  "In 2 days", // ← NEW
  "In 3 days", // ← NEW
  "In 7 days",
  "In 15 days",
  "In 30 Days",
  "In 60 Days",
  "Upcoming",
];

export const jobDateColumn = ({ handleUpdateDates, auth }) => {
  const canEdit =
    isAdmin(auth?.user) || hasSubrole(auth?.user, "Jobs", "AffotaxDLN");

  return {
    id: "Job_Date",
    header: "Job Date",
    accessorFn: (row) => row.job?.workDeadline || "",
    Header: ({ column }) => <DateHeader column={column} />,

    Cell: (props) => (
      <DateCell
        {...props}
        handleUpdateDates={handleUpdateDates}
        canEdit={canEdit}
      />
    ),

    enableColumnFilter: true,

    size: 100,
    minSize: 80,
    maxSize: 140,
    grow: false,
  };
};

const DateHeader = memo(({ column }) => {
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  const [showPopover, setShowPopover] = useState(false);

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

  useEffect(() => {
    const filter = column.getFilterValue();

    if (!filter) {
      setFilterValue("");
      setDateRange({ from: "", to: "" });
      setShowPopover(false);
      return;
    }

    // ✅ Handle preset
    if (filter.type === "preset") {
      setFilterValue(filter.value);
      setShowPopover(false);
    }

    // ✅ Handle range
    if (filter.type === "range") {
      setFilterValue("Custom Range");

      setDateRange({
        from: filter.from,
        to: filter.to,
      });

      setShowPopover(true);
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
        title="Affotax Deadline"
        onClick={() => {
          setFilterValue("");
          setDateRange({
            from: "",
            to: "",
          });

          column.setFilterValue(undefined);
        }}
      >
        {/* Job Date */}
        AffotaxDLN
      </span>

      <select
        ref={selectRef}
        value={filterValue}
        onChange={handleChange}
        className="h-[1.8rem] w-full rounded-md border border-gray-200 text-sm  font-normal outline-none"
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

const DateCell = memo(({ cell, row, handleUpdateDates, canEdit }) => {
  const initialDate = useMemo(() => {
    const d = new Date(cell.getValue());

    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  }, [cell]);

  const [date, setDate] = useState(initialDate);

  const [editing, setEditing] = useState(false);

  const startEditing = () => {
    if (!canEdit) {
      toast.error("You don't have permission to change this date");
      return;
    }
    setEditing(true);
  };

  const commitChange = (value) => {
    if (!canEdit) {
      setEditing(false);
      return;
    }

    const parsed = new Date(value);

    if (isNaN(parsed)) {
      toast.error("Please enter a valid date");
      return;
    }

    setDate(value);

    handleUpdateDates(row.original._id, value, "workDeadline");

    setEditing(false);
  };

  return (
    <div className="w-full">
      {!editing ? (
        <p
          className={canEdit ? "cursor-pointer" : "cursor-default"}
          onDoubleClick={startEditing}
        >
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
