import React, { useState } from "react";

export const createJobHolderColumn = ({ users, auth, setFormData, handleUpdateData, formData }) => ({
  accessorKey: "jobHolder._id",
  id: "jobHolderId",
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span className="ml-1 cursor-pointer" onClick={() => column.setFilterValue("")}>Job Holder</span>
        {auth?.user?.role?.name === "Admin" && (
          <select
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              column.setFilterValue(e.target.value);
            }}
            className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {users?.map((jobhold, i) => (
              <option key={i} value={jobhold?.name}>
                {jobhold?.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  Cell: ({ row }) => {
    const jobholder = row.original.jobHolder.name;
    const [localJobholder, setLocalJobholder] = useState(jobholder._id || "");
    const [show, setShow] = useState(false);

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalJobholder(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        jobHolder: localJobholder,
      }));

      handleUpdateData(row.original._id, {
        ...formData,
        jobHolder: selectedValue,
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
            {users?.map((jobHold, i) => (
              <option value={jobHold?._id} key={i}>
                {jobHold.name}
              </option>
            ))}
          </select>
        ) : (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {jobholder ? (
              <span>{jobholder}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const jobHolderName = row.original.jobHolder.name || "";
    return jobHolderName === filterValue;
  },
  size: 110,
  minSize: 80,
  maxSize: 130,
  grow: false,
});

export default createJobHolderColumn;


