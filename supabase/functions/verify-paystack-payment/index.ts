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

    // Update payment and order status (with retry)
    let updateSuccess = false;
    let updateError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Database update attempt ${attempt}/3`);

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
          throw updatePaymentError;
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
          throw updateOrderError;
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

      // Store successful verification for manual database update
      await supabaseClient.from("pending_payment_updates").insert({
        payment_reference: reference,
        order_id: payment.order_id,
        transaction_data: transaction,
        verified_at: verifiedAt,
        error_details: updateError?.message || "Database update failed",
        requires_manual_processing: true,
      });

      return new Response(
        JSON.stringify({
          success: true,
          payment_verified: true,
          database_pending: true,
          message:
            "Payment verified with Paystack. Database update is being processed manually.",
          payment: {
            id: payment.id,
            reference: reference,
            status: "verified_pending_update",
            amount: payment.amount,
            verified_at: verifiedAt,
            transaction_id: transaction.id,
          },
        }),
        { headers: corsHeaders },
      );
    }

    // Generate receipt for the order
    let receiptId = null;
    try {
      console.log("Generating receipt for order:", payment.order_id);
      const { data: receiptData, error: receiptError } =
        await supabaseClient.rpc("generate_receipt_for_order", {
          order_id: payment.order_id,
        });

      if (receiptError) {
        console.error("Receipt generation failed:", receiptError);
      } else {
        receiptId = receiptData;
        console.log("Receipt generated successfully:", receiptId);
      }
    } catch (receiptError) {
      console.error("Receipt generation error:", receiptError);
      // Continue with payment - receipt can be regenerated later
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
        receipt_id: receiptId,
      },
    });

    // Send notifications (quick operation)
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

    try {
      await supabaseClient.from("notifications").insert(notifications);
    } catch (notificationError) {
      console.error("Failed to create notifications:", notificationError);
    }

    // Queue email notifications and reminders (non-blocking)
    const emailData = {
      buyer_email: {
        to: payment.order.buyer.email,
        template: "payment_confirmed",
        data: {
          recipient_name: payment.order.buyer.full_name,
          book_title: payment.order.book.title,
          amount: payment.amount,
          order_id: payment.order_id,
          reference,
        },
      },
      seller_email: {
        to: payment.order.seller.email,
        template: "payment_received",
        data: {
          recipient_name: payment.order.seller.full_name,
          book_title: payment.order.book.title,
          amount: payment.amount,
          order_id: payment.order_id,
          buyer_name: payment.order.buyer.full_name,
        },
      },
    };

    // Store for background processing instead of blocking
    try {
      await supabaseClient.from("email_queue").insert([
        {
          type: "payment_confirmed",
          recipient: emailData.buyer_email.to,
          data: emailData.buyer_email,
          priority: "high",
          scheduled_for: new Date().toISOString(),
        },
        {
          type: "payment_received",
          recipient: emailData.seller_email.to,
          data: emailData.seller_email,
          priority: "high",
          scheduled_for: new Date().toISOString(),
        },
      ]);

      // Queue reminder processing
      await supabaseClient.from("reminder_queue").insert({
        order_id: payment.order_id,
        reminder_type: "seller_commitment",
        scheduled_for: new Date().toISOString(),
      });
    } catch (queueError) {
      console.error("Failed to queue background tasks:", queueError);
      // Continue execution - these are non-critical
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
