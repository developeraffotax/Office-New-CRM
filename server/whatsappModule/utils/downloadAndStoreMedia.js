// // utils/downloadWhatsappMedia.js
// import axios from "axios";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
 
// import logger from "./logger.js";
// import   { getS3 } from "../../utils/s3/s3Client.js";


 


// const GRAPH_API_VERSION = "v25.0";
// const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// /**
//  * Downloads a WhatsApp media file and uploads it to Wasabi.
//  * Returns the Wasabi key and public (or signed) URL.
//  *
//  * @param {string} mediaId   - WhatsApp media_id from the webhook payload
//  * @param {string} mimeType  - e.g. "image/jpeg", "audio/ogg; codecs=opus"
//  * @param {string} phone     - contact phone (used for folder structure)
//  * @returns {{ key: string, wasabiUrl: string }}
//  */
// export const downloadAndStoreMedia = async (mediaId, mimeType, phone) => {
//   const token = process.env.WHATSAPP_ACCESS_TOKEN;

//   // ── Step 1: Resolve media URL from Graph API ─────────────────────
//   const { data: mediaMeta } = await axios.get(`${GRAPH_BASE}/${mediaId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   // mediaMeta.url is a temporary (~5 min) direct download URL
//   const { url: tempUrl, file_size } = mediaMeta;

//   // ── Step 2: Download raw bytes ────────────────────────────────────
//   const { data: fileBuffer, headers } = await axios.get(tempUrl, {
//     headers: { Authorization: `Bearer ${token}` },
//     responseType: "arraybuffer",
//   });

//   const contentType = headers["content-type"] || mimeType;
//   const ext         = extensionFromMime(contentType);

//   // ── Step 3: Build a clean Wasabi key ─────────────────────────────
//   // whatsapp-media/{phone}/{YYYY-MM-DD}/{mediaId}.{ext}
//   const date = new Date().toISOString().split("T")[0];
//   const key  = `whatsapp-media/${phone}/${date}/${mediaId}.${ext}`;


 
//   // ── Step 4: Upload to Wasabi ──────────────────────────────────────
//   await getS3().send(
//     new PutObjectCommand({
//       Bucket:      process.env.S3_BUCKET,
//       Key:         key,
//       Body:        Buffer.from(fileBuffer),
//       ContentType: contentType,
//     })
//   );

//   // Build a permanent URL (no expiry — adjust if your bucket is private)
//   //const wasabiUrl = `https://s3.${process.env.AWS_REGION}.wasabisys.com/${process.env.S3_BUCKET}/${key}`;

//   logger.info("[Media] Stored to Wasabi", { mediaId, key, file_size });

//   return { key };
// };

// // ── Helpers ───────────────────────────────────────────────────────

// const MIME_EXT_MAP = {
//   "image/jpeg":          "jpg",
//   "image/png":           "png",
//   "image/webp":          "webp",
//   "video/mp4":           "mp4",
//   "video/3gpp":          "3gp",
//   "audio/ogg":           "ogg",
//   "audio/mpeg":          "mp3",
//   "audio/mp4":           "m4a",
//   "application/pdf":     "pdf",
//   "application/msword":  "doc",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
//   "application/vnd.ms-excel": "xls",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
//   "image/gif":           "gif",
//   "sticker/webp":        "webp",
// };

// const extensionFromMime = (mime) => {
//   // Strip codecs suffix e.g. "audio/ogg; codecs=opus" → "audio/ogg"
//   const base = mime.split(";")[0].trim().toLowerCase();
//   return MIME_EXT_MAP[base] ?? "bin";
// };