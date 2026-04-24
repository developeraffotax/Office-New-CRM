import { useEffect, useRef, useState } from "react";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";
import toast from "react-hot-toast";
import { HiCheck, HiOutlineClipboardCopy } from "react-icons/hi";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSearch = getColumnSearchValue(columnFilters, "email", searchValue);

  return (
    <div
      onClick={handleCopy}
      className="group relative flex items-center justify-between gap-2 px-2 py-1.5    transition-all cursor-pointer active:scale-[0.98]"
    >
      <span
        className={`text-sm    transition-colors ${
          copied ? "text-orange-600" : "text-slate-600 group-hover:text-slate-900"
        }`}
      >
        {highlightText(email, activeSearch)}
      </span>

      <div className="flex items-center justify-center shrink-0 w-5 h-5">
        {copied ? (
          <div className="flex items-center justify-center w-full h-full bg-orange-100 text-orange-600 rounded-full animate-in zoom-in duration-200">
            <HiCheck size={12} strokeWidth={2} />
          </div>
        ) : (
          <HiOutlineClipboardCopy 
            size={14} 
            className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        )}
      </div>
    </div>
  );
},

    minSize: 100,
    maxSize: 220,
    grow: true,
  };
};
