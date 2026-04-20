import { useEffect, useRef, useState } from "react";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";

export const emailColumn = ({ columnFilters, searchValue }) => {
  return {
    id: "email",
    accessorFn: (row) => row.email || "",
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

      // Cleanup debounce on unmount
      useEffect(() => {
        return () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
        };
      }, []);

      return (
        <div className="flex flex-col gap-1">
          <span
            className="ml-1 cursor-pointer text-sm font-medium"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
              setValue("");
            }}
          >
            Email
          </span>

          <input
            type="search"
            value={value}
            onChange={handleChange}
            
            className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
          />
        </div>
      );
    },

    Cell: ({ row }) => {
      const email = row.original.email;

      const activeSearch = getColumnSearchValue(
        columnFilters,
        "email",
        searchValue,
      );
      return (
        <div className="w-full">
          <span> {highlightText(email, activeSearch)}</span>
        </div>
      );
    },

    minSize: 100,
    maxSize: 220,
    grow: true,
  };
};
