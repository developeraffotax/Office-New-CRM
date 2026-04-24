import { Link } from "react-router-dom";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";
import { useEffect, useRef, useState } from "react";

export const companyNameColumn = ({ columnFilters, searchValue }) => {
  return {
    id: "companyName",
    accessorKey: "companyName",
    minSize: 150,
    maxSize: 300,
    size: 200,
    grow: false,

    Header: ({ column }) => {
      const [value, setValue] = useState(column.getFilterValue() ?? "");
      const debounceRef = useRef(null);

      const handleChange = (e) => {
        const val = e.target.value;
        setValue(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
          column.setFilterValue(val);
        }, 300);
      };

        // ✅ Sync when filter is cleared externally
      useEffect(() => {
        const filterValue = column.getFilterValue() ?? "";

        setValue(filterValue);
      }, [column.getFilterValue()]);

  

      // Cleanup debounce on unmount
      useEffect(() => {
        return () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
        };
      }, []);

      return (
        <div className="flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            onClick={() => {
              column.setFilterValue("");
              setValue("");
            }}
          >
            Company Name
          </span>

          <input
            type="search"
            value={value}
            onChange={handleChange}
            className="font-normal h-[1.8rem] px-2 bg-white rounded-md border border-gray-300 outline-none"
          />
        </div>
      );
    },

    Cell: ({ cell, row }) => {
      const companyName = row.original.companyName;
      const regNo = row.original.regNumber || "";

      const activeSearch = getColumnSearchValue(
        columnFilters,
        "companyName",
        searchValue,
      );

      return (
        <Link
          to={
            regNo
              ? `https://find-and-update.company-information.service.gov.uk/company/${regNo}`
              : "#"
          }
          target="_black"
          className={`cursor-pointer flex items-center justify-start ${
            regNo && "text-[#0078c8] hover:text-[#0053c8]"
          }   w-full h-full`}
        >
          {highlightText(companyName, activeSearch)}
        </Link>
      );
    },
  };
};
