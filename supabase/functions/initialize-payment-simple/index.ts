import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log("Simple payment initialization request:", req.method);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      email,
      amount,
      currency = "ZAR",
      callback_url,
      metadata = {},
    } = await req.json();

    console.log("Simple payment request data:", {
      email,
      amount,
      currency,
      callback_url,
      metadata,
    });

    if (!email || !amount) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email, amount",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Get current user for auth check
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    console.log("User auth result:", { user: user?.id, error: userError });

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Check if Paystack is configured
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      return new Response(
        JSON.stringify({
          error: "Payment service not configured",
          details: "Paystack secret key not found",
        }),
        {
          status: 503,
          headers: corsHeaders,
        },
      );
    }

    // Generate unique reference
    const reference = `simple_${Date.now()}_${user.id}`;

    // Convert amount to kobo (Paystack uses kobo for ZAR)
    const amountInKobo = Math.round(amount * 100);

    // Prepare Paystack initialization data
    const initializationData = {
      email: email,
      amount: amountInKobo,
      currency: currency,
      reference: reference,
      callback_url:
        callback_url || `${Deno.env.get("SITE_URL")}/payment/callback`,
      metadata: {
        ...metadata,
        user_id: user.id,
        test_payment: true,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    };

    console.log("Paystack initialization data:", initializationData);

    // Initialize payment with Paystack
    try {
      const paystackResponse = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(initializationData),
        },
      );

      console.log("Paystack response status:", paystackResponse.status);

      if (!paystackResponse.ok) {
        const errorText = await paystackResponse.text();
        console.error("Paystack error response:", errorText);

        return new Response(
          JSON.stringify({
            error: "Payment gateway error",
            details: `Paystack API returned ${paystackResponse.status}`,
            paystack_error: errorText,
          }),
          {
            status: 502,
            headers: corsHeaders,
          },
        );
      }

      const paystackData = await paystackResponse.json();
      console.log("Paystack response data:", paystackData);

      if (!paystackData.status) {
        return new Response(
          JSON.stringify({
            error: "Payment initialization failed",
            details: paystackData.message,
          }),
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            reference: reference,
            amount: amount,
            currency: currency,
            status: "pending",
          },
          paystack: {
            authorization_url: paystackData.data.authorization_url,
            access_code: paystackData.data.access_code,
            reference: paystackData.data.reference,
          },
          message: "Payment initialized successfully",
        }),
        {
          headers: corsHeaders,
        },
      );
    } catch (paystackError) {
      console.error("Paystack API error:", paystackError);

      return new Response(
        JSON.stringify({
          error: "Payment service unavailable",
          details: paystackError.message,
        }),
        {
          status: 503,
          headers: corsHeaders,
        },
      );
    }
  } catch (error) {
    console.error("Simple payment initialization error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to initialize payment",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
