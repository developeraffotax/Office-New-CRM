export const getHeader = (headers, name) =>
  headers.find(h => h.name === name)?.value || "";



export function extractAttachments(payload) {
  const attachments = [];

  function walk(parts = []) {
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size || 0
        });
      }
      if (part.parts) walk(part.parts);
    }
  }

  walk(payload.parts);
  return attachments;
}




// export function categorizeEmail({ from, subject, to }) {
//   const s = subject.toLowerCase();

//   if (to.some(e => e.email.includes("support@")) || s.includes("help"))
//     return "support";

//   if (s.includes("pricing") || s.includes("quote") || s.includes("demo"))
//     return "lead";

//   return "other";
// }



export function parseEmail(headerValue) {
  if (!headerValue) return { name: "", email: "" };

  // Regex to match: "Name <email>" or just email
  const match = headerValue.match(/(.*)<(.+)>/);

  if (match) {
    return {
      name: match[1].trim().replace(/(^"|"$)/g, ""), // remove quotes
      email: match[2].trim()
    };
  } else {
    return {
      name: "",
      email: headerValue.trim()
    };
  }
}



 

export function parseEmailList(headerValue) {
  if (!headerValue) return [];

  // Gmail headers can be comma-separated
  return headerValue
    .split(",")
    .map(part => parseEmail(part.trim()))
    .filter(e => e.email); // remove empty
}



