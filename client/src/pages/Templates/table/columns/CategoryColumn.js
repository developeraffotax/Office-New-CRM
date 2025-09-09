import React from "react";

export const createCategoryColumn = ({ categoryData }) => ({
  accessorKey: "category",
  minSize: 100,
  maxSize: 200,
  size: 170,
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
          Category
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {categoryData?.map((cate) => (
            <option key={cate._id} value={cate.name}>
              {cate.name}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const categroyName = row.original.category;
    return (
      <div className="w-full px-1">
        <span>{categroyName}</span>
      </div>
    );
  },
  filterFn: "equals",
  filterSelectOptions: categoryData?.map((category) => category?.name),
  filterVariant: "select",
});

export default createCategoryColumn;


