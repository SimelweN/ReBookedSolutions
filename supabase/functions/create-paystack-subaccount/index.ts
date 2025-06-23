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
    console.log("Starting subaccount creation process...");

    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment service is not configured. Please contact support.",
          error_code: "MISSING_SECRET_KEY",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Paystack secret key is present, proceeding with request...");

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request format",
          error_code: "INVALID_JSON",
        }),
        {
          status: 400,
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
    } = requestBody;

    console.log("Received request:", {
      business_name,
      bank_name,
      primary_contact_email,
    });

    if (!business_name || !bank_name || !account_number) {
      const missingFields = [];
      if (!business_name) missingFields.push("business_name");
      if (!bank_name) missingFields.push("bank_name");
      if (!account_number) missingFields.push("account_number");

      console.error("Missing required fields:", missingFields);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          error_code: "MISSING_FIELDS",
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
      console.error("Paystack subaccount creation failed:", {
        status: response.status,
        statusText: response.statusText,
        data,
        payload,
      });

      let errorMessage = "Failed to create payment account";
      if (data.message) {
        errorMessage = data.message;
      } else if (response.status === 401) {
        errorMessage = "Payment service authentication failed";
      } else if (response.status === 400) {
        errorMessage = "Invalid banking details provided";
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
          error_code: `PAYSTACK_${response.status}`,
          details: data,
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
