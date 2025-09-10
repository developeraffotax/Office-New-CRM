import { useState } from "react";

export const acColumn = ({updateActiveClient}) => {


    return {
                id: "AC",
                accessorKey: "activeClient",
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
                        AC
                      </span>
                      <select
                        value={column.getFilterValue() || ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        {/* <option value="empty">Empty</option> */}
                      </select>
                    </div>
                  );
                },

              




Cell: ({ row }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(row.original.activeClient || "");

  const handleDoubleClick = () => setIsEditing(true);

  const handleChange = async (newValue) => {
    setValue(newValue);
    setIsEditing(false);

    // TODO: Save to DB if needed
    await updateActiveClient(row.original._id, newValue);
  };

  return (
    <div
      className="w-full flex justify-center items-center  cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <div className="flex gap-1">
          <button
            className={`text-xs px-2 py-0.5 rounded ${
              value === "active"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-green-100"
            }`}
            onClick={() => handleChange("active")}
          >
            A
          </button>
          <button
            className={`text-xs px-2 py-0.5 rounded ${
              value === "inactive"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-red-100"
            }`}
            onClick={() => handleChange("inactive")}
          >
            I
          </button>
        </div>
      ) : (
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
            value === "active"
              ? "bg-green-100 text-green-700"
              : value === "inactive"
              ? "bg-red-100 text-red-700"
              : "text-gray-400"
          }`}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
},



                filterFn: (row, columnId, filterValue) => {
                  const labelName = row.original?.activeClient || "";
                  return labelName === filterValue;
                },

                filterVariant: "select",
                size: 50,
                minSize: 70,
                maxSize: 120,
                grow: false,
              }
}