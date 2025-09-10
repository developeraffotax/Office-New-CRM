import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import DateRangePopover from "../../../../utlis/DateRangePopover";
import { DateFilterFn } from "../../../../utlis/DateFilterFn";

export const signupDateColumn = ({handleUpdateDates,}) => {


    return  {
                id: "SignUp_Date",
                accessorKey: "currentDate",


              Header: ({ column }) => {
                const [filterValue, setFilterValue] = useState("");
                const [dateRange, setDateRange] = useState({ from: "", to: "" });
                const [showPopover, setShowPopover] = useState(false);
                const selectRef = useRef(null);

                const filterValues = [
                    "Today",
                    "Yesterday",
                    "Last 7 days",
                    "Last 15 days",
                    "Last 30 Days",
                    "Last 12 months",
                    "This Month",
                    "Last Month",
                    "This Year",
                    "Last Year",
                  ];

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
                      <option  value="Custom Range">Custom Date</option>
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
                          className="h-[2rem] w-full cursor-pointer text-center rounded-md border border-gray-200 outline-none"
                        />
                      )}
                    </div>
                  );
                },
               
                



                filterFn: DateFilterFn,



                // filterSelectOptions: [
                //   "Today",
                //   "Yesterday",
                //   "Last 7 days",
                //   "Last 15 days",
                //   "Last 30 Days",
                //   "Last 12 months",
                   
                // ],
                // filterVariant: "select",
                size: 115,
                minSize: 80,
                maxSize: 140,
                grow: false,
              }
}