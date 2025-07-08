import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Pay seller request:", req.method);
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
      order_id,
      seller_id,
      amount,
      reason = "Book sale payout",
    } = await req.json();

    if (!order_id || !seller_id || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Get seller profile and subaccount
    const { data: seller, error: sellerError } = await supabaseClient
      .from("seller_profiles")
      .select("*")
      .eq("user_id", seller_id)
      .single();

    if (sellerError || !seller) {
      throw new Error("Seller profile not found");
    }

    if (!seller.paystack_subaccount_code) {
      throw new Error("Seller does not have a Paystack subaccount");
    }

    // Verify order exists and is eligible for payout
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("seller_id", seller_id)
      .eq("status", "delivered")
      .single();

    if (orderError || !order) {
      throw new Error("Order not found or not eligible for payout");
    }

    // Check if payout already exists
    const { data: existingPayout } = await supabaseClient
      .from("seller_payouts")
      .select("id")
      .eq("order_id", order_id)
      .single();

    if (existingPayout) {
      return new Response(
        JSON.stringify({ error: "Payout already processed for this order" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const reference = `payout_${order_id}_${Date.now()}`;
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!paystackSecret) {
      throw new Error("Paystack secret key not configured");
    }

    // Calculate platform fee (e.g., 5%)
    const platformFeeRate = 0.05;
    const platformFee = Math.round(amount * platformFeeRate);
    const sellerAmount = amount - platformFee;

    // Create transfer recipient if not exists
    let recipientCode = seller.paystack_recipient_code;

    if (!recipientCode) {
      const recipientResponse = await fetch(
        "https://api.paystack.co/transferrecipient",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "nuban",
            name:
              seller.business_name ||
              `${seller.first_name} ${seller.last_name}`,
            account_number: seller.bank_account_number,
            bank_code: seller.bank_code,
            currency: "ZAR",
          }),
        },
      );

      const recipientData = await recipientResponse.json();

      if (!recipientData.status) {
        throw new Error(`Failed to create recipient: ${recipientData.message}`);
      }

      recipientCode = recipientData.data.recipient_code;

      // Update seller profile with recipient code
      await supabaseClient
        .from("seller_profiles")
        .update({ paystack_recipient_code: recipientCode })
        .eq("user_id", seller_id);
    }

    // Initiate transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: sellerAmount,
        recipient: recipientCode,
        reason: reason,
        reference: reference,
        currency: "ZAR",
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferData.status) {
      throw new Error(`Transfer failed: ${transferData.message}`);
    }

    // Record payout in database
    const { data: payout, error: payoutError } = await supabaseClient
      .from("seller_payouts")
      .insert({
        seller_id: seller_id,
        order_id: order_id,
        amount: sellerAmount,
        platform_fee: platformFee,
        reference: reference,
        paystack_transfer_code: transferData.data.transfer_code,
        status: "pending",
        paystack_response: transferData.data,
      })
      .select()
      .single();

    if (payoutError) {
      throw new Error(`Failed to record payout: ${payoutError.message}`);
    }

    // Log audit trail
    await supabaseClient.from("audit_logs").insert({
      action: "seller_payout_initiated",
      table_name: "seller_payouts",
      record_id: payout.id,
      details: {
        seller_id,
        order_id,
        amount: sellerAmount,
        platform_fee: platformFee,
        reference,
      },
    });

    // Send notification to seller
    await supabaseClient.from("notifications").insert({
      user_id: seller_id,
      title: "Payout Initiated",
      message: `Your payout of R${(sellerAmount / 100).toFixed(2)} is being processed`,
      type: "payout",
    });

    return new Response(
      JSON.stringify({
        success: true,
        payout_id: payout.id,
        amount: sellerAmount,
        reference: reference,
        transfer_code: transferData.data.transfer_code,
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Payout error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
