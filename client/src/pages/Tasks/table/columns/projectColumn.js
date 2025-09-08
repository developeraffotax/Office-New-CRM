import React from "react";

export const projectColumn = (ctx) => {
  return {
    accessorFn: (row) => row.project?.projectName || "",
    id: "projectName",
    minSize: 150,
    maxSize: 200,
    size: 160,
    grow: false,
     
    Header: ({ column }) => (
      <div className="flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => column.setFilterValue("")}
        >
          Project
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {ctx.allProjects?.map((proj) => (
            <option key={proj._id} value={proj.projectName}>
              {proj.projectName}
            </option>
          ))}
        </select>
      </div>
    ),

    Cell: ({ row }) => {
      const currentProjectId = row.original.project?._id || "";

      return (
        <select
          value={currentProjectId}
          onChange={(e) => ctx.updateTaskProject(row.original._id, e.target.value)}
          className="w-full h-[2rem] rounded-md border-none outline-none"
        >
          <option value="">Select</option>
          {ctx.allProjects?.map((proj) => (
            <option key={proj._id} value={proj._id}>
              {proj.projectName}
            </option>
          ))}
        </select>
      );
    },

    filterFn: "equals",
  };
};
