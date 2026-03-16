// lib/email/brevo.ts
// Uses Brevo's transactional email REST API (v3).
// Requires only BREVO_API_KEY and BREVO_FROM_EMAIL in .env.local

const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;
const fromName = process.env.BREVO_FROM_NAME || "SAGE";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sageadvisor.app";

// ─────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendWelcomeEmailParams {
  email: string;
  firstName: string;
  role: "STUDENT" | "ADVISOR" | "ADMIN";
}

interface SendVerificationPinParams {
  email: string;
  firstName: string;
  pin: string;
}

interface SendPasswordResetParams {
  email: string;
  firstName: string;
  resetLink: string;
}

interface SendPasswordResetSuccessParams {
  email: string;
  firstName: string;
}

// ─────────────────────────────────────────────
// Core Send Function — Brevo REST API
// ─────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<boolean> {
  const recipient = String(to ?? "").trim();
  if (!recipient.includes("@")) {
    throw new Error("Invalid recipient email address");
  }

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in environment variables.");
  }
  if (!fromEmail) {
    throw new Error(
      "BREVO_FROM_EMAIL (or SMTP_FROM_EMAIL) is not set in environment variables.",
    );
  }

  const payload = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: recipient }],
    subject,
    htmlContent: html,
    textContent: text || html.replace(/<[^>]*>/g, ""),
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "(no body)");
    const err = new Error(
      `[Brevo] API error ${res.status}: ${errBody}`,
    );
    console.error("[Brevo] Failed to send email:", err.message);
    throw err;
  }

  const data = (await res.json()) as { messageId?: string };
  console.log("[Brevo] Email sent successfully:", data.messageId ?? "(no id)");
  return true;
}

// ─────────────────────────────────────────────
// Welcome Email
// ─────────────────────────────────────────────

export async function sendWelcomeEmail({
  email,
  firstName,
  role,
}: SendWelcomeEmailParams): Promise<boolean> {
  const roleLabel = {
    STUDENT: "Student",
    ADVISOR: "Academic Advisor",
    ADMIN: "Administrator",
  }[role];

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SAGE</h1>
            <p>Your Academic Advising Platform</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your account has been created as a <strong>${roleLabel}</strong>.</p>
            <p>We're excited to have you on board. SAGE is designed to help you succeed in your academic journey with intelligent advising and personalized recommendations.</p>
            <p>Your next step is to verify your email address by entering the verification code we'll send you shortly.</p>
            <p style="color: #666; font-size: 14px;">
              <strong>Account Role:</strong> ${roleLabel}<br>
              <strong>Email:</strong> ${email}<br>
            </p>
            <div class="footer">
              <p>© 2024 SAGE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to SAGE - Verify Your Email",
    html,
  });
}

// ─────────────────────────────────────────────
// Email Verification PIN
// ─────────────────────────────────────────────

export async function sendVerificationPin({
  email,
  firstName,
  pin,
}: SendVerificationPinParams): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .pin-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .pin-code { font-size: 36px; font-weight: 700; letter-spacing: 4px; color: #667eea; font-family: monospace; }
          .warning { background: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 20px 0; font-size: 13px; color: #856404; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
            <p>Enter this code to confirm your email address</p>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Your verification code is:</p>
            <div class="pin-box">
              <div class="pin-code">${pin}</div>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <div class="warning">
              ⚠️ If you didn't request this code, please ignore this email. Someone else may have tried to create an account with this email address.
            </div>
            <div class="footer">
              <p>© 2024 SAGE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Your SAGE Verification Code: ${pin}`,
    html,
  });
}

// ─────────────────────────────────────────────
// Password Reset Link
// ─────────────────────────────────────────────

export async function sendPasswordResetEmail({
  email,
  firstName,
  resetLink,
}: SendPasswordResetParams): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: 600; }
          .warning { background: #f8d7da; padding: 12px; border-left: 4px solid #f5c6cb; margin: 20px 0; font-size: 13px; color: #721c24; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your SAGE password</p>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              Or copy and paste this link in your browser:<br>
              <code style="background: white; padding: 4px 8px; border-radius: 3px;">${resetLink}</code>
            </p>
            <div class="warning">
              ⚠️ This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email or contact support if you believe your account is at risk.
            </div>
            <div class="footer">
              <p>© 2024 SAGE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your SAGE Password",
    html,
  });
}

// ─────────────────────────────────────────────
// Password Reset Success
// ─────────────────────────────────────────────

export async function sendPasswordResetSuccessEmail({
  email,
  firstName,
}: SendPasswordResetSuccessParams): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .success-badge { display: inline-block; background: #28a745; color: white; padding: 10px 20px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Successful</h1>
            <p>Your password has been updated</p>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <div class="success-badge">✓ Your password has been successfully changed</div>
            <p>You can now log in to your SAGE account with your new password.</p>
            <div style="text-align: center;">
              <a href="${appUrl}/auth/login" class="button">Back to Login</a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you didn't make this change, please contact support immediately.
            </p>
            <div class="footer">
              <p>© 2024 SAGE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Your SAGE Password Has Been Reset",
    html,
  });
}

// ─────────────────────────────────────────────
// Account Suspended Notification
// ─────────────────────────────────────────────

export async function sendAccountLockedNotification(
  email: string,
  firstName: string,
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .warning { background: #f8d7da; padding: 15px; border-left: 4px solid #f5c6cb; margin: 20px 0; color: #721c24; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Locked</h1>
            <p>Too many failed login attempts</p>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <div class="warning">
              🔒 Your account has been temporarily locked due to multiple failed login attempts.
            </div>
            <p>Your account will be automatically unlocked after <strong>15 minutes</strong>.</p>
            <p>If you need immediate assistance, please contact our support team.</p>
            <div style="text-align: center;">
              <a href="${appUrl}/dashboard" class="button">Contact Support</a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you didn't attempt to log in, please reset your password immediately to secure your account.
            </p>
            <div class="footer">
              <p>© 2024 SAGE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Your SAGE Account Has Been Locked",
    html,
  });
}
