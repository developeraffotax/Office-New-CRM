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
import { openJobModal, openModal, openTicketModal } from "../../../redux/slices/globalModalSlice";

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



 // Open ticket modal if entityType is ticket
    if (item.entityType === "ticket") {
      dispatch(
        openModal({
          modal: "ticket",
          data: { ticketId: item.taskId   }, // adjust field if needed
        })
      );
      setOpen(false);
      return;
    }

    // Open job modal if entityType is job (optional)
    if (item.entityType === "job") {
      dispatch(
        openModal({
          modal: "job",
          data: { clientId: item.taskId },
        })
      );
      setOpen(false);
      return;
    }


     if (item.entityType === "task") {
      dispatch(
        openModal({
          modal: "task",
          data: { taskId: item.taskId },
        })
      );
      setOpen(false);
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
 
    isNotificationAllowed,
  };
};
