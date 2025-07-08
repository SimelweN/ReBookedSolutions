import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { orderId, sellerId } = await req.json();

    if (!orderId || !sellerId) {
      return new Response(
        JSON.stringify({ error: "Order ID and Seller ID are required" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Get the order and verify seller ownership
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        books(id, title, author, seller_id)
      `,
      )
      .eq("id", orderId)
      .eq("seller_id", sellerId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found or unauthorized" }),
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    if (order.status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Order is not in paid status" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Update order status to committed
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "committed",
        committed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    // Mark book as sold
    if (order.book_id) {
      await supabase
        .from("books")
        .update({ sold: true })
        .eq("id", order.book_id);
    }

    // Send notification to buyer
    await supabase.from("notifications").insert({
      user_id: order.buyer_id,
      type: "order_committed",
      title: "Order Confirmed!",
      message: `Great news! The seller has confirmed your order for "${order.books?.title}". Collection details will be sent to you soon.`,
    });

    // Log the commitment
    await supabase.from("audit_logs").insert({
      action: "seller_committed",
      table_name: "orders",
      record_id: orderId,
      user_id: sellerId,
      new_values: {
        committed_at: new Date().toISOString(),
        book_title: order.books?.title,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully committed to sale",
        order: {
          id: order.id,
          status: "committed",
          committed_at: new Date().toISOString(),
        },
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error in commit-to-sale:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
