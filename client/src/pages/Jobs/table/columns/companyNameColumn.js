import { Link } from "react-router-dom";
import { getColumnSearchValue } from "../../utils/getColumnSearchValue";
import { highlightText } from "../../utils/highlightText";

export const companyNameColumn = ({ columnFilters, searchValue }) => {
  return {
    id: "companyName",
    accessorKey: "companyName",
    minSize: 150,
    maxSize: 300,
    size: 200,
    grow: false,
    Header: ({ column }) => {
      return (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
            }}
          >
            Company Name
          </span>
          <input
            type="search"
            value={column.getFilterValue() || ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
          />
        </div>
      );
    },

    Cell: ({ cell, row }) => {
      const companyName = row.original.companyName;
      const regNo = row.original.regNumber || "";

     


      const activeSearch = getColumnSearchValue(
        columnFilters,
        "companyName",
        searchValue,
      );

      return (
        <Link
          to={
            regNo
              ? `https://find-and-update.company-information.service.gov.uk/company/${regNo}`
              : "#"
          }
          target="_black"
          className={`cursor-pointer flex items-center justify-start ${
            regNo && "text-[#0078c8] hover:text-[#0053c8]"
          }   w-full h-full`}
        >
          {highlightText(companyName, activeSearch)}
        </Link>
      );
    },
  };
};
