import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  createGenericErrorHandler,
} from "../_shared/cors.ts";
import {
  validateAndCreateSupabaseClient,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

const fromEmail = Deno.env.get("FROM_EMAIL") || "notifications@rebooked.co.za";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to ReBooked Solutions! 📚",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #44ab83; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to ReBooked!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Hi {{name}},</p>
          <p>Welcome to South Africa's premier university textbook marketplace! We're excited to have you join our community of students buying and selling textbooks.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{siteUrl}}/books" style="background: #44ab83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Books</a>
          </div>
          <p>Get started by:</p>
          <ul>
            <li>Browse available textbooks for your university</li>
            <li>List your own textbooks for sale</li>
            <li>Complete your profile for better trust</li>
          </ul>
        </div>
      </div>
    `,
    variables: ["name", "siteUrl"],
  },

  book_sold: {
    id: "book_sold",
    name: "Book Sold Notification",
    subject: 'Great news! Your book "{{bookTitle}}" has been sold! 🎉',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #44ab83; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Book Sold!</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi {{sellerName}},</p>
          <p>Congratulations! Your book "<strong>{{bookTitle}}</strong>" has been purchased by {{buyerName}}.</p>
          <div style="background: #f0f8f4; padding: 20px; border-left: 4px solid #44ab83; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Sale Details:</h3>
            <p><strong>Book:</strong> {{bookTitle}} by {{bookAuthor}}</p>
            <p><strong>Sale Price:</strong> R{{salePrice}}</p>
            <p><strong>Your Earnings:</strong> R{{sellerAmount}}</p>
            <p><strong>Order Reference:</strong> {{orderReference}}</p>
          </div>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>You have 48 hours to commit to this sale</li>
            <li>Prepare your book for collection/delivery</li>
            <li>Wait for buyer to confirm receipt</li>
            <li>Receive payment to your bank account</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{commitUrl}}" style="background: #44ab83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Commit to Sale</a>
          </div>
        </div>
      </div>
    `,
    variables: [
      "sellerName",
      "bookTitle",
      "bookAuthor",
      "buyerName",
      "salePrice",
      "sellerAmount",
      "orderReference",
      "commitUrl",
    ],
  },

  book_purchased: {
    id: "book_purchased",
    name: "Book Purchase Confirmation",
    subject: 'Purchase confirmed! You bought "{{bookTitle}}" 📚',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #44ab83; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Purchase Confirmed!</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi {{buyerName}},</p>
          <p>Thank you for your purchase! We've confirmed your order for "<strong>{{bookTitle}}</strong>".</p>
          <div style="background: #f0f8f4; padding: 20px; border-left: 4px solid #44ab83; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Order Details:</h3>
            <p><strong>Book:</strong> {{bookTitle}} by {{bookAuthor}}</p>
            <p><strong>Seller:</strong> {{sellerName}}</p>
            <p><strong>Total Paid:</strong> R{{totalAmount}}</p>
            <p><strong>Order Reference:</strong> {{orderReference}}</p>
          </div>
          <p><strong>What happens next:</strong></p>
          <ol>
            <li>The seller has 48 hours to commit to the sale</li>
            <li>Once committed, we'll arrange delivery</li>
            <li>You'll receive tracking information</li>
            <li>Confirm receipt to release payment to seller</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{orderUrl}}" style="background: #44ab83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Order</a>
          </div>
        </div>
      </div>
    `,
    variables: [
      "buyerName",
      "bookTitle",
      "bookAuthor",
      "sellerName",
      "totalAmount",
      "orderReference",
      "orderUrl",
    ],
  },

  commit_reminder: {
    id: "commit_reminder",
    name: "Commit Reminder",
    subject: "Reminder: Please commit to your sale - 24 hours remaining ⏰",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Commit Reminder</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi {{sellerName}},</p>
          <p>This is a friendly reminder that you have <strong>24 hours remaining</strong> to commit to the sale of your book "{{bookTitle}}".</p>
          <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p><strong>Important:</strong> If you don't commit within 48 hours, the order will be automatically cancelled and the buyer will be refunded.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{commitUrl}}" style="background: #44ab83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Commit Now</a>
          </div>
        </div>
      </div>
    `,
    variables: ["sellerName", "bookTitle", "commitUrl"],
  },

  sale_expired: {
    id: "sale_expired",
    name: "Sale Expired",
    subject: "Order cancelled - Seller did not commit in time",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Order Cancelled</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi {{buyerName}},</p>
          <p>Unfortunately, your order for "{{bookTitle}}" has been cancelled because the seller did not commit to the sale within the 48-hour deadline.</p>
          <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p><strong>Refund:</strong> Your payment of R{{refundAmount}} has been automatically refunded and will appear in your account within 3-5 business days.</p>
          </div>
          <p>Don't worry! There are many other books available on our platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{browseUrl}}" style="background: #44ab83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse More Books</a>
          </div>
        </div>
      </div>
    `,
    variables: ["buyerName", "bookTitle", "refundAmount", "browseUrl"],
  },

  password_reset: {
    id: "password_reset",
    name: "Password Reset",
    subject: "Reset your ReBooked password",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #44ab83; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi {{name}},</p>
          <p>You requested to reset your password for your ReBooked account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #44ab83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      </div>
    `,
    variables: ["name", "resetUrl"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // Validate environment variables
    const missingEnvVars = validateRequiredEnvVars([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASS",
    ]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }

    // Initialize Supabase client
    const supabase = validateAndCreateSupabaseClient();
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (req.method) {
      case "POST":
        if (action === "send") {
          const emailData = await req.json();
          return await sendEmail(supabase, emailData);
        } else if (action === "send-template") {
          const templateData = await req.json();
          return await sendTemplateEmail(supabase, templateData);
        } else if (action === "queue") {
          const emailData = await req.json();
          return await queueEmail(supabase, emailData);
        } else if (action === "process-queue") {
          return await processEmailQueue(supabase);
        } else if (action === "trigger-automation") {
          const automation = await req.json();
          return await triggerEmailAutomation(supabase, automation);
        }
        break;

      case "GET":
        if (action === "templates") {
          return await getEmailTemplates();
        } else if (action === "queue-status") {
          return await getQueueStatus(supabase);
        } else if (action === "analytics") {
          const period = url.searchParams.get("period") || "30d";
          return await getEmailAnalytics(supabase, period);
        }
        break;
    }

    return createErrorResponse("Invalid action", 400);
  } catch (error) {
    return createGenericErrorHandler("email-automation")(error);
  }
});

async function sendEmail(supabase: any, emailData: any) {
  const { to, subject, htmlContent, textContent, templateId, variables } =
    emailData;

  let finalHtmlContent = htmlContent;
  let finalSubject = subject;

  // If using template, process it
  if (templateId && EMAIL_TEMPLATES[templateId]) {
    const template = EMAIL_TEMPLATES[templateId];
    finalHtmlContent = processTemplate(template.htmlContent, variables || {});
    finalSubject = processTemplate(template.subject, variables || {});
  }

  // Check if API key is configured
  if (!resendApiKey) {
    console.log(
      "⚠️ VITE_RESEND_API_KEY not configured - simulating email send",
    );

    // Log email sent for simulation
    await supabase.from("email_logs").insert({
      to_email: to,
      subject: finalSubject,
      template_id: templateId,
      status: "simulated",
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: "simulated_" + Date.now(),
        message: "Email simulated (no API key configured)",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Send via Resend API
  const emailPayload = {
    from: `ReBooked Solutions <${fromEmail}>`,
    to: [to],
    subject: finalSubject,
    html: finalHtmlContent,
  };

  if (textContent) {
    emailPayload.text = textContent;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      `Resend error: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`,
    );
  }

  // Log email sent
  await supabase.from("email_logs").insert({
    to_email: to,
    subject: finalSubject,
    template_id: templateId,
    status: "sent",
    sent_at: new Date().toISOString(),
  });

  return new Response(
    JSON.stringify({
      success: true,
      messageId: responseData.id || responseData.message_id,
      data: responseData,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function sendTemplateEmail(supabase: any, templateData: any) {
  const { templateId, to, variables } = templateData;

  if (!EMAIL_TEMPLATES[templateId]) {
    return new Response(JSON.stringify({ error: "Template not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return await sendEmail(supabase, { to, templateId, variables });
}

async function queueEmail(supabase: any, emailData: any) {
  const { to, subject, htmlContent, templateId, variables, scheduledFor } =
    emailData;

  const { data, error } = await supabase
    .from("email_queue")
    .insert({
      to_email: to,
      subject,
      html_content: htmlContent,
      template_id: templateId,
      variables: variables ? JSON.stringify(variables) : null,
      scheduled_for: scheduledFor || new Date().toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, queueId: data.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function processEmailQueue(supabase: any) {
  // Get pending emails that are due to be sent
  const { data: pendingEmails, error } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(50);

  if (error) throw error;

  let processed = 0;
  let failed = 0;

  for (const email of pendingEmails) {
    try {
      const emailData = {
        to: email.to_email,
        subject: email.subject,
        htmlContent: email.html_content,
        templateId: email.template_id,
        variables: email.variables ? JSON.parse(email.variables) : {},
      };

      await sendEmail(supabase, emailData);

      // Update status to sent
      await supabase
        .from("email_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", email.id);

      processed++;
    } catch (error) {
      // Update status to failed
      await supabase
        .from("email_queue")
        .update({
          status: "failed",
          error_message: error.message,
          failed_at: new Date().toISOString(),
        })
        .eq("id", email.id);

      failed++;
    }
  }

  return new Response(
    JSON.stringify({
      processed,
      failed,
      total: pendingEmails.length,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function triggerEmailAutomation(supabase: any, automation: any) {
  const { trigger, data } = automation;

  switch (trigger) {
    case "user_registered":
      await sendTemplateEmail(supabase, {
        templateId: "welcome",
        to: data.email,
        variables: {
          name: data.name,
          siteUrl: Deno.env.get("SITE_URL") || "https://rebooked.co.za",
        },
      });
      break;

    case "book_sold":
      await sendTemplateEmail(supabase, {
        templateId: "book_sold",
        to: data.sellerEmail,
        variables: data,
      });
      await sendTemplateEmail(supabase, {
        templateId: "book_purchased",
        to: data.buyerEmail,
        variables: data,
      });
      break;

    case "commit_reminder":
      await sendTemplateEmail(supabase, {
        templateId: "commit_reminder",
        to: data.sellerEmail,
        variables: data,
      });
      break;

    case "sale_expired":
      await sendTemplateEmail(supabase, {
        templateId: "sale_expired",
        to: data.buyerEmail,
        variables: data,
      });
      break;

    default:
      return new Response(
        JSON.stringify({ error: "Unknown automation trigger" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getEmailTemplates() {
  return new Response(
    JSON.stringify({ templates: Object.values(EMAIL_TEMPLATES) }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function getQueueStatus(supabase: any) {
  const { data: queueStats } = await supabase
    .from("email_queue")
    .select("status");

  const stats = queueStats?.reduce((acc: any, email: any) => {
    acc[email.status] = (acc[email.status] || 0) + 1;
    return acc;
  }, {});

  return new Response(JSON.stringify({ queueStats: stats }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getEmailAnalytics(supabase: any, period: string) {
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: emailLogs } = await supabase
    .from("email_logs")
    .select("*")
    .gte("sent_at", startDate.toISOString());

  const analytics = {
    totalSent: emailLogs?.length || 0,
    byTemplate: {},
    byDay: {},
    successRate: 100, // Would calculate based on delivery confirmations
  };

  emailLogs?.forEach((log: any) => {
    // Group by template
    const template = log.template_id || "custom";
    analytics.byTemplate[template] = (analytics.byTemplate[template] || 0) + 1;

    // Group by day
    const day = new Date(log.sent_at).toISOString().split("T")[0];
    analytics.byDay[day] = (analytics.byDay[day] || 0) + 1;
  });

  return new Response(JSON.stringify({ analytics }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function processTemplate(
  template: string,
  variables: Record<string, any>,
): string {
  let processed = template;

  // Replace all variables in the format {{variableName}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    processed = processed.replace(regex, String(value));
  }

  return processed;
}
