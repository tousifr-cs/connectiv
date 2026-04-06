import crypto from "crypto";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const OTP_SECRET =
  process.env.OTP_SECRET ?? process.env.JWT_SECRET ?? "dev-otp-secret-change-me";

export function generateSixDigitOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

/** HMAC of email + code — store this, never the raw OTP. */
export function hashOtp(email: string, code: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${normalized}:${code}`)
    .digest("hex");
}

let smtpTransport: Transporter | null = null;

function getSmtpTransport(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;

  if (!smtpTransport) {
    const port = Number(process.env.SMTP_PORT ?? "587");
    const secure =
      process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
    const user = process.env.SMTP_USER?.trim();
    // Gmail app passwords are often copied with spaces; SMTP expects 16 chars without them.
    const pass = (process.env.SMTP_PASS ?? "").replace(/\s/g, "");

    smtpTransport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user !== undefined && user !== ""
          ? { user, pass }
          : undefined,
    });
  }
  return smtpTransport;
}

/**
 * Sends signup OTP via Nodemailer (SMTP). Set SMTP_HOST, SMTP_PORT, SMTP_USER,
 * SMTP_PASS, EMAIL_FROM. In development without SMTP_HOST, logs the code to the console.
 */
export async function sendSignupOtpEmail(to: string, code: string): Promise<void> {
  const subject = "Your ProConnectiv verification code";
  const text = `Your verification code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can ignore this email.`;
  const html = `<p style="font-family:sans-serif;font-size:16px;">Your verification code is:</p><p style="font-family:monospace;font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p><p style="font-family:sans-serif;font-size:14px;color:#666;">This code expires in 15 minutes.</p>`;

  const from =
    process.env.EMAIL_FROM ?? '"ProConnectiv" <noreply@localhost>';

  const transport = getSmtpTransport();
  if (transport) {
    await transport.sendMail({ from, to, subject, text, html });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[email] Signup OTP for ${to}: ${code} (set SMTP_HOST to send for real)`);
    return;
  }

  throw new Error(
    "Email not configured: set SMTP_HOST (and EMAIL_FROM, SMTP_USER/SMTP_PASS as needed) or run in development.",
  );
}
