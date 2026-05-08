import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import axios from "axios";
import { FaCirclePlay } from "react-icons/fa6";
import { IoSettingsOutline, IoStopCircle } from "react-icons/io5";
 import toast from "react-hot-toast";
 
 
import { useDispatch, useSelector } from "react-redux";
import { setAnyTimerRunning, setJid } from "../redux/slices/authSlice";
import { startCountdown, stopCountdown } from "../redux/slices/timerSlice";
import { fetchGlobalTimer, startTimer, stopTimer } from "../redux/slices/globalTimerSlice";
import { MdTimer } from "react-icons/md";
 

export const Timer = forwardRef(
  (
    {
      clientId,
      jobId,
      setIsShow,
      note,
      pageName,
      taskName,
      taskLink,
      setNote,
      department,
      clientName,
      companyName,
      JobHolderName,
      projectName,
      task,
      activity,
      setActivity,
      reload,

      allocatedTime,
      setTaskIdForNote,
      
      setIsNonChargeable,
      setIsSubmitting,

      stateSetter,
    },
    ref
  ) => {
    

    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth.auth);
    const timer = useSelector((state) => state.globalTimer.timer);


 

 
    console.log("TImer", {
       taskName,
      taskLink,
      setNote,
      clientName,
      companyName,
      department,
      JobHolderName,
      projectName,
      task,
      pageName,
      note
    })
 
 
    

const start = () => {
  dispatch(startTimer({
    clientId,
    jobId,
     
    task,
    clientName,
    companyName,
    department,
    
    pageName, 
    taskLink,
  }));
}


 
     
 
 

    return (
      <>
        <div className="w-full h-full relative">
          <div className="flex items-center gap-[2px]  ">
            <div className="flex space-x-4">
              {(timer?.isRunning && timer?.jobId === jobId) ? (
              <div className="flex items-center justify-center">
    <MdTimer className="h-6 w-6 text-green-600 animate-bob" />
  </div>
              ) : (
                <button
                  onClick={start}
                   disabled={timer?.isRunning}
                  className={`flex items-center justify-center ${
                    timer?.isRunning ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <FaCirclePlay className={`h-6 w-6  ${timer?.isRunning ? "text-gray-500" : "text-sky-500 hover:text-sky-600"}`} />
                </button>
              )}
            </div>
 
          </div>
        </div>
      </>
    );
  }
);
