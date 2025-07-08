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

    const { orderId, sellerId } = await req.json();

    if (!orderId || !sellerId) {
      return new Response(
        JSON.stringify({ error: "Order ID and Seller ID are required" }),
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

    // Get order and seller details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        books(title, price),
        profiles!orders_seller_id_fkey(full_name, email, subaccount_code)
      `,
      )
      .eq("id", orderId)
      .eq("seller_id", sellerId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found or unauthorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (order.status !== "collected") {
      return new Response(
        JSON.stringify({ error: "Order must be collected before payout" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if payout already exists
    const { data: existingPayout } = await supabase
      .from("payout_logs")
      .select("id, status")
      .eq("order_id", orderId)
      .single();

    if (existingPayout) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payout already processed",
          status: existingPayout.status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Calculate payout amount (90% to seller, 10% platform commission)
    const platformCommission = Math.round(order.amount * 0.1);
    const sellerAmount = order.amount - platformCommission;

    // Get banking details
    const { data: bankingDetails, error: bankingError } = await supabase
      .from("banking_details")
      .select("recipient_code, bank_account_number, bank_name, full_name")
      .eq("user_id", sellerId)
      .single();

    if (bankingError || !bankingDetails?.recipient_code) {
      return new Response(
        JSON.stringify({ error: "Seller banking details not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate transfer reference
    const reference = `payout_${orderId}_${Date.now()}`;

    // Create payout log
    const { data: payoutLog, error: logError } = await supabase
      .from("payout_logs")
      .insert({
        order_id: orderId,
        seller_id: sellerId,
        amount: sellerAmount,
        commission: platformCommission,
        recipient_code: bankingDetails.recipient_code,
        reference: reference,
        status: "pending",
      })
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    // Initiate transfer with Paystack
    const transferData = {
      source: "balance",
      amount: sellerAmount * 100, // Convert to kobo
      recipient: bankingDetails.recipient_code,
      reason: `Payout for book sale: ${order.books?.title || "Book"}`,
      reference: reference,
      metadata: {
        order_id: orderId,
        book_title: order.books?.title,
        commission: platformCommission,
      },
    };

    const paystackResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transferData),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack transfer error:", paystackData);

      // Update payout log with error
      await supabase
        .from("payout_logs")
        .update({
          status: "failed",
          error_message: paystackData.message || "Transfer failed",
          paystack_response: paystackData,
        })
        .eq("id", payoutLog.id);

      return new Response(
        JSON.stringify({
          error: "Transfer failed",
          details: paystackData.message || "Unknown error",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update payout log with transfer details
    await supabase
      .from("payout_logs")
      .update({
        transfer_code: paystackData.data.transfer_code,
        status: "processing",
        paystack_response: paystackData.data,
      })
      .eq("id", payoutLog.id);

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: "payout_processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Send notification to seller
    await supabase.from("notifications").insert({
      user_id: sellerId,
      type: "payout_initiated",
      title: "Payout Processing",
      message: `Your payout of R${sellerAmount.toFixed(2)} for "${order.books?.title || "your book"}" is being processed. You should receive it within 24 hours.`,
    });

    // Log the payout initiation
    await supabase.from("audit_logs").insert({
      action: "payout_initiated",
      table_name: "payout_logs",
      record_id: payoutLog.id,
      user_id: sellerId,
      new_values: {
        amount: sellerAmount,
        reference: reference,
        book_title: order.books?.title,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          id: payoutLog.id,
          amount: sellerAmount,
          reference: reference,
          status: "processing",
        },
        message: "Payout initiated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in pay-seller:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
