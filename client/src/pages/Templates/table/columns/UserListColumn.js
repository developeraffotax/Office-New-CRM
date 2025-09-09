import React from "react";

export const createUserListColumn = ({ userName }) => ({
  accessorKey: "userList",
  minSize: 100,
  maxSize: 500,
  size: 170,
  grow: true,
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
          User List
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {userName?.map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    );
  },

  Cell: ({ row }) => {
    const userList = row.original.userList;
    return (
      <ul className="w-full flex flex-row justify-start items-center gap-2 px-2 list-none">
        {userList.map((user, index) => (
          <li
            key={index}
            className="bg-gray-100 text-gray-800 text-sm px-4 py-1 rounded-full shadow-sm hover:bg-gray-200 transition m-0"
          >
            {user.name}
          </li>
        ))}
      </ul>
    );
  },

  filterFn: (row, columnId, filterValue) => {
    const cellArray = row.original[columnId];
    return cellArray.some((user) => user.name === filterValue);
  },
});

export default createUserListColumn;


