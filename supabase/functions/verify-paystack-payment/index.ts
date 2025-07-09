import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
  withRetry,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["POST", "OPTIONS"];

interface PaystackTransaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    customer_code?: string;
  };
  metadata?: {
    book_id?: string;
    buyer_id?: string;
    seller_id?: string;
    order_id?: string;
    [key: string]: any;
  };
  paid_at?: string;
  created_at?: string;
  fees?: number;
  authorization?: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Parse request body
  const { data: requestBody, error: parseError } = await safeJsonParse(req);
  if (parseError) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON", {
      error: parseError,
    });
  }

  const { reference, orderId } = requestBody;

  // Validate required fields
  if (!reference) {
    return errorResponse(
      "Payment reference is required",
      400,
      "REFERENCE_MISSING",
    );
  }

  // Check if payment was already verified
  const { data: existingPayment, error: paymentCheckError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .single();

  if (paymentCheckError && paymentCheckError.code !== "PGRST116") {
    // PGRST116 is "not found", which is expected for new payments
    console.error("Error checking existing payment:", paymentCheckError);
    return errorResponse(
      "Failed to check payment status",
      500,
      "PAYMENT_CHECK_ERROR",
      { error: paymentCheckError.message },
    );
  }

  if (existingPayment?.status === "verified") {
    return successResponse(
      {
        verified: true,
        alreadyVerified: true,
        transaction: existingPayment.paystack_response,
        payment: existingPayment,
      },
      "Payment was already verified",
    );
  }

  // Get Paystack API key
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // Handle development/testing mode
  if (!PAYSTACK_SECRET_KEY) {
    console.warn("PAYSTACK_SECRET_KEY not set - using test mode");

    // Simulate successful verification for testing
    const mockTransaction: PaystackTransaction = {
      reference: reference,
      status: "success",
      amount: 10000, // R100.00 in kobo
      currency: "ZAR",
      customer: { email: "test@example.com" },
      metadata: {
        book_id: "test-book-id",
        buyer_id: "test-buyer-id",
        seller_id: "test-seller-id",
        order_id: orderId || "test-order-id",
      },
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Save mock payment record
    const mockPayment = {
      reference,
      status: "verified",
      amount: mockTransaction.amount / 100, // Convert kobo to rand
      currency: mockTransaction.currency,
      paystack_response: mockTransaction,
      metadata: mockTransaction.metadata,
      verified_at: new Date().toISOString(),
      user_id: mockTransaction.metadata?.buyer_id,
    };

    const { error: insertError } = await supabase
      .from("payments")
      .upsert(mockPayment, { onConflict: "reference" });

    if (insertError) {
      console.error("Failed to save mock payment:", insertError);
    }

    return successResponse(
      {
        verified: true,
        testMode: true,
        transaction: mockTransaction,
        payment: mockPayment,
      },
      "Payment verification simulated (test mode)",
    );
  }

  try {
    // Verify payment with Paystack API
    const verifyPayment = async (): Promise<any> => {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Paystack API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      return await response.json();
    };

    // Add timeout and retry logic for Paystack API call
    const paystackData = await withTimeout(
      withRetry(verifyPayment, 3, 2000),
      15000,
      "Paystack verification timed out",
    );

    if (!paystackData.status) {
      return errorResponse(
        "Payment verification failed",
        400,
        "PAYSTACK_VERIFICATION_FAILED",
        {
          message: paystackData.message,
          reference,
        },
      );
    }

    const transaction: PaystackTransaction = paystackData.data;

    if (!transaction) {
      return errorResponse(
        "No transaction data received from Paystack",
        400,
        "NO_TRANSACTION_DATA",
      );
    }

    // Check transaction status
    if (transaction.status !== "success") {
      // Save failed payment record
      const failedPayment = {
        reference,
        status: "failed",
        amount: transaction.amount ? transaction.amount / 100 : 0,
        currency: transaction.currency || "ZAR",
        paystack_response: transaction,
        metadata: transaction.metadata,
        user_id: transaction.metadata?.buyer_id,
      };

      await supabase
        .from("payments")
        .upsert(failedPayment, { onConflict: "reference" })
        .catch((error) =>
          console.error("Failed to save failed payment:", error),
        );

      return errorResponse(
        `Payment was not successful: ${transaction.status}`,
        400,
        "PAYMENT_NOT_SUCCESSFUL",
        {
          status: transaction.status,
          reference,
          transaction,
        },
      );
    }

    // Verify amount if provided in metadata
    const expectedAmount = transaction.metadata?.amount;
    if (expectedAmount && Math.abs(transaction.amount - expectedAmount) > 0) {
      return errorResponse("Payment amount mismatch", 400, "AMOUNT_MISMATCH", {
        expected: expectedAmount,
        received: transaction.amount,
        reference,
      });
    }

    // Save successful payment record
    const paymentRecord = {
      reference,
      status: "verified",
      amount: transaction.amount / 100, // Convert kobo to rand
      currency: transaction.currency,
      paystack_response: transaction,
      metadata: transaction.metadata,
      verified_at: new Date().toISOString(),
      user_id: transaction.metadata?.buyer_id,
      order_id: transaction.metadata?.order_id || orderId,
    };

    const { data: savedPayment, error: saveError } = await supabase
      .from("payments")
      .upsert(paymentRecord, { onConflict: "reference" })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save payment record:", saveError);
      // Don't fail the verification if database save fails
      // The payment was successful with Paystack
    }

    // Update order status if order_id is provided
    if (orderId || transaction.metadata?.order_id) {
      const updateOrderId = orderId || transaction.metadata?.order_id;
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_reference: reference,
        })
        .eq("id", updateOrderId);

      if (orderUpdateError) {
        console.error("Failed to update order status:", orderUpdateError);
        // Don't fail verification if order update fails
      }
    }

    return successResponse(
      {
        verified: true,
        transaction,
        payment: savedPayment || paymentRecord,
        amount: transaction.amount / 100,
        currency: transaction.currency,
      },
      "Payment verified successfully",
    );
  } catch (error) {
    console.error("Error verifying payment:", error);

    // Check if it's a Paystack API error
    if (error.message?.includes("Paystack API error")) {
      return errorResponse(
        "Failed to verify payment with Paystack",
        400,
        "PAYSTACK_API_ERROR",
        {
          error: error.message,
          reference,
        },
      );
    }

    // Handle timeout errors
    if (error.message?.includes("timed out")) {
      return errorResponse(
        "Payment verification timed out",
        408,
        "VERIFICATION_TIMEOUT",
        { reference },
      );
    }

    return errorResponse(
      "Payment verification failed",
      500,
      "VERIFICATION_ERROR",
      {
        error: error.message,
        reference,
      },
    );
  }
};

// Health check for GET requests
const healthHandler = async (req: Request): Promise<Response> => {
  if (req.method === "GET") {
    const hasPaystackKey = !!Deno.env.get("PAYSTACK_SECRET_KEY");

    return successResponse({
      service: "verify-paystack-payment",
      timestamp: new Date().toISOString(),
      paystack: hasPaystackKey ? "configured" : "test-mode",
      status: "healthy",
    });
  }

  return handler(req);
};

serve(wrapFunction(healthHandler, requiredEnvVars, ["GET", "POST", "OPTIONS"]));
