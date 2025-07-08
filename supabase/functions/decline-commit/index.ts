import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Validate required environment variables
const requiredVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAYSTACK_SECRET_KEY",
];
const missingVars = validateRequiredEnvVars(requiredVars);

interface DeclineRequest {
  transactionId?: string;
  orderId?: string;
  sellerId: string;
  reason?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { transactionId, orderId, sellerId, reason }: DeclineRequest =
      await req.json();

    if (!sellerId) {
      throw new Error("Seller ID is required");
    }

    if (!transactionId && !orderId) {
      throw new Error("Either transactionId or orderId is required");
    }

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get JWT token from request for user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Verify the user making the request
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      throw new Error("Invalid authentication token");
    }

    // Security: Verify the seller ID matches the authenticated user
    if (user.id !== sellerId) {
      throw new Error("Unauthorized: You can only decline your own sales");
    }

    // Find the order
    const orderIdToUse = orderId || transactionId;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderIdToUse)
      .eq("seller_id", sellerId)
      .single();

    if (orderError || !order) {
      throw new Error(
        "Order not found, or you don't have permission to decline this sale",
      );
    }

    console.log(`Processing decline for order:`, order.id);

    // Check if already cancelled
    if (order.status === "cancelled") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sale already declined",
          data: order,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (order.status === "ready_for_payout" || order.status === "paid_out") {
      throw new Error("Cannot decline a sale that has already been committed");
    }

    // Check current status - should be 'paid'
    if (order.status !== "paid") {
      throw new Error(`Cannot decline sale with status: ${order.status}`);
    }

    const now = new Date();

    // Update the order to cancelled status
    const { data: updatedRecord, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: now.toISOString(),
        metadata: {
          ...order.metadata,
          declined_at: now.toISOString(),
          decline_reason: reason || "Seller declined the order",
        },
      })
      .eq("id", order.id)
      .eq("seller_id", sellerId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating record:", updateError);
      throw new Error(`Failed to decline sale: ${updateError.message}`);
    }

    console.log("✅ Sale declined successfully:", updatedRecord.id);

    // Relist the books as available
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.book_id) {
          const { error: bookUpdateError } = await supabase
            .from("books")
            .update({
              sold: false,
              available: true,
              status: "available",
              updated_at: now.toISOString(),
            })
            .eq("id", item.book_id);

          if (bookUpdateError) {
            console.warn("Could not relist book:", bookUpdateError);
          } else {
            console.log("✅ Book relisted as available:", item.book_id);
          }
        }
      }
    }

    // Process refund if Paystack reference exists
    let refundProcessed = false;
    if (order.paystack_ref && PAYSTACK_SECRET_KEY) {
      try {
        console.log(
          `💳 Processing refund for declined order: ${order.paystack_ref}`,
        );

        const refundResponse = await fetch("https://api.paystack.co/refund", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction: order.paystack_ref,
            amount: order.amount, // Amount in kobo
            currency: "ZAR",
            customer_note: "Refund for declined order",
            merchant_note: `Refund for order ${order.id} - seller declined the order`,
          }),
        });

        const refundResult = await refundResponse.json();

        if (refundResult.status) {
          console.log(`✅ Refund successful:`, refundResult.data);

          // Update record with refund details
          await supabase
            .from("orders")
            .update({
              status: "cancelled",
              metadata: {
                ...order.metadata,
                refund_reference: refundResult.data?.reference,
                refunded_at: now.toISOString(),
              },
              updated_at: now.toISOString(),
            })
            .eq("id", order.id);

          refundProcessed = true;
        } else {
          console.error(`❌ Refund failed:`, refundResult.message);
        }
      } catch (refundError) {
        console.error(`💥 Refund processing error:`, refundError);
      }
    }

    // Create notification for seller (buyer notification would need buyer_id which is not in current schema)
    try {
      // Notification for seller
      await supabase.from("order_notifications").insert({
        order_id: order.id,
        user_id: order.seller_id,
        type: "decline_confirmed",
        title: "Order Decline Confirmed",
        message: `You have declined order #${order.id.slice(0, 8)}. The books have been relisted and ${refundProcessed ? "buyer automatically refunded" : "buyer will receive refund assistance"}.`,
        read: false,
      });

      console.log("✅ Decline notification created");
    } catch (notificationError) {
      console.warn("Failed to create notifications:", notificationError);
      // Don't fail the decline for notification issues
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: refundProcessed
          ? "Order declined successfully and buyer has been refunded"
          : "Order declined successfully. Buyer will be notified.",
        data: updatedRecord,
        refund_processed: refundProcessed,
        notifications_sent: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in decline-commit function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to decline sale",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
