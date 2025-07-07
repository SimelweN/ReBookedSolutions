import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Payment reference is required");
    }

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paymentData = await response.json();

    if (!response.ok) {
      throw new Error(`Paystack verification failed: ${paymentData.message}`);
    }

    const { data } = paymentData;

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (data.status === "success") {
      // Get the order first to ensure we have seller_id
      const { data: existingOrder, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("paystack_ref", reference)
        .single();

      if (fetchError || !existingOrder) {
        console.error("Order not found for reference:", reference, fetchError);
        throw new Error("Order not found for payment verification");
      }

      const paidAt = new Date(data.paid_at);

      // Update order status to "paid"
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_data: data,
          paid_at: paidAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("paystack_ref", reference);

      if (orderError) {
        console.error("Error updating order:", orderError);
        // Don't throw - payment was successful, log the issue
      } else {
        console.log("✅ Order updated successfully");
      }

      // Create notification for seller
      try {
        const { error: notificationError } = await supabase
          .from("order_notifications")
          .insert({
            order_id: existingOrder.id,
            user_id: existingOrder.seller_id,
            type: "payment_received",
            title: "Payment Received",
            message: `Payment received for your book order #${existingOrder.id.slice(0, 8)}. Please prepare for delivery.`,
            read: false,
            created_at: new Date().toISOString(),
          });

        if (notificationError) {
          console.warn(
            "Failed to create seller notification:",
            notificationError,
          );
        } else {
          console.log("✅ Seller notification created");
        }
      } catch (notifError) {
        console.warn("Notification creation failed:", notifError);
      }

      // Send success notification email (optional)
      try {
        await supabase.functions.invoke("send-email-notification", {
          body: {
            to: data.customer.email,
            type: "payment_success",
            data: {
              reference: reference,
              amount: (data.amount / 100).toFixed(2),
            },
          },
        });
      } catch (emailError) {
        console.warn("Email notification failed:", emailError);
        // Don't fail the verification for email issues
      }
    }

    return new Response(
      JSON.stringify({
        status: data.status,
        reference: data.reference,
        amount: data.amount,
        gateway_response: data.gateway_response,
        paid_at: data.paid_at,
        channel: data.channel,
        currency: data.currency,
        customer: data.customer,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: "failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
