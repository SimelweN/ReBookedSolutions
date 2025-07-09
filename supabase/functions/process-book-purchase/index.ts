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
          message: "Process book purchase function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const {
      bookId,
      buyerId,
      sellerId,
      amount,
      paymentReference,
      deliveryOption,
    } = body;

    if (!bookId || !buyerId || !sellerId || !amount || !paymentReference) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: bookId, buyerId, sellerId, amount, paymentReference",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate processing the book purchase
    const purchase = {
      id: crypto.randomUUID(),
      book_id: bookId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount: amount,
      payment_reference: paymentReference,
      delivery_option: deliveryOption || "pickup",
      status: "processing",
      processed_at: new Date().toISOString(),
      expected_completion: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 2 days
    };

    console.log("Book purchase processed:", purchase);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Book purchase processed successfully",
        purchase: purchase,
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
