import { NotificationChannel, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { padCountryCode, validateMobileNumber } from "./utils";

export async function sendNotification({
  userId,
  email,
  mobileNo,
  title,
  message,
  type,
  referenceIds,
  channel,
  metadata = {},
}: {
  userId: string;
  email: string;
  mobileNo: string | null;
  title: string;
  message: string;
  type: NotificationType;
  referenceIds: string[];
  channel: NotificationChannel;
  metadata?: any;
}) {
  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      channel,
      referenceIds,
      metadata,
    },
  });

  // Send to appropriate channels
  if (
    channel === NotificationChannel.EMAIL ||
    channel === NotificationChannel.BOTH
  ) {
    await sendEmailNotification(userId, email, title, message, metadata);
    console.log("Sending email notification to user", userId);
  }

  if (
    channel === NotificationChannel.MOBILE ||
    (channel === NotificationChannel.BOTH &&
      mobileNo &&
      mobileNo !== "" &&
      mobileNo !== null &&
      validateMobileNumber(mobileNo))
  ) {
    console.log("Sending mobile notification to user", userId);
    await sendMobileNotification(userId, mobileNo!, title, message, metadata);
  }

  return notification;
}

// Implement these functions based on your email/mobile providers
async function sendEmailNotification(
  userId: string,
  email: string,
  title: string,
  message: string,
  metadata: any
) {
  try {
    if (!email) {
      console.error("sendEmailNotification: missing recipient email");
      return false;
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from =
      process.env.SMTP_FROM || process.env.EMAIL_FROM || "no-reply@example.com";

    if (!host || !port || !user || !pass) {
      console.warn(
        "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and SMTP_FROM)."
      );
      return false;
    }

    // Lazy-load nodemailer to avoid client bundles including it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodemailer: any = await import("nodemailer");

    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

    const tls: Record<string, unknown> = {};
    if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false") {
      // Allow self-signed certificates when explicitly configured
      tls.rejectUnauthorized = false;
    }
    if (process.env.SMTP_REQUIRE_TLS === "true") {
      tls.rejectUnauthorized = tls.rejectUnauthorized ?? true;
      // nodemailer enables STARTTLS automatically; requireTLS is implicit when server supports it
    }

    // Optional: provide a custom CA certificate via base64 to trust self-signed CA
    const caB64 = process.env.SMTP_CA_B64;
    if (caB64) {
      try {
        const ca = Buffer.from(caB64, "base64").toString("utf8");
        // nodemailer expects Buffer|string|string[] in tls.ca
        tls.ca = ca;
      } catch (e) {
        console.warn("Invalid SMTP_CA_B64 content; unable to decode base64 CA");
      }
    }

    const ignoreTLS = process.env.SMTP_IGNORE_TLS === "true";
    const requireTLS = process.env.SMTP_REQUIRE_TLS === "true";
    const logger = process.env.SMTP_DEBUG === "true";
    const debug = logger;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls,
      ignoreTLS,
      requireTLS,
      logger,
      debug,
      socketTimeout: 30000,
      displayName: "OVA System",
    });

    // Proactively verify connection to surface TLS/cert issues clearly
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verify failed:", verifyError);
      if (logger) {
        console.error(
          "Effective SMTP options:",
          JSON.stringify(
            {
              host,
              port,
              secure,
              ignoreTLS,
              requireTLS,
              tlsFlags: Object.keys(tls),
            },
            null,
            2
          )
        );
      }
      console.error(
        "If you're using a self-signed certificate, set SMTP_TLS_REJECT_UNAUTHORIZED=false, and for STARTTLS on 587 set SMTP_SECURE=false. For debugging set SMTP_DEBUG=true."
      );
      throw verifyError;
    }

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111;">
        <h2 style="margin: 0 0 12px;">${title}</h2>
        <p style="margin: 0 0 12px; white-space: pre-line;">${message}</p>
        ${
          metadata
            ? `<pre style="background:#f6f6f6; padding:12px; border-radius:6px; overflow:auto;">${
                typeof metadata === "string"
                  ? metadata
                  : JSON.stringify(metadata, null, 2)
              }</pre>`
            : ""
        }
        <p style="margin-top:16px; font-size:12px; color:#666;">This is an automated message. Do not reply.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: title,
      text: message,
      html,
    });

    console.info("Email sent:", {
      userId,
      to: email,
      messageId: info?.messageId,
    });
    return true;
  } catch (error) {
    console.error("sendEmailNotification error:", error);
    return false;
  }
}

async function sendMobileNotification(
  userId: string,
  mobileNo: string,
  title: string,
  message: string,
  metadata: any
) {
  // Connect to your push notification service (MSD SMS Gateway)
  try {
    // Validate phone number before attempting to send SMS
    if (!mobileNo || !validateMobileNumber(mobileNo)) {
      console.error(
        `Cannot send SMS: Invalid phone number format: ${mobileNo}`
      );
      return false;
    }

    const paddedPhoneNumber = padCountryCode(mobileNo);

    // Replace with your actual SMS service provider
    const smsApiUrl =
      process.env.SMS_API_URL || "https://api.smsservice.com/send";

    const response = await fetch(
      `${smsApiUrl}/sms?mobile=${paddedPhoneNumber}&message=${message}`
    );

    if (response.ok) {
      console.info(`SMS sent successfully to ${paddedPhoneNumber}`);
      return true;
    }

    console.error(`Failed to send SMS: ${response.statusText}`);
    return false;
  } catch (error) {
    console.error(`Error sending SMS: ${error}`);
    return false;
  }
}
