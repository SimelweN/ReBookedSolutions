import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    console.log("Starting subaccount update process...");

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
      subaccount_code,
      business_name,
      bank_name,
      account_number,
      primary_contact_email,
      metadata,
    } = requestBody;

    console.log("Received update request:", {
      subaccount_code,
      business_name,
      bank_name,
      primary_contact_email,
    });

    if (!subaccount_code || !business_name || !bank_name || !account_number) {
      const missingFields = [];
      if (!subaccount_code) missingFields.push("subaccount_code");
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
      primary_contact_email,
      metadata,
    };

    console.log("Updating Paystack subaccount:", {
      subaccount_code,
      business_name,
      bank_name,
      bankCode,
    });

    const response = await fetch(
      `https://api.paystack.co/subaccount/${subaccount_code}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack subaccount update failed:", {
        status: response.status,
        statusText: response.statusText,
        data,
        payload,
      });

      let errorMessage = "Failed to update payment account";
      if (data.message) {
        errorMessage = data.message;
      } else if (response.status === 401) {
        errorMessage = "Payment service authentication failed";
      } else if (response.status === 400) {
        errorMessage = "Invalid banking details provided";
      } else if (response.status === 404) {
        errorMessage = "Payment account not found";
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
      "Paystack subaccount updated successfully:",
      data.data.subaccount_code,
    );

    // Update our database record
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get user_id from JWT token
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        throw new Error("No authorization header");
      }

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        throw new Error("Failed to get user from token");
      }

      console.log("Updating subaccount in database for user:", user.id);

      const { error: dbError } = await supabase
        .from("banking_subaccounts")
        .update({
          business_name: business_name,
          email: primary_contact_email,
          bank_name: bank_name,
          bank_code: bankCode,
          account_number: account_number,
          paystack_response: data.data,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("subaccount_code", subaccount_code);

      if (dbError) {
        console.error("Failed to update database:", dbError);
        // Don't fail the entire request if DB update fails
        // The Paystack subaccount was updated successfully
      } else {
        console.log("Successfully updated subaccount in database");
      }
    } catch (dbError) {
      console.error("Database update error:", dbError);
      // Don't fail the entire request if DB update fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subaccount updated successfully",
        subaccount_code: data.data.subaccount_code,
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
    console.error("Error in update-paystack-subaccount function:", error);
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
