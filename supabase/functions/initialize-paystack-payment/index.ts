import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Validate environment variables at startup
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

if (!PAYSTACK_SECRET_KEY) {
  console.error("Missing PAYSTACK_SECRET_KEY environment variable");
}

const supabase = createClient(
  SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY ?? "",
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Handle health check
    if (body.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Initialize Paystack Payment is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: {
            supabaseConfigured: !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY,
            paystackConfigured: !!PAYSTACK_SECRET_KEY,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Handle test requests
    if (body.test === true) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Test mode - payment initialization would work with valid parameters",
          requiredFields: ["email", "amount", "bookId", "sellerId"],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const {
      email,
      amount,
      bookId,
      sellerId,
      deliveryOption,
      shippingAddress,
      callbackUrl,
    } = body;

    if (!email || !amount || !bookId || !sellerId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email, amount, bookId, sellerId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Paystack configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get book and seller details
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select(
        `
        *,
        profiles!books_seller_id_fkey(subaccount_code, full_name)
      `,
      )
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (book.sold) {
      return new Response(
        JSON.stringify({ error: "Book is no longer available" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate unique reference
    const reference = `RS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Calculate split payment
    const platformCommission = Math.round(amount * 0.1); // 10% commission
    const sellerAmount = amount - platformCommission;

    const paymentData: any = {
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      callback_url: callbackUrl,
      metadata: {
        book_id: bookId,
        seller_id: sellerId,
        book_title: book.title,
        delivery_option: deliveryOption,
        shipping_address: shippingAddress,
        platform_commission: platformCommission,
        seller_amount: sellerAmount,
      },
    };

    // Add subaccount for split payment if seller has one
    if (book.profiles?.subaccount_code) {
      paymentData.subaccount = book.profiles.subaccount_code;
      paymentData.transaction_charge = platformCommission * 100; // Platform commission in kobo
      paymentData.bearer = "subaccount";
    }

    // Initialize payment with Paystack
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack error:", paystackData);
      return new Response(
        JSON.stringify({
          error: "Failed to initialize payment",
          details: paystackData.message || "Unknown error",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log the payment initialization
    await supabase.from("audit_logs").insert({
      action: "payment_initialized",
      table_name: "transactions",
      new_values: {
        reference,
        book_id: bookId,
        amount,
        email,
        seller_id: sellerId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in initialize-paystack-payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
