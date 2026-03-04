export const budgetColumn = () => {
  return {
    accessorKey: "estimate_Time",
    header: "Budget",
    Cell: ({ cell, row }) => {
      const estimateTime = cell.getValue();
      return (
        <div className="flex items-center gap-1">
          <span className="text-[1rem]">⏳</span>
          <span>{estimateTime}</span>
        </div>
      );
    },
    size: 80,
  };
};
