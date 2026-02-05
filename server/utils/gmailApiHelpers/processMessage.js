import {
  base64UrlToBase64,
  cleanMessageHtmlAggressive,
  decodeBase64,
  extractAttachments,
  flattenParts,
  inlineImages,
} from "./utility.js";

export const processMessage = async (message, accessToken) => {
  const parts = message.payload.parts?.length
    ? flattenParts(message.payload.parts)
    : [];

  // ---------------------------
  // Decode HTML body
  // ---------------------------
  let decodedMessage = "";

  if (message.payload.body?.data) {
    decodedMessage = decodeBase64(
      base64UrlToBase64(message.payload.body.data || "")
    );
  } else if (parts.length) {
    for (const part of parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        decodedMessage += decodeBase64(base64UrlToBase64(part.body.data || ""));
      }
    }
  }

  // ---------------------------
  // Replace inline images (cid: or inline base64)
  // ---------------------------
  decodedMessage = await inlineImages(
    decodedMessage,
    parts,
    message.id,
    accessToken
  );

  // ---------------------------
  // Clean message HTML
  // ---------------------------
  // decodedMessage = cleanMessageHtmlAggressive(decodedMessage);
  // ---------------------------
  // Extract attachments (non-inline)
  // ---------------------------
  const attachments = await extractAttachments(parts, message.id, accessToken);

  // ---------------------------
  // Detect if message is sent by me
  // ---------------------------
  const fromHeader =
    message.payload.headers?.find((h) => h.name.toLowerCase() === "from")
      ?.value || "";
  const sentByMe = [
    "info@affotax.com",
    "Affotax Team <info@affotax.com>",
    "Affotax <info@affotax.com>",
    "Affotax Accountants <info@affotax.com>",
    "Outsource Accountings <admin@outsourceaccountings.co.uk>",
    "admin@outsourceaccountings.co.uk",
  ].includes(fromHeader);

  // ---------------------------
  // Return processed message
  // ---------------------------
  return {
    ...message,
    payload: {
      ...message.payload,
      body: {
        ...message.payload.body,
        data: decodedMessage,
        sentByMe,
        messageAttachments: attachments,
      },
    },
  };
};
