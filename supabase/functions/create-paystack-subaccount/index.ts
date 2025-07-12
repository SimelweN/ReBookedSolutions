import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders,
  errorResponse,
  successResponse,
  validateEnvironment,
  wrapFunction,
} from "../_shared/response-utils.ts";

interface SubaccountRequest {
  userId: string;
  businessName: string;
  bankCode: string;
  accountNumber: string;
  primaryContactEmail: string;
  primaryContactName: string;
  primaryContactPhone?: string;
  percentageCharge?: number;
}

interface PaystackSubaccountResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    subaccount_code: string;
    business_name: string;
    description: string;
    primary_contact_name: string;
    primary_contact_email: string;
    primary_contact_phone: string;
    percentage_charge: number;
    settlement_bank: string;
    account_number: string;
    settlement_schedule: string;
    active: boolean;
    migrate: boolean;
    product: string;
    domain: string;
    created_at: string;
    updated_at: string;
  };
}

async function createPaystackSubaccount(
  data: SubaccountRequest,
): Promise<PaystackSubaccountResponse> {
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

  if (!paystackSecretKey) {
    throw new Error("Paystack secret key not configured");
  }

  const payload = {
    business_name: data.businessName,
    settlement_bank: data.bankCode,
    account_number: data.accountNumber,
    percentage_charge: data.percentageCharge || 2.5, // Default 2.5% platform fee
    description: `ReBooked Solutions - ${data.businessName}`,
    primary_contact_email: data.primaryContactEmail,
    primary_contact_name: data.primaryContactName,
    primary_contact_phone: data.primaryContactPhone,
    settlement_schedule: "auto", // Automatic settlement
  };

  const response = await fetch("https://api.paystack.co/subaccount", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Paystack API error: ${response.status}`,
    );
  }

  return await response.json();
}

async function saveSubaccountToDatabase(
  supabase: any,
  userId: string,
  paystackData: any,
): Promise<void> {
  const subaccountRecord = {
    user_id: userId,
    subaccount_code: paystackData.subaccount_code,
    business_name: paystackData.business_name,
    settlement_bank: paystackData.settlement_bank,
    account_number: paystackData.account_number,
    percentage_charge: paystackData.percentage_charge,
    primary_contact_name: paystackData.primary_contact_name,
    primary_contact_email: paystackData.primary_contact_email,
    primary_contact_phone: paystackData.primary_contact_phone,
    status: paystackData.active ? "active" : "inactive",
    paystack_subaccount_id: paystackData.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("banking_subaccounts")
    .upsert(subaccountRecord, {
      onConflict: "user_id",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("Error saving subaccount to database:", error);
    throw new Error("Failed to save subaccount to database");
  }

  // Also update the user's profile with subaccount code
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subaccount_code: paystackData.subaccount_code,
      banking_setup_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile with subaccount code:", profileError);
    // Don't throw here as the subaccount was created successfully
  }
}

const handler = wrapFunction(async (req: Request) => {
  // Validate environment
  const requiredVars = [
    "PAYSTACK_SECRET_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const validation = validateEnvironment(requiredVars);
  if (!validation.valid) {
    return errorResponse(validation.message!, 500, "ENVIRONMENT_ERROR");
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405, "METHOD_NOT_ALLOWED");
  }

  let requestBody: SubaccountRequest;
  try {
    requestBody = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON");
  }

  const {
    userId,
    businessName,
    bankCode,
    accountNumber,
    primaryContactEmail,
    primaryContactName,
    primaryContactPhone,
    percentageCharge,
  } = requestBody;

  // Validate required fields
  if (
    !userId ||
    !businessName ||
    !bankCode ||
    !accountNumber ||
    !primaryContactEmail ||
    !primaryContactName
  ) {
    return errorResponse(
      "Missing required fields: userId, businessName, bankCode, accountNumber, primaryContactEmail, primaryContactName",
      400,
      "MISSING_FIELDS",
    );
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Check if user already has a subaccount
    const { data: existingSubaccount, error: checkError } = await supabase
      .from("banking_subaccounts")
      .select("subaccount_code, status")
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw new Error("Failed to check existing subaccount");
    }

    if (existingSubaccount) {
      return successResponse({
        subaccount: existingSubaccount,
        message: "Subaccount already exists",
        isExisting: true,
      });
    }

    // Create Paystack subaccount
    console.log(`Creating Paystack subaccount for user ${userId}`);
    const paystackResponse = await createPaystackSubaccount(requestBody);

    if (!paystackResponse.status) {
      return errorResponse(
        paystackResponse.message || "Failed to create subaccount",
        400,
        "PAYSTACK_ERROR",
      );
    }

    // Save to database
    await saveSubaccountToDatabase(supabase, userId, paystackResponse.data);

    console.log(
      `Successfully created subaccount ${paystackResponse.data.subaccount_code} for user ${userId}`,
    );

    return successResponse({
      subaccount: {
        id: paystackResponse.data.id,
        user_id: userId,
        business_name: paystackResponse.data.business_name,
        settlement_bank: paystackResponse.data.settlement_bank,
        account_number: paystackResponse.data.account_number,
        subaccount_code: paystackResponse.data.subaccount_code,
        percentage_charge: paystackResponse.data.percentage_charge,
        status: paystackResponse.data.active ? "active" : "inactive",
        created_at: paystackResponse.data.created_at,
      },
      message: "Subaccount created successfully",
    });
  } catch (error) {
    console.error("Error creating subaccount:", error);
    return errorResponse(
      error.message || "Failed to create subaccount",
      500,
      "SUBACCOUNT_CREATION_ERROR",
    );
  }
});

serve(handler);
