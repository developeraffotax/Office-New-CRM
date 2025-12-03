import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { DateFilterFn } from "../../../../utlis/DateFilterFn";

export const jobDateColumn = ({ handleUpdateDates, auth }) => {
  return {
    id: "Job_Date",
    accessorKey: "job.workDeadline",

Header: ({ column }) => {
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showPopover, setShowPopover] = useState(false);
  const selectRef = useRef(null);

  // Sync local state with external filter changes
  useEffect(() => {
    const currentFilter = column.getFilterValue();
    if (typeof currentFilter === "object" && currentFilter !== null) {
      setFilterValue("Custom Range");
      setDateRange(currentFilter);
      setShowPopover(true);
    } else {
      setFilterValue(currentFilter || "");
      setDateRange({ from: "", to: "" });
      setShowPopover(false);
    }
  }, [column]);

  // Reset local state when external filter is cleared
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
      // Don't set filter yet, wait for user to select range
    } else {
      setShowPopover(false);
      setDateRange({ from: "", to: "" });
      column.setFilterValue(val); // <-- Apply the filter here
    }
  };

  const handleRangeChange = (key, value) => {
    const newRange = { ...dateRange, [key]: value };
    setDateRange(newRange);
    column.setFilterValue(newRange); // <-- Apply filter when custom range changes
  };

  return (
    <div className="flex flex-col gap-[2px] relative">
      <span
        className="ml-1 cursor-pointer"
        title="Clear Filter"
        onClick={() => {
          setFilterValue("");
          setDateRange({ from: "", to: "" });
          setShowPopover(false);
          column.setFilterValue("");
        }}
      >
        Job Date
      </span>

      <select
        ref={selectRef}
        value={filterValue}
        onChange={handleFilterChange}
        className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
      >
        <option value="">Select</option>
        {column.columnDef.filterSelectOptions.map((option, idx) => (
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
        handleUpdateDates(row.original._id, newDate, "workDeadline");
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

    filterFn: JobDateFilterFn,

    filterSelectOptions: [
      "Expired",
      "Today",
      "Tomorrow",
      "In 7 days",
      "In 15 days",
      "30 Days",
      "60 Days",
      "Upcoming"

      // "Custom date",
    ],
    filterVariant: "select",
    size: 100,
    minSize: 80,
    maxSize: 140,
    grow: false,
  };
};

const JobDateFilterFn = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  const cellDate = new Date(cellValue);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
    const fromDate = new Date(filterValue.from);
    const toDate = new Date(filterValue.to);
    return cellDate >= fromDate && cellDate <= toDate;
  }

  switch (filterValue) {
    

    case "Expired":
      return cellDate < startOfToday;
      case "Upcoming":
      return cellDate > tomorrow;
    case "Today":
      return cellDate.toDateString() === today.toDateString();
    case "Tomorrow":
      
      return cellDate.toDateString() === tomorrow.toDateString();
    case "In 7 days":
      const in7Days = new Date(today);
      in7Days.setDate(today.getDate() + 7);
      return cellDate <= in7Days && cellDate > today;
    case "In 15 days":
      const in15Days = new Date(today);
      in15Days.setDate(today.getDate() + 15);
      return cellDate <= in15Days && cellDate > today;
    case "30 Days":
      const in30Days = new Date(today);
      in30Days.setDate(today.getDate() + 30);
      return cellDate <= in30Days && cellDate > today;
    case "60 Days":
      const in60Days = new Date(today);
      in60Days.setDate(today.getDate() + 60);
      return cellDate <= in60Days && cellDate > today;
    case "Last 12 months":
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      return cellDate >= lastYear && cellDate <= today;
    case "Month Wise":
      return (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() === today.getMonth()
      );
    default:
      return false;
  }
};



























// export const jobDassteColumn = ({handleUpdateDates}) => {

//     return         {
//           id: "Job_Date",
//           accessorKey: "job.workDeadline",
//           Header: ({ column }) => {
//             const [filterValue, setFilterValue] = useState("");
//             const [customDate, setCustomDate] = useState(getCurrentMonthYear());

//             useEffect(() => {
//               if (filterValue === "Custom date") {
//                 column.setFilterValue(customDate);
//               }
//               //eslint-disable-next-line
//             }, [customDate, filterValue]);

//             const handleFilterChange = (e) => {
//               setFilterValue(e.target.value);
//               column.setFilterValue(e.target.value);
//             };

//             const handleCustomDateChange = (e) => {
//               setCustomDate(e.target.value);
//               column.setFilterValue(e.target.value);
//             };
//             return (
//               <div className=" flex flex-col gap-[2px]">
//                 <span
//                   className="ml-1 cursor-pointer"
//                   title="Clear Filter"
//                   onClick={() => {
//                     setFilterValue("");
//                     column.setFilterValue("");
//                   }}
//                 >
//                   Job Date
//                 </span>
//                 {filterValue === "Custom date" ? (
//                   <input
//                     type="month"
//                     value={customDate}
//                     onChange={handleCustomDateChange}
//                     className="h-[1.8rem] font-normal w-full    cursor-pointer rounded-md border border-gray-200 outline-none"
//                   />
//                 ) : (
//                   <select
//                     value={filterValue}
//                     onChange={handleFilterChange}
//                     className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
//                   >
//                     <option value="">Select</option>
//                     {column.columnDef.filterSelectOptions.map((option, idx) => (
//                       <option key={idx} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>
//             );
//           },
//           Cell: ({ cell, row }) => {
//             const [date, setDate] = useState(() => {
//               const cellDate = new Date(cell.getValue());
//               return cellDate.toISOString().split("T")[0];
//             });

//             const [showCurrentDate, setShowCurrentDate] = useState(false);

//             const handleDateChange = (newDate) => {
//               const date = new Date(newDate);
//               // Check if the date is valid
//               if (isNaN(date.getTime())) {
//                 toast.error("Please enter a valid date.");
//                 return;
//               }

//               setDate(newDate);
//               handleUpdateDates(row.original._id, newDate, "workDeadline");
//               setShowCurrentDate(false);
//             };

//             return (
//               <div className="w-full ">
//                 {!showCurrentDate ? (
//                   <p onDoubleClick={() => setShowCurrentDate(true)} className="">
//                     {format(new Date(date), "dd-MMM-yyyy")}
//                   </p>
//                 ) : (
//                   <input
//                     type="date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     onBlur={(e) => handleDateChange(e.target.value)}
//                     className={`h-[2rem] text-[11px] w-full  cursor-pointer text-center rounded-md border border-gray-200 outline-none `}
//                   />
//                 )}
//               </div>
//             );
//           },
//           filterFn: (row, columnId, filterValue) => {
//             const cellValue = row.getValue(columnId);
//             if (!cellValue) return false;

//             const cellDate = new Date(cellValue);
//             const today = new Date();
//             const startOfToday = new Date(
//               today.getFullYear(),
//               today.getMonth(),
//               today.getDate()
//             );

//             switch (filterValue) {
//               case "Expired":
//                 return cellDate < startOfToday;
//               case "Today":
//                 return cellDate.toDateString() === today.toDateString();
//               case "Tomorrow":
//                 const tomorrow = new Date(today);
//                 tomorrow.setDate(today.getDate() + 1);
//                 return cellDate.toDateString() === tomorrow.toDateString();
//               case "In 7 days":
//                 const in7Days = new Date(today);
//                 in7Days.setDate(today.getDate() + 7);
//                 return cellDate <= in7Days && cellDate > today;
//               case "In 15 days":
//                 const in15Days = new Date(today);
//                 in15Days.setDate(today.getDate() + 15);
//                 return cellDate <= in15Days && cellDate > today;
//               case "30 Days":
//                 const in30Days = new Date(today);
//                 in30Days.setDate(today.getDate() + 30);
//                 return cellDate <= in30Days && cellDate > today;
//               case "60 Days":
//                 const in60Days = new Date(today);
//                 in60Days.setDate(today.getDate() + 60);
//                 return cellDate <= in60Days && cellDate > today;
//               case "Last 12 months":
//                 const lastYear = new Date(today);
//                 lastYear.setFullYear(today.getFullYear() - 1);
//                 return cellDate >= lastYear && cellDate <= today;
//               case "Month Wise":
//                 return (
//                   cellDate.getFullYear() === today.getFullYear() &&
//                   cellDate.getMonth() === today.getMonth()
//                 );
//               default:
//                 return false;
//             }
//           },
//           filterSelectOptions: [
//             "Expired",
//             "Today",
//             "Tomorrow",
//             "In 7 days",
//             "In 15 days",
//             "30 Days",
//             "60 Days",

//             "Custom date",
//           ],
//           filterVariant: "select",
//           size: 100,
//           minSize: 80,
//           maxSize: 140,
//           grow: false,
//         }
// }
