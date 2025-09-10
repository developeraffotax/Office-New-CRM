export const ownerColumn = ({users, handleUpdateLead}) => {


    return         {
          id: "Owner",
          accessorKey: "job.lead",
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
                  Owner
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {users?.map((lead, i) => (
                    <option key={i} value={lead}>
                      {lead}
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
                  onChange={(e) =>
                    handleUpdateLead(row.original._id, e.target.value)
                  }
                  className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
                >
                  <option value="empty"></option>
                  {users.map((lead, i) => (
                    <option value={lead} key={i}>
                      {lead}
                    </option>
                  ))}
                </select>
              </div>
            );
          },

          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
          
            if (filterValue === "empty") {
              return !cellValue || cellValue === "empty";
            }
          
            return String(cellValue ?? "") === String(filterValue);
          },
          // filterFn: "equals",
          filterSelectOptions: users.map((lead) => lead),
          filterVariant: "select",
          size: 100,
          minSize: 70,
          maxSize: 140,
          grow: false,
        }
}