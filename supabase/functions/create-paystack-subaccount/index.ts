import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

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

    const {
      userId,
      businessName,
      bankCode,
      accountNumber,
      percentageCharge = 0.0,
    } = await req.json();

    if (!userId || !businessName || !bankCode || !accountNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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

    // Check if subaccount already exists
    const { data: existingSubaccount } = await supabase
      .from("paystack_subaccounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingSubaccount) {
      return new Response(
        JSON.stringify({
          success: true,
          subaccount: existingSubaccount,
          message: "Subaccount already exists",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create subaccount with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: businessName,
        bank_code: bankCode,
        account_number: accountNumber,
        percentage_charge: percentageCharge,
        description: `Subaccount for ${businessName}`,
        primary_contact_email: null,
        primary_contact_name: null,
        primary_contact_phone: null,
        metadata: {
          user_id: userId,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack error:", paystackData);
      return new Response(
        JSON.stringify({
          error: "Failed to create Paystack subaccount",
          details: paystackData.message || "Unknown error",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get bank name from bank code
    const bankName = await getBankName(bankCode);

    // Save subaccount to database
    const { data: subaccount, error: dbError } = await supabase
      .from("paystack_subaccounts")
      .insert({
        user_id: userId,
        business_name: businessName,
        settlement_bank: bankName || bankCode,
        account_number: accountNumber,
        subaccount_code: paystackData.data.subaccount_code,
        percentage_charge: percentageCharge,
        status: "active",
        paystack_response: paystackData.data,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Update user profile with subaccount code
    await supabase
      .from("profiles")
      .update({ subaccount_code: paystackData.data.subaccount_code })
      .eq("id", userId);

    // Log the creation
    await supabase.from("audit_logs").insert({
      action: "subaccount_created",
      table_name: "paystack_subaccounts",
      record_id: subaccount.id,
      user_id: userId,
      new_values: {
        subaccount_code: paystackData.data.subaccount_code,
        business_name: businessName,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        subaccount: subaccount,
        message: "Subaccount created successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in create-paystack-subaccount:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getBankName(bankCode: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    const bank = data.data?.find((b: any) => b.code === bankCode);
    return bank?.name || null;
  } catch (error) {
    console.error("Error fetching bank name:", error);
    return null;
  }
}
