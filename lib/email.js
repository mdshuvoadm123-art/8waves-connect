import nodemailer from "nodemailer";

let cachedTransporter = null;

function getTransporter() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD must be set to send emails."
    );
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  return cachedTransporter;
}

/**
 * Sends one email to many recipients via BCC (so nobody sees anyone
 * else's address). Silently does nothing if there are no recipients.
 * Throws only on a real send failure — callers should catch this so an
 * email problem never blocks the notice/exam from being saved.
 */
export async function sendBulkEmail({ recipients, subject, text, html }) {
  const uniqueRecipients = Array.from(
    new Set((recipients || []).map((r) => r.trim()).filter(Boolean))
  );
  if (uniqueRecipients.length === 0) return { sent: 0 };

  const transporter = getTransporter();
  const { GMAIL_USER } = process.env;

  await transporter.sendMail({
    from: `"8WAVES CONNECT" <${GMAIL_USER}>`,
    to: GMAIL_USER, // send "to" yourself, real recipients go in bcc
    bcc: uniqueRecipients,
    subject,
    text,
    html,
  });

  return { sent: uniqueRecipients.length };
}
