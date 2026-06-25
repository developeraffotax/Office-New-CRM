// NEW: single source of truth for which bucket a notification belongs to
export const getNotificationCategory = (item) => {
  if (
    item.type === "ticket_received" ||
    item.type === "email_received"
  ) {
    return "inbox";
  }

  if (item.type === "whatsapp_lead" || item.type === "message_received") {
    return "whatsapp";
  }

  return "crm";
};




export   const isNotificationAllowed = (notificationType,  settings) => {

  
  const { showCrmNotifications = true, showEmailNotifications = true, showWhatsappNotifications = true } =
    settings || {};


    const category = getNotificationCategory({ type: notificationType,   });

    if (category === "inbox") return showEmailNotifications;
    if (category === "whatsapp") return showWhatsappNotifications;
    return showCrmNotifications;
  };
