// Helper — put above renderMessageConten
export const getSenderLabel = (msg, users) => {
  if (msg.direction === "inbound") return null;

  const parts = [];

  // Who sent it
  if (msg.userId) {
    // Try to find agent name from team prop
    const user = users?.find?.(
      (user) => user._id === msg.userId
    );
    parts.push(user?.name);
  }  

  // Where it was sent from
  if (msg.sentFrom === "crm") {
    parts.push("via CRM");
  } else if (msg.sentFrom === "external") {
    parts.push("via External");
  }

  return parts.join(" · ");
};