import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Paystack Webhook Received ===");

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    console.log("Webhook signature:", signature);
    console.log("Webhook body length:", body.length);

    // Verify webhook signature
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response("Configuration error", { status: 500 });
    }

    // Create hash to verify signature
    const crypto = await import("node:crypto");
    const hash = crypto
      .createHmac("sha512", paystackSecretKey)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Webhook event:", event.event, event.data?.reference);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(supabase, event.data);
        break;

      case "charge.failed":
        await handleFailedPayment(supabase, event.data);
        break;

      case "transfer.success":
        console.log("Transfer successful:", event.data.reference);
        await handleSuccessfulTransfer(supabase, event.data);
        break;

      case "transfer.failed":
        console.log(
          "Transfer failed:",
          event.data.reference,
          event.data.failure_reason,
        );
        await handleFailedTransfer(supabase, event.data);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return new Response("OK", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});

async function handleSuccessfulPayment(supabase: any, paymentData: any) {
  try {
    console.log("Processing successful payment:", paymentData.reference);

    // Find order by Paystack reference (updated to use orders table)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("paystack_ref", paymentData.reference)
      .single();

    if (orderError || !order) {
      console.error(
        "Order not found for reference:",
        paymentData.reference,
        orderError,
      );

      // Try to find in transactions table as fallback
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("paystack_reference", paymentData.reference)
        .single();

      if (transactionError || !transaction) {
        console.error("Transaction also not found:", paymentData.reference);
        return;
      }

      // Handle legacy transaction
      await handleLegacyTransaction(supabase, transaction, paymentData);
      return;
    }

    console.log("Found order for payment:", order.id);

    // Update order status to paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_data: {
          ...order.payment_data,
          payment_verified: true,
          payment_completed_at: new Date().toISOString(),
          paystack_amount: paymentData.amount,
          paystack_gateway_response: paymentData.gateway_response,
        },
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return;
    }

    // Create payment split record for tracking (if table exists)
    const deliveryFee = order.delivery_data?.delivery_fee || 0;
    const bookAmount =
      order.items?.reduce((sum: number, item: any) => sum + item.price, 0) ||
      order.amount;

    try {
      const { error: splitError } = await supabase
        .from("payment_splits")
        .insert({
          order_id: order.id,
          seller_subaccount: order.payment_data?.seller_subaccount_code,
          book_amount: bookAmount,
          delivery_amount: deliveryFee,
          platform_commission: Math.round(order.amount * 0.1),
          seller_amount: Math.round(order.amount * 0.9),
          courier_amount: deliveryFee,
          split_executed: true,
          paystack_reference: paymentData.reference,
        });

      if (splitError) {
        console.error(
          "Error creating payment split record (non-critical):",
          splitError,
        );
      }
    } catch (splitError) {
      console.error(
        "Payment splits table may not exist (non-critical):",
        splitError,
      );
    }

    if (splitError) {
      console.error("Error creating payment split record:", splitError);
    }

    // Ensure book remains sold
    if (order.book_id) {
      await supabase
        .from("books")
        .update({ sold: true })
        .eq("id", order.book_id);
    }

    console.log("Payment processed successfully for order:", order.id);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(supabase: any, paymentData: any) {
  try {
    console.log("Processing failed payment:", paymentData.reference);

    // Find order by Paystack reference
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("paystack_ref", paymentData.reference)
      .single();

    if (orderError || !order) {
      console.error(
        "Order not found for failed payment:",
        paymentData.reference,
      );
      return;
    }

    // Update order status to failed
    await supabase
      .from("orders")
      .update({
        status: "failed",
        payment_held: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Make book available again
    if (order.book_id) {
      await supabase
        .from("books")
        .update({ sold: false })
        .eq("id", order.book_id);
    }

    console.log("Failed payment processed for order:", order.id);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

async function handleSuccessfulTransfer(supabase: any, transferData: any) {
  try {
    console.log("Processing successful transfer:", transferData.reference);

    // Update any pending payouts
    const { error } = await supabase
      .from("orders")
      .update({
        payout_completed_at: new Date().toISOString(),
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("paystack_ref", transferData.reference);

    if (error) {
      console.error("Error updating transfer status:", error);
    }
  } catch (error) {
    console.error("Error handling successful transfer:", error);
  }
}

async function handleFailedTransfer(supabase: any, transferData: any) {
  try {
    console.log("Processing failed transfer:", transferData.reference);

    // Mark transfer as failed for retry
    const { error } = await supabase
      .from("orders")
      .update({
        payout_failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("paystack_ref", transferData.reference);

    if (error) {
      console.error("Error updating failed transfer:", error);
    }
  } catch (error) {
    console.error("Error handling failed transfer:", error);
  }
}

async function handleLegacyTransaction(
  supabase: any,
  transaction: any,
  paymentData: any,
) {
  try {
    console.log("Processing legacy transaction:", transaction.id);

    // Update transaction status
    await supabase
      .from("transactions")
      .update({
        status: "completed",
        committed_at: new Date().toISOString(),
        seller_committed: true,
      })
      .eq("id", transaction.id);

    // Ensure book remains sold
    await supabase
      .from("books")
      .update({ sold: true })
      .eq("id", transaction.book_id);
  } catch (error) {
    console.error("Error handling legacy transaction:", error);
  }
}
