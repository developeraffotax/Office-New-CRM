import React from "react";

export const createTimeColumn = () => ({
  accessorKey: "Months",
  Header: ({ column }) => {
    return (
      <div className="w-full flex flex-col gap-[2px]">
        <span
          className="cursor-pointer"
          title="Clear Filter"
          onClick={() => column.setFilterValue("")}
        >
          Time
        </span>
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-2 py-1 text-sm outline-none"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
        />
      </div>
    );
  },
  Cell: ({ row }) => {
    const billingStart = new Date(row.original.job.billingStart);
    const billingEnd = new Date(row.original.job.billingEnd);
    if (!billingStart || !billingEnd) return <div>N/A</div>;
    const timeDifference = billingEnd.getTime() - billingStart.getTime();
    const monthDifference = (
      timeDifference / (1000 * 60 * 60 * 24 * 30.44)
    ).toFixed(0);
    return (
      <div className="w-full text-center">
        {monthDifference > 0 ? (
          `${monthDifference} Month${monthDifference > 1 ? "s" : ""}`
        ) : (
          <span className="text-red-500">Expired</span>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const billingStart = new Date(row.original.job.billingStart);
    const billingEnd = new Date(row.original.job.billingEnd);
    if (!billingStart || !billingEnd) return false;
    const timeDifference = billingEnd.getTime() - billingStart.getTime();
    const monthDifference = (
      timeDifference / (1000 * 60 * 60 * 24 * 30.44)
    ).toFixed(0);
    return monthDifference.toString().includes(filterValue);
  },
  enableColumnFilter: true,
  size: 80,
  minSize: 60,
  maxSize: 120,
  grow: false,
});

export default createTimeColumn;


