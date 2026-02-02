import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  dismissNotification,
  getNotifications,
  updateNotification,
  dismissAllNotification,
  updateAllNotification,
} from "../../../redux/slices/notificationSlice";
import { setFilterId } from "../../../redux/slices/authSlice";
import { openTicketModal } from "../../../redux/slices/ticketModalSlice";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.auth);
  const { settings } = useSelector((state) => state.settings);
  const notificationData = useSelector(
    (state) => state.notifications.notificationData
  );

  const [open, setOpen] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);

  const { showCrmNotifications = true, showEmailNotifications = true } =
    settings || {};

  const isNotificationAllowed = (notificationType) => {
    if (notificationType === "ticket_received") {
      return showEmailNotifications;
    }
    return showCrmNotifications;
  };

  const visibleNotifications = notificationData.filter((item) =>
    isNotificationAllowed(item.type)
  );

  const unread_notifications_count = notificationData.filter(
    (n) => n.status === "unread" && isNotificationAllowed(n.type)
  ).length;

  const handleNotificationClick = (item) => {
    dispatch(
      updateNotification({
        id: item._id,
        userId: auth.user.id,
        status: item.status,
      })
    );

    if (item.type === "ticket_received") {
      setOpenTicketId(item.taskId);
      return;
    }

    navigate(`${item.redirectLink}?comment_taskId=${item.taskId}`);
    dispatch(setFilterId(item.taskId));
    setOpen(false);
  };

  const handleDismissNotification = (item) => {
    dispatch(
      dismissNotification({
        id: item._id,
        userId: auth.user.id,
      })
    );
  };

  const handleDismissAll = () => {
    dispatch(dismissAllNotification(auth.user.id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(updateAllNotification(auth.user.id));
  };

  const handleTicketView = (taskId) => {
    dispatch(openTicketModal(taskId));
    setOpen(false);
  };

  useEffect(() => {
    if (auth?.user?.id) {
      dispatch(getNotifications(auth.user.id));
    }
  }, [auth.user, dispatch, settings]);

  return {
    open,
    setOpen,
    openTicketId,
    setOpenTicketId,
    visibleNotifications,
    unread_notifications_count,
    handleNotificationClick,
    handleDismissNotification,
    handleDismissAll,
    handleMarkAllAsRead,
    handleTicketView,
    isNotificationAllowed,
  };
};
