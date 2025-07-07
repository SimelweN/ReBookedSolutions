import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    // Try to find transaction first, then order
    let transactionData = null;
    let orderData = null;

    if (transactionId) {
      // Check transaction table
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .eq("seller_id", sellerId)
        .single();

      if (transactionError) {
        console.warn("Transaction not found:", transactionError);
      } else {
        transactionData = transaction;
      }
    }

    if (orderId || (!transactionData && orderId)) {
      // Check orders table
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId || transactionId)
        .eq("seller_id", sellerId)
        .single();

      if (orderError) {
        console.warn("Order not found:", orderError);
      } else {
        orderData = order;
      }
    }

    if (!transactionData && !orderData) {
      throw new Error(
        "Transaction or order not found, or you don't have permission to decline this sale",
      );
    }

    // Use whichever data we found
    const data = transactionData || orderData;
    const isTransaction = !!transactionData;
    const tableName = isTransaction ? "transactions" : "orders";

    console.log(`Processing decline for ${tableName}:`, data.id);

    // Check if already declined or committed
    if (data.status === "declined_by_seller") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sale already declined",
          data: data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (data.seller_committed || data.status === "committed") {
      throw new Error("Cannot decline a sale that has already been committed");
    }

    // Check if expired (48 hours)
    const now = new Date();
    const deadline = data.expires_at || data.commit_deadline;

    if (deadline && new Date(deadline) < now) {
      throw new Error(
        "Cannot decline an expired commit (48 hours have passed)",
      );
    }

    // Check current status - should be 'paid' or 'paid_pending_seller'
    const validStatuses = ["paid", "paid_pending_seller"];
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Cannot decline sale with status: ${data.status}`);
    }

    // Update the transaction/order to declined status
    const updateData = {
      status: "declined_by_seller",
      seller_committed: false,
      declined_at: now.toISOString(),
      decline_reason: reason || "Seller declined the order",
      updated_at: now.toISOString(),
    };

    const { data: updatedRecord, error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", data.id)
      .eq("seller_id", sellerId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating record:", updateError);
      throw new Error(`Failed to decline sale: ${updateError.message}`);
    }

    console.log("✅ Sale declined successfully:", updatedRecord.id);

    // Relist the book as available
    if (data.book_id) {
      const { error: bookUpdateError } = await supabase
        .from("books")
        .update({
          sold: false,
          available: true,
          status: "available",
          updated_at: now.toISOString(),
        })
        .eq("id", data.book_id);

      if (bookUpdateError) {
        console.warn("Could not relist book:", bookUpdateError);
      } else {
        console.log("✅ Book relisted as available:", data.book_id);
      }
    }

    // Process refund if Paystack reference exists
    let refundProcessed = false;
    if (data.paystack_reference && PAYSTACK_SECRET_KEY) {
      try {
        console.log(
          `💳 Processing refund for declined order: ${data.paystack_reference}`,
        );

        const refundResponse = await fetch("https://api.paystack.co/refund", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction: data.paystack_reference,
            amount: data.amount, // Amount in kobo
            currency: "ZAR",
            customer_note: "Refund for declined order",
            merchant_note: `Refund for ${tableName} ${data.id} - seller declined the order`,
          }),
        });

        const refundResult = await refundResponse.json();

        if (refundResult.status) {
          console.log(`✅ Refund successful:`, refundResult.data);

          // Update record with refund details
          await supabase
            .from(tableName)
            .update({
              status: "refunded",
              refund_reference: refundResult.data?.reference,
              refunded_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", data.id);

          refundProcessed = true;
        } else {
          console.error(`❌ Refund failed:`, refundResult.message);
        }
      } catch (refundError) {
        console.error(`💥 Refund processing error:`, refundError);
      }
    }

    // Create notifications for both buyer and seller
    try {
      // Notification for buyer
      await supabase.from("order_notifications").insert({
        order_id: data.id,
        user_id: data.buyer_id,
        type: "sale_declined",
        title: "Order Declined by Seller",
        message: `Unfortunately, the seller declined your order #${data.id.slice(0, 8)}. ${refundProcessed ? "Your refund has been processed." : "Please contact support for refund assistance."}`,
        read: false,
      });

      // Notification for seller
      await supabase.from("order_notifications").insert({
        order_id: data.id,
        user_id: data.seller_id,
        type: "decline_confirmed",
        title: "Order Decline Confirmed",
        message: `You have declined order #${data.id.slice(0, 8)}. The buyer has been notified and ${refundProcessed ? "automatically refunded" : "will receive refund assistance"}.`,
        read: false,
      });

      console.log("✅ Decline notifications created");
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
