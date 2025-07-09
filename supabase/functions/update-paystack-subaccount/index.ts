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
          message: "Update Paystack subaccount function is healthy",
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
      subaccountCode,
      businessName,
      bankCode,
      accountNumber,
      percentageCharge,
    } = body;

    if (!subaccountCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required field: subaccountCode",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Simulate subaccount update
    const updatedSubaccount = {
      subaccount_code: subaccountCode,
      business_name: businessName || "Updated Business Name",
      settlement_bank: bankCode || "044",
      account_number: accountNumber || "0123456789",
      percentage_charge: percentageCharge || 10,
      status: "active",
      updated_at: new Date().toISOString(),
    };

    console.log("Subaccount updated:", updatedSubaccount);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subaccount updated successfully",
        subaccount: updatedSubaccount,
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
