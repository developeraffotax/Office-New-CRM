import axios from "axios";

// ---------------------------
// Base64 Helpers
// ---------------------------
const base64UrlToBase64 = (b64url) => {
  if (!b64url) return b64url;
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
};

const decodeBase64 = (b64) => Buffer.from(b64, "base64").toString("utf-8");

// ---------------------------
// Gmail Message Helpers
// ---------------------------
const stripQuotedText = (html) => {
  if (!html) return html;

  html = html.replace(/<div class="gmail_quote">([\s\S]*?)<\/div>/gi, "");
  html = html.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "");
  html = html.replace(/^On .* wrote:$/gim, "");
  html = html.replace(/^>.*$/gm, "");

  return html.trim();
};

const flattenParts = (parts = []) => {
  const out = [];
  for (const p of parts) {
    out.push(p);
    if (p.parts && p.parts.length) out.push(...flattenParts(p.parts));
  }
  return out;
};

// ---------------------------
// Fetch attachment
// ---------------------------
const fetchAttachmentData = async (messageId, attachmentId, accessToken) => {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return base64UrlToBase64(response.data?.data || "");
  } catch (err) {
    console.error("Error fetching attachment data:", err?.message);
    return null;
  }
};

// ---------------------------
// Fetch EXTERNAL image & convert to base64
// (fixes googleusercontent signature images)
// ---------------------------
const fetchExternalImageAsBase64 = async (imgUrl) => {
  try {
    const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
    const mime = res.headers["content-type"] || "image/png";
    const base64 = Buffer.from(res.data).toString("base64");
    return `data:${mime};base64,${base64}`;
  } catch (err) {
    console.error("External image fetch failed:", imgUrl);
    return null;
  }
};

// ---------------------------
// Convert message HTML into cleaner format
// ---------------------------
const cleanMessageHtml = (html) => {
  if (!html) return "";

  // Remove quoted message
  html = stripQuotedText(html);

  // Normalize line endings
  html = html.replace(/\r\n|\r/g, "\n");

  // Replace 2+ newlines with EXACTLY one blank line
  html = html.replace(/\n{2,}/g, "\n\n");

  // Split paragraphs by blank line
  const paragraphs = html
    .split(/\n{2}/)
    .map((p) => p.trim())
    .filter((p) => p.length);

  // Convert single newlines inside a paragraph → <br>
  const finalHtml = paragraphs
    .map((p) => {
      const withBr = p.replace(/\n/g, "<br>");
      return `<p style="margin:0 0 10px; line-height:1.5;">${withBr}</p>`;
    })
    .join("");

  return finalHtml;
};

const normalizeMessageHtml = (html) => {
  if (!html) return "";

  let clean = html;

  // Remove meta and style tags
  clean = clean.replace(/<meta[\s\S]*?>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove empty <p> or <div> (with only <br> or whitespace)
  clean = clean.replace(/<(p|div)>(\s|&nbsp;|<br>)*<\/\1>/gi, "");

  // Collapse multiple <br> into one
  clean = clean.replace(/(<br\s*\/?>\s*){2,}/gi, "<br>");

  // Remove excessive margin/padding in p tags
  clean = clean.replace(/<p[^>]*>/gi, "<p style='margin:0; padding:0;'>");

  // Trim leading/trailing whitespace
  clean = clean.trim();

  return clean;
};

// ---------------------------
// Convert message HTML into cleaner format
// Aggressively removes quoted text, empty tags, multiple <br>, meta/style tags, and collapses spacing
// ---------------------------
const cleanMessageHtmlAggressive = (html) => {
  if (!html) return "";

  let clean = html;

  // 1️⃣ Remove Gmail/Outlook quoted text
  clean = stripQuotedText(clean);

  // 2️⃣ Remove meta and style tags
  clean = clean.replace(/<meta[\s\S]*?>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 3️⃣ Normalize line endings
  clean = clean.replace(/\r\n|\r/g, "\n");

  // 4️⃣ Remove empty <p> or <div> (with only <br> or whitespace)
  clean = clean.replace(/<(p|div)>(\s|&nbsp;|<br>)*<\/\1>/gi, "");

  // 5️⃣ Collapse multiple <br> into one
  clean = clean.replace(/(<br\s*\/?>\s*){2,}/gi, "<br>");

  // 6️⃣ Remove excessive margin/padding in <p> tags
  clean = clean.replace(/<p[^>]*>/gi, "<p style='margin:0; padding:0;'>");

  // 7️⃣ Trim leading/trailing whitespace
  clean = clean.trim();

  // 8️⃣ Optional: wrap remaining text into <p> tags for spacing consistency
  const paragraphs = clean
    .split(/<br>\s*<br>/i)
    .map((p) => p.trim())
    .filter((p) => p.length);
  clean = paragraphs
    .map((p) => `<p style="margin:0 0 10px; line-height:1.5;">${p}</p>`)
    .join("");

  return clean;
};

// ---------------------------
// Extract non-inline attachments
// ---------------------------
const extractAttachments = async (parts, messageId, accessToken) => {
  const attachments = [];

  for (const part of parts) {
    const contentIdHeader = part.headers?.find(
      (h) => h.name.toLowerCase() === "content-id"
    )?.value;

    const dispositionHeader = part.headers?.find(
      (h) => h.name.toLowerCase() === "content-disposition"
    )?.value;

    const isInline =
      (dispositionHeader &&
        dispositionHeader.toLowerCase().includes("inline"))


    // const filename = part.filename;
    // const mimeType = part.mimeType;

    // let isInline = false;

    // if (dispositionHeader) {
    //   const disp = dispositionHeader.toLowerCase();
    //   if (disp.includes("inline")) isInline = true;
    //   if (disp.includes("attachment")) isInline = false;
    // } else {
    //   // Fallback rules when Content-Disposition is missing
    //   if (!filename && mimeType?.startsWith("image/")) {
    //     // Image with no filename = signature / inline CID image
    //     isInline = true;
    //   } else {
    //     // If filename exists -> probably real attachment
    //     isInline = false;
    //   }
    // }

    if (part.filename && part.body?.attachmentId && !isInline) {
      attachments.push({
        attachmentId: part.body.attachmentId,
        attachmentMessageId: messageId,
        attachmentFileName: part.filename,
        attachmentHeaders: part.headers || [],
        mimeType: part.mimeType,
      });
    }
  }

  return attachments;
};

// ---------------------------
// Inline ALL images (CID, FILENAME, OUTLOOK IDs, EXTERNAL)
// ---------------------------
const inlineImages = async (decodedMessage, parts, messageId, accessToken) => {
  // 1️⃣ Gmail inline image parts
  for (const part of parts) {
    const cidHeader = part.headers?.find(
      (h) => h.name.toLowerCase() === "content-id"
    )?.value;

    const dispHeader = part.headers?.find(
      (h) => h.name.toLowerCase() === "content-disposition"
    )?.value;

    const isInline =
      (dispHeader && dispHeader.toLowerCase().includes("inline")) ||
      !!cidHeader;

    if (part.mimeType?.startsWith("image/") && part.body) {
      let dataUrl = null;

      if (part.body.attachmentId) {
        const b64 = await fetchAttachmentData(
          messageId,
          part.body.attachmentId,
          accessToken
        );
        if (b64) dataUrl = `data:${part.mimeType};base64,${b64}`;
      } else if (part.body.data) {
        const b64 = base64UrlToBase64(part.body.data);
        dataUrl = `data:${part.mimeType};base64,${b64}`;
      }

      if (dataUrl) {
        if (cidHeader) {
          const cid = cidHeader.replace(/[<>]/g, "");
          decodedMessage = decodedMessage.replace(
            new RegExp(`cid:${cid}`, "gi"),
            dataUrl
          );
        }

        if (part.filename) {
          decodedMessage = decodedMessage.replace(
            new RegExp(part.filename, "gi"),
            dataUrl
          );
        }
      }
    }
  }

  // 2️⃣ EXTERNAL SIGNATURE IMAGES (googleusercontent URLs)
  const externalImgRegex =
    /<img[^>]+src="(https:\/\/[^"]+googleusercontent\.com[^"]+)"[^>]*>/gi;

  const uniqueUrls = new Set();
  let match;

  while ((match = externalImgRegex.exec(decodedMessage)) !== null) {
    uniqueUrls.add(match[1]);
  }

  for (const url of uniqueUrls) {
    const base64 = await fetchExternalImageAsBase64(url);
    if (base64) {
      decodedMessage = decodedMessage.replace(
        new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        base64
      );
    }
  }

  // 3️⃣ OUTLOOK SIGNATURE ID FIX (_x0000_i1025 etc)
  decodedMessage = decodedMessage.replace(/id="_x0000_i\d+"/g, "");

  return decodedMessage;
};

export {
  decodeBase64,
  base64UrlToBase64,
  flattenParts,
  extractAttachments,
  inlineImages,
  stripQuotedText,
  cleanMessageHtmlAggressive,
  fetchAttachmentData,
};
