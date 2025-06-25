import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const WEBHOOK_SECRET = Deno.env.get("PAYSTACK_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Simple webhook signature verification
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("Webhook secret not configured, skipping verification");
    return true; // Allow in development
  }

  // In production, implement proper HMAC verification
  // For now, we'll do a simple check
  return signature === WEBHOOK_SECRET;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    if (!verifyWebhookSignature(body, signature || "")) {
      throw new Error("Invalid webhook signature");
    }

    const event = JSON.parse(body);
    const { event: eventType, data } = event;

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`📧 Received webhook: ${eventType}`);

    switch (eventType) {
      case "charge.success":
        // Payment successful - update order status
        await handlePaymentSuccess(supabase, data);
        break;

      case "transfer.success":
        // Payout successful - update payout logs
        await handleTransferSuccess(supabase, data);
        break;

      case "transfer.failed":
        // Payout failed - log and retry
        await handleTransferFailed(supabase, data);
        break;

      case "transfer.reversed":
        // Payout reversed - handle reversal
        await handleTransferReversed(supabase, data);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return new Response(JSON.stringify({ success: true, event: eventType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function handlePaymentSuccess(supabase: any, data: any) {
  try {
    const { reference } = data;

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_data: data,
        paid_at: new Date(data.paid_at).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("paystack_ref", reference);

    if (error) {
      console.error("Error updating order from webhook:", error);
    } else {
      console.log(`✅ Order ${reference} marked as paid via webhook`);
    }

    // Send confirmation email
    await supabase.functions.invoke("send-email-notification", {
      body: {
        to: data.customer.email,
        type: "payment_success",
        data: {
          reference: reference,
          amount: (data.amount / 100).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("Error handling payment success webhook:", error);
  }
}

async function handleTransferSuccess(supabase: any, data: any) {
  try {
    const { reference, transfer_code } = data;

    // Update payout log
    const { error } = await supabase
      .from("payout_logs")
      .update({
        status: "success",
        paystack_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("transfer_code", transfer_code);

    if (error) {
      console.error("Error updating payout log from webhook:", error);
    } else {
      console.log(
        `✅ Payout ${transfer_code} marked as successful via webhook`,
      );
    }

    // Get the payout details for notification
    const { data: payoutLog } = await supabase
      .from("payout_logs")
      .select("seller_id, amount, order_id")
      .eq("transfer_code", transfer_code)
      .single();

    if (payoutLog) {
      // Send success notification to seller
      await supabase.functions.invoke("send-email-notification", {
        body: {
          seller_id: payoutLog.seller_id,
          type: "payout_success",
          data: {
            amount: (payoutLog.amount / 100).toFixed(2),
            orderId: payoutLog.order_id,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error handling transfer success webhook:", error);
  }
}

async function handleTransferFailed(supabase: any, data: any) {
  try {
    const { transfer_code, failure_reason } = data;

    // Update payout log with failure
    const { error } = await supabase
      .from("payout_logs")
      .update({
        status: "failed",
        error_message: failure_reason,
        paystack_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("transfer_code", transfer_code);

    if (error) {
      console.error("Error updating failed payout log:", error);
    } else {
      console.log(`❌ Payout ${transfer_code} marked as failed via webhook`);
    }

    // Get payout details for retry logic
    const { data: payoutLog } = await supabase
      .from("payout_logs")
      .select("*")
      .eq("transfer_code", transfer_code)
      .single();

    if (payoutLog && payoutLog.retry_count < 3) {
      // Schedule retry (you might implement this with a queue system)
      console.log(`🔄 Scheduling retry for failed payout ${transfer_code}`);

      // For now, just increment retry count
      await supabase
        .from("payout_logs")
        .update({
          retry_count: payoutLog.retry_count + 1,
        })
        .eq("transfer_code", transfer_code);
    }
  } catch (error) {
    console.error("Error handling transfer failure webhook:", error);
  }
}

async function handleTransferReversed(supabase: any, data: any) {
  try {
    const { transfer_code } = data;

    // Update payout log
    const { error } = await supabase
      .from("payout_logs")
      .update({
        status: "reversed",
        paystack_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("transfer_code", transfer_code);

    if (error) {
      console.error("Error updating reversed payout log:", error);
    } else {
      console.log(`🔄 Payout ${transfer_code} marked as reversed via webhook`);
    }

    // Notify seller about reversal
    const { data: payoutLog } = await supabase
      .from("payout_logs")
      .select("seller_id, amount, order_id")
      .eq("transfer_code", transfer_code)
      .single();

    if (payoutLog) {
      // You might want to create a specific email template for reversals
      console.log(
        `📧 Should notify seller ${payoutLog.seller_id} about payout reversal`,
      );
    }
  } catch (error) {
    console.error("Error handling transfer reversal webhook:", error);
  }
}
