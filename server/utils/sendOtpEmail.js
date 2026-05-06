// utils/sendOtpEmail.js

import { getGmailClient } from "../emailModule/services/gmail.service.js";

 

// ─── Build raw RFC 2822 message ──────────────────────────────────────────────
function buildRawEmail({ to, subject, html }) {
  const messageParts = [
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

// ─── OTP Email HTML Template ─────────────────────────────────────────────────
function buildOtpEmailHtml({ userName, otp, expiryMinutes = 10 }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f13; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f13; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%;">

          <!-- Logo / Brand bar -->
          <tr>
            <td style="padding-bottom: 28px;" align="center">
              <span style="
                display: inline-block;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #fff;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 3px;
                text-transform: uppercase;
                padding: 8px 20px;
                border-radius: 100px;
              ">Your CRM</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="
              background: #18181f;
              border: 1px solid #2a2a35;
              border-radius: 16px;
              overflow: hidden;
            ">

              <!-- Top accent bar -->
              <tr>
                <td style="
                  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
                  height: 4px;
                  display: block;
                  line-height: 4px;
                  font-size: 0;
                ">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 44px 48px 40px;">

                  <!-- Shield icon -->
                  <div style="text-align:center; margin-bottom: 28px;">
                    <div style="
                      display: inline-block;
                      background: linear-gradient(135deg, #1e1e2e, #2a2040);
                      border: 1px solid #3d3560;
                      border-radius: 50%;
                      width: 64px;
                      height: 64px;
                      line-height: 64px;
                      text-align: center;
                      font-size: 28px;
                    ">🔐</div>
                  </div>

                  <!-- Heading -->
                  <h1 style="
                    margin: 0 0 8px;
                    font-size: 24px;
                    font-weight: 700;
                    color: #f1f1f5;
                    text-align: center;
                    letter-spacing: -0.3px;
                  ">Verify your login</h1>

                  <p style="
                    margin: 0 0 32px;
                    font-size: 15px;
                    color: #8b8b9e;
                    text-align: center;
                    line-height: 1.6;
                  ">Hi <strong style="color:#c4c4d4">${userName}</strong>, enter the code below inside your CRM to complete sign-in.</p>

                  <!-- OTP box -->
                  <div style="
                    background: linear-gradient(135deg, #1c1c28, #21213a);
                    border: 1px solid #3b3b55;
                    border-radius: 12px;
                    padding: 28px 24px;
                    text-align: center;
                    margin-bottom: 32px;
                  ">
                    <div style="
                      font-size: 13px;
                      font-weight: 600;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                      color: #6366f1;
                      margin-bottom: 14px;
                    ">Your verification code</div>

                    <div style="
                      font-size: 52px;
                      font-weight: 800;
                      letter-spacing: 14px;
                      color: #f1f1f5;
                      line-height: 1;
                      padding-left: 14px; /* optical balance for letter-spacing */
                    ">${otp}</div>

                    <div style="
                      margin-top: 16px;
                      display: inline-block;
                      background: #2a1f3d;
                      border: 1px solid #4a3a6e;
                      border-radius: 100px;
                      padding: 5px 14px;
                      font-size: 12px;
                      color: #a78bfa;
                      font-weight: 500;
                    ">⏱ Expires in ${expiryMinutes} minutes</div>
                  </div>

                  <!-- Warning note -->
                  <div style="
                    background: #1e1a14;
                    border: 1px solid #3d3020;
                    border-radius: 8px;
                    padding: 14px 18px;
                    margin-bottom: 32px;
                  ">
                    <p style="
                      margin: 0;
                      font-size: 13px;
                      color: #a08060;
                      line-height: 1.6;
                    ">⚠️ <strong style="color:#c4a070">Never share this code</strong> with anyone. Our team will never ask for your verification code.</p>
                  </div>

                  <!-- Divider -->
                  <div style="border-top: 1px solid #2a2a35; margin-bottom: 28px;"></div>

                  <!-- Footer note -->
                  <p style="
                    margin: 0;
                    font-size: 13px;
                    color: #55556a;
                    text-align: center;
                    line-height: 1.7;
                  ">If you didn't attempt to sign in, you can safely ignore this email.<br/>Someone may have entered your email by mistake.</p>

                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top: 28px;" align="center">
            <p style="margin:0; font-size:12px; color:#3a3a4a; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} Your CRM · All rights reserved
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

// ─── Main exported function ───────────────────────────────────────────────────
export async function sendOtpEmail({ to, userName, otp, expiryMinutes = 10 }) {
  const gmail = await getGmailClient("affotax");

  const html = buildOtpEmailHtml({ userName, otp, expiryMinutes });

  const raw = buildRawEmail({
    to,
    subject: `${otp} is your verification code`,
    html,
  });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}