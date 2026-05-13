// Plain-string HTML templates. Kept inline so we don't need a templating
// engine. Branded with the emerald/platinum palette to match the app.

const EMERALD = "#047857";
const PLATINUM_BG = "#f8fafc";
const TEXT = "#0f172a";
const MUTED = "#64748b";

interface BaseShellArgs {
  title: string;
  preheader: string;
  body: string;
}

function shell({ title, preheader, body }: BaseShellArgs): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; padding: 0; background: ${PLATINUM_BG}; }
      .preheader { display: none !important; visibility: hidden; opacity: 0; height: 0; width: 0; mso-hide: all; overflow: hidden; }
      .container { max-width: 560px; margin: 0 auto; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: ${TEXT}; }
      .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; }
      .brand { font-weight: 600; font-size: 16px; letter-spacing: 0.02em; color: ${EMERALD}; text-transform: uppercase; }
      h1 { font-size: 22px; margin: 16px 0 12px; line-height: 1.3; }
      p { font-size: 15px; line-height: 1.6; color: ${TEXT}; margin: 0 0 14px; }
      .muted { color: ${MUTED}; font-size: 13px; }
      .btn { display: inline-block; background: ${EMERALD}; color: white !important; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 500; font-size: 15px; margin: 12px 0 6px; }
      .footer { text-align: center; font-size: 12px; color: ${MUTED}; padding: 24px 0 0; }
    </style>
  </head>
  <body>
    <span class="preheader">${escapeHtml(preheader)}</span>
    <div class="container">
      <div class="card">
        <div class="brand">Platinum Kitchen</div>
        ${body}
      </div>
      <div class="footer">
        You're receiving this because someone (hopefully you) requested it on theplatinumkitchen.com.
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderPasswordReset(args: { resetUrl: string; ttlMinutes: number }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Reset your Platinum Kitchen password";
  const html = shell({
    title: subject,
    preheader: "Tap the button to choose a new password.",
    body: `
      <h1>Reset your password</h1>
      <p>Tap the button below to choose a new password. This link expires in ${args.ttlMinutes} minutes.</p>
      <p><a class="btn" href="${escapeHtml(args.resetUrl)}">Reset password</a></p>
      <p class="muted">Or paste this URL into your browser:<br />${escapeHtml(args.resetUrl)}</p>
      <p class="muted">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    `,
  });
  const text = `Reset your Platinum Kitchen password\n\nUse this link to choose a new password (expires in ${args.ttlMinutes} minutes):\n\n${args.resetUrl}\n\nIf you didn't request this, ignore this email.`;
  return { subject, html, text };
}

export function renderEmailChangeVerification(args: {
  verifyUrl: string;
  ttlMinutes: number;
}): { subject: string; html: string; text: string } {
  const subject = "Confirm your new email address";
  const html = shell({
    title: subject,
    preheader: "Tap to confirm this email change on your account.",
    body: `
      <h1>Confirm your new email</h1>
      <p>Tap the button below to confirm this email becomes the new sign-in address for your Platinum Kitchen account. This link expires in ${args.ttlMinutes} minutes.</p>
      <p><a class="btn" href="${escapeHtml(args.verifyUrl)}">Confirm email</a></p>
      <p class="muted">Or paste this URL into your browser:<br />${escapeHtml(args.verifyUrl)}</p>
      <p class="muted">If you didn't request this, ignore this email and the change won't go through.</p>
    `,
  });
  const text = `Confirm your new email\n\nUse this link to confirm (expires in ${args.ttlMinutes} minutes):\n\n${args.verifyUrl}\n\nIf you didn't request this, ignore this email.`;
  return { subject, html, text };
}
