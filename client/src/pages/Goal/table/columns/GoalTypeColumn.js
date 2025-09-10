import React, { useState } from "react";

export const createGoalTypeColumn = ({ goalTypes, setFormData, handleUpdateData, formData }) => ({
  accessorKey: "goalType",
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
          Goal Type
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {goalTypes?.map((goal, i) => (
            <option key={i} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const goalType = row.original.goalType;
    const [localJobholder, setLocalJobholder] = useState(goalType || "");
    const [show, setShow] = useState(false);

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalJobholder(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        goalType: localJobholder,
      }));

      handleUpdateData(row.original._id, {
        ...formData,
        goalType: selectedValue,
      });
      setShow(false);
    };

    return (
      <div className="w-full">
        {show ? (
          <select
            value={localJobholder || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {goalTypes?.map((goal, i) => (
              <option value={goal} key={i}>
                {goal}
              </option>
            ))}
          </select>
        ) : (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {goalType ? (
              <span>{goalType}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        )}
      </div>
    );
  },
  filterFn: "equals",
  filterSelectOptions: goalTypes.map((goal) => goal),
  filterVariant: "select",
  size: 150,
  minSize: 80,
  maxSize: 170,
  grow: false,
});

export default createGoalTypeColumn;


