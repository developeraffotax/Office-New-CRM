import crypto from "crypto";


function buildReplySubject(subject = "") {
  const s = subject.trim();
  if (/^re(\[\d+\])?:/i.test(s)) return s;
  return `Re: ${s}`;
}


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
    // replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${subject ? buildReplySubject(subject) : ""}`,
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









//${quotedHtml}
// function buildGmailAttribution({ fromName, fromEmail, date }) {
//   const formattedDate = new Date(date).toLocaleString("en-US", {
//     weekday: "short",
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//     hour: "numeric",
//     minute: "2-digit"
//   });

//   return `
// <div class="gmail_attr">
//   On ${formattedDate} ${fromName || fromEmail} &lt;${fromEmail}&gt; wrote:
// </div>
// `;
// }







// function buildGmailQuotedHtml({
//   previousHtml,
//   fromName,
//   fromEmail,
//   date
// }) {
//   if (!previousHtml) return "";

//   return `
// <br />
// ${buildGmailAttribution({ fromName, fromEmail, date })}
// <div class="gmail_quote">
//   <blockquote
//     class="gmail_quote"
//     style="margin:0 0 0 .8ex;border-left:1px solid #ccc;padding-left:1ex">
//     ${previousHtml}
//   </blockquote>
// </div>
// `;
// }
