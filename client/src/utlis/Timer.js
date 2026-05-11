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
import { startCountdown,  } from "../redux/slices/timerSlice";
import {
  fetchGlobalTimer,
  startTimer,
  stopTimer,
} from "../redux/slices/globalTimerSlice";
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
      entityType,
      metadata,
    },
    ref,
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
      note,
    });

const start = async () => {
  try {
    const timer = await dispatch(
      startTimer({
        clientId,
        jobId,
        task,
        clientName,
        companyName,
        department,
        entityType,
        metadata,
        pageName,
        taskLink,
      })
    ).unwrap();

     

    if (entityType === "task") {
      dispatch(
        startCountdown(
          allocatedTime,
          jobId,
          task,
          timer._id // ✅ here
        )
      );
    }
  } catch (err) {
    console.error(err);
     toast.error(err, { style: { borderRadius: '8px', background: '#333', color: '#fff', }, iconTheme: { primary: '#ff4b4b', secondary: '#fff', }, });
  }
};

    return (
      <div className="w-full h-full relative">
        <div className="flex items-center gap-[2px]  ">
          <div className="flex space-x-4">
            {timer?.isRunning && timer?.jobId === jobId ? (
              <button
                title="Timer running on this task!"
                className="flex items-center justify-center animate-badge-pop"
              >
                <MdTimer className="h-6 w-6 text-sky-500 animate-pulse" />
              </button>
            ) : (
              <button
                title={
                  timer?.isRunning ? "Another timer is running!" : "Start Timer"
                }
                onClick={start}
                disabled={timer?.isRunning}
                className={`flex items-center justify-center  ${
                  timer?.isRunning ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <FaCirclePlay
                  className={`h-6 w-6 transition-colors duration-500  ${
                    timer?.isRunning
                      ? "text-gray-400"
                      : "text-sky-500 hover:text-sky-600"
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
