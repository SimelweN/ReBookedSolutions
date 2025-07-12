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
      userId,
      subaccountCode,
      businessName,
      bankCode,
      accountNumber,
      percentageCharge
    } = body;

    // Validate required fields
    if (!userId || !subaccountCode) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User ID and Subaccount Code are required'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Simulate successful update
    const updatedSubaccount = {
      id: crypto.randomUUID(),
      user_id: userId,
      subaccount_code: subaccountCode,
      business_name: businessName || 'Updated Business',
      settlement_bank: bankCode || 'Updated Bank',
      account_number: accountNumber || '1234567890',
      percentage_charge: percentageCharge || 0.00,
      status: 'active',
      updated_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      subaccount: updatedSubaccount,
      message: 'Subaccount updated successfully (simulated)'
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