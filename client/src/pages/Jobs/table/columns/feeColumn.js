import { useState } from "react";

export const feeColumn = ({totalFee, handleUpdateFee}) => {


    return {
                id: "Fee",
                accessorKey: "fee",
                
                Header: ({ column }) => {
                  
                  return (
                    <div className=" flex flex-col gap-[2px] w-full items-center justify-center  ">
                      <span
                        className="ml-1 w-full text-center cursor-pointer pr-6"
                        title="Filter out the empty fees"
                        onClick={() => {
                          column.setFilterValue("empty");
                           
                        }}
                      >
                        Fee
                      </span>
                      <span
                        title={totalFee}
                        className="font-medium w-full cursor-pointer text-center text-[12px] px-1 py-1 rounded-md bg-gray-50 text-black"
                      >
                        {totalFee}
                      </span>
                    </div>
                  );
                },
                Cell: ({ cell, row }) => {

                  const fee = row.original.fee;
                 
                  const [show, setShow] = useState(false);
                  const [feeVal, setFeeVal] = useState(fee);
                  const [showId, setShowId] = useState("");
                  return (

                    <div className="w-full flex items-center justify-center">
                    {show && row.original._id === showId ? (
                      <input
                        type="text"
                        value={feeVal}
                        onChange={(e) => setFeeVal(e.target.value)}
                        onBlur={(e) => {handleUpdateFee(row.original._id, e.target.value); setShowId("")}}
                        className="w-full h-[1.7rem] px-[2px] outline-none rounded-md cursor-pointer"
                      />
                    ) : (
                      <span
                        className="text-[15px] font-medium"
                        onDoubleClick={() => {
                          setShowId(row.original._id);
                          setShow(true);
                        }}
                      >
                        {fee ? fee : <span className="text-white">.</span>}
                         
                      </span>
                    )}
                  </div>


                    // <div className="w-full flex items-center justify-center">
                    //   <span className="text-[15px] font-medium">
                    //     {fee && fee}
                    //   </span>
                    // </div>
                  );
                },



                filterFn: (row, columnId, filterValue) => {
                  const fee = row.getValue(columnId);

                  if (filterValue === "empty") {
                    return !fee;
                  }

                  return fee === filterValue;
                },
                size: 60,

                 
              }
}