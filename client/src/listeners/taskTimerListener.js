 
import { updateCountdown } from "../redux/slices/timerSlice";

export const registerTaskTimerListener = (socket, dispatch) => {
  if (!socket) return;

  socket.on("update_task_timer", (data) => {
    console.log("update_task_timer received💜💜💜💜💜💜:", data);
     
      dispatch(updateCountdown(data.newAllocatedTimeInHours))
     
  });

  return () => {
    socket.off("update_task_timer");
  };
};