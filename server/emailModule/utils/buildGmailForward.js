import crypto from "crypto";

function buildForwardSubject(subject = "") {
  const s = subject.trim();
  if (/^fwd(\[\d+\])?:/i.test(s)) return s;
  return `Fwd: ${s}`;
}

export function buildGmailForward({
  to = [],
  cc = [],
  bcc = [],
  subject,
  html,
  forwardedHtml = "",
  attachments = [] // include originals
}) {
  const boundary = crypto.randomBytes(16).toString("hex");

  const mimeHeaders = [
    `To: ${to.join(", ")}`,
    cc.length ? `Cc: ${cc.join(", ")}` : "",
    bcc.length ? `Bcc: ${bcc.join(", ")}` : "",
    `Subject: ${buildForwardSubject(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ]
    .filter(Boolean)
    .join("\r\n");

  let body = `--${boundary}
Content-Type: text/html; charset="UTF-8"

${html}
${forwardedHtml}
`;

  // loop through all attachments (new + original)
  for (const file of attachments) {
    body += `
--${boundary}
Content-Type: ${file.mimeType}; name="${file.filename}"
Content-Disposition: attachment; filename="${file.filename}"
Content-Transfer-Encoding: base64

${file.base64}
`;
  }

  body += `\r\n--${boundary}--`;

  const raw = Buffer.from(`${mimeHeaders}\r\n\r\n${body}`)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return raw;
}
