export const createOutcomeColumn = () => ({
  accessorKey: "difference",
  minSize: 60,
  maxSize: 150,
  size: 100,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className="flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Outcome
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          <option value="positive">Exceeds</option>
          <option value="negative">Short</option>
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const achievement = parseFloat(row.original.achievement) || 0;
    const achievedCount = parseFloat(row.original.achievedCount) || 0;
    const difference = (achievedCount - achievement).toFixed(2);
    const isPositive = difference >= 0;
    return (
      <div className="w-full px-1 flex items-center justify-center">
        <div className={`cursor-pointer w-full text-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? `+${difference}` : difference}
        </div>
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const achievement = parseFloat(row.original.achievement) || 0;
    const achievedCount = parseFloat(row.original.achievedCount) || 0;
    const difference = achievedCount - achievement;
    if (filterValue === "positive") return difference >= 0;
    if (filterValue === "negative") return difference < 0;
    return true;
  },
  filterVariant: "select",
});

export default createOutcomeColumn;


