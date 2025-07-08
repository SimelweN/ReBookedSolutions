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
    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    console.log("Starting expired orders check...");

    // Find orders that have passed their collection deadline
    const { data: expiredOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["paid", "awaiting_collection"])
      .lte("collection_deadline", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching expired orders:", fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to fetch expired orders",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log("No expired orders found");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expired orders to process",
          processed: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`Found ${expiredOrders.length} expired orders`);

    const results = [];

    for (const order of expiredOrders) {
      try {
        console.log(`Processing expired order: ${order.id}`);

        let refundResult = null;

        // Attempt automatic refund via Paystack if we have the API key
        if (PAYSTACK_SECRET_KEY && order.paystack_reference) {
          try {
            const refundResponse = await fetch(
              "https://api.paystack.co/refund",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transaction: order.paystack_reference,
                  amount: order.total_amount, // Amount in kobo
                  currency: "ZAR",
                  customer_note:
                    "Automatic refund due to collection deadline exceeded",
                  merchant_note: `Order ${order.id} - Collection deadline exceeded`,
                }),
              },
            );

            const refundData = await refundResponse.json();

            if (refundData.status) {
              refundResult = {
                success: true,
                refund_id: refundData.data.id,
                amount: refundData.data.amount,
              };
              console.log(`Refund successful for order ${order.id}`);
            } else {
              refundResult = {
                success: false,
                message: refundData.message || "Refund failed",
              };
              console.error(
                `Refund failed for order ${order.id}:`,
                refundData.message,
              );
            }
          } catch (refundError) {
            console.error(`Refund error for order ${order.id}:`, refundError);
            refundResult = {
              success: false,
              message: "Refund API error",
            };
          }
        }

        // Update order status regardless of refund result
        const updateData: any = {
          status: "expired",
          updated_at: new Date().toISOString(),
          cancelled_at: new Date().toISOString(),
          metadata: {
            ...order.metadata,
            expired_at: new Date().toISOString(),
            auto_expired_by_system: true,
          },
        };

        if (refundResult?.success) {
          updateData.status = "refunded";
          updateData.refunded_at = new Date().toISOString();
          updateData.metadata.refund_id = refundResult.refund_id;
          updateData.metadata.refund_amount = refundResult.amount;
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", order.id);

        if (updateError) {
          console.error(`Failed to update order ${order.id}:`, updateError);
          results.push({
            order_id: order.id,
            success: false,
            message: "Failed to update order status",
          });
          continue;
        }

        // Update corresponding transaction
        await supabase
          .from("transactions")
          .update({
            status: refundResult?.success ? "refunded" : "cancelled",
            updated_at: new Date().toISOString(),
            metadata: {
              expired_at: new Date().toISOString(),
              refund_result: refundResult,
            },
          })
          .eq("paystack_reference", order.paystack_reference);

        results.push({
          order_id: order.id,
          success: true,
          refund_result: refundResult,
          new_status: updateData.status,
        });

        // TODO: Send notification to buyer about expired order/refund
        // TODO: Send notification to seller about missed collection
        // TODO: Update book status back to available
      } catch (orderError) {
        console.error(`Error processing order ${order.id}:`, orderError);
        results.push({
          order_id: order.id,
          success: false,
          message:
            orderError instanceof Error ? orderError.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `Processed ${expiredOrders.length} expired orders: ${successCount} successful, ${failureCount} failed`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${expiredOrders.length} expired orders`,
        processed: expiredOrders.length,
        successful: successCount,
        failed: failureCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in check-expired-orders function:", error);
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
