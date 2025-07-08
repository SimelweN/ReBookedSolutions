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

interface CommitRequest {
  transactionId?: string;
  orderId?: string;
  sellerId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transactionId, orderId, sellerId }: CommitRequest =
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
      throw new Error("Unauthorized: You can only commit to your own sales");
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
        "Order not found, or you don't have permission to commit this sale",
      );
    }

    console.log(`Processing commit for order:`, order.id);

    // Check if already ready for payout (committed)
    if (order.status === "ready_for_payout") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sale already committed",
          data: order,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check current status - should be 'paid'
    if (order.status !== "paid") {
      throw new Error(`Cannot commit sale with status: ${order.status}`);
    }

    const now = new Date();

    // Update the order to ready_for_payout status
    const { data: updatedRecord, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "ready_for_payout",
        updated_at: now.toISOString(),
      })
      .eq("id", order.id)
      .eq("seller_id", sellerId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating record:", updateError);
      throw new Error(`Failed to commit sale: ${updateError.message}`);
    }

    console.log("✅ Sale committed successfully:", updatedRecord.id);

    // Update book statuses to sold for all items
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.book_id) {
          const { error: bookUpdateError } = await supabase
            .from("books")
            .update({
              sold: true,
              available: false,
              status: "sold",
              updated_at: now.toISOString(),
            })
            .eq("id", item.book_id);

          if (bookUpdateError) {
            console.warn("Could not update book status:", bookUpdateError);
          } else {
            console.log("✅ Book marked as sold:", item.book_id);
          }
        }
      }
    }

    // Create notification for seller (buyer notification would need buyer_id which is not in current schema)
    try {
      // Notification for seller
      await supabase.from("order_notifications").insert({
        order_id: order.id,
        user_id: order.seller_id,
        type: "commitment_confirmed",
        title: "Sale Commitment Confirmed",
        message: `You have successfully committed to order #${order.id.slice(0, 8)}. Your books are ready for payout processing.`,
        read: false,
      });

      console.log("✅ Seller notification created for sale commitment");
    } catch (notificationError) {
      console.warn("Failed to create notifications:", notificationError);
      // Don't fail the commit for notification issues
    }

    // TODO: Trigger courier booking if integrated
    // await triggerCourierBooking(updatedRecord);

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Sale committed successfully! Please prepare your book for collection.",
        data: updatedRecord,
        notifications_sent: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in commit-to-sale function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to commit sale",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
