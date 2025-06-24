import React, { useEffect, useState } from "react";
import { useTimer } from "../context/timerContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import toast from "react-hot-toast";
 



const OverdueModal = () => {

        const { anyTimerRunning, setAnyTimerRunning, auth, setJid } = useAuth();

    const { showModal, setShowModal, snooze, taskId, task, timerId, stopCountdown,  } = useTimer();
     const navigate = useNavigate();
   
        const [isNote, setIsNote] = useState(false);
        const [note, setNote] = useState("");


         // --------Remove Timer Status-------
         const removeTimerStatus = async () => {
           try {
             await axios.delete(
               `${process.env.REACT_APP_API_URL}/api/v1/timer/remove/timer_task/Status/${auth.user.id}`
             );
           } catch (error) {
             console.log(error);
           }
         };
     
        // --------------Stop Timer----------->
        const stopTimer = async () => {
          if (!timerId) {
            return;
          }
          try {
            const { data } = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timerId}`,
              {
                note: note || "Auto stop due to inactivity!",
                activity:
                  task.trim() === "Training"
                    ? "Non-Chargeable"
                    :  "Chargeable",
              }
            );
    
            if (data) {
    
              
                setShowModal(false);
                setIsNote(false);

                setNote("");
                stopCountdown()

                
              removeTimerStatus();
              localStorage.removeItem("timer_Id");
              setAnyTimerRunning(false);
            //   setIsShow(false);
            //   gettotalTime(timerId);
            //   setTimerId(null);
            //   setElapsedTime(0);
            //   setIsRunning(false);
            //   setRunningId("");
              
            //   setNote("");
            //   setActivity("Chargeable");
              localStorage.removeItem("jobId");
              toast.success("Timer stoped successfully!");

                
                if(typeof window !== "undefined"){
                    window.location.reload();

                }
            }
          } catch (error) {
            console.error("Error stopping timer:", error);
            toast.error(error.response?.data?.message);
          }
        };





  if (!showModal) return null;

  

  return (
<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
  <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4 max-w-md w-full">
    <h2 className="text-2xl font-semibold text-red-600">⏰ Time's Up!</h2>
    <p>Your task has exceeded its allocated time.</p>
    <p className="text-lg font-medium">Task: {task}</p>

    <div className="flex flex-wrap justify-center gap-4">
      <button
        onClick={() => snooze(5)}
        className="bg-yellow-400 px-4 py-2 rounded hover:bg-yellow-500"
      >
        Snooze 5 min
      </button>
      <button
        onClick={() => snooze(1)}
        className="bg-yellow-400 px-4 py-2 rounded hover:bg-yellow-500"
      >
        Snooze 1 min
      </button>
      <button
        onClick={() => setIsNote(true)}
        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        Stop Timer
      </button>
      {/* <button
        onClick={() => snooze(0)}
        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        Dismiss
      </button> */}
    </div>

    {/* 📝 Note Section Appears Below Buttons */}
    {isNote && (
      <div className="mt-6 text-left space-y-4">
        <h2 className="text-xl font-semibold">Add Note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-24 p-2 border rounded"
          placeholder="Enter your note here..."
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setIsNote(false)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={stopTimer}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Submit
          </button>
        </div>
      </div>
    )}
  </div>
</div>

  );
};

export default OverdueModal;
