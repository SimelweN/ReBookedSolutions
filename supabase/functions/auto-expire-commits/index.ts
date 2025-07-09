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

    console.log("Auto-expire commits triggered:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Auto-expire commits function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate checking for expired commits
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Mock expired orders
    const expiredOrders = [
      {
        id: "order_1",
        book_id: "book_123",
        seller_id: "seller_456",
        buyer_email: "buyer@example.com",
        created_at: fortyEightHoursAgo.toISOString(),
        status: "paid",
      },
    ];

    const processedExpiries = expiredOrders.map((order) => ({
      order_id: order.id,
      book_id: order.book_id,
      seller_id: order.seller_id,
      buyer_email: order.buyer_email,
      expired_at: now.toISOString(),
      action_taken: "auto_expired",
      refund_initiated: true,
    }));

    console.log("Processed expired commits:", processedExpiries);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${expiredOrders.length} expired commit(s)`,
        expired_count: expiredOrders.length,
        expired_orders: processedExpiries,
        processed_at: now.toISOString(),
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
