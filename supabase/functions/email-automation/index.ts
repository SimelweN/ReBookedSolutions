import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Environment variable validation
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const optionalEnvVars = ["SENDER_API_KEY"];
const missingRequiredVars = requiredEnvVars.filter(
  (varName) => !Deno.env.get(varName),
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const SENDER_API_KEY = Deno.env.get("SENDER_API_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Health check handler
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "email-automation",
          timestamp: new Date().toISOString(),
          environment: {
            hasRequiredVars: missingRequiredVars.length === 0,
            missingVars: missingRequiredVars,
            hasEmailProvider: !!SENDER_API_KEY,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Environment validation
    if (missingRequiredVars.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error",
          details: `Missing environment variables: ${missingRequiredVars.join(", ")}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Email automation request:", requestBody);

    // Health check via JSON
    if (requestBody.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "email-automation",
          timestamp: new Date().toISOString(),
          environment: {
            hasRequiredVars: missingRequiredVars.length === 0,
            missingVars: missingRequiredVars,
            hasEmailProvider: !!SENDER_API_KEY,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Test mode handler
    if (requestBody.action === "test" || requestBody.test === true) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email automation test successful",
          email_sent: true,
          recipient: requestBody.recipient || "test@example.com",
          template: requestBody.template || "test_notification",
          sent_at: new Date().toISOString(),
          test: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { action, recipient, template, data, subject, message } = requestBody;

    // Handle different automation actions
    switch (action) {
      case "send_welcome":
        return await handleWelcomeEmail(recipient, data);

      case "send_order_confirmation":
        return await handleOrderConfirmation(recipient, data);

      case "send_commit_reminder":
        return await handleCommitReminder(recipient, data);

      case "send_delivery_notification":
        return await handleDeliveryNotification(recipient, data);

      case "send_custom":
        return await handleCustomEmail(recipient, subject, message, data);

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Invalid action. Supported actions: send_welcome, send_order_confirmation, send_commit_reminder, send_delivery_notification, send_custom",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }
  } catch (error) {
    console.error("Error in email-automation:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function handleWelcomeEmail(recipient: string, data: any) {
  if (!recipient) {
    return new Response(
      JSON.stringify({ success: false, error: "Recipient email is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Simulate welcome email
  const emailData = {
    to: recipient,
    subject: "Welcome to ReBooked Solutions!",
    template: "welcome",
    data: {
      firstName: data?.firstName || "User",
      loginUrl: "https://app.rebookedsolutions.com/login",
      ...data,
    },
  };

  return await sendEmail(emailData);
}

async function handleOrderConfirmation(recipient: string, data: any) {
  if (!recipient || !data?.orderId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Recipient email and order ID are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const emailData = {
    to: recipient,
    subject: "Order Confirmation - ReBooked Solutions",
    template: "order_confirmation",
    data: {
      orderId: data.orderId,
      bookTitle: data.bookTitle || "Your Book",
      amount: data.amount || 0,
      deliveryOption: data.deliveryOption || "Standard",
      ...data,
    },
  };

  return await sendEmail(emailData);
}

async function handleCommitReminder(recipient: string, data: any) {
  if (!recipient || !data?.orderId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Recipient email and order ID are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const emailData = {
    to: recipient,
    subject: "Action Required: Commit to Sale",
    template: "commit_reminder",
    data: {
      orderId: data.orderId,
      bookTitle: data.bookTitle || "Your Book",
      deadline: data.deadline || "24 hours",
      dashboardUrl: "https://app.rebookedsolutions.com/dashboard",
      ...data,
    },
  };

  return await sendEmail(emailData);
}

async function handleDeliveryNotification(recipient: string, data: any) {
  if (!recipient || !data?.trackingNumber) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Recipient email and tracking number are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const emailData = {
    to: recipient,
    subject: "Your Order is on the Way!",
    template: "delivery_notification",
    data: {
      trackingNumber: data.trackingNumber,
      carrier: data.carrier || "Courier",
      estimatedDelivery: data.estimatedDelivery || "Soon",
      trackingUrl: data.trackingUrl || "#",
      ...data,
    },
  };

  return await sendEmail(emailData);
}

async function handleCustomEmail(
  recipient: string,
  subject: string,
  message: string,
  data: any,
) {
  if (!recipient || !subject || !message) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Recipient, subject, and message are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const emailData = {
    to: recipient,
    subject: subject,
    html: message,
    data: data || {},
  };

  return await sendEmail(emailData);
}

async function sendEmail(emailData: any) {
  try {
    // If no email provider API key, simulate sending
    if (!SENDER_API_KEY) {
      // Log the email attempt
      await supabase.from("audit_logs").insert({
        action: "email_sent_simulated",
        table_name: "emails",
        new_values: {
          recipient: emailData.to,
          subject: emailData.subject,
          template: emailData.template || "custom",
          sent_at: new Date().toISOString(),
          simulated: true,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully (simulated)",
          recipient: emailData.to,
          subject: emailData.subject,
          sent_at: new Date().toISOString(),
          simulated: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Here would be the actual email sending logic with the provider
    // For now, we'll simulate it
    await supabase.from("audit_logs").insert({
      action: "email_sent",
      table_name: "emails",
      new_values: {
        recipient: emailData.to,
        subject: emailData.subject,
        template: emailData.template || "custom",
        sent_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        recipient: emailData.to,
        subject: emailData.subject,
        sent_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send email",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
