// utils/mailer.js
const nodemailer = require("nodemailer");

// Create a single transporter instance that will be reused
let transporter = null;
let emailEnabled = false;

const createTransporter = () => {
  // Check for required email environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    const errorMessage = `Email configuration missing: ${missing.join(', ')}`;

    // In production, treat missing email config as a critical error
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ CRITICAL: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // In development, warn but allow to continue
    console.warn(`⚠️ Email disabled in development: ${errorMessage}`);
    emailEnabled = false;
    return null;
  }

  if (!transporter) {
    const port = parseInt(process.env.EMAIL_PORT || "465", 10);
    // Determine TLS/secure settings:
    // - If EMAIL_SECURE is explicitly set, respect it ("true"/"false").
    // - Otherwise, default to secure=true for port 465, false for 587.
    const secure = process.env.EMAIL_SECURE
      ? String(process.env.EMAIL_SECURE).toLowerCase() === "true"
      : port === 465;

    // For services like Office365 using STARTTLS on port 587, set requireTLS=true
    const requireTLS = process.env.EMAIL_REQUIRE_TLS
      ? String(process.env.EMAIL_REQUIRE_TLS).toLowerCase() === "true"
      : port === 587;

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // STARTTLS / require TLS when appropriate
      ...(requireTLS ? { requireTLS: true } : {}),
    });
    emailEnabled = true;
  }
  return transporter;
};

// Verify transporter on module load
const initializeMailer = async () => {
  try {
    const tp = createTransporter();
    if (!tp) {
      if (process.env.NODE_ENV === 'production') {
        // In production, this is critical - the error will have been thrown above
        process.exit(1);
      }
      console.warn("⚠️ Email features are disabled due to missing configuration");
      return;
    }
    await tp.verify();
    console.log("✅ Email transporter is ready");
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error.message);

    if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: Email service required but not available in production");
      process.exit(1);
    }

    console.error("Email features may not work properly");
    emailEnabled = false;
  }
};

// Initialize the mailer when the module is loaded
initializeMailer();

const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  // Check if email is enabled
  if (!emailEnabled || !transporter) {
    const error = new Error("Email service is not configured or disabled");

    // In production, log as high-severity error
    if (process.env.NODE_ENV === 'production') {
      console.error("❌ CRITICAL EMAIL FAILURE:", {
        severity: 'HIGH',
        to,
        subject,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    } else {
      console.warn("⚠️ Email not sent: Email service is disabled");
    }

    return {
      success: false,
      error
    };
  }

  const tp = createTransporter();
  if (!tp) {
    const error = new Error("Email transporter not available");

    if (process.env.NODE_ENV === 'production') {
      console.error("❌ CRITICAL EMAIL FAILURE:", {
        severity: 'HIGH',
        to,
        subject,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }

    return {
      success: false,
      error
    };
  }

  try {
    await tp.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      ...(replyTo && { replyTo })
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);

    // In production, log with high severity
    if (process.env.NODE_ENV === 'production') {
      console.error("❌ EMAIL SEND FAILURE:", {
        severity: 'HIGH',
        to,
        subject,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }

    return { success: false, error };
  }
};

const sendStatusChangeEmail = async ({ to, name, oldStatus, newStatus }) => {
  if (!to) return { success: false, error: 'Missing recipient' };
  const subject = `Votre statut de compte a été mis à jour`;
  const preheader = `Votre statut de compte est maintenant : ${newStatus}`;
  const text = `Bonjour ${name || ''},\n\nVotre statut de compte a changé de '${oldStatus}' à '${newStatus}'.\n\nSi vous avez des questions, contactez le support.\n\nCordialement,\nL'équipe`;
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:20px;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;">
    <div style="max-width:680px;margin:0 auto;">
      <div style="background:#ffffff;border-radius:8px;padding:28px;box-shadow:0 2px 8px rgba(16,24,40,0.08);">
        <h2 style="margin:0 0 8px 0;color:#0f172a;font-size:20px;font-weight:600;">Mise à jour de votre compte</h2>
        <p style="margin:0 0 18px 0;color:#475569;line-height:1.5;">Bonjour ${name || ''},</p>
        <p style="margin:0 0 18px 0;color:#0f172a;line-height:1.6;">Nous vous informons que le statut de votre compte a été modifié.</p>

        <div style="display:flex;gap:12px;align-items:center;margin-bottom:18px;">
          <div style="flex:1;padding:14px;border-radius:6px;background:#f1f5f9;color:#0f172a;font-weight:600;text-align:center;">Ancien statut<br/><span style="font-size:14px;color:#334155">${oldStatus}</span></div>
          <div style="flex:1;padding:14px;border-radius:6px;background:#e6fffa;color:#065f46;font-weight:700;text-align:center;">Nouveau statut<br/><span style="font-size:14px;color:#064e3b">${newStatus}</span></div>
        </div>

        <p style="margin:0 0 20px 0;color:#475569;line-height:1.5;">Si vous n'attendiez pas cette modification ou si vous avez des questions, veuillez contacter notre support.</p>

        <p style="margin:0;color:#64748b;font-size:13px;">Cordialement,<br/>L'équipe de support</p>
      </div>

      <p style="text-align:center;margin:16px 0 0 0;color:#94a3b8;font-size:12px;">Si vous ne souhaitez plus recevoir ces emails, contactez le support.</p>
    </div>
  </body>
  </html>
  `;

  return sendEmail({ to, subject, text, html });
};

module.exports = { sendEmail, sendStatusChangeEmail };
