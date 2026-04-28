import toast from "react-hot-toast";
import { stopCountdown } from "../redux/slices/timerSlice";
import { fetchGlobalTimer } from "../redux/slices/globalTimerSlice";

 
export const registerShiftEndListener = (socket, dispatch) => {
  if (!socket) return;

  socket.on("timer:autoStopped", (data) => {
    console.log("Shift end timer received:", data);

    dispatch(stopCountdown());
    dispatch(fetchGlobalTimer());


    toast.success("Your shift has ended. Timer stopped automatically.", {
      duration: 5000,
    });

    const audio = new Audio("/beep.mp3");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  });

  return () => {
    socket.off("timer:autoStopped");
  };
};