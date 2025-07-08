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
    console.log("Paystack webhook received:", req.method, req.url);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    // Verify webhook signature
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) {
      throw new Error("Paystack secret key not configured");
    }

    const hash = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"],
    );

    const expectedSignature = Array.from(
      new Uint8Array(
        await crypto.subtle.sign("HMAC", hash, new TextEncoder().encode(body)),
      ),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature !== expectedSignature) {
      console.log("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const event = JSON.parse(body);
    console.log("Webhook event:", event.event);

    // Log webhook event
    await supabaseClient.from("audit_logs").insert({
      action: "webhook_received",
      table_name: "paystack_webhooks",
      details: { event: event.event, reference: event.data?.reference },
    });

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(supabaseClient, event.data);
        break;
      case "transfer.success":
        await handleTransferSuccess(supabaseClient, event.data);
        break;
      case "transfer.failed":
        await handleTransferFailed(supabaseClient, event.data);
        break;
      case "subaccount.updated":
        await handleSubaccountUpdated(supabaseClient, event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Webhook error:", error);
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

async function handleChargeSuccess(supabaseClient: any, data: any) {
  const { reference, amount, customer } = data;

  // Update payment record with retry mechanism
  let paymentUpdateSuccess = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { error: paymentError } = await supabaseClient
        .from("payments")
        .update({
          status: "completed",
          paystack_response: data,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);

      if (!paymentError) {
        paymentUpdateSuccess = true;
        break;
      } else {
        console.error(
          `Payment update attempt ${attempt} failed:`,
          paymentError,
        );
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    } catch (error) {
      console.error(`Payment update attempt ${attempt} error:`, error);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  if (!paymentUpdateSuccess) {
    // Fallback: Store webhook event for manual processing
    console.error(
      "Failed to update payment, storing webhook for manual processing",
    );
    await supabaseClient.from("failed_webhooks").insert({
      event_type: "charge.success",
      reference: reference,
      payload: data,
      error: "Failed to update payment record",
      retry_count: 3,
      created_at: new Date().toISOString(),
    });
    return;
  }

  // Get order details
  const { data: payment } = await supabaseClient
    .from("payments")
    .select("order_id, orders(*)")
    .eq("reference", reference)
    .single();

  if (payment?.order_id) {
    // Update order status
    await supabaseClient
      .from("orders")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.order_id);

    // Send notification to seller
    await supabaseClient.from("notifications").insert({
      user_id: payment.orders.seller_id,
      title: "Payment Received",
      message: `Payment of R${(amount / 100).toFixed(2)} received for your book`,
      type: "payment",
    });
  }

  console.log(`Charge success processed for reference: ${reference}`);
}

async function handleTransferSuccess(supabaseClient: any, data: any) {
  const { reference, amount, recipient } = data;

  // Update payout record
  const { error } = await supabaseClient
    .from("seller_payouts")
    .update({
      status: "completed",
      paystack_response: data,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference);

  if (error) {
    console.error("Error updating payout:", error);
    return;
  }

  // Get seller details and send notification
  const { data: payout } = await supabaseClient
    .from("seller_payouts")
    .select("seller_id, amount")
    .eq("reference", reference)
    .single();

  if (payout) {
    await supabaseClient.from("notifications").insert({
      user_id: payout.seller_id,
      title: "Payout Completed",
      message: `Your payout of R${(payout.amount / 100).toFixed(2)} has been processed`,
      type: "payout",
    });
  }

  console.log(`Transfer success processed for reference: ${reference}`);
}

async function handleTransferFailed(supabaseClient: any, data: any) {
  const { reference, amount } = data;

  // Update payout record
  const { error } = await supabaseClient
    .from("seller_payouts")
    .update({
      status: "failed",
      paystack_response: data,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference);

  if (error) {
    console.error("Error updating failed payout:", error);
    return;
  }

  // Get seller details and send notification
  const { data: payout } = await supabaseClient
    .from("seller_payouts")
    .select("seller_id, amount")
    .eq("reference", reference)
    .single();

  if (payout) {
    await supabaseClient.from("notifications").insert({
      user_id: payout.seller_id,
      title: "Payout Failed",
      message: `Your payout of R${(payout.amount / 100).toFixed(2)} failed. Please contact support.`,
      type: "error",
    });
  }

  console.log(`Transfer failed processed for reference: ${reference}`);
}

async function handleSubaccountUpdated(supabaseClient: any, data: any) {
  const { subaccount_code, business_name, settlement_bank } = data;

  // Update seller subaccount
  const { error } = await supabaseClient
    .from("seller_profiles")
    .update({
      paystack_subaccount_data: data,
      updated_at: new Date().toISOString(),
    })
    .eq("paystack_subaccount_code", subaccount_code);

  if (error) {
    console.error("Error updating subaccount:", error);
    return;
  }

  console.log(`Subaccount updated: ${subaccount_code}`);
}
