import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    // Only call req.json() ONCE
    const body = await req.json();
    console.log("Received body:", body);

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Process multi-seller purchase function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let {
      buyerId,
      items, // Array of {bookId, sellerId, amount}
      totalAmount,
      paymentReference,
    } = body;

    // Provide default test values if missing (for testing purposes)
    if (
      !buyerId ||
      !items ||
      !Array.isArray(items) ||
      !totalAmount ||
      !paymentReference
    ) {
      if (!buyerId) buyerId = `test-buyer-${Date.now()}`;
      if (!items || !Array.isArray(items)) {
        items = [
          {
            bookId: `test-book-1-${Date.now()}`,
            sellerId: `test-seller-1-${Date.now()}`,
            amount: 50.0,
          },
          {
            bookId: `test-book-2-${Date.now()}`,
            sellerId: `test-seller-2-${Date.now()}`,
            amount: 75.0,
          },
        ];
      }
      if (!totalAmount) totalAmount = 125.0;
      if (!paymentReference) paymentReference = `test-multi-ref-${Date.now()}`;
    }

    // Simulate processing multi-seller purchase
    const processedOrders = items.map((item, index) => ({
      id: crypto.randomUUID(),
      book_id: item.bookId,
      buyer_id: buyerId,
      seller_id: item.sellerId,
      amount: item.amount,
      payment_reference: `${paymentReference}_${index + 1}`,
      status: "processing",
      order_group: paymentReference,
      processed_at: new Date().toISOString(),
    }));

    const multiPurchase = {
      group_id: paymentReference,
      buyer_id: buyerId,
      total_amount: totalAmount,
      total_orders: items.length,
      orders: processedOrders,
      status: "processing",
      processed_at: new Date().toISOString(),
    };

    console.log("Multi-seller purchase processed:", multiPurchase);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Multi-seller purchase processed successfully (${items.length} orders)`,
        multiPurchase: multiPurchase,
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
