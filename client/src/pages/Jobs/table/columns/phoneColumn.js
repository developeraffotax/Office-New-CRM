import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiCheck, HiOutlineClipboardCopy } from "react-icons/hi";

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
  const [copied, setCopied] = useState(false);
  
  // Check if a valid phone number exists
  const hasPhone = !!phone && phone.trim() !== "";
  
  // Extract only the last 4 digits for display
  const lastFour = hasPhone ? phone.slice(-4) : "";

  const handleCopy = () => {
    // Exit early if there's no phone number to copy
    if (!hasPhone) return;

    // We still copy the FULL phone number to the clipboard
    navigator.clipboard.writeText(phone);
    setCopied(true);
    toast.success("Phone copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      // Changed to w-full & justify-center for centering, reduced padding & gap for compactness
      className={`group relative w-full flex items-center justify-center gap-1.5 px-1 py-1 transition-all ${
        hasPhone ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
      }`}
    >
      <span
        // Removed text-right, added tracking to make the dots/numbers look clean
        className={`text-xs tracking-widest transition-colors ${
          copied 
            ? "text-orange-600 font-medium" 
            : hasPhone 
              ? "text-slate-600 group-hover:text-slate-900" 
              : "text-slate-400 italic tracking-normal" 
        }`}
      >
        {/* Prepended with dots to indicate it's truncated */}
        {hasPhone ? `${lastFour}` : ""}
      </span>

       
    </div>
  );
},

    minSize: 60,
    maxSize: 160,
    size: 60,
    grow: false,
  };
};
