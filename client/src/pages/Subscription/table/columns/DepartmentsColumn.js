import React from "react";

export const createDepartmentsColumn = () => ({
  accessorKey: "job.jobName",
  header: "Departments",
  filterFn: "equals",
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
          Departments
        </span>
      </div>
    );
  },
  filterSelectOptions: [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ],
  filterVariant: "select",
  size: 110,
  minSize: 100,
  maxSize: 140,
  grow: false,
});

export default createDepartmentsColumn;


