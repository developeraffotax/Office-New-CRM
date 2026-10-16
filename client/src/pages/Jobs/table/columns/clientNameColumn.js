import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyInfo from "../../../../utlis/CompanyInfo";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";
import toast from "react-hot-toast";

export const clientNameColumn = ({
  getSingleJobDetail,
  setCompanyName,
  searchValue,
  columnFilters,
}) => {
  return {
    id: "clientName",
    accessorKey: "clientName",
    header: "Client",

    // ✅ Stable reference — React will never remount this
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
        <div className="flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer font-semibold"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
              setValue("");
            }}
          >
            Client
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
      const clientName = cell.getValue();
      const companyName = row.original.companyName;
      const [showCompanyInfo, setShowCompanyInfo] = useState(false);
      const anchorRef = useRef(null);

      const activeSearch = getColumnSearchValue(
        columnFilters,
        "clientName",
        searchValue,
      );

      const handleCopy = () => {
        if (!clientName) return;
        navigator.clipboard.writeText(clientName);
        toast.success(
          <div className="flex items-center gap-2 text-sm font-google">
            <span className="font-medium">Copied</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 truncate max-w-[160px]">{clientName}</span>
          </div>
        );
      };

      return (
        <div
          ref={anchorRef}
          className="flex items-center w-full h-full text-[#0078c8] hover:text-[#0053c8]"
        >
          {/* Client name – existing click behavior */}
          <span
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                setShowCompanyInfo(true);
              } else {
                getSingleJobDetail(row.original._id);
                setCompanyName(companyName);
              }
            }}
            className="cursor-pointer shrink-0"
          >
            {highlightText(clientName, activeSearch)}
          </span>

          {/* Empty space = copy area */}
          <span
            onClick={handleCopy}
            className="flex-1 h-full min-w-[20px] cursor-pointer"
            title="Click to copy client name"
          />

          {showCompanyInfo && (
            <CompanyInfo
              anchorRef={anchorRef}
              clientId={row.original._id}
              onClose={() => setShowCompanyInfo(false)}
            />
          )}
        </div>
      );
    },

    size: 120,
    minSize: 80,
    maxSize: 150,
    grow: false,
  };
};