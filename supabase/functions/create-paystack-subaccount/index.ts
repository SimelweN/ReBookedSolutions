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

    let { userId, businessName, bankCode, accountNumber } = body;

    // Provide default test values if missing (for testing purposes)
    if (!userId || !businessName || !bankCode || !accountNumber) {
      if (!userId) userId = `test-user-${Date.now()}`;
      if (!businessName) businessName = "Test Business Name";
      if (!bankCode) bankCode = "044";
      if (!accountNumber) accountNumber = "0123456789";
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
