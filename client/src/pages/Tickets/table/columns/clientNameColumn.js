import { useEffect, useRef, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";


export const clientNameColumn = (ctx) => {


    return      {
            accessorKey: "clientName",
            minSize: 100,
            maxSize: 200,
            size: 140,
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
                    Client Name
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
              const clientName = row.original.clientName;
              const [isEditing, setIsEditing] = useState(false);
              const [newClientName, setNewClientName] = useState("");
    
              const inputRef = useRef(null);
    
              const handleKeyDown = (e) => {
                if (e.key === "Escape") {
                  setNewClientName("");
                  setIsEditing(false);
                }
    
                if (e.key === "Enter") {
                  if (newClientName !== clientName) {
                    ctx.updateTicketSingleField(row.original._id, {
                      clientName: newClientName.trim(),
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
                    <span className="text-gray-500 ">{clientName}</span>
                  ) : (
                    <div className="w-full px-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={inputRef}
                            type="text"
                            value={newClientName}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                              setNewClientName(e.target.value);
                            }}
                            onBlur={(e) => {
                              if (newClientName !== clientName) {
                                ctx.updateTicketSingleField(row.original._id, {
                                  clientName: newClientName.trim(),
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
                            setNewClientName(clientName);
                          }}
                          
                        >
                          {clientName ? (
                            clientName
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