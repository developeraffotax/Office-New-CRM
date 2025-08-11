import { fetchReminders, incrementUnreadCount, setReminderData, setShowReminder } from "../redux/slices/reminderSlice";

export const registerReminderListener = (socket, dispatch) => {
  if (!socket) return;

  socket.on("receive_reminder", (data) => {
    console.log("Reminder received:", data);
    dispatch(setShowReminder(true));
    dispatch(setReminderData(data));
    dispatch(incrementUnreadCount());
    dispatch(fetchReminders());

    const audio = new Audio("/beep.mp3");
    audio.play().catch((err) => console.log("Audio play failed:", err));
  });

  return () => {
    socket.off("receive_reminder");
  };
};