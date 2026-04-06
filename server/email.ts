import crypto from "crypto";

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

export async function sendEmailVerificationOtp(
  to: string,
  code: string,
): Promise<void> {
  const subject = "Your ProConnectiv verification code";
  const text = `Your verification code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can ignore this email.`;
  const html = `<p style="font-family:sans-serif;font-size:16px;">Your verification code is:</p><p style="font-family:monospace;font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p><p style="font-family:sans-serif;font-size:14px;color:#666;">This code expires in 15 minutes.</p>`;

  const resendKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "ProConnectiv <onboarding@resend.dev>";

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend failed: ${res.status} ${errText}`);
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[email] Verification OTP for ${to}: ${code}`);
    return;
  }

  throw new Error(
    "Email not configured: set RESEND_API_KEY (and EMAIL_FROM) or run in development.",
  );
}
