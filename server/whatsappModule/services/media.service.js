import axios from "axios";
 
import { getS3 } from "../../utils/s3/s3Client.js";

 
import WhatsappMessage from "../models/WhatsappMessage.js";
import logger from "../utils/logger.js";
 import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // 👈 Import the presigner
import { buildS3Key, extensionFromMime } from "../utils/mediaKeyBuilder.js";
 
 
 
 
 


 


const GRAPH_API_VERSION = "v25.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
 
 

export const serveMedia = async (req, res) => {
  const { messageId } = req.params;

  try {
    // ── Fetch message ───────────────────────────────────────────
    const message = await WhatsappMessage.findById(messageId)
      .select("media conversationId type")
      .lean();

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.media?.s3Key) {
      return res.status(404).json({ error: "No media attached to this message" });
    }

     
    // ── Fetch from Wasabi ───────────────────────────────────────
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key:    message.media.s3Key,
    });

    let s3Response;
    try {
      s3Response = await getS3().send(command);
    } catch (err) {
      // S3 NoSuchKey — file was deleted or key is wrong
      if (err.name === "NoSuchKey") {
        logger.error("[Media] s3Key not found in Wasabi", {
          messageId,
          s3Key: message.media.s3Key,
        });
        return res.status(404).json({ error: "Media file not found in storage" });
      }
      throw err; // rethrow anything else to outer catch
    }

    // ── Headers ─────────────────────────────────────────────────
    res.setHeader("Content-Type",  message.media.mimeType || "application/octet-stream");
    res.setHeader("Cache-Control", "private, max-age=3600");

    if (s3Response.ContentLength) {
      res.setHeader("Content-Length", s3Response.ContentLength);
    }

    if (message.media.filename) {
      // inline   → browser renders it  (images, audio, video, pdf)
      // attachment → browser downloads it (everything else)
      const renderable = ["image/", "audio/", "video/", "application/pdf"];
      const disposition = renderable.some((prefix) =>
        message.media.mimeType?.startsWith(prefix)
      )
        ? "inline"
        : "attachment";

      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${message.media.filename}"`
      );
    }

    logger.info("[Media] Streaming media", {
      messageId,
      s3Key:    message.media.s3Key,
      mimeType: message.media.mimeType,
      userId:   req.user?.user?._id,
    });

    // ── Stream ───────────────────────────────────────────────────
    // Destroy the S3 stream if the client disconnects early
    // so we don't keep pulling bytes from Wasabi for nothing
    req.on("close", () => {
      if (!res.writableEnded) {
        s3Response.Body.destroy();
        logger.info("[Media] Client disconnected early — stream destroyed", { messageId });
      }
    });

    s3Response.Body.pipe(res);

  } catch (err) {
    logger.error("[Media] Failed to serve media", {
      messageId,
      err: err.message,
      stack: err.stack,
    });

    // Only send error response if headers haven't been flushed yet
    // (pipe may have already started writing)
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve media" });
    }
  }
};





















export const uploadMediaBuffer = async (file, phone) => {
  try {
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    
    // ── Generate the Uniform S3 Key ─────────────────────────────────
    const key = buildS3Key(phone, uniqueId, file.mimetype);
    const s3Client = getS3();

    // 1. Upload the object to your private bucket
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // 2. Generate a Presigned GET URL valid for 15 minutes for Meta download engine
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    logger.info("[Media] Outbound file uploaded", { key });

    // Return BOTH the key (to save to MongoDB as s3Key) and the url (to pass to Meta)
    return { s3Key: key, presignedUrl }; 
  } catch (error) {
    logger.error("[Media] Error uploading file buffer to Wasabi", { error: error.message });
    throw new Error(`Failed to upload file to storage: ${error.message}`);
  }
};




















 
export const downloadAndStoreMedia = async (mediaId, mimeType, phone) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  // ── Step 1: Resolve media URL from Graph API ─────────────────────
  const { data: mediaMeta } = await axios.get(`${GRAPH_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // mediaMeta.url is a temporary (~5 min) direct download URL
  const { url: tempUrl, file_size } = mediaMeta;

  // ── Step 2: Download raw bytes ────────────────────────────────────
  const { data: fileBuffer, headers } = await axios.get(tempUrl, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "arraybuffer",
  });

  const contentType = headers["content-type"] || mimeType;
  const ext         = extensionFromMime(contentType);

  // ── Step 3: Build a clean Wasabi key ─────────────────────────────
  // whatsapp-media/{phone}/{YYYY-MM-DD}/{mediaId}.{ext}
  const date = new Date().toISOString().split("T")[0];
  //const key  = `whatsapp-media/${phone}/${date}/${mediaId}.${ext}`;
  const key = buildS3Key(phone, mediaId, contentType);


 
  // ── Step 4: Upload to Wasabi ──────────────────────────────────────
  await getS3().send(
    new PutObjectCommand({
      Bucket:      process.env.S3_BUCKET,
      Key:         key,
      Body:        Buffer.from(fileBuffer),
      ContentType: contentType,
    })
  );

  // Build a permanent URL (no expiry — adjust if your bucket is private)
  //const wasabiUrl = `https://s3.${process.env.AWS_REGION}.wasabisys.com/${process.env.S3_BUCKET}/${key}`;

  logger.info("[Media] Stored to Wasabi", { mediaId, key, file_size });

  return { key };
};
 