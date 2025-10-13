import { useEffect, useState } from "react";
import { DateFilterFn, getCurrentMonthYear, TaskDateFilterFn } from "../../utils";
import toast from "react-hot-toast";
import { format } from "date-fns";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { useRef } from "react";

export const taskDateColumn = (ctx) => {
  return {
    id: "taskDate",
    accessorKey: "taskDate",

    Header: ({ column }) => {
      const [filterValue, setFilterValue] = useState(() => {


        return ctx.auth.user?.role?.name === "Admin" ? "Today" : ""
      });
      const [dateRange, setDateRange] = useState({ from: "", to: "" });
      const [showPopover, setShowPopover] = useState(false);
      const selectRef = useRef(null);

      const filterValues = [
        "Expired",
        "Yesterday",
        "Today",
        "Tomorrow",
        "In 7 days",
        "In 15 days",
        "In 30 Days",
        "In 60 Days",
        
      ];

      useEffect(() => {
        if (filterValue === "Custom Range" || filterValue === "Custom Day") {
          column.setFilterValue(dateRange);
        } else {
          column.setFilterValue(filterValue);
        }
      }, [dateRange, filterValue]);
 

      const handleFilterChange = (e) => {
        const val = e.target.value;
        setFilterValue(val);

        if (val === "Custom Range" || val === "Custom Day") {
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
            Task Date
          </span>

          <select
            ref={selectRef}
             value={column.getFilterValue() || ""}
            onChange={handleFilterChange}
            className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {filterValues.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
            <option value="Custom Day">Custom Day</option>
            <option value="Custom Range">Custom Date</option>
          </select>

          {showPopover && (
            <DateRangePopover
              anchorRef={selectRef}
              type={filterValue === "Custom Day" ? "day" : "range"}
              onChange={handleRangeChange}
              onClose={() => setShowPopover(false)}
            />
          )}
        </div>
      );
    },

    Cell: ({ cell, row }) => {
  const initialValue = cell.getValue();
  const isValidDate = initialValue && !isNaN(new Date(initialValue).getTime());

  const [date, setDate] = useState(() => {
    if (!isValidDate) return ""; // no valid date
    return new Date(initialValue).toISOString().split("T")[0];
  });

  const [showInput, setShowInput] = useState(false);

  const handleDateChange = (newDate) => {
    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      toast.error("Please enter a valid date.");
      return;
    }
    setDate(newDate);
    
    ctx.updateAlocateTask(row.original._id, "", "", "", newDate);
    setShowInput(false);
  };

  return (
    <div className="w-full">
      {!showInput ? (
        <p onDoubleClick={() => setShowInput(true)}>
          {date ? format(new Date(date), "dd-MMM-yyyy") : "-"}
        </p>
      ) : (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={(e) => handleDateChange(e.target.value)}
          className="h-[2rem] w-full cursor-pointer text-center rounded-md border border-gray-200 outline-none"
        />
      )}
    </div>
  );
},


    filterFn:  TaskDateFilterFn,

    size: 100,
    minSize: 80,
    maxSize: 140,
    grow: false,
  };
};




















export const taskDateColumnCompleted = (ctx) => {
  return {
    id: "taskDate",
    accessorKey: "taskDate",

    Header: ({ column }) => {
      const [filterValue, setFilterValue] = useState("");
      const [dateRange, setDateRange] = useState({ from: "", to: "" });
      const [showPopover, setShowPopover] = useState(false);
      const selectRef = useRef(null);

      const filterValues = [
        "Expired",
        "Today",
        "Tomorrow",
        "In 7 days",
        "In 15 days",
        "In 30 Days",
        "In 60 Days",
        
      ];

      useEffect(() => {
        if (filterValue === "Custom Range") {
          column.setFilterValue(dateRange);
        } else {
          column.setFilterValue(filterValue);
        }
      }, [dateRange, filterValue]);

      // 🔄 Reset local state when external filter is cleared
      // useEffect(() => {
      //   const currentFilter = column.getFilterValue();
      //   if (!currentFilter) {
      //      setFilterValue("");
      //     setDateRange({ from: "", to: "" });
      //     setShowPopover(false);
      //   }
      // }, [column.getFilterValue()]);

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
            Task Date
          </span>

          <select
            ref={selectRef}
             value={column.getFilterValue() || ""}
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
  const initialValue = cell.getValue();
  const isValidDate = initialValue && !isNaN(new Date(initialValue).getTime());

  const [date, setDate] = useState(() => {
    if (!isValidDate) return ""; // no valid date
    return new Date(initialValue).toISOString().split("T")[0];
  });

  const [showInput, setShowInput] = useState(false);

  const handleDateChange = (newDate) => {
    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      toast.error("Please enter a valid date.");
      return;
    }
    setDate(newDate);
    // handleUpdateDates(row.original._id, newDate, "taskDate");
    ctx.updateAlocateTask(row.original._id, "", "", "", newDate);
    setShowInput(false);
  };

  return (
    <div className="w-full">
      {!showInput ? (
        <p onDoubleClick={() => setShowInput(true)}>
          {date ? format(new Date(date), "dd-MMM-yyyy") : "-"}
        </p>
      ) : (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={(e) => handleDateChange(e.target.value)}
          className="h-[2rem] w-full cursor-pointer text-center rounded-md border border-gray-200 outline-none"
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
              const cellMonth = (cellDate.getMonth() + 1)
                .toString()
                .padStart(2, "0");
    
              return year === cellYear && month === cellMonth;
            }
    
            // Other filter cases
            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
    
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
    
            switch (filterValue) {
              case "Expired":
                return cellDate < startOfToday;
    
              case "Yesterday":
                const Yesterday = new Date(today);
                Yesterday.setDate(today.getDate() - 1);
                return cellDate.toDateString() === Yesterday.toDateString();
    
              case "Today":
                return cellDate.toDateString() === today.toDateString();
              case "Tomorrow":
                return cellDate.toDateString() === tomorrow.toDateString();
              case "In 7 days":
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
    
                return cellDate <= in7Days && cellDate > tomorrow;
              case "In 15 days":
                const in15Days = new Date(today);
                in15Days.setDate(today.getDate() + 15);
                return cellDate <= in15Days && cellDate > tomorrow;
              case "30 Days":
                const in30Days = new Date(today);
                in30Days.setDate(today.getDate() + 30);
                return cellDate <= in30Days && cellDate > tomorrow;
              case "60 Days":
                const in60Days = new Date(today);
                in60Days.setDate(today.getDate() + 60);
                return cellDate <= in60Days && cellDate > tomorrow;
              case "Last 12 months":
                const lastYear = new Date(today);
                lastYear.setFullYear(today.getFullYear() - 1);
                return cellDate >= lastYear && cellDate <= tomorrow;
              default:
                return false;
            }
          },

    size: 100,
    minSize: 80,
    maxSize: 140,
    grow: false,
  };
};
