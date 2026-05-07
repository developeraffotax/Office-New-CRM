// utils/sendOtpEmail.js

import { getGmailClient } from "../emailModule/services/gmail.service.js";










// function buildRawEmail({ to, subject, html }) {
//   // Generate a unique ID to prevent Gmail from threading it with old OTPs
//   const messageId = `<${Date.now()}@affotax.com>`;
  
//   const messageParts = [
//     `From: "Affotax Security" <info@affotax.com>`, // Explicit sender name
//     `To: ${to}`,
//     `Message-ID: ${messageId}`, 
//     `Subject: ${subject}`,
//     `MIME-Version: 1.0`,
//     `Content-Type: text/html; charset=UTF-8`,
//     ``,
//     html,
//   ];

//   const raw = messageParts.join("\r\n");
//   return Buffer.from(raw)
//     .toString("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=+$/, "");
// }


 

// ─── Build raw RFC 2822 message ──────────────────────────────────────────────
function buildRawEmail({ to, subject, html }) {
  const messageParts = [
    //`From: "Affotax Security" <info@affotax.com>`, 
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
  ];

  const raw = messageParts.join("\r\n");

  // Gmail API requires base64url encoding
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ─── OTP Email HTML Template (Affotax Light Edition) ─────────────────────────────
function buildOtpEmailHtml({ userName, otp, expiryMinutes = 10 }) {
  // Brand color from your logo
  const brandOrange = "#ff7f45"; 

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%;">

          <!-- Logo Section -->
          <tr>
            <td style="padding-bottom: 32px;" align="center">
              <div style="width: 200px;">
                <svg aria-label="Affotax Logo" width="200" viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1.62,0,0,1.62,-0.25,-24.82)" fill="${brandOrange}">
                    <path d="M17.44 35.04 l-9 0 l-1.76 4.96 l-6.52 0 l9.8 -24.48 l6 0 l9.8 24.48 l-6.56 0 z M10.4 29.48 l5.08 0 l-2.52 -7.12 z M28.997 15.52 l18.2 0 l0 5.56 l-12.2 0 l0 3.92 l9.8 0 l0 5.56 l-9.8 0 l0 9.44 l-6 0 l0 -24.48 z M51.394 15.52 l18.2 0 l0 5.56 l-12.2 0 l0 3.92 l9.8 0 l0 5.56 l-9.8 0 l0 9.44 l-6 0 l0 -24.48 z M84.711 34.64 c4.36 0 6.6 -2.8 6.6 -6.88 c0 -4.32 -2.4 -6.88 -6.6 -6.88 c-4.4 0 -6.6 2.8 -6.6 6.88 c0 4.24 2.44 6.88 6.6 6.88 z M84.711 40.2 c-7.52 0 -12.6 -5.12 -12.6 -12.44 c0 -7.56 5.32 -12.44 12.6 -12.44 c7.56 0 12.6 5.08 12.6 12.44 c0 7.6 -5.28 12.44 -12.6 12.44 z M100.388 15.52 l20.4 0 l0 5.56 l-7.2 0 l0 18.92 l-6 0 l0 -18.92 l-7.2 0 l0 -5.56 z M139.865 35.04 l-9 0 l-1.76 4.96 l-6.52 0 l9.8 -24.48 l6 0 l9.8 24.48 l-6.56 0 z M132.825 29.48 l5.08 0 l-2.52 -7.12 z M160.942 32.64 l-5 7.36 l-7 0 l8.52 -12.52 l-8.12 -11.96 l7 0 l4.6 6.8 l4.6 -6.8 l7 0 l-8.08 11.96 l8.48 12.52 l-7 0 z"></path>
                  </g>
                  <!-- Changed fill to dark slate for light theme visibility -->
                  <g transform="matrix(0.96,0,0,0.96,-1.1,52.59)" fill="#0f172a">
                    <path d="M4.14 13.26 l0 6.74 l-3 0 l0 -12.24 l3 0 l3.82 6.76 l3.82 -6.76 l3 0 l0 12.24 l-3 0 l0 -6.74 l-2.32 3.98 l-3 0 z M27.4495 17.52 l-4.5 0 l-0.88 2.48 l-3.26 0 l4.9 -12.24 l3 0 l4.9 12.24 l-3.28 0 z M23.9295 14.74 l2.54 0 l-1.26 -3.56 z M35.619 7.76 l3 0 l0 5.74 l3.94 -5.74 l3.72 0 l-4.28 6.12 l4.44 6.12 l-3.68 0 l-4.14 -5.76 l0 5.76 l-3 0 l0 -12.24 z M50.0485 7.76 l3 0 l0 12.24 l-3 0 l0 -12.24 z M65.898 7.76 l3 0 l0 12.24 l-3 0 l-4.8 -7.16 l0 7.16 l-3 0 l0 -12.24 l3 0 l4.8 7.16 l0 -7.16 z M84.8075 12.5 l0 6.8 c-1.42 0.54 -3.2 0.84 -4.72 0.84 c-3.9 0 -6.52 -2.34 -6.52 -6.2 c0 -4.22 3.14 -6.28 6.98 -6.28 c0.26 0 0.54 0 0.86 0.02 c0.3 0.02 0.62 0.06 0.96 0.08 c0.62 0.08 1.24 0.16 1.84 0.34 l0 3.06 c-0.22 -0.1 -0.46 -0.18 -0.74 -0.26 c-0.3 -0.06 -0.6 -0.12 -0.92 -0.18 c-0.64 -0.12 -1.32 -0.16 -1.98 -0.16 c-2.54 0 -4 0.78 -4 3.38 c0 2.54 1.34 3.3 3.62 3.3 c0.24 0 0.5 -0.02 0.78 -0.04 c0.26 -0.02 0.54 -0.04 0.84 -0.06 l0 -1.86 l-2.6 0 l0 -2.78 l5.6 0 z M95.9665 7.76 l10.2 0 l0 2.78 l-3.6 0 l0 9.46 l-3 0 l0 -9.46 l-3.6 0 l0 -2.78 z M118.096 17.52 l-4.5 0 l-0.88 2.48 l-3.26 0 l4.9 -12.24 l3 0 l4.9 12.24 l-3.28 0 z M114.576 14.74 l2.54 0 l-1.26 -3.56 z M131.0255 16.32 l-2.5 3.68 l-3.5 0 l4.26 -6.26 l-4.06 -5.98 l3.5 0 l2.3 3.4 l2.3 -3.4 l3.5 0 l-4.04 5.98 l4.24 6.26 l-3.5 0 z M15NS.6245 17.52 l-4.5 0 l-0.88 2.48 l-3.26 0 l4.9 -12.24 l3 0 l4.9 12.24 l-3.28 0 z M152.1045 14.74 l2.54 0 l-1.26 -3.56 z M163.794 7.76 l9.1 0 l0 2.78 l-6.1 0 l0 1.96 l4.9 0 l0 2.78 l-4.9 0 l0 4.72 l-3 0 l0 -12.24 z M177.3835 7.76 l9.1 0 l0 2.78 l-6.1 0 l0 1.96 l4.9 0 l0 2.78 l-4.9 0 l0 4.72 l-3 0 l0 -12.24 z M196.433 17.32 c2.18 0 3.3 -1.4 3.3 -3.44 c0 -2.16 -1.2 -3.44 -3.3 -3.44 c-2.2 0 -3.3 1.4 -3.3 3.44 c0 2.12 1.22 3.44 3.3 3.44 z M196.433 20.1 c-3.76 0 -6.3 -2.56 -6.3 -6.22 c0 -3.78 2.66 -6.22 6.3 -6.22 c3.78 0 6.3 2.54 6.3 6.22 c0 3.8 -2.64 6.22 -6.3 6.22 z M210.3825 10.58 l0 2.92 l2.8 0 c0.92 0 1.46 -0.54 1.46 -1.46 s-0.54 -1.46 -1.46 -1.46 l-2.8 0 z M214.9225 15.48 c0.56 0.76 1.12 1.52 1.7 2.26 c0.56 0.74 1.12 1.5 1.68 2.26 l-3.66 0 c-0.72 -0.96 -1.42 -1.92 -2.12 -2.88 c-0.7 -0.94 -1.42 -1.9 -2.14 -2.86 l0 5.74 l-3 0 l0 -12.24 l5.8 0 c2.28 0 4.22 1.74 4.22 4.04 c0 1.62 -1 3.04 -2.48 3.68 z M226.652 20 l-4.3 0 l0 -12.24 l4.3 0 c3.74 0 6.3 2.44 6.3 6.12 c0 3.78 -2.7 6.12 -6.3 6.12 z M225.352 10.54 l0 6.68 l1.3 0 c2.12 0 3.3 -1.34 3.3 -3.34 c0 -0.46 -0.06 -0.88 -0.18 -1.3 c-0.52 -1.46 -1.66 -2.04 -3.12 -2.04 l-1.3 0 z M245.1815 17.52 l-4.5 0 l-0.88 2.48 l-3.26 0 l4.9 -12.24 l3 0 l4.9 12.24 l-3.28 0 z M241.6615 14.74 l2.54 0 l-1.26 -3.56 z M262.371 13.72 c0.88 0.62 1.4 1.54 1.4 2.62 c0 2.08 -1.92 3.66 -3.92 3.66 l-6.5 0 l0 -12.24 l6.1 0 c1.6 0 2.92 0.86 3.62 2.28 c0.2 0.46 0.3 0.92 0.3 1.4 c0 0.9 -0.36 1.64 -1 2.28 z M256.351 10.54 l0 1.96 l3.1 0 c0.52 0 0.92 -0.5 0.92 -1 c0 -0.52 -0.38 -0.96 -0.92 -0.96 l-3.1 0 z M256.351 15.28 l0 1.94 l3.5 0 c0.54 0 0.92 -0.44 0.92 -0.96 c0 -0.26 -0.1 -0.5 -0.28 -0.7 c-0.18 -0.18 -0.4 -0.28 -0.64 -0.28 l-3.5 0 z M277.3605 17.22 l0 2.78 l-9.1 0 l0 -12.24 l3 0 l0 9.46 l6.1 0 z M281.67 7.76 l9.1 0 l0 2.78 l-6.1 0 l0 1.96 l4.9 0 l0 2.78 l-4.9 0 l0 1.94 l6.1 0 l0 2.78 l-9.1 0 l0 -12.24 z"></path>
                  </g>
                </svg>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
              
              <!-- Accent Top Bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: ${brandOrange}; height: 4px; font-size: 0; line-height: 4px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Content Body -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 40px;">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;">
                      🔐 Verify your login
                    </h1>
                    
                    <p style="margin: 0 0 32px; font-size: 15px; color: #475569; text-align: center; line-height: 1.6;">
                      Hi <span style="color:#0f172a; font-weight: 600;">${userName}</span>, enter the verification code below to access your account.
                    </p>

                    <!-- OTP Section -->
                    <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
                      <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${brandOrange}; margin-bottom: 16px;">
                        One-Time Password
                      </div>
                      
                      <div style="font-size: 52px; font-weight: 800; letter-spacing: 14px; color: #0f172a; line-height: 1; padding-left: 14px; margin-bottom: 24px;">
                        ${otp}
                      </div>

                      <div style="display: inline-block; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 100px; padding: 6px 16px; font-size: 12px; color: ${brandOrange}; font-weight: 600;">
                        ⏱ Valid for ${expiryMinutes} minutes
                      </div>
                    </div>

                    <!-- Security Alert -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 16px; font-size: 13px; color: #64748b; line-height: 1.5; border-left: 4px solid ${brandOrange}; text-align: left;">
                          <strong style="color: #0f172a;">Security Alert:</strong> Never share this code with anyone. Affotax employees will never ask for this code via phone or chat.
                        </td>
                      </tr>
                    </table>

                    <div style="border-top: 1px solid #f1f5f9; margin-bottom: 24px;"></div>

                    <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
                      This is an automated message. If you did not request this code, please ignore this email or contact our security team.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px;" align="center">
              <p style="margin:0; font-size:12px; color:#94a3b8; letter-spacing: 0.025em; text-align: center;">
                © ${new Date().getFullYear()} Affotax. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}







// ─── Simple Transactional OTP Email Template ─────────────────────────────

// function buildOtpEmailHtml({ userName, otp, expiryMinutes = 10 }) {
//   const brandOrange = "#ff7f45";

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Verification Code</title>
// </head>

// <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111827;">

//   <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
//     <tr>
//       <td align="center">

//         <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

//           <!-- Small Brand -->
//           <tr>
//             <td style="padding-bottom:24px;text-align:center;">
//               <div style="font-size:20px;font-weight:700;color:${brandOrange};">
//                 Affotax
//               </div>
//             </td>
//           </tr>

//           <!-- Main Content -->
//           <tr>
//             <td style="border:1px solid #e5e7eb;padding:32px 24px;border-radius:8px;">

//               <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#111827;text-align:center;">
//                 Verification Code
//               </h1>

//               <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4b5563;text-align:center;">
//                 Hi ${userName},
//                 use the verification code below to sign in to your Affotax account.
//               </p>

//               <!-- OTP -->
//               <div style="text-align:center;margin:32px 0;">

//                 <div style="
//                   display:inline-block;
//                   padding:16px 24px;
//                   border:1px solid #e5e7eb;
//                   border-radius:8px;
//                   background:#f9fafb;
//                   font-size:36px;
//                   letter-spacing:10px;
//                   font-weight:700;
//                   color:#111827;
//                 ">
//                   ${otp}
//                 </div>

//               </div>

//               <p style="margin:0 0 20px;font-size:13px;color:#6b7280;text-align:center;">
//                 This code expires in ${expiryMinutes} minutes.
//               </p>

              

//             </td>
//           </tr>
 

//         </table>

//       </td>
//     </tr>
//   </table>

// </body>
// </html>
//   `;
// }






// ─── Main exported function ───────────────────────────────────────────────────
// export async function sendOtpEmail({ to, userName, otp, expiryMinutes = 10 }) {
//   const gmail = await getGmailClient("affotax");

//   const html = buildOtpEmailHtml({ userName, otp, expiryMinutes });

//   const raw = buildRawEmail({
//     to,
//     subject: `${otp} is your verification code`,
//     html,
//   });

//   await gmail.users.messages.send({
//     userId: "me",
//     requestBody: { raw },
//   });
// }






export async function sendOtpEmail({ to, userName, otp, expiryMinutes = 10 }) {
  const gmail = await getGmailClient("affotax");
  const html = buildOtpEmailHtml({ userName, otp, expiryMinutes });

  const raw = buildRawEmail({
    to,
    subject: `${otp} is your verification code`,
    html,
  });

  // 1. Send the email
  const sentMessage = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  // 2. If sending to yourself/alias, manually add the INBOX label
  // This bypasses the "Self-Sent" archive logic
  if (to.includes("affotax.com")) {
    await gmail.users.messages.batchModify({
      userId: "me",
      requestBody: {
        ids: [sentMessage.data.id],
        addLabelIds: ["INBOX", "UNREAD"],
      },
    });
  }

  return sentMessage.data;
}