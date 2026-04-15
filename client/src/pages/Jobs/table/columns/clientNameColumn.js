import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyInfo from "../../../../utlis/CompanyInfo";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";

/**
 * Client Name Column (Server-Side + Debounced Filtering)
 */
export const clientNameColumn = ({
  getSingleJobDetail,
  setCompanyName,
  searchValue,
  columnFilters
 
}) => {
  return {
    id: "clientName",
    accessorKey: "clientName",
    header: "Client",

    // ======================================================
    // HEADER (SERVER-SIDE + DEBOUNCE)
    // ======================================================
    Header: ({ column }) => {
      const [value, setValue] = useState(column.getFilterValue() || "");
      const debounceRef = useRef(null);

      useEffect(() => {
        setValue(column.getFilterValue() || "");
      }, [column]);

      const handleChange = (e) => {
        const val = e.target.value;

        setValue(val);

        // clear old timer
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // debounce API trigger via MRT filter state
        debounceRef.current = setTimeout(() => {
          column.setFilterValue(val);
        }, 500); // 👈 debounce delay
      };

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

    // ======================================================
    // CELL (unchanged logic)
    // ======================================================
   
    Cell: ({ cell, row }) => {
      const clientName = cell.getValue();
      const companyName = row.original.companyName;

      const [showCompanyInfo, setShowCompanyInfo] =
        useState(false);

      const anchorRef = useRef(null);

      // ✅ Get active search
      const activeSearch = getColumnSearchValue( columnFilters, "clientName", searchValue );

      return (
        <div
          ref={anchorRef}
          className="flex items-center justify-start text-[#0078c8] hover:text-[#0053c8] w-full h-full"
        >
          <span
            onClick={(e) => {
              const isCtrlClick =
                e.ctrlKey || e.metaKey;

              if (isCtrlClick) {
                setShowCompanyInfo(true);
              } else {
                getSingleJobDetail(
                  row.original._id
                );
                setCompanyName(companyName);
              }
            }}
            className="cursor-pointer"
          >
            {/* ✅ Highlight Applied */}
            {highlightText(
              clientName,
              activeSearch
            )}
          </span>

          {showCompanyInfo && (
            <CompanyInfo
              anchorRef={anchorRef}
              clientId={row.original._id}
              onClose={() =>
                setShowCompanyInfo(false)
              }
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