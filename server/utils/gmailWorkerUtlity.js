export const parseMessageHeaders = (gmailMsg) => {
  const headers = gmailMsg.payload.headers;

  const fromRaw =
    headers.find((h) => h.name.toLowerCase() === "from")?.value || "";
  const match = fromRaw.match(/(.*)<(.+?)>/);

  return {
    fromName: match ? match[1].trim() : fromRaw,
    fromEmail: match ? match[2].trim() : fromRaw,
  };
};




export const normalizeEmail = (raw = "") =>
  String(raw)
    .toLowerCase()
    .replace(/.*<(.+)>/, "$1")
    .replace(/"/g, "")
    .trim();





export const getLatestMessageStatus = (latestMsg, ourEmails) => {
  const parsedLatest = parseMessageHeaders(latestMsg);
  const latestFrom = normalizeEmail(
    parsedLatest.fromEmail || parsedLatest.from || ""
  );

  // Determine status
  let lastMessageStatus = "Read";

  if (ourEmails.includes(latestFrom)) {
    lastMessageStatus = "Sent";
  } else if (latestMsg.labelIds?.includes("UNREAD")) {
    lastMessageStatus = "Unread";
  }

  return lastMessageStatus;
};




export const getLatestSentMessageByUs = (messages, ourEmails) => {
  let latestSentMsg = null;

  for (const msg of messages) {
    try {
      const p = parseMessageHeaders(msg);
      const from = normalizeEmail(p.fromEmail || p.from || "");

      if (ourEmails.includes(from)) {
        if (
          !latestSentMsg ||
          parseInt(msg.internalDate) > parseInt(latestSentMsg.internalDate)
        ) {
          latestSentMsg = msg;
        }
      }
    } catch {
      // ignore parse issues
    }
  }

  return latestSentMsg;
};
