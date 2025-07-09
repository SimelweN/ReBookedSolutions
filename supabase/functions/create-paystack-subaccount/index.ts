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
          message: "Create Paystack subaccount function is healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { userId, businessName, bankCode, accountNumber } = body;

    if (!userId || !businessName || !bankCode || !accountNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: userId, businessName, bankCode, accountNumber",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate subaccount creation (replace with real Paystack API call)
    const subaccountCode = `ACCT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const subaccountData = {
      id: crypto.randomUUID(),
      user_id: userId,
      business_name: businessName,
      settlement_bank: bankCode,
      account_number: accountNumber,
      subaccount_code: subaccountCode,
      status: "active",
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        subaccount: subaccountData,
        message: "Subaccount created successfully",
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
