import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Handle both GET and POST requests
    let body = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    console.log("Check expired orders triggered:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Check expired orders function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate checking for expired orders
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Mock expired orders data
    const expiredOrders = [
      {
        id: "order_expired_1",
        book_id: "book_789",
        buyer_id: "buyer_123",
        seller_id: "seller_456",
        status: "pending_collection",
        created_at: twentyFourHoursAgo.toISOString(),
        payment_reference: "PAY_123456",
      },
    ];

    const checkedOrders = expiredOrders.map((order) => ({
      order_id: order.id,
      book_id: order.book_id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      original_status: order.status,
      checked_at: now.toISOString(),
      is_expired: true,
      days_overdue: Math.floor(
        (now.getTime() - new Date(order.created_at).getTime()) /
          (24 * 60 * 60 * 1000),
      ),
      action_required: "notify_parties",
    }));

    console.log("Checked expired orders:", checkedOrders);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${expiredOrders.length} order(s) for expiration`,
        total_checked: expiredOrders.length,
        expired_found: checkedOrders.filter((o) => o.is_expired).length,
        orders: checkedOrders,
        checked_at: now.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Edge Function Error:", error);

    return new Response(
      JSON.stringify({
        error: "Function crashed",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
