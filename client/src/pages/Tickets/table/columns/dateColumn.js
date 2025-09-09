import { useEffect, useState } from "react";
import { NumderFilterFn } from "../../../../utlis/NumberFilterPortal";
import { TiFilter } from "react-icons/ti";
import { format } from "date-fns";
import { getCurrentMonthYear } from "../../utils/utils";

export const dateColumn = (ctx) => {




    return             {
            accessorKey: "createdAt",
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
                  <span
                    className="cursor-pointer "
                    title="Clear Filter"
                    onClick={() => {
                      setFilterValue("");
                      column.setFilterValue("");
                    }}
                  >
                    Date
                  </span>
    
                  {filterValue === "Custom date" ? (
                    <input
                      type="month"
                      value={customDate}
                      onChange={handleCustomDateChange}
                      className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                    />
                  ) : (
                    <select
                      value={filterValue}
                      onChange={handleFilterChange}
                      className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                    >
                      <option value="">Select</option>
                      {column.columnDef.filterSelectOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            },
            Cell: ({ cell, row }) => {
              const createdAt = row.original.createdAt;
    
              return (
                <div className="w-full flex  ">
                  <p>{format(new Date(createdAt), "dd-MMM-yyyy")}</p>
                </div>
              );
            },
            filterFn: (row, columnId, filterValue) => {
              const cellValue = row.getValue(columnId);
              if (!cellValue) return false;
    
              const cellDate = new Date(cellValue);
              const today = new Date();
    
              const startOfToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );
    
              // Handle "Custom date" filter
              if (filterValue.includes("-")) {
                const [year, month] = filterValue.split("-");
                const cellYear = cellDate.getFullYear().toString();
                const cellMonth = (cellDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
    
                return year === cellYear && month === cellMonth;
              }
    
              // Other filter cases
              switch (filterValue) {
                case "Expired":
                  return cellDate < startOfToday;
                case "Today":
                  return cellDate.toDateString() === today.toDateString();
                case "Yesterday":
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() - 1);
                  return cellDate.toDateString() === tomorrow.toDateString();
                case "Last 7 days":
                  const last7Days = new Date(today);
                  last7Days.setDate(today.getDate() - 7);
                  return cellDate >= last7Days && cellDate < startOfToday;
                case "Last 15 days":
                  const last15Days = new Date(today);
                  last15Days.setDate(today.getDate() - 15);
                  return cellDate >= last15Days && cellDate < startOfToday;
                case "Last 30 Days":
                  const last30Days = new Date(today);
                  last30Days.setDate(today.getDate() - 30);
                  return cellDate >= last30Days && cellDate < startOfToday;
                case "Last 60 Days":
                  const last60Days = new Date(today);
                  last60Days.setDate(today.getDate() - 60);
                  return cellDate >= last60Days && cellDate < startOfToday;
                default:
                  return false;
              }
            },
            filterSelectOptions: [
              "Today",
              "Yesterday",
              "Last 7 days",
              "Last 15 days",
              "Last 30 Days",
              "Last 60 Days",
              "Custom date",
            ],
            filterVariant: "custom",
            size: 100,
            minSize: 90,
            maxSize: 110,
            grow: false,
          }
}