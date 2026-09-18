import {
  base64UrlToBase64,
  cleanMessageHtmlAggressive,
  decodeBase64,
  extractAttachments,
  flattenParts,
  inlineImages,
} from "./utility.js";

export const processMessage = async (message, accessToken, companyName) => {
  const parts = message.payload.parts?.length
    ? flattenParts(message.payload.parts)
    : [];

  // Decode raw HTML first
  let rawDecodedMessage = "";
  if (message.payload.body?.data) {
    rawDecodedMessage = decodeBase64(
      base64UrlToBase64(message.payload.body.data || "")
    );
  } else if (parts.length) {
    for (const part of parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        rawDecodedMessage += decodeBase64(base64UrlToBase64(part.body.data || ""));
      }
    }
  }

  // Extract attachments against the RAW html (before cid: refs get swapped out)
  const attachments = await extractAttachments(parts, message.id, accessToken, rawDecodedMessage);

  // Now inline the images that are actually referenced
  const decodedMessage = await inlineImages(
    rawDecodedMessage,
    parts,
    message.id,
    accessToken,
    companyName
  );

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