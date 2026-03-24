import { useEffect } from "react";
import { useSocket } from "../../../context/socketProvider";

export function useSocketSync(getAllTasks) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("task_updated", getAllTasks);
    return () => socket.off("task_updated", getAllTasks); // ← fixes the bug
  }, [socket, getAllTasks]);
}
