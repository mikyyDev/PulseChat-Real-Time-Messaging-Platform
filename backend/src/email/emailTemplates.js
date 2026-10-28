export function createWelcomeEmailTemplate(name, clientURL) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to PulseChat</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    body { margin:0; padding:0; width:100% !important; background:#f0f4f8; font-family:'Inter',Arial,sans-serif; }
    .wrapper { width:100%; table-layout:fixed; background:#f0f4f8; padding:40px 0; }
    .card { max-width:560px; margin:auto; background:rgba(255,255,255,0.85); backdrop-filter:blur(12px); border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.1); }
    .header { background:linear-gradient(135deg, #6366f1, #3b82f6, #14b8a6); padding:24px; text-align:center; color:#fff; }
    .header h1 { margin:0; font-size:24px; font-weight:700; }
    .content { padding:32px 28px; color:#374151; line-height:1.6; }
    .content h2 { margin:0 0 12px; font-size:20px; font-weight:600; color:#111827; }
    .btn { display:inline-block; background:#111827; color:#fff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:600; margin-top:24px; }
    .footer { background:#fafafa; text-align:center; font-size:12px; color:#6b7280; padding:20px; }
    @media only screen and (max-width:600px) {
      .card { width:100% !important; border-radius:0; }
      .content { padding:24px 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="header">
          <h1>Welcome, ${name}!</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2>You’re all set.</h2>
          <p>Thanks for joining PulseChat. Your account is ready for real‑time conversations, secure messaging, and instant presence.</p>
          <p>Get started by opening the app:</p>
          <a href="${clientURL}" target="_blank" class="btn">Open Messenger →</a>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>If the button above doesn’t work, paste this link into your browser:</p>
          <p><a href="${clientURL}" style="color:#6366f1; word-break:break-all;">${clientURL}</a></p>
          <p>© ${year} PulseChat. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
