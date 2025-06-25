import React, { createContext, useState, useContext, useEffect, useRef } from "react";

const TimerContext = createContext();

const channel = new BroadcastChannel("task-timer-channel"); // ✅


export const TimerProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [task, setTask] = useState("");
  const [taskId, setTaskId] = useState("");
  const [timerId, setTimerId] = useState("");
  //const [endTime, setEndTime] = useState(null);

  const timeoutRef = useRef(null);
  const timeRef = useRef(null);

  const timerRef = useRef();
  // BroadcastChannel for cross-tab sync
  //const channel = new BroadcastChannel("overdue-alert");

  

//   // Listen to other tabs
//   useEffect(() => {
//     channel.onmessage = (event) => {
//       if (event.data.type === "OVERDUE_ALERT") {
//         setIsOverdue(true);
//       }
//     };
//   }, []);

  // Call when task is overdue
//   const triggerOverdue = () => {
//     const now = Date.now();
//     if (!snoozedUntil || now >= snoozedUntil) {
//       setIsOverdue(true);
//       //channel.postMessage({ type: "OVERDUE_ALERT" });
//     }
//   };



 







//   // ---------Stop Timer ----------->
//   const handleStopTimer = () => {
//     if (timerRef.current) {
//       timerRef.current.stopTimer();
//     }


    
//   };


 const stopCountdown = () => {
    localStorage.removeItem(`task-timer`);
    clearTimeout(timeoutRef.current); // Clear existing timeout
    setShowModal(false);

     // 🔁 Inform all other tabs to stop their timers too
    channel.postMessage({ type: "STOP_TIMER" });
    
  };




  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`task-timer`));
    if (saved && saved.endTime) {
         setTask(saved.task);
    setTaskId(saved.taskId);
    setTimerId(saved.timerId);

      const endTime = new Date(saved.endTime);
      const now = new Date();
      //const diff = endTime - now;

      if(now.getTime() > endTime.getTime()) {
        setShowModal(true);
        console.log("Task is overdue!💛💛💛💛💛💛💛💛 💛");
      } else {
        console.log("Task is not overdue yet.");
        scheduleTimeout(endTime);
      }


      
      
    }
  }, []);





const scheduleTimeout = (endTime) => {
    console.log("Scheduling timeout for endTime:", endTime);
  const duration = endTime - new Date();

  console.log("Duration until timeout:", duration);

    if (duration <= 0) {
    setShowModal(true);
    console.log("Task is overdue immediately!💛💛💛💛💛")
    return;
    }

  timeoutRef.current = setTimeout(() => {
    setShowModal(true);
     console.log("Task is overdue!💛💛💛💛💛💛💛💛💛💛💛");
    channel.postMessage({ type: "SHOW_MODAL" }); // ✅ broadcast
  }, duration);
};



const snooze = (SNOOZE_TIME) => {
  const saved = JSON.parse(localStorage.getItem(`task-timer`));

  setTask(saved.task);
    setTaskId(saved.taskId);
    setTimerId(saved.timerId);

  // let newEndTime = new Date(new Date(saved.endTime).getTime() + SNOOZE_TIME * 60000); // Convert minutes to milliseconds

  // if(newEndTime.getTime() < Date.now()) {
  //   newEndTime = new Date(Date.now() + SNOOZE_TIME * 60000);  
  // }


  const newEndTime = new Date(Date.now() + SNOOZE_TIME * 60000);  

  saved.endTime = newEndTime.toISOString();

  localStorage.setItem(`task-timer`, JSON.stringify(saved));

  channel.postMessage({ type: "SNOOZE", });
  //channel.postMessage({ type: "SNOOZE", newEndTime: newEndTime.toISOString() });

  setShowModal(false);
 

  clearTimeout(timeoutRef.current); // Clear existing timeout
  scheduleTimeout(newEndTime);
   
};




const startCountdown = (ALLOCATED_TIME, taskId, task, timerId) => {

    setTask(task);
    setTaskId(taskId);
    setTimerId(timerId);


    console.log("Starting countdown for task:", taskId, ALLOCATED_TIME);


    
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + Number(ALLOCATED_TIME) * 60 * 60000); // Convert hours to milliseconds

    console.log("Start time:", startTime);
    console.log("End time:", endTime);

    localStorage.setItem(
      `task-timer`,
      JSON.stringify({
        taskId,
        task,
        timerId,
        timerStartedAt: startTime.toISOString(),
        endTime: endTime.toISOString()
      })
    );


     channel.postMessage({ type: "START_TIMER", task, timerId });

    scheduleTimeout(endTime);
  };






  useEffect(() => {
  channel.onmessage = (event) => {
    const { type,task, timerId } = event.data;

    if (type === "SHOW_MODAL") {

      
      setShowModal(true);
    }

    if (type === "SNOOZE" ) {
      //const snoozedEndTime = new Date(newEndTime);
      //clearTimeout(timeoutRef.current);
      //scheduleTimeout(snoozedEndTime);
      setShowModal(false);
    }

    if (type === "STOP_TIMER") {
      console.log("[Broadcast] STOP_TIMER received");
      clearTimeout(timeoutRef.current);
      setShowModal(false);
      localStorage.removeItem("task-timer"); // optional: keep tabs in sync
    }

    if(type === "START_TIMER") {
      setTask(task)
      setTimerId(timerId)
    }


  };

  return () => channel.close(); // Cleanup on unmount
}, []);



  return (
    <TimerContext.Provider value={{ showModal, snooze, startCountdown, setShowModal, task, taskId, timerId, stopCountdown,  }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
