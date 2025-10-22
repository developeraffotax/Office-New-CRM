import { useRef, useState } from "react";
import CompanyInfo from "../../../../utlis/CompanyInfo";
import { Link } from "react-router-dom";

export const companyNameColumn = ({getSingleJobDetail, setCompanyName}) => {


    return         {
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
          // Cell: ({ cell, row }) => {
          //   const companyName = cell.getValue();

          //     const [showCompanyInfo, setShowCompanyInfo] = useState(false);
          //     const anchorRef = useRef(null);

          //   return (
          //     <div ref={anchorRef} className="flex items-center justify-start text-[#0078c8] hover:text-[#0053c8] w-full h-full">
          //       <span
          //          onClick={(e) => {
          //           const isCtrlClick = e.ctrlKey || e.metaKey; // ctrl on Windows/Linux, ⌘ on Mac

          //           if (isCtrlClick) {
          //             console.log("CTRL + Click triggered!");
          //            setShowCompanyInfo(true)
          //           } else {
          //             getSingleJobDetail(row.original._id);
          //             setCompanyName(companyName);
          //           }
          //         }}
          //         className="cursor-pointer"
          //       >
          //         {companyName}
          //       </span>



          //       {showCompanyInfo && (
          //               <CompanyInfo
          //                 anchorRef={anchorRef}
          //                 clientId={row.original._id}
          //                  onClose={() => setShowCompanyInfo(false)}
          //               />
          //             )}
          //     </div>
          //   );
          // },


          Cell: ({ cell, row }) => {
                      const companyName = row.original.companyName;
                      const regNo = row.original.regNumber || "";
                      // console.log("regNo:", row.original);
          
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
                          {companyName}
                        </Link>
                      );
                    },






          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.includes(filterValue.toLowerCase());
          },
        }
}