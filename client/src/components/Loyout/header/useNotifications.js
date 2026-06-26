import { useEffect, useMemo, useRef, useState } from "react";
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
import { getNotificationCategory, isNotificationAllowed,  } from "./getNotificationCategory";
import { hasPermission } from "../../../utlis/checkPermission";
import axios from "axios";
import toast from "react-hot-toast";


 


export const useNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.auth);
  const { settings } = useSelector((state) => state.settings);
  const notificationData = useSelector(
    (state) => state.notifications.notificationData
  );

  const NOTIFICATION_TABS = useMemo(() => {
    const list = [
      { key: "all", label: "All" },
      { key: "crm", label: "CRM" },
    ];

    if (hasPermission(auth.user, "Inbox" )) {
      list.push({ key: "inbox", label: "Inbox" });
    }

    if (hasPermission(auth.user, "Whatsapp")) {
      list.push({ key: "whatsapp", label: "WhatsApp" });
    }

    return list;
  }, [auth]);


  const [open, setOpen] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);
    const [activeTab, setActiveTab] = useState("all"); // NEW


  // const { showCrmNotifications = true, showEmailNotifications = true, showWhatsappNotifications = true } =
  //   settings || {};


    //whatsapp_lead
  // const isNotificationAllowed = (notificationType) => {
  //   if (notificationType === "ticket_received" || notificationType === "email_received") {
  //     return showEmailNotifications;
  //   }

  //   if (notificationType === "whatsapp_lead" ) {
  //     return showWhatsappNotifications;
  //   }

  //   return showCrmNotifications;
  // };




  const visibleNotifications = notificationData.filter((item) =>
    isNotificationAllowed(item.type, settings)
  );

  const unread_notifications_count = notificationData.filter(
    (n) => n.status === "unread" && isNotificationAllowed(n.type, settings)
  ).length;




  // NEW: notifications for the currently active tab
const categorizedNotifications =
  activeTab === "all"
    ? visibleNotifications
    : visibleNotifications.filter(
        (item) => getNotificationCategory(item) === activeTab
      );


 // NEW: total + unread counts per tab, for badges
const tabCounts = NOTIFICATION_TABS.reduce((acc, tab) => {
  const itemsInTab =
    tab.key === "all"
      ? visibleNotifications
      : visibleNotifications.filter(
          (item) => getNotificationCategory(item) === tab.key
        );

  acc[tab.key] = {
    total: itemsInTab.length,
    unread: itemsInTab.filter((item) => item.status === "unread").length,
  };
  return acc;
}, {});




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












const ASSIGN_ENDPOINTS = {
  whatsapp: (_id) => `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/update-conversation/${_id}`,
  mailbox: (threadId) =>  `${process.env.REACT_APP_API_URL}/api/v1/gmail/update-thread-via-thread-id/${threadId}`,
};

const assignFromNotification = async(notification, userId) => {
  const buildUrl = ASSIGN_ENDPOINTS[notification.entityType];
  if (!buildUrl) return; // type doesn't support inline assignment
  return axios.put(buildUrl(notification.entityId), { userId: userId });
}
 






 const [assigningId, setAssigningId] = useState(null);
 
const [users, setUsers] = useState([]);

const toggleAssignDropdown = (notificationId) => {
  setAssigningId((prev) => (prev === notificationId ? null : notificationId));
};

const handleAssignUser = async (notification, userId) => {

  console.log({
    notification,
    userId
  })
  try {
 
    setAssigningId(null);
    toast.success('Updated!');
    await assignFromNotification(notification, userId);
    // simplest correct approach: refetch so the panel reflects the
    // server-confirmed assignee (same "read-time enrichment" idea as before).
    // If you'd rather avoid the refetch, add a small reducer to patch
    // the matching notification by taskId/entityId instead.
     dispatch(getNotifications(auth.user.id));
  } catch (err) {
    console.log("ERROR", err)
     
  }
};



  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      // setUsers(
      //   data?.users?.filter((user) =>
      //     user.role?.access?.some((item) =>
      //       item?.permission?.includes("Whatsapp")
      //     )
      //   ) || []
      // );

      setUsers(data?.users)


    } catch (error) {
      console.log(error);
    }
  };





useEffect(() => {
getAllUsers()
}, [])

















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

        categorizedNotifications, // NEW
    activeTab,                // NEW
    setActiveTab,             // NEW
    tabCounts,                // NEW
    tabs: NOTIFICATION_TABS,  // NEW

    assigningId,
toggleAssignDropdown,
handleAssignUser,
users
 

  };
};
