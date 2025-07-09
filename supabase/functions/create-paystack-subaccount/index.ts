import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { userId, businessName, bankCode, accountNumber } = requestBody;

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

    // Simulate subaccount creation
    const subaccountCode = `ACCT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return new Response(
      JSON.stringify({
        success: true,
        subaccount: {
          id: crypto.randomUUID(),
          user_id: userId,
          business_name: businessName,
          settlement_bank: bankCode,
          account_number: accountNumber,
          subaccount_code: subaccountCode,
          status: "active",
          created_at: new Date().toISOString(),
        },
        message: "Subaccount created successfully (simulated)",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in create-paystack-subaccount:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
