import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

interface EmailRequest {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, unknown>;
  htmlContent?: string;
  textContent?: string;
  priority?: "high" | "normal" | "low";
  from?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateEmailFromTemplate = (
  template: string,
  data: Record<string, unknown>,
) => {
  const templates = {
    welcome: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Welcome to ReBooked Solutions, ${data.name}!</h1>
          <p>Thank you for joining our textbook marketplace. We're excited to have you as part of our community.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Getting Started:</h3>
            <ul>
              <li>Browse textbooks from universities across South Africa</li>
              <li>List your own textbooks for sale</li>
              <li>Connect with students in your area</li>
            </ul>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>The ReBooked Solutions Team</strong></p>
        </div>
      `,
      text: `Welcome to ReBooked Solutions, ${data.name}! Thank you for joining our textbook marketplace.`,
    },
    order_confirmation: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Order Confirmation #${data.orderId}</h2>
          <p>Hi ${data.buyerName},</p>
          <p>Your order has been confirmed and payment received. Here are the details:</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Book:</td><td>${data.bookTitle}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Price:</td><td>R${data.price}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Order ID:</td><td>${data.orderId}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Seller:</td><td>${data.sellerName}</td></tr>
            </table>
          </div>
          <p><strong>Next Steps:</strong></p>
          <p>The seller has 48 hours to commit to your order. You'll receive another email once they confirm.</p>
          <p>Best regards,<br><strong>ReBooked Solutions</strong></p>
        </div>
      `,
      text: `Order Confirmation #${data.orderId}: Your order for ${data.bookTitle} (R${data.price}) has been confirmed.`,
    },
    commit_reminder: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">⏰ Order Commitment Reminder</h2>
          <p>Hi ${data.sellerName},</p>
          <p>You have an order waiting for your commitment:</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Book:</td><td>${data.bookTitle}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Price:</td><td>R${data.price}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Deadline:</td><td>${new Date(data.deadline).toLocaleString("en-ZA")}</td></tr>
            </table>
          </div>
          <p><strong>Important:</strong> If you don't commit by the deadline, the order will be automatically cancelled.</p>
          <p>Best regards,<br><strong>ReBooked Solutions</strong></p>
        </div>
      `,
      text: `Order Commitment Reminder: Please commit to your order for ${data.bookTitle} by ${new Date(data.deadline).toLocaleString("en-ZA")}.`,
    },
  };

  const template_data = templates[template as keyof typeof templates];
  if (!template_data) {
    return {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Notification from ReBooked Solutions</h2>
          <p>${data.message || "You have a new notification."}</p>
          <p>Best regards,<br><strong>ReBooked Solutions</strong></p>
        </div>
      `,
      text: data.message || "Notification from ReBooked Solutions",
    };
  }

  return template_data;
};

const sendWithSender = async (
  to: string,
  subject: string,
  html?: string,
  text?: string,
  from?: string,
) => {
  const senderApiKey = process.env.SENDER_API_KEY;
  const fromEmail =
    from || process.env.FROM_EMAIL || "noreply@rebookedsolutions.co.za";

  if (!senderApiKey) {
    return {
      success: false,
      error: "Sender API key not configured",
      provider: "sender",
    };
  }

  const response = await fetch("https://api.sender.net/v2/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${senderApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [{ email: to }],
      subject: subject,
      html: html,
      text: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sender API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    success: true,
    message: "Email sent via Sender",
    provider: "sender",
    messageId: result.id,
  };
};

const sendWithResend = async (
  to: string,
  subject: string,
  html?: string,
  text?: string,
  from?: string,
) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    from || process.env.FROM_EMAIL || "noreply@rebookedsolutions.co.za";

  if (!resendApiKey) {
    return {
      success: false,
      error: "Resend API key not configured",
      provider: "resend",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: html,
      text: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    success: true,
    message: "Email sent via Resend",
    provider: "resend",
    messageId: result.id,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Health check for GET requests
  if (req.method === "GET") {
    const emailProviders = {
      sender: !!process.env.SENDER_API_KEY,
      resend: !!process.env.RESEND_API_KEY,
      fromEmail: !!process.env.FROM_EMAIL,
    };

    return res.status(200).json({
      service: "send-email-notification",
      timestamp: new Date().toISOString(),
      status: "healthy",
      providers: emailProviders,
      templates: ["welcome", "order_confirmation", "commit_reminder"],
      fallbackEnabled: true,
    });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const emailRequest: EmailRequest = req.body;
    const {
      to,
      subject,
      template,
      data,
      htmlContent,
      textContent,
      priority = "normal",
      from,
    } = emailRequest;

    // Validate required fields
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to and subject are required",
      });
    }

    // Validate email format
    if (!validateEmail(to)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address format",
      });
    }

    // Generate email content
    let finalHtmlContent = htmlContent;
    let finalTextContent = textContent;

    if (template && data) {
      const generatedContent = generateEmailFromTemplate(template, data);
      finalHtmlContent = generatedContent.html;
      finalTextContent = generatedContent.text;
    }

    // Ensure we have some content
    if (!finalHtmlContent && !finalTextContent) {
      return res.status(400).json({
        success: false,
        error:
          "Email must have either HTML content, text content, or a template with data",
      });
    }

    // Try providers in sequence
    let result: {
      success: boolean;
      provider?: string;
      messageId?: string;
      message?: string;
      error?: string;
    } | null = null;
    let lastError = "";

    // Try Sender first
    try {
      result = await sendWithSender(
        to,
        subject,
        finalHtmlContent,
        finalTextContent,
        from,
      );
      if (result.success) {
        // Log successful email (non-blocking)
        supabase
          .from("audit_logs")
          .insert({
            action: "email_notification_sent",
            table_name: "email_notifications",
            new_values: {
              to,
              subject,
              template,
              priority,
              provider: result.provider,
              message_id: result.messageId,
              sent_at: new Date().toISOString(),
            },
          })
          .catch((error) =>
            console.warn("Failed to log email success:", error.message),
          );

        return res.status(200).json({
          success: true,
          provider: result.provider,
          messageId: result.messageId,
          message: result.message,
        });
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn("Sender failed:", lastError);
    }

    // Try Resend as fallback
    try {
      result = await sendWithResend(
        to,
        subject,
        finalHtmlContent,
        finalTextContent,
        from,
      );
      if (result.success) {
        return res.status(200).json({
          success: true,
          provider: result.provider,
          messageId: result.messageId,
          message: result.message,
        });
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn("Resend failed:", lastError);
    }

    // All providers failed
    return res.status(500).json({
      success: false,
      error: "Failed to send email with all providers",
      lastError,
      attemptedProviders: ["sender", "resend"],
    });
  } catch (error: unknown) {
    console.error("Unexpected error in send-email-notification:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while sending email",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
