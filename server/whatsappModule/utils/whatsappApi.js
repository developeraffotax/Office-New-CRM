import axios from "axios";
/**
 * Thin wrapper around the Meta WhatsApp Cloud API.
 * No DB logic here — just HTTP.
 */

const BASE_URL = "https://graph.facebook.com/v25.0";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
});

 
export const sendWhatsappPayload = async (phoneNumberId, payload) => {
  const url = `${BASE_URL}/${phoneNumberId}/messages`;

 

  try {
    const { data } = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        ...payload,
      },
      {
        headers: headers(),
      }
    );

    return data; // { messages: [{ id: "wamid.xxx" }] }
  } catch (error) {
    const apiError = error.response?.data;

    const err = new Error(
      apiError?.error?.message ?? error.message ?? "WhatsApp API error"
    );

    err.code = apiError?.error?.code;
    err.meta = apiError;

    throw err;
  }
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