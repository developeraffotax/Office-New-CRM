import { useEffect } from "react";

export const statusColumn = (ctx) => {
  return {
    accessorKey: "status",
    header: "Task Status",

    Header: ({ column }) => {
      const statusData = ["To do", "Progress", "Review", "Awaiting", "On hold"];

      useEffect(() => {
        if (!ctx.comment_taskId) {
          column.setFilterValue("Progress");
        }
      }, []);
      return (
        <div className=" flex flex-col gap-[2px]">
          <span
            className=" text-center cursor-pointer"
            title="Clear Filter "
            onClick={() => {
              column.setFilterValue("");
            }}
          >
            Task Status
          </span>
          <div className="flex ">
            <select
              value={column.getFilterValue() || ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="ml-1 font-normal w-full  h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
            >
              <option value="">Select</option>
              {statusData?.map((status, i) => (
                <option key={i} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      const statusValue = cell.getValue();

      return (
        <div className="flex items-center justify-center w-full">
          <select
            value={statusValue}
            onChange={(e) =>
              ctx.updateTaskJLS(row.original?._id, "", "", e.target.value)
            }
            className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
          >
            <option value="empty"></option>
            <option value="To do">To do</option>
            <option value="Progress">Progress</option>
            <option value="Review">Review</option>
            <option value="Awaiting">Awaiting</option>
            <option value="On hold">On hold</option>
          </select>
        </div>
      );
    },
    // filterFn: "equals",
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId);
      return (cellValue || "").toString() === filterValue.toString();
    },
    filterSelectOptions: [
      "Select",
      "To do",
      "Progress",
      "Review",
      "Awaiting",
      "On hold",
    ],
    filterVariant: "select",
    minSize: 90,
    size: 100,
    maxSize: 140,
    grow: false,
  };
};





export const statusColumnCompleted = (ctx) => {
  return {
    accessorKey: "status",
    header: "Task Status",
    Header: ({ column }) => {
      const statusData = [
        "To do",
        "Progress",
        "Review",
        "On hold",
        "Completed",
      ];
      return (
        <div className=" flex flex-col gap-[2px]">
          <span
            className=" text-center"
            title="Clear Filter "
            onClick={() => {
              column.setFilterValue("");
            }}
          >
            Task Status
          </span>
          <div className="flex ">
            <select
              value={column.getFilterValue() || ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="ml-1 font-normal w-full  h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
            >
              <option value="">Select</option>
              {statusData?.map((status, i) => (
                <option key={i} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      const statusValue = cell.getValue();

      return (
        <div className="flex items-center justify-center w-full">
          <select
            value={statusValue}
            onChange={(e) =>
              ctx.updateTaskJLS(row.original?._id, "", "", e.target.value)
            }
            className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
          >
            <option value="empty"></option>
            <option value="To do">To do</option>
            <option value="Progress">Progress</option>
            <option value="Review">Review</option>
            <option value="On hold">On hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      );
    },
    // filterFn: "equals",
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId);
      return (cellValue || "").toString() === filterValue.toString();
    },
    filterSelectOptions: [
      "Select",
      "To do",
      "Progress",
      "Review",
      "On hold",
      "completed",
    ],
    filterVariant: "select",
    minSize: 90,
    size: 100,
    maxSize: 140,
    grow: false,
  };
};
