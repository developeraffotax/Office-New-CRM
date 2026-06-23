// src/components/SocketListeners.js
import { useEffect } from "react";

import { registerReminderListener } from "../listeners/reminderListener";
import { useDispatch } from "react-redux";
import { useSocket } from "../context/socketProvider";
import { registerShiftEndListener } from "../listeners/shiftEndListener";
import { registerPermissionListener } from "../listeners/permissionListener";

export default function SocketListeners() {
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    // ✅ Register all socket event listeners here
    const cleanupReminder = registerReminderListener(socket, dispatch);
    const cleanupShiftEnd = registerShiftEndListener(socket, dispatch);
    const cleanupPermission = registerPermissionListener(socket, dispatch);

    // ✅ Cleanup all listeners on unmount or socket change
    return () => {
      cleanupReminder?.();
      cleanupShiftEnd?.();
      cleanupPermission?.();
    };
  }, [socket, dispatch]); // include dispatch so it's always the latest

  return null;
}
