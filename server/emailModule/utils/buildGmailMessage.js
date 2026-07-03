import MailComposer from "nodemailer/lib/mail-composer/index.js";

/**
 * Build a raw Gmail MIME message.
 *
 * @param {Object} options
 * @returns {Promise<string>} Gmail Base64URL encoded raw message
 */
export async function buildGmailMessage({
  from,
  fromName,

  sender,

  to = [],
  cc = [],
  bcc = [],

  subject = "",

  text,
  html,
  watchHtml,
  amp,

  replyTo,

  inReplyTo,
  references,

  attachments = [],

  alternatives = [],

  headers = {},

  priority,

  date,

  messageId,

  list,

  encoding,
  textEncoding,
}) {
  const mail = new MailComposer({
    // from: from
    //   ? fromName
    //     ? `"${fromName}" <${from}>`
    //     : from
    //   : fromName
    //   ? `"${fromName}" <me>`
    //   : undefined,

    // sender,

    to: Array.isArray(to) ? to.join(", ") : to,

    cc: Array.isArray(cc) ? cc.join(", ") : cc,

    bcc: Array.isArray(bcc) ? bcc.join(", ") : bcc,

    subject,

    text,

    html,

    watchHtml,

    amp,

    replyTo,

    inReplyTo,

    references,

    attachments,

    alternatives,

    headers,

    priority,

    date,

    messageId,

    list,

    encoding,

    textEncoding,
  });

  return new Promise((resolve, reject) => {
    mail.compile().build((err, message) => {
      if (err) {
        return reject(err);
      }

      const raw = message
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      resolve(raw);
    });
  });
}