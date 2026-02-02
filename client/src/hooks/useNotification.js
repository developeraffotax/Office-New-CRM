import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications } from "../redux/slices/notificationSlice";
import { getRemindersCount } from "../redux/slices/reminderSlice";
import { useSocket } from "../context/socketProvider";

/**
 * One-tab-only browser notification hook
 */
export default function useNotification() {
  const socket = useSocket();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth.auth);
  const { settings } = useSelector((state) => state.settings);

  const {
    showCrmNotifications = true,
    showEmailNotifications = true,
  } = settings || {};

  const isNotificationAllowed = (type) => {
    if (type === "ticket_received") return showEmailNotifications;
    return showCrmNotifications;
  };

  // 🔊 Sounds
  const notificationSoundRef = useRef(new Audio("/noti.mp3"));
  const reminderSoundRef = useRef(new Audio("/reminder.wav"));

  // 🧠 Leader election
  const leaderChannelRef = useRef(null);
  const isLeaderRef = useRef(false);

  /* ---------------- Notification Permission ---------------- */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  /* ---------------- Leader Election ---------------- */
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

  /* ---------------- Socket Listeners ---------------- */
  useEffect(() => {
    if (!socket || !auth?.user?.id) return;

    const handleNewNotification = (payload) => {
      const notification = payload?.notification;
      if (!notification) return;

      if (!isNotificationAllowed(notification.type)) return;

      // Always update Redux (all tabs)
      dispatch(getNotifications(auth.user.id));

      // 🔔 Only leader shows browser notification
      if (!isLeaderRef.current) return;

      // 🔊 Sound
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(() => {});

      // 🖥️ Chrome Notification
      if (Notification.permission === "granted") {
        new Notification("New Notification", {
          body: notification.title || "You have a new update",
          icon: "/logo.png",
          badge: "/logo.png",
        });
      }
    };

    const handleReminderRefresh = () => {
      dispatch(getRemindersCount());

      if (!isLeaderRef.current) return;

      reminderSoundRef.current.currentTime = 0;
      reminderSoundRef.current.play().catch(() => {});
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("reminder:refresh", handleReminderRefresh);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("reminder:refresh", handleReminderRefresh);
    };
  }, [socket, auth?.user?.id, settings]);
}
