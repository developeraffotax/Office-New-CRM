import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import axios from "axios";
import { FaCirclePlay } from "react-icons/fa6";
import { IoStopCircle } from "react-icons/io5";
import { useAuth } from "../context/authContext";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export const Timer = forwardRef(
  (
    { clientId, jobId, setIsShow, note, pageName, taskName, taskLink, setNote },
    ref
  ) => {
    const { anyTimerRunning, setAnyTimerRunning, auth, setTime } = useAuth();
    const [timerId, setTimerId] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [totalTime, setTotalTime] = useState(null);
    const isInitialMount = useRef(true);
    console.log("Note:", note);

    useEffect(() => {
      const fetchTimerStatus = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/timer/status`,
            {
              params: { clientId, jobId },
            }
          );
          const { _id, startTime, endTime } = response.data.timer;

          if (startTime && !endTime) {
            setTimerId(_id);
            setStartTime(new Date(startTime));
            setIsRunning(true);
            setAnyTimerRunning(true);
            const timeElapsed = Math.floor(
              (new Date() - new Date(startTime)) / 1000
            );
            setElapsedTime(timeElapsed);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // fetchTimerStatus();
      if (isInitialMount.current) {
        fetchTimerStatus();
        isInitialMount.current = false;
      }

      const timeId = localStorage.getItem("timer_Id");
      setTimerId(JSON.parse(timeId));
    }, [clientId, jobId, setAnyTimerRunning]);

    // ---------Timer-------
    useEffect(() => {
      let intervalId;

      if (isRunning) {
        intervalId = setInterval(() => {
          setElapsedTime((prevTime) => prevTime + 1);
        }, 1000);
      }

      return () => clearInterval(intervalId);
    }, [isRunning]);

    const startTimer = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/start/timer`,
          {
            clientId,
            jobId,
            note: `Started work on ${pageName}`,
          }
        );
        setTimerId(response.data.timer._id);
        localStorage.setItem(
          "timer_Id",
          JSON.stringify(response.data.timer._id)
        );
        addTimerTaskStatus();
        setIsRunning(true);
        setStartTime(new Date());
        setAnyTimerRunning(true);
        // Send Socket Timer
        socketId.emit("timer", {
          clientId: clientId,
          jobId: jobId,
          note: "Started work on job",
        });
      } catch (error) {
        console.error("Error starting timer:", error);
      }
    };

    const stopTimer = async () => {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timerId}`,
          { note }
        );
        setIsRunning(false);
        setAnyTimerRunning(false);
        setNote("");
        removeTimerStatus();
        setIsShow(false);
        setTimerId(null);
        setElapsedTime(0);
        gettotalTime(timerId);
        localStorage.removeItem("timer_Id");
        // Send Socket Timer
        socketId.emit("timer", {
          timerId: timerId,
          note: note,
        });
      } catch (error) {
        console.error("Error stopping timer:", error);
      }
    };

    const gettotalTime = async (id) => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/total_time/${id}`,
          {
            params: { jobId },
          }
        );
        setTotalTime(data.totalTime);
      } catch (error) {
        console.log(error);
      }
    };

    useImperativeHandle(ref, () => ({
      stopTimer,
    }));

    // -----------Timer Status--------->
    const addTimerTaskStatus = async () => {
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/timer_task/status`,
          { userId: auth.user.id, taskName, pageName, taskLink, taskId: jobId }
        );
      } catch (error) {
        console.log(error);
      }
    };

    // --------Remove Timer-------
    const removeTimerStatus = async () => {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/remove/timer_task/Status/${auth.user.id}`
        );
      } catch (error) {
        console.log(error);
      }
    };

    return (
      <>
        <div className="w-full h-full relative">
          <div className="flex items-center gap-[2px]  ">
            <div className="flex space-x-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  disabled={anyTimerRunning}
                  className={`flex items-center justify-center ${
                    anyTimerRunning ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <FaCirclePlay className="h-6 w-6  text-sky-500 hover:text-sky-600 " />
                </button>
              ) : (
                <button
                  onClick={() => setIsShow(true)}
                  disabled={!isRunning}
                  className="flex items-center justify-center  disabled:cursor-not-allowed"
                >
                  <IoStopCircle className="h-6 w-6  text-red-500 hover:text-red-600 animate-pulse " />
                </button>
              )}
            </div>
            {isRunning && (
              <div className="text-[13px] text-gray-800 font-semibold ">
                {Math.floor(elapsedTime / 3600)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor((elapsedTime % 3600) / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(elapsedTime % 60).toString().padStart(2, "0")}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);
