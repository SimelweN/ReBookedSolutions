import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Mark collected request:", req.method);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const { order_id, collection_method, notes, location_coords } =
      await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(
        `
        *,
        buyer:buyer_id(id, email, full_name),
        seller:seller_id(id, email, full_name),
        book:book_id(title, author, isbn)
      `,
      )
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Check if user is authorized (buyer or seller)
    if (user.id !== order.buyer_id && user.id !== order.seller_id) {
      return new Response(
        JSON.stringify({ error: "Not authorized to update this order" }),
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    // Check if order is in correct status
    if (!["paid", "shipped", "in_transit"].includes(order.status)) {
      return new Response(
        JSON.stringify({
          error: `Cannot mark order as collected. Current status: ${order.status}`,
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const collectionTime = new Date().toISOString();

    // Update order status
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({
        status: "delivered",
        collection_method: collection_method || "unknown",
        collection_notes: notes,
        collection_location: location_coords,
        collected_at: collectionTime,
        updated_at: collectionTime,
      })
      .eq("id", order_id);

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Create collection record
    const { error: collectionError } = await supabaseClient
      .from("order_collections")
      .insert({
        order_id: order_id,
        collected_by: user.id,
        collection_method: collection_method || "unknown",
        notes: notes,
        location_coords: location_coords,
        collected_at: collectionTime,
      });

    if (collectionError) {
      console.error("Failed to create collection record:", collectionError);
    }

    // Update book availability if it was marked as sold
    const { error: bookError } = await supabaseClient
      .from("books")
      .update({
        status: "sold",
        updated_at: collectionTime,
      })
      .eq("id", order.book_id);

    if (bookError) {
      console.error("Failed to update book status:", bookError);
    }

    // Log audit trail
    await supabaseClient.from("audit_logs").insert({
      action: "order_collected",
      table_name: "orders",
      record_id: order_id,
      user_id: user.id,
      details: {
        order_id,
        collection_method: collection_method || "unknown",
        collected_by: user.id,
        previous_status: order.status,
        notes: notes,
      },
    });

    // Send notifications
    const notifications = [];

    // Notify the other party
    const otherPartyId =
      user.id === order.buyer_id ? order.seller_id : order.buyer_id;
    const isCollectedByBuyer = user.id === order.buyer_id;

    notifications.push({
      user_id: otherPartyId,
      title: "Order Collected",
      message: isCollectedByBuyer
        ? `Your book "${order.book.title}" has been collected by the buyer`
        : `The book "${order.book.title}" has been marked as collected`,
      type: "order_update",
      metadata: { order_id, status: "delivered" },
    });

    // Notify collector with confirmation
    notifications.push({
      user_id: user.id,
      title: "Collection Confirmed",
      message: `You have successfully marked "${order.book.title}" as collected`,
      type: "order_update",
      metadata: { order_id, status: "delivered" },
    });

    await supabaseClient.from("notifications").insert(notifications);

    // Critical: Only release payment if collected by buyer AND order is confirmed delivered
    if (isCollectedByBuyer) {
      // Double-check that order status was successfully updated to delivered
      const { data: verifyOrder } = await supabaseClient
        .from("orders")
        .select("status, payment_held")
        .eq("id", order_id)
        .single();

      if (verifyOrder?.status !== "delivered") {
        console.error(
          "Order status verification failed - payment NOT released",
        );
        throw new Error("Collection verification failed");
      }
      const { data: sellerProfile } = await supabaseClient
        .from("seller_profiles")
        .select("bank_account_number, paystack_subaccount_code")
        .eq("user_id", order.seller_id)
        .single();

      if (sellerProfile?.bank_account_number) {
        // Call pay-seller function
        try {
          // Calculate book price only (exclude delivery fee for seller payout)
          const bookPrice = order.book_price || order.total_price; // Use book_price if available, fallback to total
          const paystackAmount = Math.round(bookPrice * 100); // Convert to kobo

          await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/pay-seller`,
            {
              method: "POST",
              headers: {
                Authorization: req.headers.get("Authorization")!,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: order_id,
                seller_id: order.seller_id,
                amount: paystackAmount,
                reason: `Payment for book: ${order.book.title}`,
              }),
            },
          );
        } catch (payoutError) {
          console.error("Failed to initiate seller payout:", payoutError);
          // Don't fail the collection, just log the error
        }
      }
    }

    // Send email notifications
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`,
        {
          method: "POST",
          headers: {
            Authorization: req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: isCollectedByBuyer ? order.seller.email : order.buyer.email,
            template: "order_collected",
            data: {
              recipient_name: isCollectedByBuyer
                ? order.seller.full_name
                : order.buyer.full_name,
              book_title: order.book.title,
              order_id: order_id,
              collected_by: isCollectedByBuyer ? "buyer" : "seller",
              collection_time: collectionTime,
            },
          }),
        },
      );
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order marked as collected successfully",
        order: {
          id: order_id,
          status: "delivered",
          collected_at: collectionTime,
          collection_method: collection_method || "unknown",
        },
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Collection error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to mark order as collected",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
