import crypto from "crypto";

export function buildGmailReply({
  to = [],
  cc = [],
  bcc = [],
  replyTo,
  subject,
  html,
  quotedHtml,
  headers,
  attachments = []
}) {
  const boundary = crypto.randomBytes(16).toString("hex");

  const mimeHeaders = [
    `To: ${to.join(", ")}`,
    cc.length ? `Cc: ${cc.join(", ")}` : "",
    bcc.length ? `Bcc: ${bcc.join(", ")}` : "",
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: Re: ${subject || ""}`,
    `In-Reply-To: ${headers["Message-Id"]}`,
    `References: ${[
      headers.References,
      headers["Message-Id"]
    ]
      .filter(Boolean)
      .join(" ")}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ]
    .filter(Boolean)
    .join("\r\n");

  let body = `
--${boundary}
Content-Type: text/html; charset="UTF-8"

${html}
${quotedHtml}
`;

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

  const raw = Buffer.from(
    `${mimeHeaders}\r\n\r\n${body}`
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return raw;
}