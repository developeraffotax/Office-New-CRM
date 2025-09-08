import { useState } from "react";

export const labelColumn = (ctx) => {


    return     {
      accessorKey: "labal",

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
              Labels
            </span>
            <select
              value={column.getFilterValue() || ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
            >
              <option value="">Select</option>
              {ctx.labelData?.map((label, i) => (
                <option key={i} value={label?.name}>
                  {label?.name}
                </option>
              ))}
            </select>
          </div>
        );
      },

      Cell: ({ cell, row }) => {
        const [show, setShow] = useState(false);
        const jobLabel = row.original.labal || {};
        const { name, color } = jobLabel;

        const handleLabelChange = (labelName) => {
          const selectedLabel = ctx.labelData.find(
            (label) => label.name === labelName
          );
          if (selectedLabel) {
            ctx.addlabelTask(row.original._id, labelName, selectedLabel?.color);
          } else {
            ctx.addlabelTask(row.original._id, "", "");
          }
          setShow(false);
        };

        return (
          <div className="w-full flex items-center justify-center">
            {show ? (
              <select
                value={name || ""}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full h-[2rem] rounded-md border-none outline-none"
              >
                <option value="clear">Select Label</option>
                {ctx.labelData?.map((label, i) => (
                  <option value={label?.name} key={i}>
                    {label?.name}
                  </option>
                ))}
              </select>
            ) : (
              <div
                className="cursor-pointer h-full min-w-full "
                onDoubleClick={() => setShow(true)}
              >
                {name ? (
                  <span
                    className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                    style={{ background: `${color}` }}
                  >
                    {name}
                  </span>
                ) : (
                  <span
                    className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                  >
                    .
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },

      filterFn: (row, columnId, filterValue) => {
        const labelName = row.original?.labal?.name || "";
        return labelName === filterValue;
      },

      filterVariant: "select",
      filterSelectOptions: ctx.labelData?.map((label) => label.name),
      size: 140,
      minSize: 100,
      maxSize: 210,
      grow: false,
    }
}