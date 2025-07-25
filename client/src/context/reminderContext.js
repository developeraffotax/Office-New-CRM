import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useSocket } from "./socketContext";
import axios from "axios";
import toast from "react-hot-toast";

const ReminderContext = createContext();

const channel = new BroadcastChannel("reminder-channel"); // ✅

export const ReminderProvider = ({ children }) => {

  const [reminders, setReminders] = useState([]);
  const[unread_reminders_count, set_unread_reminders_count] = useState(0)

  const [showReminder, setShowReminder] = useState(false);
  const [reminderData, setReminderData] = useState(null);


  const [loadingReminders, setLoadingReminders] = useState(false);


  const { socket } = useSocket();






  
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("receive_reminder", (data) => {
      console.log("Reminder received:😍😍😍😍😍 ", data);
      setShowReminder(true);
      setReminderData(data);

      set_unread_reminders_count(prev => prev + 1)
      
      fetchReminders();


    
      const audio = new Audio("/beep.mp3");
      if(audio) {
        audio.play().catch((err) => console.log("Audio play failed:", err));

      }
     
    });

    // return () => { socket.off("receive_reminder", getNotifications); };
  }, [socket]);







  const fetchReminders = async () => {
      try {
        setLoadingReminders(true)
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminder`
        );

        console.log(reminders);
        setReminders(data.reminders);
      } catch (error) {
        console.error("Failed to fetch reminders", error);
      } finally {
        setLoadingReminders(false)
      }
    };








  const getRemindersCount = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/remindersCount`
        );

          console.log("Remindersw COunt is 💙💙💚💚💛💛💛", data)
        set_unread_reminders_count(data.remindersCount);
      } catch (error) {
        console.error("Failed to fetch reminders", error);
      }
  }






  const snoozeReminder = async (reminderId, minutes) => {

    if(!reminderId) return;

    
    const newTime = new Date(Date.now() + minutes * 60 * 1000);

    try {
      const { data, status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/${reminderId}`,
        { scheduledAt: newTime.toISOString() }
      );

      if (status === 200) {
        toast.success(`Snoozed for ${minutes} minutes`);
        setShowReminder(false);

        
      }
    } catch (err) {
      toast.error("Failed to snooze reminder");
    }
  };



  const markAsReadReminder = async (reminderId) => {
    try {
      const { data, status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/${reminderId}/markAsRead`
      );

      if (status === 200) {
        toast.success("Marked as Read");
        // setShowReminder(false);

        set_unread_reminders_count(p => p - 1);
        fetchReminders()

      }
    } catch (err) {
      toast.error("Failed to mark as read reminder");
    }
  };




  const completeReminder = async (reminderId) => {
    try {
      const { data, status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/${reminderId}/complete`
      );

      if (status === 200) {
        toast.success("Reminder is marked as completed!");
        setShowReminder(false);

        set_unread_reminders_count(p => p -1);
        fetchReminders()
      }
    } catch (err) {
      toast.error("Failed to stop reminder");
    }
  };




  return (
    <ReminderContext.Provider value={{ showReminder, setShowReminder, reminderData, setReminderData, snoozeReminder, markAsReadReminder, completeReminder, reminders, setReminders, unread_reminders_count, set_unread_reminders_count, getRemindersCount, fetchReminders, loadingReminders }} >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => useContext(ReminderContext);
