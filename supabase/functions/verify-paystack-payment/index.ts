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
    console.log("Verify payment request:", req.method);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Payment reference is required" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
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

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select(
        `
        *,
        order:order_id(
          *,
          buyer:buyer_id(id, email, full_name),
          seller:seller_id(id, email, full_name),
          book:book_id(title, author, price)
        )
      `,
      )
      .eq("reference", reference)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment record not found" }),
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    // Verify user has access to this payment
    if (user.id !== payment.user_id && user.id !== payment.order.seller_id) {
      return new Response(
        JSON.stringify({ error: "Not authorized to verify this payment" }),
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    // If payment is already verified, return existing status
    if (payment.status === "completed") {
      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: payment.id,
            reference: payment.reference,
            status: payment.status,
            amount: payment.amount,
            verified_at: payment.verified_at,
          },
          order: {
            id: payment.order.id,
            status: payment.order.status,
          },
        }),
        {
          headers: corsHeaders,
        },
      );
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      throw new Error("Paystack secret key not configured");
    }

    // Verify payment with Paystack (with timeout and retry)
    let verificationData = null;
    let verificationError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Paystack verification attempt ${attempt}/3`);

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const verificationResponse = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (!verificationResponse.ok) {
          throw new Error(
            `HTTP ${verificationResponse.status}: ${verificationResponse.statusText}`,
          );
        }

        const data = await verificationResponse.json();

        if (!data.status) {
          throw new Error(`Paystack error: ${data.message}`);
        }

        verificationData = data;
        break;
      } catch (error) {
        verificationError = error;
        console.error(`Verification attempt ${attempt} failed:`, error);

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    if (!verificationData) {
      console.error(
        "All verification attempts failed, checking local payment status",
      );

      // Fallback: Check if payment was already processed via webhook
      const { data: recentPayment } = await supabaseClient
        .from("payments")
        .select("*")
        .eq("reference", reference)
        .single();

      if (recentPayment?.status === "completed") {
        console.log("Payment was already verified via webhook");
        return new Response(
          JSON.stringify({
            success: true,
            payment: {
              id: recentPayment.id,
              reference: recentPayment.reference,
              status: recentPayment.status,
              amount: recentPayment.amount,
              verified_at: recentPayment.verified_at,
            },
            fallback: true,
            message: "Payment was already verified",
          }),
          { headers: corsHeaders },
        );
      }

      // Store verification attempt for manual processing
      await supabaseClient.from("failed_verifications").insert({
        payment_reference: reference,
        user_id: user.id,
        error_details: verificationError?.message || "Paystack API unavailable",
        attempted_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment verification temporarily unavailable",
          fallback: true,
          details:
            "We'll verify your payment manually within 1 hour and notify you.",
          reference: reference,
        }),
        {
          status: 503,
          headers: corsHeaders,
        },
      );
    }

    const transaction = verificationData.data;
    const verifiedAt = new Date().toISOString();

    // Check if payment was successful
    if (transaction.status !== "success") {
      // Update payment as failed
      await supabaseClient
        .from("payments")
        .update({
          status: "failed",
          paystack_response: transaction,
          verified_at: verifiedAt,
          updated_at: verifiedAt,
        })
        .eq("reference", reference);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment was not successful",
          payment: {
            id: payment.id,
            reference: reference,
            status: "failed",
            paystack_status: transaction.status,
          },
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Verify amount matches
    const expectedAmount = Math.round(payment.amount * 100); // Convert to kobo
    if (transaction.amount !== expectedAmount) {
      throw new Error(
        `Amount mismatch. Expected: ${expectedAmount}, Received: ${transaction.amount}`,
      );
    }

    // Update payment as completed
    const { error: updatePaymentError } = await supabaseClient
      .from("payments")
      .update({
        status: "completed",
        paystack_response: transaction,
        verified_at: verifiedAt,
        updated_at: verifiedAt,
      })
      .eq("reference", reference);

    if (updatePaymentError) {
      throw new Error(
        `Failed to update payment status: ${updatePaymentError.message}`,
      );
    }

    // Update order status to paid
    const { error: updateOrderError } = await supabaseClient
      .from("orders")
      .update({
        status: "paid",
        paid_at: verifiedAt,
        updated_at: verifiedAt,
      })
      .eq("id", payment.order_id);

    if (updateOrderError) {
      throw new Error(
        `Failed to update order status: ${updateOrderError.message}`,
      );
    }

    // Log audit trail
    await supabaseClient.from("audit_logs").insert({
      action: "payment_verified",
      table_name: "payments",
      record_id: payment.id,
      user_id: user.id,
      details: {
        reference,
        order_id: payment.order_id,
        amount: payment.amount,
        paystack_status: transaction.status,
        transaction_id: transaction.id,
      },
    });

    // Send notifications
    const notifications = [
      {
        user_id: payment.order.buyer_id,
        title: "Payment Confirmed",
        message: `Your payment for "${payment.order.book.title}" has been confirmed`,
        type: "payment",
        metadata: {
          order_id: payment.order_id,
          reference,
          amount: payment.amount,
        },
      },
      {
        user_id: payment.order.seller_id,
        title: "Payment Received",
        message: `Payment received for "${payment.order.book.title}"`,
        type: "payment",
        metadata: {
          order_id: payment.order_id,
          reference,
          amount: payment.amount,
        },
      },
    ];

    await supabaseClient.from("notifications").insert(notifications);

    // Send email notifications
    try {
      // Notify buyer
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`,
        {
          method: "POST",
          headers: {
            Authorization: req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: payment.order.buyer.email,
            template: "payment_confirmed",
            data: {
              recipient_name: payment.order.buyer.full_name,
              book_title: payment.order.book.title,
              amount: payment.amount,
              order_id: payment.order_id,
              reference,
            },
          }),
        },
      );

      // Notify seller
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`,
        {
          method: "POST",
          headers: {
            Authorization: req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: payment.order.seller.email,
            template: "payment_received",
            data: {
              recipient_name: payment.order.seller.full_name,
              book_title: payment.order.book.title,
              amount: payment.amount,
              order_id: payment.order_id,
              buyer_name: payment.order.buyer.full_name,
            },
          }),
        },
      );
    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
    }

    // Trigger order reminder system for seller commitment
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-order-reminders`,
        {
          method: "POST",
          headers: {
            Authorization: req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: payment.order_id,
            reminder_type: "seller_commitment",
          }),
        },
      );
    } catch (reminderError) {
      console.error("Failed to trigger reminder system:", reminderError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        payment: {
          id: payment.id,
          reference: reference,
          status: "completed",
          amount: payment.amount,
          verified_at: verifiedAt,
          transaction_id: transaction.id,
        },
        order: {
          id: payment.order_id,
          status: "paid",
          paid_at: verifiedAt,
        },
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Payment verification error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to verify payment",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
