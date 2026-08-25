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

  // Check if a valid email exists
  const hasEmail = !!email && email.trim() !== "";

  const handleClick = (e) => {
    if (!hasEmail) return;

    // Ctrl+Click (Windows/Linux) or Cmd+Click (Mac) → open in new tab
    if (e.ctrlKey || e.metaKey) {
      const url = `${window.location.origin}/mail?folder=inbox&companyName=affotax&status=progress&page=1&search=${encodeURIComponent(
  email
)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    // Normal click → copy to clipboard
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSearch = getColumnSearchValue(columnFilters, "email", searchValue);

  return (
    <div
      onClick={handleClick}
      className="group w-full relative flex items-center justify-between gap-2 px-1.5 py-1.5 transition-all cursor-pointer active:scale-[0.98]"
    >
      <span
        title={email}
        className={`text-sm flex-1 min-w-0 truncate transition-colors ${
          copied ? "text-orange-600" : "text-slate-600 group-hover:text-slate-900"
        }`}
      >
        {highlightText(email, activeSearch)}
      </span>
    </div>
  );
},

    size: 140,
    minSize: 100,
    maxSize: 400,
    grow: false,
  };
};
