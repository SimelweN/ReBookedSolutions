import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only call req.json() ONCE
    const body = await req.json();
    console.log("Received body:", body);

    const {
      cartItems,
      buyerId,
      buyerEmail,
      deliveryOptions,
      shippingAddress,
      callbackUrl
    } = body;

    // Validate required fields
    if (!cartItems || !buyerEmail || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields or empty cart'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate totals
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
    const totalDeliveryFee = deliveryOptions?.reduce((sum: number, opt: any) => sum + (opt.price || 0), 0) || 0;
    const grandTotal = totalAmount + totalDeliveryFee;

    // Generate unique reference
    const reference = `RS_MULTI_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Simulate successful payment initialization
    const paymentData = {
      authorization_url: `https://checkout.paystack.com/test_${reference}`,
      access_code: `ACC_${reference}`,
      reference: reference
    };

    return new Response(JSON.stringify({
      success: true,
      data: paymentData,
      summary: {
        book_count: cartItems.length,
        total_amount: totalAmount,
        delivery_fee: totalDeliveryFee,
        grand_total: grandTotal
      },
      message: 'Multi-seller purchase initialized successfully (simulated)'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Edge Function Error:", error);

    return new Response(JSON.stringify({
      success: false,
      error: "Function crashed",
      details: error.message || "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});