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



export const ActiveTimer = () => {


  const { anyTimerRunning, setAnyTimerRunning, auth, setJid } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const isInitialMount = useRef(true);



  
    const fetchRunningTimer = async () => {
       
      try {
        
        const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/timer/running-timer/${auth?.user?.id}`);
  
        const { _id, startTime, endTime, isRunning } = data.timer;
  
        console.log("Timer:", data.timer);
  
        if (startTime && !endTime) {
          setIsRunning(isRunning);
          const timeElapsed = Math.floor(
            (new Date() - new Date(startTime)) / 1000
          );
          setElapsedTime(timeElapsed);
        }
  
      } catch (error) {
        console.log(error)
      }
  
    }



  useEffect(() => {
    if (isInitialMount.current) {
      fetchRunningTimer();
      isInitialMount.current = false;
    }


    // eslint-disable-next-line
  }, [isRunning, elapsedTime]);










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



  //----------------- Display time in Favicon right side--------------

  useEffect(() => {
    if (isRunning) {
      const hours = Math.floor(elapsedTime / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((elapsedTime % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (elapsedTime % 60).toString().padStart(2, "0");
      // setTime(`${hours}:${minutes}:${seconds}`);
      document.title = `${hours}:${minutes}:${seconds} ⏱`;
    } else {
      document.title = "Affotax-CRM";
    }
    // eslint-disable-next-line
  }, [isRunning, elapsedTime]);



  return (
    <>
      <div className="hidden">

      </div>
    </>
  );



}