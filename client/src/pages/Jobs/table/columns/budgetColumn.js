import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export const budgetColumn = ({auth}) => {


    return         {
          id: "Budget",
          accessorKey: "totalTime",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
                <span className="w-full text-center ">Budget</span>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const currentVal = row.original.totalTime;
            // const statusValue = cell.getValue();
            const [show, setShow] = useState(false);
            const [totalTime, setTotalTime] = useState(currentVal);
            const [load, setLoad] = useState(false);

            const updateTimer = async (e) => {
              e.preventDefault();
              setLoad(true);
              try {
                const { data } = await axios.put(
                  `${process.env.REACT_APP_API_URL}/api/v1/client/update/timer/${row.original._id}`,
                  { totalTime }
                );
                if (data) {
                  setShow(false);
                  setLoad(true);
                  toast.success("Budget updated!");
                }
              } catch (error) {
                setLoad(false);
                console.log(error);
              }
            };

            return (
              <div className="flex items-center gap-1 w-full ">
                {!show ? (
                  <div
                    onDoubleClick={
                      auth?.user?.role?.name === "Admin"
                        ? () => setShow(true)
                        : null
                    }
                    className="w-full flex items-center gap-1 justify-center cursor-pointer"
                  >
                    <span className="text-[1rem]">⏳</span>
                    <span>{totalTime}</span>
                  </div>
                ) : (
                  <div className="w-full">
                    <form onSubmit={updateTimer}>
                      <input
                        type="text"
                        disabled={load}
                        className="w-full h-[2rem] rounded-md border border-gray-500 px-1 outline-none "
                        value={totalTime}
                        onChange={(e) => setTotalTime(e.target.value)}
                      />
                    </form>
                  </div>
                )}
              </div>
            );
          },
          size: 80,
        }
}