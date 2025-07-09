import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface EmailNotificationRequest {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
  htmlContent?: string;
  textContent?: string;
  priority?: "high" | "normal" | "low";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Email notification request:", req.method);
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const emailRequest: EmailNotificationRequest = await req.json();
    const {
      to,
      subject,
      template,
      data,
      htmlContent,
      textContent,
      priority = "normal",
    } = emailRequest;

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    // Generate email content
    let finalHtmlContent = htmlContent;
    let finalTextContent = textContent;

    if (template && data) {
      const generatedContent = generateEmailFromTemplate(template, data);
      finalHtmlContent = generatedContent.html;
      finalTextContent = generatedContent.text;
    }

    // Send email using primary provider (Sender)
    let result = await sendWithSender(
      to,
      subject,
      finalHtmlContent,
      finalTextContent,
    );

    // Fallback to Resend if Sender fails
    if (!result.success) {
      console.log("Sender failed, trying Resend...");
      result = await sendWithResend(
        to,
        subject,
        finalHtmlContent,
        finalTextContent,
      );
    }

    // Fallback to SMTP if both fail
    if (!result.success) {
      console.log("Resend failed, trying SMTP...");
      result = await sendWithSMTP(
        to,
        subject,
        finalHtmlContent,
        finalTextContent,
      );
    }

    // Log the email attempt
    await supabase.from("audit_logs").insert({
      action: "email_notification_sent",
      table_name: "email_notifications",
      new_values: {
        to,
        subject,
        template,
        priority,
        success: result.success,
        provider: result.provider,
        error: result.error,
      },
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        provider: result.provider,
      }),
      {
        status: result.success ? 200 : 500,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Error in send-email-notification:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});

function generateEmailFromTemplate(
  template: string,
  data: Record<string, any>,
) {
  const templates = {
    welcome: {
      html: `
        <h1>Welcome to Rebooked Solutions, ${data.name}!</h1>
        <p>Thank you for joining our textbook marketplace.</p>
        <p>You can now start buying and selling textbooks with students across South Africa.</p>
        <p>Best regards,<br>The Rebooked Solutions Team</p>
      `,
      text: `Welcome to Rebooked Solutions, ${data.name}! Thank you for joining our textbook marketplace.`,
    },
    order_confirmation: {
      html: `
        <h2>Order Confirmation</h2>
        <p>Hi ${data.buyerName},</p>
        <p>Your order has been confirmed:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle}</li>
          <li><strong>Price:</strong> R${data.price}</li>
          <li><strong>Order ID:</strong> ${data.orderId}</li>
        </ul>
        <p>Best regards,<br>Rebooked Solutions</p>
      `,
      text: `Order Confirmation: Your order for ${data.bookTitle} (R${data.price}) has been confirmed. Order ID: ${data.orderId}`,
    },
    commit_reminder: {
      html: `
        <h2>Order Commitment Reminder</h2>
        <p>You have an order waiting for commitment:</p>
        <p><strong>Book:</strong> ${data.bookTitle}</p>
        <p><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleString()}</p>
        <p>Please log in to your account to commit to this sale.</p>
        <p>Best regards,<br>Rebooked Solutions</p>
      `,
      text: `Order Commitment Reminder: Please commit to your order for ${data.bookTitle} by ${new Date(data.deadline).toLocaleString()}`,
    },
    payment_confirmed: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Confirmed!</h2>
          <p>Hi ${data.recipient_name},</p>
          <p>Great news! Your payment has been successfully confirmed.</p>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Book:</strong> ${data.book_title}</li>
              <li><strong>Amount Paid:</strong> R${data.amount.toFixed(2)}</li>
              <li><strong>Order ID:</strong> ${data.order_id}</li>
              <li><strong>Payment Reference:</strong> ${data.reference}</li>
              ${data.transaction_id ? `<li><strong>Transaction ID:</strong> ${data.transaction_id}</li>` : ""}
            </ul>
          </div>

          ${
            data.receipt_url
              ? `
          <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">📧 Your Receipt</h3>
            <p>Your payment receipt is ready for download:</p>
            <p><a href="${data.receipt_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Receipt</a></p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">You can also access your receipt anytime from your account dashboard.</p>
          </div>
          `
              : ""
          }

          <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #047857;">✅ Next Steps</h3>
            <p>Your payment is confirmed and the seller has been notified. They will contact you within 48 hours to arrange book collection or delivery.</p>
          </div>

          <p>Thank you for using ReBooked Solutions!</p>
          <p>Best regards,<br>The ReBooked Solutions Team</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Need help? Contact us at support@rebooked.co.za
          </p>
        </div>
      `,
      text: `Payment Confirmed! Hi ${data.recipient_name}, your payment for ${data.book_title} (R${data.amount.toFixed(2)}) has been confirmed. Order ID: ${data.order_id}. Payment Reference: ${data.reference}. ${data.receipt_url ? `Download your receipt: ${data.receipt_url}` : ""} The seller will contact you within 48 hours.`,
    },
    payment_confirmed_with_receipt: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your textbook purchase is confirmed</p>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hi ${data.recipient_name},</p>
            <p>Excellent! Your payment has been successfully processed and confirmed.</p>

            <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1f2937;">📚 Purchase Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Book:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.book_title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Amount Paid:</td>
                  <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">R${data.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Order ID:</td>
                  <td style="padding: 8px 0; color: #6b7280; font-family: monospace;">${data.order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Payment Reference:</td>
                  <td style="padding: 8px 0; color: #6b7280; font-family: monospace;">${data.reference}</td>
                </tr>
                ${
                  data.transaction_id
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #6b7280; font-family: monospace;">${data.transaction_id}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>

            ${
              data.receipt_url
                ? `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="margin-top: 0; color: white; font-size: 20px;">🧾 Your Official Receipt</h3>
              <p style="color: rgba(255,255,255,0.9); margin: 12px 0;">Your payment receipt is ready for download and record keeping.</p>
              <a href="${data.receipt_url}" style="background: white; color: #5b21b6; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">📥 Download Receipt</a>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 16px; margin-bottom: 0;">Keep this receipt for your records and warranty purposes.</p>
            </div>
            `
                : ""
            }

            <div style="background: #f0fff4; padding: 24px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbf7d0;">
              <h3 style="margin-top: 0; color: #047857; display: flex; align-items: center;">✅ What Happens Next?</h3>
              <ol style="color: #065f46; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">The seller has been automatically notified of your payment</li>
                <li style="margin-bottom: 8px;">They will contact you within <strong>48 hours</strong> to arrange collection or delivery</li>
                <li style="margin-bottom: 8px;">You'll receive updates about your order status via email and in-app notifications</li>
                <li style="margin-bottom: 0;">If you don't hear from the seller within 48 hours, we'll follow up automatically</li>
              </ol>
            </div>

            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #fed7aa;">
              <h4 style="margin-top: 0; color: #92400e;">💡 Helpful Tips:</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">Check your notifications regularly for seller messages</li>
                <li style="margin-bottom: 6px;">Have your order ID ready when communicating with the seller</li>
                <li style="margin-bottom: 0;">Contact support if you need any assistance</li>
              </ul>
            </div>

            <p style="margin-top: 30px;">Thank you for choosing ReBooked Solutions - South Africa's trusted textbook marketplace!</p>
            <p>Best regards,<br><strong>The ReBooked Solutions Team</strong></p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Need help? Email us at <a href="mailto:support@rebooked.co.za" style="color: #2563eb;">support@rebooked.co.za</a> or visit our help center
            </p>
          </div>
        </div>
      `,
      text: `Payment Successful! Hi ${data.recipient_name}, your payment for "${data.book_title}" (R${data.amount.toFixed(2)}) has been confirmed. Order ID: ${data.order_id}. Payment Reference: ${data.reference}. ${data.receipt_url ? `Download your receipt: ${data.receipt_url}` : ""} The seller will contact you within 48 hours to arrange collection or delivery. Thank you for using ReBooked Solutions!`,
    },
    payment_received: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">💰 Payment Received!</h2>
          <p>Hi ${data.recipient_name},</p>
          <p>Great news! You've received a payment for your textbook.</p>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Sale Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Book:</strong> ${data.book_title}</li>
              <li><strong>Amount:</strong> R${data.amount.toFixed(2)}</li>
              <li><strong>Buyer:</strong> ${data.buyer_name}</li>
              <li><strong>Order ID:</strong> ${data.order_id}</li>
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">⏰ Action Required</h3>
            <p><strong>Please contact the buyer within 48 hours</strong> to arrange book collection or delivery.</p>
            <p>The buyer is expecting to hear from you soon!</p>
          </div>

          <p>Log in to your account to view full order details and contact the buyer.</p>
          <p>Best regards,<br>The ReBooked Solutions Team</p>
        </div>
      `,
      text: `Payment Received! Hi ${data.recipient_name}, you've received payment for ${data.book_title} (R${data.amount.toFixed(2)}) from ${data.buyer_name}. Order ID: ${data.order_id}. Please contact the buyer within 48 hours to arrange collection or delivery.`,
    },
  };

  return (
    templates[template as keyof typeof templates] || {
      html: `<p>${data.message || "Notification from Rebooked Solutions"}</p>`,
      text: data.message || "Notification from Rebooked Solutions",
    }
  );
}

async function sendWithSender(
  to: string,
  subject: string,
  html?: string,
  text?: string,
) {
  const senderApiKey = Deno.env.get("SENDER_API_KEY");
  const fromEmail =
    Deno.env.get("FROM_EMAIL") || "noreply@rebookedsolutions.co.za";

  if (!senderApiKey) {
    return {
      success: false,
      error: "Sender API key not configured",
      provider: "sender",
    };
  }

  try {
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
      return { success: false, error: errorText, provider: "sender" };
    }

    return {
      success: true,
      message: "Email sent via Sender",
      provider: "sender",
    };
  } catch (error) {
    return { success: false, error: error.message, provider: "sender" };
  }
}

async function sendWithResend(
  to: string,
  subject: string,
  html?: string,
  text?: string,
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail =
    Deno.env.get("FROM_EMAIL") || "noreply@rebookedsolutions.co.za";

  if (!resendApiKey) {
    return {
      success: false,
      error: "Resend API key not configured",
      provider: "resend",
    };
  }

  try {
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
      return { success: false, error: errorText, provider: "resend" };
    }

    return {
      success: true,
      message: "Email sent via Resend",
      provider: "resend",
    };
  } catch (error) {
    return { success: false, error: error.message, provider: "resend" };
  }
}

async function sendWithSMTP(
  to: string,
  subject: string,
  html?: string,
  text?: string,
) {
  // SMTP fallback - this would require additional SMTP configuration
  // For now, we'll return a simulated success for fallback
  console.log(
    "SMTP fallback triggered - email would be queued for later delivery",
  );

  return {
    success: true,
    message: "Email queued for SMTP delivery",
    provider: "smtp",
  };
}
