import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify user has access to this payment
    if (user.id !== payment.user_id && user.id !== payment.order.seller_id) {
      return new Response(
        JSON.stringify({ error: "Not authorized to verify this payment" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      throw new Error("Paystack secret key not configured");
    }

    // Verify payment with Paystack
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      },
    );

    const verificationData = await verificationResponse.json();

    if (!verificationData.status) {
      throw new Error(
        `Paystack verification failed: ${verificationData.message}`,
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Payment verification error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to verify payment",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
