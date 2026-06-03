// utils/mediaKeyBuilder.js

export const MIME_EXT_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/3gpp": "3gp",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "image/gif": "gif",
  "sticker/webp": "webp",
};

export const extensionFromMime = (mime) => {
  if (!mime) return "bin";
  const base = mime.split(";")[0].trim().toLowerCase();
  return MIME_EXT_MAP[base] ?? "bin";
};

/**
 * Builds a uniform S3 key path for all WhatsApp attachments.
 * Layout: whatsapp-media/{phone}/{YYYY-MM-DD}/{fileId}.{ext}
 */
export const buildS3Key = (phone, fileId, mimeType) => {
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "unknown";
  const date = new Date().toISOString().split("T")[0];
  const ext = extensionFromMime(mimeType);
  
  return `whatsapp-media/${cleanPhone}/${date}/${fileId}.${ext}`;
};