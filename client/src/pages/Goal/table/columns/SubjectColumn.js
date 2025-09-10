import React, { useState } from "react";

export const createSubjectColumn = ({ setFormData, handleUpdateData, formData }) => ({
  accessorKey: "subject",
  header: "Subject",
  Header: ({ column }) => {
    return (
      <div className=" w-[350px] flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Subject
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-white border-gray-300 rounded-md border  outline-none"
        />
      </div>
    );
  },
  Cell: ({ row }) => {
    const subject = row.original.subject;
    const [showEdit, setShowEdit] = useState(false);
    const [localSubject, setSubject] = useState(subject);

    const handleSubmit = () => {
      setFormData((prevData) => ({
        ...prevData,
        subject: localSubject,
      }));

      handleUpdateData(row.original._id, {
        ...formData,
        subject: localSubject,
      });

      setShowEdit(false);
    };
    return (
      <div className="w-full h-full ">
        {showEdit ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <input
              type="text"
              placeholder="Enter Subject..."
              value={localSubject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => handleSubmit()}
              className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
            />
          </form>
        ) : (
          <div
            className="w-full h-full flex items-center justify-start "
            onDoubleClick={() => setShowEdit(true)}
            title={subject}
          >
            <p
              className="text-black text-start font-medium"
              onDoubleClick={() => setShowEdit(true)}
            >
              {subject}
            </p>
          </div>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
  size: 400,
  minSize: 350,
  maxSize: 560,
  grow: false,
});

export default createSubjectColumn;


