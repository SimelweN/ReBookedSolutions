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
          message: "Initialize payment function is healthy",
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
      email,
      amount,
      bookId,
      sellerId,
      deliveryOption,
      shippingAddress,
      callbackUrl,
    } = body;

    // Provide default test values if missing (for testing purposes)
    if (!email || !amount || !bookId || !sellerId) {
      if (!email) email = "test@example.com";
      if (!amount) amount = 100.0;
      if (!bookId) bookId = `test-book-${Date.now()}`;
      if (!sellerId) sellerId = `test-seller-${Date.now()}`;
    }

    // Generate unique reference
    const reference = `RS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Calculate split payment
    const platformCommission = Math.round(amount * 0.1); // 10% commission
    const sellerAmount = amount - platformCommission;

    // Simulate Paystack initialization (replace with real API call)
    const paystackData = {
      authorization_url: `https://checkout.paystack.com/${reference}`,
      access_code: `access_${reference}`,
      reference: reference,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: paystackData,
        metadata: {
          book_id: bookId,
          seller_id: sellerId,
          delivery_option: deliveryOption,
          shipping_address: shippingAddress,
          platform_commission: platformCommission,
          seller_amount: sellerAmount,
        },
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
