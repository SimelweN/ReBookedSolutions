import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

// Bank codes mapping for Paystack
const PAYSTACK_BANK_CODES: Record<string, string> = {
  "Absa Bank": "632005",
  "Capitec Bank": "470010",
  "First National Bank (FNB)": "250655",
  "Investec Bank": "580105",
  Nedbank: "198765",
  "Standard Bank": "051001",
  "African Bank": "430000",
  "Mercantile Bank": "450905",
  TymeBank: "678910",
  "Bidvest Bank": "679000",
  "Sasfin Bank": "683000",
  "Bank of Athens": "410506",
  "RMB Private Bank": "222026",
  "South African Post Bank (Post Office)": "460005",
  "Hollard Bank": "585001",
  "Discovery Bank": "679000",
  "Standard Chartered Bank": "730020",
  "Barclays Bank": "590000",
};

function getBankCode(bankName: string): string {
  return PAYSTACK_BANK_CODES[bankName] || "";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment service configuration error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const {
      business_name,
      bank_name,
      account_number,
      primary_contact_email,
      primary_contact_name,
      metadata,
    } = await req.json();

    if (!business_name || !bank_name || !account_number) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const bankCode = getBankCode(bank_name);
    if (!bankCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Unsupported bank: ${bank_name}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = {
      business_name,
      settlement_bank: bankCode,
      account_number,
      percentage_charge: 0,
      primary_contact_email,
      primary_contact_name,
      metadata,
    };

    console.log("Creating Paystack subaccount:", {
      business_name,
      bank_name,
      bankCode,
    });

    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack subaccount creation failed:", data);
      return new Response(
        JSON.stringify({
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "Paystack subaccount created successfully:",
      data.data.subaccount_code,
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subaccount_code: data.data.subaccount_code,
          id: data.data.id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in create-paystack-subaccount function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
