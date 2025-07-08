import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Update subaccount request:", req.method);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      seller_id,
      business_name,
      settlement_bank,
      account_number,
      percentage_charge,
      description,
    } = await req.json();

    if (!seller_id) {
      return new Response(JSON.stringify({ error: "Seller ID is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get seller profile
    const { data: sellerProfile, error: sellerError } = await supabaseClient
      .from("seller_profiles")
      .select("*")
      .eq("user_id", seller_id)
      .single();

    if (sellerError || !sellerProfile) {
      return new Response(
        JSON.stringify({ error: "Seller profile not found" }),
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    // Check authorization (seller can update their own profile, or admin)
    const { data: userProfile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (user.id !== seller_id && userProfile?.role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "Not authorized to update this seller profile",
        }),
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    if (!sellerProfile.paystack_subaccount_code) {
      return new Response(
        JSON.stringify({ error: "Seller does not have a Paystack subaccount" }),
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      throw new Error("Paystack secret key not configured");
    }

    // Prepare update data
    const updateData: any = {};

    if (business_name) updateData.business_name = business_name;
    if (settlement_bank) updateData.settlement_bank = settlement_bank;
    if (account_number) updateData.account_number = account_number;
    if (percentage_charge !== undefined)
      updateData.percentage_charge = percentage_charge;
    if (description) updateData.description = description;

    // If no update data provided, return error
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "No update data provided" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Update subaccount with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/subaccount/${sellerProfile.paystack_subaccount_code}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(
        `Paystack subaccount update failed: ${paystackData.message}`,
      );
    }

    // Update seller profile in database
    const dbUpdateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (business_name) {
      dbUpdateData.business_name = business_name;
    }
    if (settlement_bank) {
      dbUpdateData.bank_code = settlement_bank;
    }
    if (account_number) {
      dbUpdateData.bank_account_number = account_number;
    }

    // Store updated Paystack response
    dbUpdateData.paystack_subaccount_data = paystackData.data;

    const { error: updateError } = await supabaseClient
      .from("seller_profiles")
      .update(dbUpdateData)
      .eq("user_id", seller_id);

    if (updateError) {
      throw new Error(
        `Failed to update seller profile: ${updateError.message}`,
      );
    }

    // Log audit trail
    await supabaseClient.from("audit_logs").insert({
      action: "paystack_subaccount_updated",
      table_name: "seller_profiles",
      record_id: sellerProfile.id,
      user_id: user.id,
      details: {
        seller_id,
        subaccount_code: sellerProfile.paystack_subaccount_code,
        updated_fields: Object.keys(updateData),
        changes: updateData,
      },
    });

    // Send notification to seller
    if (user.id !== seller_id) {
      await supabaseClient.from("notifications").insert({
        user_id: seller_id,
        title: "Subaccount Updated",
        message: "Your Paystack subaccount has been updated",
        type: "account_update",
        metadata: {
          subaccount_code: sellerProfile.paystack_subaccount_code,
          updated_by: user.id,
        },
      });
    }

    // Send email notification
    try {
      const { data: sellerUser } = await supabaseClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", seller_id)
        .single();

      if (sellerUser) {
        await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`,
          {
            method: "POST",
            headers: {
              Authorization: req.headers.get("Authorization")!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: sellerUser.email,
              template: "subaccount_updated",
              data: {
                recipient_name: sellerUser.full_name,
                business_name: business_name || sellerProfile.business_name,
                subaccount_code: sellerProfile.paystack_subaccount_code,
                updated_fields: Object.keys(updateData),
                updated_by: user.id === seller_id ? "yourself" : "admin",
              },
            }),
          },
        );
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subaccount updated successfully",
        subaccount: {
          code: sellerProfile.paystack_subaccount_code,
          business_name: paystackData.data.business_name,
          settlement_bank: paystackData.data.settlement_bank,
          account_number: paystackData.data.account_number,
          percentage_charge: paystackData.data.percentage_charge,
          is_verified: paystackData.data.is_verified,
          updated_at: new Date().toISOString(),
        },
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Subaccount update error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to update subaccount",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
