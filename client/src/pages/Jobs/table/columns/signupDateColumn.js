 




import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { useEffect, useMemo, useRef, useState, memo } from "react";
import toast from "react-hot-toast";
 


const dateFilters = [ "Today", "Yesterday", "Last 7 days", "Last 15 days", "Last 30 Days", "Last 12 months", "This Month", "Last Month", "This Year", "Last Year" ];


export const signupDateColumn = ({ handleUpdateDates }) => ({
  id: "SignUp_Date",
 
  accessorFn: (row) => row?.currentDate || "",
 

  Header: ({ column }) => (
    <DateHeader column={column} />
  ),

  Cell: (props) => (
    <DateCell
      {...props}
      handleUpdateDates={handleUpdateDates}
    />
  ),

 
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
        Signup Date
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

        {dateFilters.map(
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
        "currentDate"
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


































export const signupDateColumn2 = ({ handleUpdateDates }) => {
  return {
    

    Header: ({ column }) => {
      const [filterValue, setFilterValue] = useState("");
      const [dateRange, setDateRange] = useState({ from: "", to: "" });
      const [showPopover, setShowPopover] = useState(false);
      const selectRef = useRef(null);

      const filterValues = 

      useEffect(() => {
        if (filterValue === "Custom Range") {
          column.setFilterValue(dateRange);
        } else {
          column.setFilterValue(filterValue);
        }
      }, [dateRange, filterValue]);

      // 🔄 Reset local state when external filter is cleared
      useEffect(() => {
        const currentFilter = column.getFilterValue();
        if (!currentFilter) {
          setFilterValue("");
          setDateRange({ from: "", to: "" });
          setShowPopover(false);
        }
      }, [column.getFilterValue()]);

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
            SignUp Date
          </span>

          <select
            ref={selectRef}
            value={filterValue}
            onChange={handleFilterChange}
            className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {filterValues.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
            <option value="Custom Range">Custom Date</option>
          </select>

          {showPopover && (
            <DateRangePopover
              anchorRef={selectRef}
              value={dateRange}
              onChange={handleRangeChange}
              onClose={() => setShowPopover(false)}
            />
          )}
        </div>
      );
    },

    Cell: ({ cell, row }) => {
      const [date, setDate] = useState(() => {
        const cellDate = new Date(cell.getValue());
        return cellDate.toISOString().split("T")[0];
      });

      const [showInput, setShowInput] = useState(false);

      const handleDateChange = (newDate) => {
        const parsedDate = new Date(newDate);
        if (isNaN(parsedDate.getTime())) {
          toast.error("Please enter a valid date.");
          return;
        }
        setDate(newDate);
        handleUpdateDates(row.original._id, newDate, "currentDate");
        setShowInput(false);
      };

      return (
        <div className="w-full">
          {!showInput ? (
            <p onDoubleClick={() => setShowInput(true)}>
              {format(new Date(date), "dd-MMM-yyyy")}
            </p>
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={(e) => handleDateChange(e.target.value)}
              className="h-[2rem] text-[11px] w-full cursor-pointer text-center rounded-md border border-gray-200 outline-none"
            />
          )}
        </div>
      );
    },

 
    size: 100,
    minSize: 80,
    maxSize: 140,
    grow: false,
  };
};
