/**
 * Thin wrapper around the Meta WhatsApp Cloud API.
 * No DB logic here — just HTTP.
 */

const BASE_URL = "https://graph.facebook.com/v25.0";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
});

/**
 * Send any message payload to a recipient.
 * Returns the raw Meta response { messages: [{ id }], contacts: [...] }
 */
export const sendWhatsappPayload = async (phoneNumberId, payload) => {
  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      ...payload,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data?.error?.message ?? "WhatsApp API error");
    err.code = data?.error?.code;
    err.meta = data;
    throw err;
  }

  return data; // { messages: [{ id: "wamid.xxx" }] }
};

/** Send a plain text message */
export const sendTextMessage = (phoneNumberId, to, text, previewUrl = false) =>
  sendWhatsappPayload(phoneNumberId, {
    to,
    type: "text",
    text: { body: text, preview_url: previewUrl },
  });

/** Send an image by URL */
export const sendImageMessage = (phoneNumberId, to, imageUrl, caption = "") =>
  sendWhatsappPayload(phoneNumberId, {
    to,
    type: "image",
    image: { link: imageUrl, caption },
  });

/** Send a document by URL */
export const sendDocumentMessage = (phoneNumberId, to, docUrl, filename = "", caption = "") =>
  sendWhatsappPayload(phoneNumberId, {
    to,
    type: "document",
    document: { link: docUrl, filename, caption },
  });

/** Send a template message */
export const sendTemplateMessage = (phoneNumberId, to, templateName, languageCode, components = []) =>
  sendWhatsappPayload(phoneNumberId, {
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });