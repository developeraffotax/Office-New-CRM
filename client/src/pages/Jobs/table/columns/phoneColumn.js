import { useEffect, useRef, useState } from "react";

export const phoneColumn = (ctx) => {
  return {
    id: "phone",
    // accessorKey: "phone",
    accessorFn: (row) => row.phone || "",

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
            Phone
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
      const phone = row.original.phone;

      return (
        <div className="w-full">
          <span>{phone}</span>
        </div>
      );
    },

    minSize: 80,
    maxSize: 150,
    grow: true,
  };
};
