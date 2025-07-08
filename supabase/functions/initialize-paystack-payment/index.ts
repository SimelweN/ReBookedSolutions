import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Initialize payment request:", req.method);
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      order_id,
      email,
      amount,
      currency = "ZAR",
      callback_url,
      metadata = {},
    } = await req.json();

    if (!order_id || !email || !amount) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: order_id, email, amount",
        }),
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

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(
        `
        *,
        buyer:buyer_id(id, email, full_name),
        seller:seller_id(id, email, full_name),
        book:book_id(title, author, price, seller_id),
        seller_profile:seller_id(paystack_subaccount_code)
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

    // Verify user is the buyer
    if (user.id !== order.buyer_id) {
      return new Response(
        JSON.stringify({ error: "Only the buyer can initialize payment" }),
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    // Check order status
    if (order.status !== "pending") {
      return new Response(
        JSON.stringify({
          error: `Cannot process payment. Order status: ${order.status}`,
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabaseClient
      .from("payments")
      .select("reference, status")
      .eq("order_id", order_id)
      .eq("status", "pending")
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          error: "Payment already initialized for this order",
          reference: existingPayment.reference,
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

    // Generate unique reference
    const reference = `order_${order_id}_${Date.now()}`;

    // Convert amount to kobo (Paystack uses kobo for ZAR)
    const amountInKobo = Math.round(amount * 100);

    // Prepare Paystack initialization data
    const initializationData: any = {
      email: email,
      amount: amountInKobo,
      currency: currency,
      reference: reference,
      callback_url:
        callback_url || `${Deno.env.get("SITE_URL")}/payment/callback`,
      metadata: {
        order_id: order_id,
        buyer_id: user.id,
        seller_id: order.seller_id,
        book_title: order.book.title,
        ...metadata,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    };

    // Add split payment if seller has subaccount
    if (order.seller_profile?.paystack_subaccount_code) {
      // Calculate platform fee (5%)
      const platformFeeRate = 0.05;
      const platformFee = Math.round(amountInKobo * platformFeeRate);
      const sellerAmount = amountInKobo - platformFee;

      initializationData.split = {
        type: "percentage",
        bearer_type: "account",
        subaccounts: [
          {
            subaccount: order.seller_profile.paystack_subaccount_code,
            share: Math.round((sellerAmount / amountInKobo) * 100), // Percentage
          },
        ],
      };
    }

    // Initialize payment with Paystack (with retries)
    let paystackData;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Payment initialization attempt ${attempt}/3`);

        const paystackResponse = await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(initializationData),
          },
        );

        if (!paystackResponse.ok) {
          throw new Error(
            `HTTP ${paystackResponse.status}: ${paystackResponse.statusText}`,
          );
        }

        paystackData = await paystackResponse.json();

        if (!paystackData.status) {
          throw new Error(`Paystack error: ${paystackData.message}`);
        }

        // Success - break out of retry loop
        break;
      } catch (error) {
        lastError = error;
        console.error(`Payment attempt ${attempt} failed:`, error);

        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!paystackData?.status) {
      // Ultimate fallback: Store order and allow manual payment processing
      console.error(
        "All Paystack attempts failed, storing for manual processing",
      );

      // Store failed payment for manual handling
      await supabaseClient.from("payments").insert({
        order_id: order_id,
        user_id: user.id,
        amount: amount,
        currency: currency,
        reference: reference,
        status: "manual_processing_required",
        metadata: {
          ...initializationData.metadata,
          error: lastError?.message,
          failed_attempts: 3,
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment gateway temporarily unavailable",
          fallback: true,
          details:
            "Your order has been saved. We'll contact you with payment instructions within 24 hours.",
          order_id: order_id,
          reference: reference,
        }),
        {
          status: 503,
          headers: corsHeaders,
        },
      );
    }

    // Store payment record (with retry)
    let payment = null;
    let paymentError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Payment record creation attempt ${attempt}/3`);

        const { data, error } = await supabaseClient
          .from("payments")
          .insert({
            order_id: order_id,
            user_id: user.id,
            amount: amount,
            currency: currency,
            reference: reference,
            status: "pending",
            paystack_response: paystackData.data,
            metadata: initializationData.metadata,
          })
          .select()
          .single();

        if (error) {
          paymentError = error;
          console.error(`Payment record attempt ${attempt} failed:`, error);

          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        } else {
          payment = data;
          break;
        }
      } catch (err) {
        paymentError = err;
        console.error(`Payment record attempt ${attempt} error:`, err);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!payment) {
      console.error(
        "Failed to store payment record, but Paystack initialization succeeded",
      );

      // Paystack was successful but we can't store locally - return special response
      return new Response(
        JSON.stringify({
          success: true,
          payment_initialized: true,
          database_pending: true,
          message:
            "Payment initialized successfully. Record creation is being processed.",
          paystack: {
            authorization_url: paystackData.data.authorization_url,
            access_code: paystackData.data.access_code,
            reference: paystackData.data.reference,
          },
          fallback_instructions:
            "Proceed with payment. We'll match your transaction manually if needed.",
        }),
        { headers: corsHeaders },
      );
    }

    // Update order with payment reference
    await supabaseClient
      .from("orders")
      .update({
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    // Log audit trail (non-blocking)
    try {
      await supabaseClient.from("audit_logs").insert({
        action: "payment_initialized",
        table_name: "payments",
        record_id: payment.id,
        user_id: user.id,
        details: {
          order_id,
          reference,
          amount,
          currency,
          paystack_access_code: paystackData.data.access_code,
        },
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Continue execution - audit log is not critical for payment flow
    }

    // Send notification to seller (non-blocking)
    try {
      await supabaseClient.from("notifications").insert({
        user_id: order.seller_id,
        title: "Payment Initiated",
        message: `A buyer has initiated payment for "${order.book.title}"`,
        type: "payment",
        metadata: { order_id, reference },
      });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Continue execution - notification is not critical for payment flow
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          reference: reference,
          amount: amount,
          currency: currency,
          status: "pending",
        },
        paystack: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        },
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Payment initialization error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to initialize payment",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
