import UserSelect from "../../../../components/UserSelect";

// Hoisted so the array identity is stable across renders.
const EMPTY_OPTION = [{ value: "empty", label: "Empty" }];

export const assignColumn = ({
  auth,
  usersData: users, // array of user objects, same as ctx.users in tasks
  comment_taskId,
  handleUpdateJobHolder,
}) => {
  const user = auth?.user?.name || "";

  return {
    id: "Assign",
    accessorFn: (row) => row.job?.jobHolder || "",
    header: "Assignee",

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
          Assignee
        </span>

        <UserSelect
          users={users}
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

    Cell: ({ cell, row }) => {
      const jobholder = cell.getValue();

      return (
        <UserSelect
          users={users}
          // "empty" is the old blank-option value; treat it as unassigned
          value={!jobholder || jobholder === "empty" ? "" : jobholder}
          // keep sending "empty" for unassigned, same as the old <select>
          onChange={(name) =>
            handleUpdateJobHolder(row.original._id, name || "empty")
          }
          noneLabel="Unassigned"
          placeholder=""
          variant="ghost"
          height={32}
          menuMaxHeight={500}
          menuMinWidth={150}
          searchable={false}
        />
      );
    },

    filterFn: "equals",
    filterSelectOptions: users?.map((u) => u.name), // only matters if you ever drop the custom Header
    filterVariant: "select",

    size: 100,
    minSize: 80,
    maxSize: 150,
    grow: false,
  };
};



































































































// export const assignColumn = ({
//   auth,
//   users,
//   comment_taskId,
//   handleUpdateJobHolder,
// }) => {

//   const user = auth?.user?.name || "";

//   return {
//     id: "Assign",
//     // accessorKey: "job.jobHolder",
//     accessorFn: (row) => row.job?.jobHolder || "",
//         header: "Assignee",
//     // ======================================================
//     // HEADER (PURE UI ONLY)
//     // ======================================================
//     Header: ({ column }) => (
//       <div className="flex flex-col gap-[2px]">

//         <span
//           className="ml-1 cursor-pointer"
//           title="Clear Filter"
//           onClick={() => column.setFilterValue("")}
//         >
//           Assignee
//         </span>

//         <select
//           value={column.getFilterValue() || ""}
//           onChange={(e) => column.setFilterValue(e.target.value)}
//           className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
//         >
//           <option value="">Select</option>

//           {users?.map((jobhold, i) => (
//             <option key={i} value={jobhold}>
//               {jobhold}
//             </option>
//           ))}

//           <option value="empty">Empty</option>
//         </select>

//       </div>
//     ),

//     // ======================================================
//     // CELL (SAFE)
//     // ======================================================
//     Cell: ({ cell, row }) => {
//       const jobholder = cell.getValue();

//       return (
//         <div className="w-full flex items-center justify-center">
//           <select
//             value={jobholder || ""}
//             onChange={(e) =>
//               handleUpdateJobHolder(row.original._id, e.target.value)
//             }
//             className="w-full h-[2rem] rounded-md border-none outline-none"
//           >
//             <option value="empty"> </option>

//             {users.map((jobHold, i) => (
//               <option value={jobHold} key={i}>
//                 {jobHold}
//               </option>
//             ))}
//           </select>
//         </div>
//       );
//     },

//     // ======================================================
//     // FILTER CONFIG
//     // ======================================================
//     filterFn: "equals",
//     filterSelectOptions: users,
//     filterVariant: "select",

//     size: 100,
//     minSize: 80,
//     maxSize: 150,
//     grow: false,
//   };
// };