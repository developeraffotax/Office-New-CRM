export const createAchievedColumn = () => ({
  accessorKey: "achievedCount",
  minSize: 60,
  maxSize: 90,
  size: 140,
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
          Achieved
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer  rounded-md border bg-white border-gray-300 outline-none"
        />
      </div>
    );
  },
  Cell: ({ row }) => {
    const achievedCount = row.original.achievedCount;
    return (
      <div className="w-full flex items-center justify-center px-1">
        <div className="cursor-pointer rounded-full ">{achievedCount ? achievedCount : 0}</div>
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
  filterVariant: "select",
});

export default createAchievedColumn;


