import React from "react";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { IoIosTimer } from "react-icons/io";
import { MdOutlineTimerOff } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setFilterId } from "../../../redux/slices/authSlice";

const TimerStatusPanel = ({ timerStatus, setShowTimerStatus }) => {
  const dispatch = useDispatch();

  return (
    <div className="w-[370px] min-h-[20vh] max-h-[60vh] overflow-y-auto border border-gray-300 pb-2 shadow-xl bg-gray-100 absolute z-[999] top-[2rem] right-[1.6rem] rounded">
      <h5 className="text-[20px] bg-orange-600 text-center font-medium flex items-center justify-center text-white p-2 font-Poppins">
        <IoIosTimer
          className={`h-9 w-9 text-sky-500 ${timerStatus && "animate-spin"}`}
        />
        Timer Status
      </h5>
      <hr className="h-[1px] w-full bg-gray-400 my-2" />
      
      {timerStatus ? (
        <Link
          to={timerStatus.taskLink}
          onClick={() => {
            dispatch(setFilterId(timerStatus?.taskId));
            setShowTimerStatus(false);
          }}
        >
          <div className="px-2">
            <div className="bg-[#00000013] rounded-md hover:bg-gray-300 font-Poppins border-b border-b-[#fff]">
              <div className="w-full flex cursor-pointer items-center justify-between py-2 px-1">
                <div className="flex items-center gap-1">
                  <b className="font-semibold text-[16px]">
                    {timerStatus?.pageName}:
                  </b>
                  <p className="py-[2px] px-5 rounded-[2rem] text-[14px] bg-sky-600 shadow-md text-white">
                    {timerStatus?.taskName}
                  </p>
                </div>
              </div>
              <div className="w-full flex items-center justify-end">
                <p className="p-2 text-gray-600 text-[12px]">
                  {format(timerStatus?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center justify-center w-full h-[4rem] bg-gray-300">
          <span className="flex items-center justify-center gap-1 font-medium">
            <MdOutlineTimerOff className="h-6 w-6 text-red-500" />
            Timer is not running!
          </span>
        </div>
      )}
    </div>
  );
};

export default TimerStatusPanel;
