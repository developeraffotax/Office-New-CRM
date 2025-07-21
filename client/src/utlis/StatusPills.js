import React, { useState } from "react";

const statuses = [
  { value: "", label: "Default", color: "bg-sky-200 text-sky-700" },
  { value: "Progress", label: "Progress", color: "bg-green-100 text-green-700" },
  { value: "Inactive", label: "Inactive", color: "bg-red-100 text-red-700" },
];

export default function StatusPills({ onChange }) {

    const [selectedStatus, setSelectedStatus] = useState(statuses[0].value);



   const handleClick = (statusValue) => {
    setSelectedStatus(statusValue);
    onChange?.(statusValue); // safe optional call
  };
 


  return (
    <div className="flex space-x-2 ">
      {statuses.map((status) => {
        const isSelected = selectedStatus === status.value;
        return (
          <button
  key={status.value}
  type="button"
  onClick={() => handleClick(status.value)}
  className={`
    relative inline-flex items-center justify-center
    px-4 py-2 text-sm font-semibold rounded-full
    border transition-all duration-200 ease-in-out
    transform active:scale-[0.95] outline-none
    
    ${
      isSelected
        ? `${status.color} border-transparent shadow-md`
        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
    }
  `}
>
  {status.label}
</button>
        );
      })}
    </div>
  );
}
