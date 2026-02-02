import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../context/socketProvider";
import { getNotifications } from "../../../redux/slices/notificationSlice";
import { getRemindersCount } from "../../../redux/slices/reminderSlice";

export const useSocketNotifications = (
  getTimerStatus,
  isNotificationAllowed
) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.auth);
  const { settings } = useSelector((state) => state.settings);

  const leaderChannelRef = useRef(null);
  const isLeaderRef = useRef(false);
  const notificationSound = useRef(null);
  const reminderSound = useRef(null);

  // Initialize audio
  useEffect(() => {
    notificationSound.current = new Audio("/noti.mp3");
    reminderSound.current = new Audio("/reminder.wav");
  }, []);

  // Leader election
  useEffect(() => {
    leaderChannelRef.current = new BroadcastChannel("notification-leader");

    const becomeLeader = () => {
      isLeaderRef.current = true;
      leaderChannelRef.current.postMessage({ type: "LEADER_ACTIVE" });
    };

    const timer = setTimeout(becomeLeader, 300);

    leaderChannelRef.current.onmessage = (e) => {
      if (e.data?.type === "LEADER_ACTIVE") {
        isLeaderRef.current = false;
        clearTimeout(timer);
      }
    };

    return () => {
      leaderChannelRef.current.close();
      clearTimeout(timer);
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !auth?.user?.id) return;

    const handleNewTimer = () => getTimerStatus();

    const handleNewNotification = (payload) => {
      const notification = payload?.notification;
      if (!notification) return;

      if (!isNotificationAllowed(notification.type)) return;

      // Always sync redux in ALL tabs
      dispatch(getNotifications(auth.user.id));

      // Non-leader tabs stop here
      if (!isLeaderRef.current) return;

      // Play sound
      if (notificationSound.current) {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play().catch(() => {});
      }

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification("New Notification", {
          body: notification.title || "You have a new update",
          icon: "/logo.png",
          badge: "/logo.png",
        });
      }
    };

    const handleNewReminder = () => {
      dispatch(getRemindersCount());

      if (!isLeaderRef.current) return;

      if (reminderSound.current) {
        reminderSound.current.currentTime = 0;
        reminderSound.current.play().catch(() => {});
      }
    };

    socket.on("newTimer", handleNewTimer);
    socket.on("newNotification", handleNewNotification);
    socket.on("reminder:refresh", handleNewReminder);

    return () => {
      socket.off("newTimer", handleNewTimer);
      socket.off("newNotification", handleNewNotification);
      socket.off("reminder:refresh", handleNewReminder);
    };
  }, [socket, settings, auth?.user?.id, dispatch, getTimerStatus, isNotificationAllowed]);
};
