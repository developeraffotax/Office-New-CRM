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

