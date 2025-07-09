import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Process refund request:", req.method);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const {
      order_id,
      reason = "Order cancelled",
      refund_amount,
      merchant_note,
    } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get order and payment details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(
        `
        *,
        buyer:buyer_id(id, email, full_name),
        book:book_id(title, author),
        payment:payments(reference, amount, status, paystack_response)
      `,
      )
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Check if order is eligible for refund
    if (
      !["paid", "committed", "shipped", "in_transit", "cancelled"].includes(
        order.status,
      )
    ) {
      return new Response(
        JSON.stringify({
          error: `Order not eligible for refund. Status: ${order.status}`,
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Check if refund already processed
    if (order.status === "refunded") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Refund already processed for this order",
        }),
        { headers: corsHeaders },
      );
    }

    const paymentData = order.payment?.[0];
    if (!paymentData || !paymentData.reference) {
      return new Response(
        JSON.stringify({
          error: "No payment reference found for this order",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      throw new Error("Paystack secret key not configured");
    }

    // Calculate refund amount (default to full payment amount)
    const refundAmountKobo = refund_amount
      ? Math.round(refund_amount * 100)
      : Math.round(paymentData.amount * 100);

    // Process refund with Paystack (with retry mechanism)
    let refundSuccess = false;
    let paystackRefundId = null;
    let refundError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Paystack refund attempt ${attempt}/3 for order ${order_id}`,
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const refundResponse = await fetch("https://api.paystack.co/refund", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction: paymentData.reference,
            amount: refundAmountKobo,
            currency: "ZAR",
            customer_note: reason,
            merchant_note: merchant_note || `Refund for order ${order_id}`,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!refundResponse.ok) {
          const errorData = await refundResponse.json();
          console.error(
            `Paystack refund failed (${refundResponse.status}):`,
            errorData,
          );

          if (
            refundResponse.status === 400 &&
            errorData.message?.includes("already refunded")
          ) {
            console.log("Payment already refunded - marking as success");
            refundSuccess = true;
            break;
          }

          throw new Error(`Paystack refund failed: ${errorData.message}`);
        }

        const refundData = await refundResponse.json();

        if (!refundData.status) {
          throw new Error(`Paystack refund error: ${refundData.message}`);
        }

        paystackRefundId = refundData.data?.id;
        refundSuccess = true;
        console.log("Paystack refund successful:", paystackRefundId);
        break;
      } catch (error) {
        refundError = error;
        console.error(`Refund attempt ${attempt} failed:`, error);

        if (error.name === "AbortError") {
          console.error("Paystack refund timeout");
        }

        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    const refundTime = new Date().toISOString();

    // Update order status (with retry)
    let updateSuccess = false;
    let updateError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Database update attempt ${attempt}/3`);

        const { error: orderUpdateError } = await supabaseClient
          .from("orders")
          .update({
            status: "refunded",
            refund_processed_at: refundTime,
            refund_amount: refund_amount || paymentData.amount,
            refund_reason: reason,
            paystack_refund_id: paystackRefundId,
            updated_at: refundTime,
          })
          .eq("id", order_id);

        if (orderUpdateError) {
          throw orderUpdateError;
        }

        // Update payment status
        const { error: paymentUpdateError } = await supabaseClient
          .from("payments")
          .update({
            status: "refunded",
            refunded_at: refundTime,
            updated_at: refundTime,
          })
          .eq("reference", paymentData.reference);

        if (paymentUpdateError) {
          console.error("Failed to update payment status:", paymentUpdateError);
        }

        // Mark book as available again
        const { error: bookUpdateError } = await supabaseClient
          .from("books")
          .update({
            sold: false,
            status: "available",
            updated_at: refundTime,
          })
          .eq("id", order.book_id);

        if (bookUpdateError) {
          console.error("Failed to update book status:", bookUpdateError);
        }

        updateSuccess = true;
        break;
      } catch (error) {
        updateError = error;
        console.error(`Update attempt ${attempt} failed:`, error);

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!updateSuccess) {
      console.error("Failed to update database, storing for manual processing");

      // Store for manual processing
      await supabaseClient.from("failed_refund_updates").insert({
        order_id: order_id,
        paystack_refund_id: paystackRefundId,
        refund_amount: refund_amount || paymentData.amount,
        refund_reason: reason,
        error_details: updateError?.message || "Database update failed",
        requires_manual_processing: true,
        created_at: refundTime,
      });

      return new Response(
        JSON.stringify({
          success: true,
          payment_refunded: refundSuccess,
          database_pending: true,
          message: refundSuccess
            ? "Refund processed with Paystack. Database update is being processed manually."
            : "Refund initiated but requires manual processing.",
          refund_id: paystackRefundId,
        }),
        { headers: corsHeaders },
      );
    }

    // Create audit log
    await supabaseClient.from("audit_logs").insert({
      action: "refund_processed",
      table_name: "orders",
      record_id: order_id,
      details: {
        order_id,
        refund_amount: refund_amount || paymentData.amount,
        reason,
        paystack_refund_id: paystackRefundId,
        refund_success: refundSuccess,
      },
    });

    // Send notifications
    const notifications = [
      {
        user_id: order.buyer_id,
        title: "Refund Processed",
        message: `Your refund for "${order.book.title}" has been processed. Amount: R${(refund_amount || paymentData.amount).toFixed(2)}`,
        type: "refund",
        metadata: {
          order_id,
          refund_amount: refund_amount || paymentData.amount,
          refund_id: paystackRefundId,
        },
      },
    ];

    // Notify seller if order was committed
    if (["committed", "shipped", "in_transit"].includes(order.status)) {
      notifications.push({
        user_id: order.seller_id,
        title: "Order Refunded",
        message: `Order for "${order.book.title}" has been refunded to the buyer`,
        type: "order_update",
        metadata: {
          order_id,
          refund_amount: refund_amount || paymentData.amount,
        },
      });
    }

    try {
      await supabaseClient.from("notifications").insert(notifications);
    } catch (notificationError) {
      console.error("Failed to create notifications:", notificationError);
    }

    // Queue email notification
    try {
      await supabaseClient.from("email_queue").insert({
        type: "refund_processed",
        recipient: order.buyer.email,
        data: {
          to: order.buyer.email,
          template: "refund_processed",
          data: {
            recipient_name: order.buyer.full_name,
            book_title: order.book.title,
            refund_amount: refund_amount || paymentData.amount,
            order_id: order_id,
            reason: reason,
          },
        },
        priority: "high",
        scheduled_for: new Date().toISOString(),
      });
    } catch (emailError) {
      console.error("Failed to queue email notification:", emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Refund processed successfully",
        refund: {
          order_id: order_id,
          refund_amount: refund_amount || paymentData.amount,
          paystack_refund_id: paystackRefundId,
          processed_at: refundTime,
          reason: reason,
        },
        paystack_success: refundSuccess,
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Refund processing error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to process refund",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
