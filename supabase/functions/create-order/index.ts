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
          message: "Create order function is healthy",
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
      buyerEmail,
      sellerId,
      amount,
      deliveryOption,
      shippingAddress,
      deliveryData,
      paystackReference,
      paystackSubaccount,
    } = body;

    // Validate required fields
    if (!bookId || !buyerEmail || !sellerId || !amount || !paystackReference) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: bookId, buyerEmail, sellerId, amount, paystackReference",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Calculate commit deadline (48 hours from now)
    const commitDeadline = new Date();
    commitDeadline.setHours(commitDeadline.getHours() + 48);

    // Create the order data
    const orderData = {
      id: crypto.randomUUID(),
      book_id: bookId,
      buyer_id: buyerId,
      buyer_email: buyerEmail,
      seller_id: sellerId,
      amount: amount,
      status: "paid",
      payment_status: "paid",
      delivery_option: deliveryOption,
      shipping_address: shippingAddress,
      delivery_data: deliveryData,
      paystack_ref: paystackReference,
      paystack_reference: paystackReference,
      paystack_subaccount: paystackSubaccount,
      commit_deadline: commitDeadline.toISOString(),
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Simulate book details (in real implementation, fetch from DB)
    const bookTitle = `Book ${bookId}`;

    return new Response(
      JSON.stringify({
        success: true,
        order: orderData,
        message: "Order created successfully",
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
