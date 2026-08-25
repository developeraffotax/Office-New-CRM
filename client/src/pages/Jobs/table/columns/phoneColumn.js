import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiCheck, HiOutlineClipboardCopy } from "react-icons/hi";

// Strips leading '+' and any spaces so numbers match the format
// the /whatsapp search expects, e.g. "+44 7525 068962" -> "447525068962"
const cleanPhoneNumber = (phone) => phone.replace(/[+\s]/g, "");

export const phoneColumn = (ctx) => {
  return {
    id: "phone",
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

      const hasPhone = !!phone && phone.trim() !== "";
      const lastFour = hasPhone ? phone.slice(-4) : "";

      const handleClick = (e) => {
        if (!hasPhone) return;

        if (e.ctrlKey || e.metaKey) {
          const url = `${window.location.origin}/whatsapp?companyName=affotax&page=1&search=${encodeURIComponent(
            cleanPhoneNumber(phone)
          )}`;
          window.open(url, "_blank", "noopener,noreferrer");
          return;
        }

        navigator.clipboard.writeText(phone);
        setCopied(true);
        toast.success("Phone copied!");
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div
          onClick={handleClick}
          className={`group relative w-full flex items-center justify-center gap-1.5 px-1 py-1 transition-all ${
            hasPhone ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
          }`}
        >
          <span
            className={`text-xs tracking-widest transition-colors ${
              copied
                ? "text-orange-600 font-medium"
                : hasPhone
                  ? "text-slate-600 group-hover:text-slate-900"
                  : "text-slate-400 italic tracking-normal"
            }`}
          >
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