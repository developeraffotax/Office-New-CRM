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

  const { showCrmNotifications = true, showEmailNotifications = true, showWhatsappNotifications } =
    settings || {};


    //whatsapp_lead
  const isNotificationAllowed = (notificationType) => {
    if (notificationType === "ticket_received" || notificationType === "email_received") {
      return showEmailNotifications;
    }

    if (notificationType === "whatsapp_lead" ) {
      return showWhatsappNotifications;
    }

    return showCrmNotifications;
  };

  const visibleNotifications = notificationData.filter((item) =>
    isNotificationAllowed(item.type)
  );

  const unread_notifications_count = notificationData.filter(
    (n) => n.status === "unread" && isNotificationAllowed(n.type)
  ).length;











const handleNotificationClick = (e, item) => {
  dispatch(
    updateNotification({
      id: item._id,
      userId: auth.user.id,
      status: item.status,
    })
  );

  const isNewTab =
    e?.ctrlKey || // Windows/Linux Ctrl+Click
    e?.metaKey || // Mac Cmd+Click
    e?.button === 1; // Middle mouse click

  // Ticket
  if (item.entityType === "ticket") {
    // if (isNewTab) {
    //   window.open(`/tickets/${item.taskId}`, "_blank");
    //   return;
    // }

    dispatch(
      openModal({
        modal: "ticket",
        data: { ticketId: item.taskId },
      })
    );

    setOpen(false);
    return;
  }

  // Job
  if (item.entityType === "job" && item.type !== "job_assigned") {
    // if (isNewTab) {
    //   window.open(`/jobs/${item.taskId}`, "_blank");
    //   return;
    // }

    dispatch(
      openModal({
        modal: "job",
        data: { clientId: item.taskId },
      })
    );

    setOpen(false);
    return;
  }

  // Task
  if (item.entityType === "task") {
    // if (isNewTab) {
    //   window.open(`/tasks/${item.taskId}`, "_blank");
    //   return;
    // }

    dispatch(
      openModal({
        modal: "task",
        data: { taskId: item.taskId },
      })
    );

    setOpen(false);
    return;
  }

  // Mailbox
  if (item.entityType === "mailbox") {
    const url = `${item.redirectLink}&mailThreadId=${item.taskId}`;

    if (isNewTab) {
      window.open(url, "_blank");
      return;
    }

    setOpen(false);
    return navigate(url);
  }

  // WhatsApp
  if (item.entityType === "whatsapp") {
    const url = item.redirectLink;

    if (isNewTab) {
      window.open(url, "_blank");
      return;
    }

    setOpen(false);
    return navigate(url);
  }

  // Default behaviour
  const url = `${item.redirectLink}?comment_taskId=${item.taskId}`;

  if (isNewTab) {
    window.open(url, "_blank");
    return;
  }

  navigate(url);
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
