import { updateCountdown } from "../redux/slices/timerSlice";



// task over due timer listener
export const registerTaskTimerListener = (socket, dispatch) => {
  if (!socket) return;

  socket.on("update_task_timer", (data) => {
    dispatch(updateCountdown(data.newAllocatedTimeInHours));
  });

  return () => {
    socket.off("update_task_timer");
  };
};
