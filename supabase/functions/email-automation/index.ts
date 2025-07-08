import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data }: EmailRequest = await req.json();

    console.log(`Sending email to: ${to}, template: ${template}`);

    const emailContent = generateEmailContent(template, data);

    const response = await sendEmail(to, subject, emailContent);

    await supabase.from("audit_logs").insert({
      action: "email_sent",
      table_name: "email_automation",
      new_values: { to, subject, template, success: response.success },
    });

    return new Response(
      JSON.stringify({ success: response.success, message: response.message }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error in email-automation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
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
        <p>Hi ${data.buyerName},</p>
        <p>Thank you for your order! Here are the details:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle}</li>
          <li><strong>Price:</strong> R${data.price}</li>
          <li><strong>Order ID:</strong> ${data.orderId}</li>
        </ul>
        <p>The seller has 48 hours to confirm availability.</p>
        <p>Best regards,<br>Rebooked Solutions Team</p>
      `;

    case "seller_notification":
      return `
        <h2>New Order Received</h2>
        <p>Hi ${data.sellerName},</p>
        <p>You have received a new order:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle}</li>
          <li><strong>Price:</strong> R${data.price}</li>
          <li><strong>Buyer:</strong> ${data.buyerEmail}</li>
        </ul>
        <p>Please log in to confirm availability within 48 hours.</p>
        <p>Best regards,<br>Rebooked Solutions Team</p>
      `;

    case "order_committed":
      return `
        <h2>Order Confirmed</h2>
        <p>Hi ${data.buyerName},</p>
        <p>Great news! Your order has been confirmed by the seller.</p>
        <p>Delivery details will be sent to you soon.</p>
        <p>Best regards,<br>Rebooked Solutions Team</p>
      `;

    case "order_cancelled":
      return `
        <h2>Order Cancelled</h2>
        <p>Hi ${data.buyerName},</p>
        <p>We're sorry to inform you that your order has been cancelled.</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p>A refund will be processed within 24 hours.</p>
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

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const senderApiKey = Deno.env.get("SENDER_API_KEY");
  const fromEmail =
    Deno.env.get("FROM_EMAIL") || "noreply@rebookedsolutions.co.za";

  if (!senderApiKey) {
    console.log("SENDER_API_KEY not found, simulating email send");
    return { success: true, message: "Email simulated (no API key)" };
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
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Sender API error:", errorData);
      return { success: false, message: `Failed to send email: ${errorData}` };
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error.message };
  }
}
