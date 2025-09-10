import React, { useState } from "react";

export const createNoteColumn = ({ handleUpdateSubscription }) => ({
  accessorKey: "note",
  minSize: 200,
  maxSize: 500,
  size: 200,
  grow: false,
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
          Note
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[200px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  Cell: ({ row }) => {
    const note = row.original.note;
    const [show, setShow] = useState(false);
    const [localNote, setLocalNote] = useState(note);

    const handleNote = () => {
      handleUpdateSubscription(row.original._id, localNote, "note");
      setShow(false);
    };

    return (
      <div className="w-full px-1">
        {show ? (
          <form onSubmit={handleNote}>
            <input
              type="text"
              value={localNote}
              autoFocus
              onChange={(e) => setLocalNote(e.target.value)}
              className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
            />
          </form>
        ) : (
          <div onDoubleClick={() => setShow(true)} className="cursor-pointer w-full">
            {note ? (note.length > 32 ? note.slice(0, 32) + " ..." : note) : (
              <div className="text-white w-full h-full">.</div>
            )}
          </div>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
  filterVariant: "select",
});

export default createNoteColumn;


