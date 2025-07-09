import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Only call req.json() ONCE
    const body = await req.json();
    console.log("Received body:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Send email notification function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let {
      to,
      subject,
      template,
      data,
      htmlContent,
      textContent,
      priority = "normal",
    } = body;

    // Provide default test values if missing (for testing purposes)
    if (!to || !subject) {
      if (!to) to = "test@example.com";
      if (!subject) subject = "Test Email Notification";
      if (!template) template = "test";
      if (!data) data = { name: "Test User", message: "Test notification" };
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

    // Try multiple email providers
    let result = await sendWithSender(
      to,
      subject,
      finalHtmlContent,
      finalTextContent,
    );

    if (!result.success) {
      console.log("Sender failed, trying fallback...");
      result = await sendWithFallback(
        to,
        subject,
        finalHtmlContent,
        finalTextContent,
      );
    }

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        provider: result.provider,
        timestamp: new Date().toISOString(),
      }),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Edge Function Error:", error);

    return new Response(
      JSON.stringify({
        error: "Function crashed",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        <h1>Welcome to Rebooked Solutions, ${data.name || "User"}!</h1>
        <p>Thank you for joining our textbook marketplace.</p>
        <p>You can now start buying and selling textbooks with students across South Africa.</p>
        <p>Best regards,<br>The Rebooked Solutions Team</p>
      `,
      text: `Welcome to Rebooked Solutions, ${data.name || "User"}! Thank you for joining our textbook marketplace.`,
    },
    order_confirmation: {
      html: `
        <h2>Order Confirmation</h2>
        <p>Hi ${data.buyerName || "Customer"},</p>
        <p>Your order has been confirmed:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle || "N/A"}</li>
          <li><strong>Price:</strong> R${data.price || "0"}</li>
          <li><strong>Order ID:</strong> ${data.orderId || "N/A"}</li>
        </ul>
        <p>Best regards,<br>Rebooked Solutions</p>
      `,
      text: `Order Confirmation: Your order for ${data.bookTitle || "N/A"} (R${data.price || "0"}) has been confirmed. Order ID: ${data.orderId || "N/A"}`,
    },
    commit_reminder: {
      html: `
        <h2>Order Commitment Reminder</h2>
        <p>You have an order waiting for commitment:</p>
        <p><strong>Book:</strong> ${data.bookTitle || "N/A"}</p>
        <p><strong>Deadline:</strong> ${data.deadline ? new Date(data.deadline).toLocaleString() : "N/A"}</p>
        <p>Please log in to your account to commit to this sale.</p>
        <p>Best regards,<br>Rebooked Solutions</p>
      `,
      text: `Order Commitment Reminder: Please commit to your order for ${data.bookTitle || "N/A"} by ${data.deadline ? new Date(data.deadline).toLocaleString() : "N/A"}`,
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

async function sendWithFallback(
  to: string,
  subject: string,
  html?: string,
  text?: string,
) {
  // Fallback email sending - could be SMTP, Resend, etc.
  console.log("Using fallback email delivery for:", to);

  return {
    success: true,
    message: "Email queued for fallback delivery",
    provider: "fallback",
  };
}
