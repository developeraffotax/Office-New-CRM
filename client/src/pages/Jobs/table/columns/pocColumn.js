import { useState } from "react";

export const pocColumn = ({dataLable, addDatalabel1}) => {


    return {
                id: "POC",
                accessorKey: "data",

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
                        {/* CC Person */}
                        POC
                      </span>
                      <select
                        value={column.getFilterValue() || ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                      >
                        <option value="">Select</option>
                        {dataLable?.map((label, i) => (
                          <option key={i} value={label?.name}>
                            {label?.name}
                          </option>
                        ))}
                        <option value="empty">Empty</option>
                      </select>
                    </div>
                  );
                },

                Cell: ({ cell, row }) => {
                  const [show, setShow] = useState(false);
                  const jobLabel = row.original.data || {};
                  const { name, color, _id } = jobLabel;


                  

                  const handleLabelChange = (labelName) => {
                    const selectedLabel = dataLable.find(
                      (label) => label._id === labelName
                    );
                    // console.log("selectedLabel:", selectedLabel);
                    if (selectedLabel) {
                      addDatalabel1(
                        row.original._id,
                        labelName,
                        selectedLabel.color
                      );
                    } else {
                      addDatalabel1(row.original._id, "", "");
                    }
                    setShow(false);
                  };

                  return (
                    <div className="w-full flex items-start ">
                      {show ? (
                        <select
                          value={_id || ""}
                          onChange={(e) => handleLabelChange(e.target.value)}
                          className="w-full h-[2rem] rounded-md border-none outline-none"
                        >
                          <option value="empty">Select Data</option>
                          {dataLable?.map((label, i) => (
                            <option value={label?._id} key={i}>
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
                              className={`label relative  rounded-md hover:shadow  cursor-pointer text-black ${
                                color === "#fff"
                                  ? "text-gray-950 py-[4px] px-0"
                                  : "text-white py-[4px] px-2"
                              }`}
                              style={{ background: `${color}` }}
                            >
                              {name} 
                            </span>
                          ) : (
                            <span
                              className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                              // style={{ background: `${color}` }}
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
                  const labelName = row.original?.data?.name || "";
                  if (filterValue === "empty") {
                    return !labelName;
                  }
                  return labelName === filterValue;
                },

                filterVariant: "select",
                filterSelectOptions: dataLable.map((label) => label.name),
                size: 80,
                minSize: 80,
                maxSize: 180,
                grow: false,
              }
}