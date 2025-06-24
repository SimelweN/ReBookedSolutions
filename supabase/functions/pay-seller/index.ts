import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment service not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { order_id, force_payout = false } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Order ID is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Order not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate order status
    if (
      !force_payout &&
      !["collected", "in_transit", "delivered"].includes(order.status)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Cannot process payout. Order status: ${order.status}. Book must be collected first.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if payout already processed
    if (order.metadata?.payout_completed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payout already processed for this order",
          transfer_code: order.metadata.payout_transfer_code,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get seller's verified banking details
    const { data: bankingDetails, error: bankingError } = await supabase
      .from("banking_details")
      .select("*")
      .eq("user_id", order.seller_id)
      .eq("is_verified", true)
      .single();

    if (bankingError || !bankingDetails) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Seller banking details not found or not verified",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create transfer recipient if not exists
    let recipientCode = bankingDetails.recipient_code;

    if (!recipientCode) {
      console.log("Creating transfer recipient for seller...");

      const recipientResponse = await fetch(
        "https://api.paystack.co/transferrecipient",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "nuban",
            name: bankingDetails.account_holder_name,
            account_number: bankingDetails.account_number,
            bank_code: bankingDetails.bank_code,
            currency: "ZAR",
          }),
        },
      );

      const recipientData = await recipientResponse.json();

      if (!recipientData.status) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to create transfer recipient",
            error: recipientData.message,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      recipientCode = recipientData.data.recipient_code;

      // Update banking details with recipient code
      await supabase
        .from("banking_details")
        .update({ recipient_code: recipientCode })
        .eq("id", bankingDetails.id);
    }

    // Initiate transfer
    const transferReference = `payout_${order.id}_${Date.now()}`;

    console.log(
      `Initiating transfer for order ${order_id}: R${order.seller_amount / 100}`,
    );

    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: order.seller_amount,
        recipient: recipientCode,
        reason: `ReBooked Sale - Order ${order.id}`,
        reference: transferReference,
        currency: "ZAR",
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferData.status) {
      console.error("Transfer failed:", transferData);
      return new Response(
        JSON.stringify({
          success: false,
          message: transferData.message || "Transfer failed",
          error_code: transferData.code,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update order with payout information
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        metadata: {
          ...order.metadata,
          payout_completed: true,
          payout_transfer_code: transferData.data.transfer_code,
          payout_reference: transferReference,
          payout_amount: order.seller_amount,
          payout_initiated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Failed to update order with payout info:", updateError);
      // Don't fail the response since transfer was successful
    }

    // Update transaction status
    await supabase
      .from("transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: {
          payout_transfer_code: transferData.data.transfer_code,
          payout_reference: transferReference,
        },
      })
      .eq("paystack_reference", order.paystack_reference);

    console.log(
      `Payout successful for order ${order_id}: ${transferData.data.transfer_code}`,
    );

    // TODO: Send notification to seller about payout
    // TODO: Mark order as completed if fully fulfilled

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transfer_code: transferData.data.transfer_code,
          reference: transferReference,
          amount: order.seller_amount,
          amount_formatted: `R${(order.seller_amount / 100).toFixed(2)}`,
          status: transferData.data.status,
          recipient: transferData.data.recipient,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in pay-seller function:", error);
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
