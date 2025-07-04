import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    const { amount, recipient, reason, reference } = await req.json();

    if (!amount || !recipient || !reason || !reference) {
      throw new Error(
        "Missing required parameters: amount, recipient, reason, reference",
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Initiate transfer with Paystack
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount,
        recipient: recipient,
        reason: reason,
        reference: reference,
        currency: "ZAR",
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferResponse.ok) {
      throw new Error(`Transfer failed: ${transferData.message}`);
    }

    const { data } = transferData;

    // Log the payout attempt
    const { error: logError } = await supabase.from("payout_logs").insert({
      order_id: reference.split("_")[1], // Extract order ID from reference
      seller_id: req.headers.get("x-seller-id"), // Should be passed from calling function
      amount: amount,
      transfer_code: data.transfer_code,
      recipient_code: recipient,
      status: data.status,
      reference: reference,
      paystack_response: data,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.warn("Failed to log payout:", logError);
      // Don't fail the transfer for logging issues
    }

    // Send notification email to seller
    try {
      await supabase.functions.invoke("send-email-notification", {
        body: {
          type: "payout_initiated",
          seller_id: req.headers.get("x-seller-id"),
          data: {
            amount: (amount / 100).toFixed(2),
            reference: reference,
            transfer_code: data.transfer_code,
          },
        },
      });
    } catch (emailError) {
      console.warn("Payout email notification failed:", emailError);
      // Don't fail the transfer for email issues
    }

    return new Response(
      JSON.stringify({
        transfer_code: data.transfer_code,
        amount: data.amount,
        recipient: data.recipient.recipient_code,
        status: data.status,
        reference: data.reference,
        currency: data.currency,
        created_at: data.createdAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Seller payout error:", error);

    // Log failed payout attempt
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("payout_logs").insert({
        order_id: req.json?.reference?.split("_")[1] || "unknown",
        seller_id: req.headers.get("x-seller-id") || "unknown",
        amount: req.json?.amount || 0,
        status: "failed",
        error_message: error.message,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.warn("Failed to log payout error:", logError);
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        status: "failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
