import { useState } from "react";
import toast from "react-hot-toast";
import { FaUserEdit } from "react-icons/fa";
import { HiCheck, HiUserAdd } from "react-icons/hi";

export const emailColumn = (ctx) => {
  return {
    id: "displayEmail",
    accessorKey: "displayEmail",

    Header: ({ column }) => {
      const filterValue = column.getFilterValue() ?? "";

      return (
        <div className="flex flex-col gap-1">
          <span
            className="ml-1 cursor-pointer text-sm font-medium"
            title="Clear Filter"
            onClick={() => column.setFilterValue("")}
          >
            Email
          </span>

          <input
            type="search"
            value={filterValue}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder="Search email..."
            className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
          />
        </div>
      );
    },
Cell: ({ row }) => {
  const { displayEmail: email, clientId } = row.original;
  const isManual = !clientId;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied!")
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div 
      onClick={handleCopy}
      className="flex items-center gap-2 group cursor-pointer w-full transition-all active:scale-95"
    >
      <span className={`text-xs truncate ${copied ? "text-sky-600" : "text-slate-700"}`}>
        {email}
      </span>
      
      {isManual && (
        <span className={`
          flex items-center justify-center w-4 h-4 text-[9px] font-black rounded border transition-colors
          ${copied 
            ? "bg-sky-100 border-sky-200 text-sky-700" 
            : "bg-sky-50 border-sky-200 text-sky-600 group-hover:bg-sky-100"}
        `}>
          {copied ? <HiCheck size={10} /> : "M"}
        </span>
      )}
    </div>
  );
},
    // ✅ Case-insensitive email filter
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
      return cellValue.includes(filterValue.toLowerCase());
    },
    minSize: 140,
    maxSize: 240,
    grow: true,
  };
};
