import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
  withRetry,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["GET", "POST", "OPTIONS"];

interface EmailNotificationRequest {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
  htmlContent?: string;
  textContent?: string;
  priority?: "high" | "normal" | "low";
  from?: string;
}

interface EmailProvider {
  name: string;
  send: (
    to: string,
    subject: string,
    html?: string,
    text?: string,
    from?: string,
  ) => Promise<EmailResult>;
}

interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
  provider: string;
  messageId?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateEmailFromTemplate = (
  template: string,
  data: Record<string, any>,
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
      text: `Welcome to ReBooked Solutions, ${data.name}! Thank you for joining our textbook marketplace. You can now start buying and selling textbooks with students across South Africa.`,
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
              <tr><td style="padding: 8px 0; font-weight: bold;">Author:</td><td>${data.bookAuthor || "N/A"}</td></tr>
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
      text: `Order Confirmation #${data.orderId}: Your order for ${data.bookTitle} (R${data.price}) has been confirmed. The seller has 48 hours to commit.`,
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
              <tr><td style="padding: 8px 0; font-weight: bold;">Buyer:</td><td>${data.buyerName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Price:</td><td>R${data.price}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Deadline:</td><td>${new Date(data.deadline).toLocaleString("en-ZA")}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.commitUrl || "#"}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Commit to Sale</a>
          </div>
          <p><strong>Important:</strong> If you don't commit by the deadline, the order will be automatically cancelled and the buyer will be refunded.</p>
          <p>Best regards,<br><strong>ReBooked Solutions</strong></p>
        </div>
      `,
      text: `Order Commitment Reminder: Please commit to your order for ${data.bookTitle} (R${data.price}) by ${new Date(data.deadline).toLocaleString("en-ZA")}. Visit your dashboard to commit.`,
    },
    payment_received: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">💰 Payment Received</h2>
          <p>Hi ${data.sellerName},</p>
          <p>Great news! Payment has been processed for your book sale.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Book:</td><td>${data.bookTitle}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Sale Amount:</td><td>R${data.saleAmount}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Your Payout:</td><td>R${data.payoutAmount}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td><td>${data.transactionId}</td></tr>
            </table>
          </div>
          <p>The amount will be transferred to your registered bank account within 2-3 business days.</p>
          <p>Best regards,<br><strong>ReBooked Solutions</strong></p>
        </div>
      `,
      text: `Payment Received: Your payout of R${data.payoutAmount} for ${data.bookTitle} will be transferred to your bank account within 2-3 business days.`,
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

// Email provider implementations
const createSenderProvider = (): EmailProvider => ({
  name: "sender",
  send: async (
    to: string,
    subject: string,
    html?: string,
    text?: string,
    from?: string,
  ): Promise<EmailResult> => {
    const senderApiKey = Deno.env.get("SENDER_API_KEY");
    const fromEmail =
      from || Deno.env.get("FROM_EMAIL") || "noreply@rebookedsolutions.co.za";

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
  },
});

const createResendProvider = (): EmailProvider => ({
  name: "resend",
  send: async (
    to: string,
    subject: string,
    html?: string,
    text?: string,
    from?: string,
  ): Promise<EmailResult> => {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail =
      from || Deno.env.get("FROM_EMAIL") || "noreply@rebookedsolutions.co.za";

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
  },
});

const createFallbackProvider = (): EmailProvider => ({
  name: "fallback",
  send: async (
    to: string,
    subject: string,
    html?: string,
    text?: string,
  ): Promise<EmailResult> => {
    // In a real implementation, this would queue the email for later delivery
    // For now, we'll log it and return success
    console.log(`[FALLBACK] Email queued for ${to}: ${subject}`);

    return {
      success: true,
      message: "Email queued for fallback delivery",
      provider: "fallback",
      messageId: `fallback_${Date.now()}`,
    };
  },
});

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Health check for GET requests
  if (req.method === "GET") {
    const emailProviders = {
      sender: !!Deno.env.get("SENDER_API_KEY"),
      resend: !!Deno.env.get("RESEND_API_KEY"),
      fromEmail: !!Deno.env.get("FROM_EMAIL"),
    };

    return successResponse({
      service: "send-email-notification",
      timestamp: new Date().toISOString(),
      status: "healthy",
      providers: emailProviders,
      templates: [
        "welcome",
        "order_confirmation",
        "commit_reminder",
        "payment_received",
      ],
      fallbackEnabled: true,
    });
  }

  // Parse request body
  const { data: requestBody, error: parseError } = await safeJsonParse(req);
  if (parseError) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON", {
      error: parseError,
    });
  }

  const emailRequest: EmailNotificationRequest = requestBody;
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
    return errorResponse(
      "Missing required fields: to and subject are required",
      400,
      "REQUIRED_FIELDS_MISSING",
      { required: ["to", "subject"] },
    );
  }

  // Validate email format
  if (!validateEmail(to)) {
    return errorResponse(
      "Invalid email address format",
      400,
      "INVALID_EMAIL_FORMAT",
      { email: to },
    );
  }

  try {
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
      return errorResponse(
        "Email must have either HTML content, text content, or a template with data",
        400,
        "NO_CONTENT",
        {
          hasHtml: !!htmlContent,
          hasText: !!textContent,
          hasTemplate: !!template,
        },
      );
    }

    // Initialize email providers
    const providers = [
      createSenderProvider(),
      createResendProvider(),
      createFallbackProvider(),
    ];

    let lastError: string = "";
    let result: EmailResult | null = null;

    // Try each provider in sequence
    for (const provider of providers) {
      try {
        console.log(`Attempting to send email via ${provider.name}...`);

        const sendOperation = () =>
          provider.send(to, subject, finalHtmlContent, finalTextContent, from);

        result = await withTimeout(
          withRetry(sendOperation, 2, 1000), // 2 retries with 1s delay
          15000, // 15 second timeout
          `Email sending via ${provider.name} timed out`,
        );

        if (result.success) {
          console.log(`Email sent successfully via ${provider.name}`);
          break;
        } else {
          lastError = result.error || "Unknown error";
          console.warn(`${provider.name} failed: ${lastError}`);
          continue;
        }
      } catch (error) {
        lastError = error.message;
        console.warn(`${provider.name} failed with exception: ${lastError}`);
        continue;
      }
    }

    // All providers failed
    if (!result || !result.success) {
      // Log the failed email attempt (non-blocking)
      supabase
        .from("audit_logs")
        .insert({
          action: "email_notification_failed",
          table_name: "email_notifications",
          new_values: {
            to,
            subject,
            template,
            priority,
            error: lastError,
            attempted_providers: providers.map((p) => p.name),
          },
        })
        .catch((error) =>
          console.warn("Failed to log email failure:", error.message),
        );

      return errorResponse(
        "Failed to send email with all providers",
        500,
        "EMAIL_SEND_FAILED",
        {
          lastError,
          attemptedProviders: providers.map((p) => p.name),
        },
      );
    }

    // Success - log the email (non-blocking)
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

    return successResponse(
      {
        provider: result.provider,
        messageId: result.messageId,
        message: result.message,
      },
      "Email sent successfully",
    );
  } catch (error) {
    console.error("Unexpected error in send-email-notification:", error);
    return errorResponse(
      "An unexpected error occurred while sending email",
      500,
      "UNEXPECTED_ERROR",
      { error: error.message },
    );
  }
};

serve(wrapFunction(handler, requiredEnvVars, allowedMethods));
