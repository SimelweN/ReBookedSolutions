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
  getEnvironmentConfig,
} from "../_shared/environment.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // Validate required environment variables
    const missingEnvVars = validateRequiredEnvVars([
      "PAYSTACK_SECRET_KEY",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }

    const config = getEnvironmentConfig();
    const PAYSTACK_SECRET_KEY = config.paystackSecretKey!;

    // Parse and validate request body
    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (error) {
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    const { reference } = requestBody;

    if (!reference) {
      return createErrorResponse("Payment reference is required", 400);
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
    const supabase = validateAndCreateSupabaseClient();

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
