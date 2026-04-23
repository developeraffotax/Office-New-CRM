import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { useMemo, useRef, useState, memo, useEffect } from "react";
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
  "Upcoming",
];

export const taskDateColumn = (ctx) => ({
  accessorKey: "taskDate",

  Header: ({ column }) => (
    <StartDateHeader column={column} ctx={ctx} />
  ),

  Cell: (props) => (
    <StartDateCell {...props} ctx={ctx} />
  ),

  size: 100,
  minSize: 90,
  maxSize: 110,
  grow: false,
});

/* =========================
   HEADER (FULLY CONTROLLED)
========================= */

const StartDateHeader = memo(({ ctx }) => {
  const selectRef = useRef(null);

  const { columnFilters, setColumnFilters } = ctx;

  /* ---------------------------------------
     Local UI state
  --------------------------------------- */

  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [showPopover, setShowPopover] =
    useState(false);

  /* ---------------------------------------
     Find current filter
  --------------------------------------- */

  const taskDateFilter = useMemo(() => {
    return columnFilters?.find(
      (f) => f.id === "taskDate"
    )?.value;
  }, [columnFilters]);

  /* ---------------------------------------
     SINGLE SYNC EFFECT
     (handles external filters)
  --------------------------------------- */

  useEffect(() => {
    if (!taskDateFilter) {
      setFilterValue("");
      setDateRange({
        from: "",
        to: "",
      });
      setShowPopover(false);
      return;
    }

    if (taskDateFilter.type === "preset") {
      setFilterValue(
        taskDateFilter.value
      );
      setShowPopover(false);
    }

    if (taskDateFilter.type === "range") {
      setFilterValue("Custom Range");

      setDateRange({
        from: taskDateFilter.from,
        to: taskDateFilter.to,
      });

      setShowPopover(true);
    }
  }, [taskDateFilter]);

  /* ---------------------------------------
     Update Filter (CONTROLLED)
  --------------------------------------- */

  const updateFilter = (newValue) => {
    setColumnFilters((prev) => {
      const others = prev.filter(
        (f) => f.id !== "taskDate"
      );

      if (!newValue) return others;

      return [
        ...others,
        {
          id: "taskDate",
          value: newValue,
        },
      ];
    });
  };

  /* ---------------------------------------
     Handlers
  --------------------------------------- */

  const handleChange = (e) => {
    const val = e.target.value;

    setFilterValue(val);

    if (val === "Custom Range") {
      setShowPopover(true);
      return;
    }

    setShowPopover(false);

    if (!val) {
      updateFilter(undefined);
      return;
    }

    updateFilter({
      type: "preset",
      value: val,
    });
  };

  const handleRangeChange = (
    key,
    val
  ) => {
    setDateRange((prev) => {
      const updated = {
        ...prev,
        [key]: val,
      };

      if (
        updated.from &&
        updated.to
      ) {
        updateFilter({
          type: "range",
          from: updated.from,
          to: updated.to,
        });
      }

      return updated;
    });
  };

  const handleClear = () => {
    updateFilter(undefined);
  };

  /* ---------------------------------------
     UI
  --------------------------------------- */

  return (
    <div className="flex flex-col gap-[2px] relative">
      <span
        className="ml-1 cursor-pointer"
        title="Clear Filter"
        onClick={handleClear}
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

        {START_DATE_FILTERS.map(
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
          onChange={handleRangeChange}
          onClose={() =>
            setShowPopover(false)
          }
        />
      )}
    </div>
  );
});

/* =========================
   CELL (UNCHANGED)
========================= */

const StartDateCell = memo(
  ({ cell, row, ctx }) => {
    const initialDate =
      useMemo(() => {
        const d = new Date(
          cell.getValue()
        );

        return isNaN(d)
          ? ""
          : d
              .toISOString()
              .split("T")[0];
      }, [cell]);

    const [date, setDate] =
      useState(initialDate);

    const [editing, setEditing] =
      useState(false);

    const commitChange = (
      value
    ) => {
      const parsed =
        new Date(value);

      if (isNaN(parsed)) {
        toast.error(
          "Please enter a valid date"
        );
        return;
      }

      setDate(value);

      ctx.updateAlocateTask(
        row.original._id,
        "",
        "",
        "",
        value
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
              setDate(
                e.target.value
              )
            }
            onBlur={(e) =>
              commitChange(
                e.target.value
              )
            }
            className="h-[2rem] w-full text-center rounded-md border outline-none"
          />
        )}
      </div>
    );
  }
);