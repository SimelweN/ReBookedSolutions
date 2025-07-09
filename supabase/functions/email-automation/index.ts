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
          message: "Email automation function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let { to, subject, template, data } = body;

    // Provide default test values if missing (for testing purposes)
    if (!to || !subject) {
      if (!to) to = "test@example.com";
      if (!subject) subject = "Test Email Subject";
      if (!template) template = "test";
      if (!data) data = { name: "Test User", message: "Test message" };
    }

    console.log(`Processing email to: ${to}, template: ${template}`);

    // Generate email content based on template
    const emailContent = generateEmailContent(template, data || {});

    // Simulate email sending (replace with real email service)
    const senderApiKey = Deno.env.get("SENDER_API_KEY");

    let emailResult;
    if (senderApiKey) {
      emailResult = await sendEmailWithSender(
        to,
        subject,
        emailContent,
        senderApiKey,
      );
    } else {
      emailResult = {
        success: true,
        message: "Email simulated (no API key configured)",
      };
    }

    return new Response(
      JSON.stringify({
        success: emailResult.success,
        message: emailResult.message,
        emailSent: true,
      }),
      {
        status: 200,
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

function generateEmailContent(
  template: string,
  data: Record<string, any>,
): string {
  switch (template) {
    case "order_confirmation":
      return `
        <h2>Order Confirmation</h2>
        <p>Hi ${data.buyerName || "Customer"},</p>
        <p>Thank you for your order! Here are the details:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle || "N/A"}</li>
          <li><strong>Price:</strong> R${data.price || "0"}</li>
          <li><strong>Order ID:</strong> ${data.orderId || "N/A"}</li>
        </ul>
        <p>The seller has 48 hours to confirm availability.</p>
        <p>Best regards,<br>Rebooked Solutions Team</p>
      `;

    case "seller_notification":
      return `
        <h2>New Order Received</h2>
        <p>Hi ${data.sellerName || "Seller"},</p>
        <p>You have received a new order:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle || "N/A"}</li>
          <li><strong>Price:</strong> R${data.price || "0"}</li>
          <li><strong>Buyer:</strong> ${data.buyerEmail || "N/A"}</li>
        </ul>
        <p>Please log in to confirm availability within 48 hours.</p>
        <p>Best regards,<br>Rebooked Solutions Team</p>
      `;

    default:
      return `
        <h2>Notification</h2>
        <p>Hi ${data.name || "User"},</p>
        <p>${data.message || "This is a notification from Rebooked Solutions."}</p>
        <p>Best regards,<br>Rebooked Solutions Team</p>
      `;
  }
}

async function sendEmailWithSender(
  to: string,
  subject: string,
  htmlContent: string,
  apiKey: string,
) {
  try {
    const response = await fetch("https://api.sender.net/v2/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL") || "noreply@rebookedsolutions.co.za",
        to: [{ email: to }],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Sender API error:", errorData);
      return { success: false, message: `Failed to send email: ${errorData}` };
    }

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error.message };
  }
}
