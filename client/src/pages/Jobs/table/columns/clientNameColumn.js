import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyInfo from "../../../../utlis/CompanyInfo";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";

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
            placeholder="Search client..."
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

      return (
        <div
          ref={anchorRef}
          className="flex items-center justify-start text-[#0078c8] hover:text-[#0053c8] w-full h-full"
        >
          <span
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                setShowCompanyInfo(true);
              } else {
                getSingleJobDetail(row.original._id);
                setCompanyName(companyName);
              }
            }}
            className="cursor-pointer"
          >
            {highlightText(clientName, activeSearch)}
          </span>

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
