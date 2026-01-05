// export function buildEmailContext(messages) {
//   return messages.map((msg) => {
//     const from = msg.payload.headers.find(h => h.name === "From")?.value;
//     const to = msg.payload.headers.find(h => h.name === "To")?.value;
//     const subject = msg.payload.headers.find(h => h.name === "Subject")?.value;

//     const bodyHtml =
//       msg.payload.body?.data ||
//       msg.payload.parts?.find(p => p.mimeType === "text/html")?.body?.data ||
//       "";

//     return {
//       from,
//       to,
//       subject,
//       sentByMe: msg.payload.body?.sentByMe,
//       body: stripQuotedText(decodeBase64(bodyHtml)),
//     };
//   });
// }

// function decodeBase64(data = "") {
//   return Buffer.from(data, "base64").toString("utf-8");
// }

// // Optional but HIGHLY recommended
// function stripQuotedText(html) {
//   return html
//     .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, "")
//     .replace(/From:.*$/gis, "")
//     .trim();
// }
