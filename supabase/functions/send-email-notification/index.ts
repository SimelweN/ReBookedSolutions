import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, type, data, seller_id } = await req.json();

    if (!type) {
      throw new Error("Email type is required");
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let emailData = {
      to: [],
      subject: "",
      html: "",
      from: "ReBooked Solutions <noreply@rebookedsolutions.co.za>",
    };

    // Get user email if seller_id is provided
    if (seller_id && !to) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", seller_id)
        .single();

      if (error || !profile) {
        throw new Error("Seller profile not found");
      }

      emailData.to = [profile.email];
    } else if (to) {
      emailData.to = Array.isArray(to) ? to : [to];
    } else {
      throw new Error("Email recipient is required");
    }

    // Generate email content based on type
    switch (type) {
      case "payment_success":
        emailData.subject = "Payment Confirmation - ReBooked Solutions";
        emailData.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payment Confirmed!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Thank you for your purchase!</h2>
              <p style="color: #666; line-height: 1.6;">
                Your payment has been successfully processed. Here are the details:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Reference:</strong> ${data.reference}</p>
                <p><strong>Amount:</strong> R${data.amount}</p>
                <p><strong>Status:</strong> Confirmed</p>
              </div>
              <p style="color: #666;">
                Your books will be prepared for shipping and you'll receive tracking information soon.
              </p>
            </div>
            <div style="padding: 20px; text-align: center; background: #333; color: white;">
              <p>ReBooked Solutions - Your Campus Bookstore</p>
            </div>
          </div>
        `;
        break;

      case "payout_initiated":
        emailData.subject = "Payout Initiated - ReBooked Solutions";
        emailData.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payout Initiated!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Your earnings are on the way!</h2>
              <p style="color: #666; line-height: 1.6;">
                We've initiated a payout to your registered bank account. Here are the details:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount:</strong> R${data.amount}</p>
                <p><strong>Reference:</strong> ${data.reference}</p>
                <p><strong>Transfer Code:</strong> ${data.transfer_code}</p>
              </div>
              <p style="color: #666;">
                The funds should reflect in your account within 1-3 business days.
              </p>
              <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #01579b;">
                  <strong>Note:</strong> If you don't receive the funds within 3 business days, 
                  please contact our support team with your transfer code.
                </p>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; background: #333; color: white;">
              <p>ReBooked Solutions - Your Campus Bookstore</p>
            </div>
          </div>
        `;
        break;

      case "payout_success":
        emailData.subject = "Payout Completed - ReBooked Solutions";
        emailData.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payout Completed!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Payment successful!</h2>
              <p style="color: #666; line-height: 1.6;">
                Your payout has been successfully completed and should now be in your account.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount:</strong> R${data.amount}</p>
                <p><strong>Order ID:</strong> ${data.orderId}</p>
              </div>
              <p style="color: #666;">
                Thank you for being part of the ReBooked Solutions community!
              </p>
            </div>
            <div style="padding: 20px; text-align: center; background: #333; color: white;">
              <p>ReBooked Solutions - Your Campus Bookstore</p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email using Resend (if configured) or log it
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Resend API error: ${errorData.message}`);
      }

      const result = await response.json();
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Log email for development/testing
      console.log("📧 Email notification (development):", {
        to: emailData.to,
        subject: emailData.subject,
        type: type,
        data: data,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email logged (development mode)",
          email: emailData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Email notification error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
