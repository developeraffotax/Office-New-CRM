import { useEffect, useRef, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";


export const companyNameColumn = (ctx) => {


    return {
            accessorKey: "companyName",
            minSize: 100,
            maxSize: 300,
            size: 240,
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
                    Company Name
                  </span>
                  <input
                    type="search"
                    value={column.getFilterValue() || ""}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                  />
                </div>
              );
            },
    
            Cell: ({ cell, row }) => {
              const companyName = row.original.companyName;
              const [isEditing, setIsEditing] = useState(false);
              const [newcompanyName, setNewcompanyName] = useState("");
    
              const inputRef = useRef(null);
    
              const handleKeyDown = (e) => {
                if (e.key === "Escape") {
                  setNewcompanyName("");
                  setIsEditing(false);
                }
    
                if (e.key === "Enter") {
                  if (newcompanyName !== companyName) {
                    ctx.updateTicketSingleField(row.original._id, {
                      companyName: newcompanyName.trim(),
                    });
                  }
    
                  setIsEditing(false);
                }
              };
    
              useEffect(() => {
                if (isEditing && inputRef?.current) {
                  inputRef.current.focus();
                }
              }, [isEditing]);
    
              return (
                <>
                  {row?.original?.clientId ? (
                    <span className="text-gray-500">{companyName}</span>
                  ) : (
                    <div className="w-full px-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={inputRef}
                            type="text"
                            value={newcompanyName}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                              setNewcompanyName(e.target.value);
                            }}
                            onBlur={(e) => {
                              if (newcompanyName !== companyName) {
                                ctx.updateTicketSingleField(row.original._id, {
                                  companyName: newcompanyName.trim(),
                                });
                              }
                              setIsEditing(false);
                            }}
                            className="w-full h-[1.8rem] px-2 border border-gray-300 rounded-md outline-none"
                          />
                        </div>
                      ) : (
                        <span
                          className="w-full flex"
                          onDoubleClick={() => {
                            setIsEditing(true);
                            setNewcompanyName(companyName);
                          }}
                        >
                          {companyName ? (
                            companyName
                          ) : (
                            <AiOutlineEdit className="text-gray-400 text-lg cursor-pointer" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </>
              );
            },
    
            filterFn: (row, columnId, filterValue) => {
              const cellValue =
                row.original[columnId]?.toString().toLowerCase() || "";
              return cellValue.includes(filterValue.toLowerCase());
            },
            filterVariant: "select",
          }
}