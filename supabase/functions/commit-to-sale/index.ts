import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
        "Transaction or order not found, or you don't have permission to commit this sale",
      );
    }

    // Use whichever data we found
    const data = transactionData || orderData;
    const isTransaction = !!transactionData;
    const tableName = isTransaction ? "transactions" : "orders";

    console.log(`Processing commit for ${tableName}:`, data.id);

    // Check if already committed
    if (data.seller_committed || data.status === "committed") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sale already committed",
          data: data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if expired (48 hours)
    const now = new Date();
    const deadline = data.expires_at || data.commit_deadline;

    if (deadline && new Date(deadline) < now) {
      throw new Error("Commit window has expired (48 hours have passed)");
    }

    // Check current status - should be 'paid' or 'paid_pending_seller'
    const validStatuses = ["paid", "paid_pending_seller"];
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Cannot commit sale with status: ${data.status}`);
    }

    // Update the transaction/order to committed status
    const updateData = {
      status: "committed",
      seller_committed: true,
      committed_at: now.toISOString(),
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
      throw new Error(`Failed to commit sale: ${updateError.message}`);
    }

    console.log("✅ Sale committed successfully:", updatedRecord.id);

    // Update book status to sold
    if (data.book_id) {
      const { error: bookUpdateError } = await supabase
        .from("books")
        .update({
          sold: true,
          available: false,
          status: "sold",
          updated_at: now.toISOString(),
        })
        .eq("id", data.book_id);

      if (bookUpdateError) {
        console.warn("Could not update book status:", bookUpdateError);
      } else {
        console.log("✅ Book marked as sold:", data.book_id);
      }
    }

    // Create notifications for both buyer and seller
    try {
      // Notification for buyer
      await supabase.from("order_notifications").insert({
        order_id: data.id,
        user_id: data.buyer_id,
        type: "sale_committed",
        title: "Seller Committed to Your Order",
        message: `Great news! The seller has committed to your order #${data.id.slice(0, 8)}. Your book will be prepared for delivery.`,
        read: false,
      });

      // Notification for seller
      await supabase.from("order_notifications").insert({
        order_id: data.id,
        user_id: data.seller_id,
        type: "commitment_confirmed",
        title: "Sale Commitment Confirmed",
        message: `You have successfully committed to order #${data.id.slice(0, 8)}. Please prepare your book for courier collection.`,
        read: false,
      });

      console.log("✅ Notifications created for sale commitment");
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
