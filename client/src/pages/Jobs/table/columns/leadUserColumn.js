export const leadUserColumn = ({ users, handleUpdateLeadUser }) => {
  return {
    id: "Lead",

    accessorFn: (row) => row.job?.leadUser || "",
    Header: ({ column }) => {
      return (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="  cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
            }}
          >
            Lead
          </span>
          <select
            value={column.getFilterValue() || ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {users?.map((username, i) => (
              <option key={i} value={username}>
                {username}
              </option>
            ))}
            <option value="empty">Empty</option>
          </select>
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      const leadValue = cell.getValue();

      return (
        <div className="w-full">
          <select
            value={leadValue || ""}
            onChange={(e) => handleUpdateLeadUser(row.original._id, e.target.value)}
            className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
          >
            <option value="empty"></option>
            {users.map((username, i) => (
              <option value={username} key={i}>
                {username}
              </option>
            ))}
          </select>
        </div>
      );
    },

    // filterFn: "equals",
    filterSelectOptions: users.map((username) => username),
    filterVariant: "select",
    size: 100,
    minSize: 70,
    maxSize: 140,
    grow: false,
  };
};
