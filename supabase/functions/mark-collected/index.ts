import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

// Validate required environment variables
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = validateRequiredEnvVars(requiredVars);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check environment variables first
    if (missingVars.length > 0) {
      return createEnvironmentError(missingVars);
    }

    const config = getEnvironmentConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
    );

    const {
      order_id,
      tracking_number,
      collected_by,
      trigger_payout = false,
    } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Order ID is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Order not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate order status
    if (order.status !== "paid" && order.status !== "awaiting_collection") {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Cannot mark order as collected. Current status: ${order.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update order status to collected
    const updateData: any = {
      status: "collected",
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (tracking_number) {
      updateData.delivery_tracking_number = tracking_number;
      updateData.status = "in_transit";
    }

    if (collected_by) {
      updateData.metadata = {
        ...order.metadata,
        collected_by,
        collection_confirmed_at: new Date().toISOString(),
      };
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update order status",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update corresponding transaction
    await supabase
      .from("transactions")
      .update({
        status: tracking_number ? "committed" : "collected",
        updated_at: new Date().toISOString(),
      })
      .eq("paystack_reference", order.paystack_reference);

    // Trigger seller payout if requested and we have the necessary info
    let payoutResult = null;
    if (trigger_payout && PAYSTACK_SECRET_KEY && order.seller_subaccount_code) {
      try {
        // Get seller banking details
        const { data: bankingDetails } = await supabase
          .from("banking_details")
          .select("recipient_code")
          .eq("user_id", order.seller_id)
          .eq("account_verified", true)
          .single();

        if (bankingDetails?.recipient_code) {
          const payoutResponse = await fetch(
            "https://api.paystack.co/transfer",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                source: "balance",
                amount: order.seller_amount,
                recipient: bankingDetails.recipient_code,
                reason: `ReBooked Sale - Order ${order.id}`,
                reference: `payout_${order.id}_${Date.now()}`,
              }),
            },
          );

          const payoutData = await payoutResponse.json();

          if (payoutData.status) {
            payoutResult = {
              success: true,
              transfer_code: payoutData.data.transfer_code,
            };

            // Update order with payout info
            await supabase
              .from("orders")
              .update({
                metadata: {
                  ...updatedOrder.metadata,
                  payout_initiated: true,
                  payout_transfer_code: payoutData.data.transfer_code,
                  payout_initiated_at: new Date().toISOString(),
                },
              })
              .eq("id", order_id);
          } else {
            payoutResult = {
              success: false,
              message: payoutData.message || "Payout failed",
            };
          }
        }
      } catch (payoutError) {
        console.error("Payout error:", payoutError);
        payoutResult = {
          success: false,
          message: "Payout failed due to system error",
        };
      }
    }

    // TODO: Send notifications
    // - Notify buyer that order is collected/in transit
    // - Notify seller that collection is confirmed
    // - Update delivery service with status change

    console.log("Order marked as collected successfully:", order_id);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order_id: updatedOrder.id,
          status: updatedOrder.status,
          collected_at: updatedOrder.collected_at,
          tracking_number: updatedOrder.delivery_tracking_number,
          payout: payoutResult,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in mark-collected function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
