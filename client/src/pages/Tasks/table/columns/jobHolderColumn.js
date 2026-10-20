import UserSelect from "../../../../components/UserSelect";

// Hoisted so the array identity is stable across renders.
const EMPTY_OPTION = [{ value: "empty", label: "Empty" }];

export const jobHolderColumn = (ctx) => {
  return {
    accessorKey: "jobHolder",
    header: "Assign",

    // Let the header content stretch to the full cell width (MRT wraps custom
    // headers in shrink-to-fit flex boxes, so `w-full` alone has nothing to fill).
    muiTableHeadCellProps: {
      sx: {
        "& .Mui-TableHeadCell-Content, & .Mui-TableHeadCell-Content-Labels, & .Mui-TableHeadCell-Content-Wrapper": {
          width: "100%",
        },
      },
    },

    Header: ({ column }) => (
      <div className="flex flex-col gap-[2px] w-full min-w-0">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => column.setFilterValue("")}
        >
          Assign
        </span>

        <UserSelect
          users={ctx.users}
          value={column.getFilterValue() ?? ""}
          onChange={(name) => column.setFilterValue(name || undefined)}
          noneLabel="Select"
          placeholder="Select"
          extraOptions={EMPTY_OPTION}
          variant="outlined"
          height={28}
          avatarSize={18}
           menuMaxHeight={500}
        />
      </div>
    ),

    Cell: ({ cell, row }) => (
      <UserSelect
        users={ctx.users}
        value={cell.getValue() || ""}
        onChange={(name) => ctx.updateTaskJLS(row.original?._id, name, "", "")}
        noneLabel="Unassigned" // remove this line if a job must always have an assignee
        placeholder=""
        variant="ghost"
        height={32}
        menuMaxHeight={500}
        menuMinWidth={150}
        searchable={false}
      />
    ),

    size: 100,
    minSize: 80,
    maxSize: 130,
    grow: false,
  };
};




































export const jobHolderColumn2 = (ctx) => {
  return {
    accessorKey: "jobHolder",
    header: "Assign",

    Header: ({ column }) => {
      return (
        <div className="flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => column.setFilterValue("")}
          >
            Assign
          </span>

          <select
            value={column.getFilterValue() ?? ""}
            onChange={(e) =>
              column.setFilterValue(
                e.target.value || undefined
              )
            }
            className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>

            {ctx.users?.map((user, i) => (
              <option key={i} value={user?.name}>
                {user?.name}
              </option>
            ))}

            <option value="empty">Empty</option>

          </select>
        </div>
      );
    },

    Cell: ({ cell, row }) => {
      const jobholder = cell.getValue();

      return (
        <div className="flex flex-col items-center justify-center h-full">
          <select
            value={jobholder || ""}
            className="w-full h-[2rem] rounded-md border-none outline-none"
            onChange={(e) =>
              ctx.updateTaskJLS(
                row.original?._id,
                e.target.value,
                "",
                ""
              )
            }
          >
            <option value=""></option>

            {ctx.users?.map((user, i) => (
              <option key={i} value={user?.name}>
                {user?.name}
              </option>
            ))}

            

          </select>
        </div>
      );
    },

    size: 100,
    minSize: 80,
    maxSize: 130,
    grow: false,
  };
};