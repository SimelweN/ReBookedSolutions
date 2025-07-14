import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
  withRetry,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["GET", "POST", "OPTIONS"];

interface PayoutRequest {
  orderId: string;
  sellerId: string;
  amount?: number;
  reference?: string;
  reason?: string;
}

interface PaystackTransferRequest {
  source: string;
  amount: number;
  recipient: string;
  reason: string;
  currency: string;
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Health check for GET requests
  if (req.method === "GET") {
    const hasPaystackKey = !!Deno.env.get("PAYSTACK_SECRET_KEY");

    return successResponse({
      service: "pay-seller",
      timestamp: new Date().toISOString(),
      status: "healthy",
      paystack: hasPaystackKey ? "configured" : "test-mode",
      features: [
        "seller-payouts",
        "transaction-recording",
        "automatic-transfers",
      ],
    });
  }

  // Parse request body
  const { data: requestBody, error: parseError } = await safeJsonParse(req);
  if (parseError) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON", {
      error: parseError,
    });
  }

  const { orderId, sellerId, amount, reference, reason }: PayoutRequest =
    requestBody;

  // Validate required fields
  if (!orderId || !sellerId) {
    return errorResponse(
      "Missing required fields: orderId and sellerId are required",
      400,
      "REQUIRED_FIELDS_MISSING",
      { required: ["orderId", "sellerId"] },
    );
  }

  try {
    // First, get the order details and verify it's ready for payout
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        status,
        seller_id,
        buyer_id,
        payment_reference,
        books(title, price)
      `,
      )
      .eq("id", orderId)
      .eq("seller_id", sellerId)
      .single();

    if (orderError || !orderData) {
      return errorResponse(
        "Order not found or access denied",
        404,
        "ORDER_NOT_FOUND",
        { orderId, sellerId },
      );
    }

    // Check if order is in the right status for payout
    if (orderData.status !== "collected" && orderData.status !== "completed") {
      return errorResponse(
        `Order is not ready for payout. Current status: ${orderData.status}`,
        400,
        "INVALID_ORDER_STATUS",
        {
          currentStatus: orderData.status,
          requiredStatus: ["collected", "completed"],
        },
      );
    }

    // Check if payout already exists
    const { data: existingPayout, error: payoutCheckError } = await supabase
      .from("payout_transactions")
      .select("*")
      .eq("order_id", orderId)
      .eq("seller_id", sellerId)
      .single();

    if (existingPayout && existingPayout.status === "completed") {
      return successResponse(
        {
          payout: existingPayout,
          alreadyProcessed: true,
        },
        "Payout was already processed for this order",
      );
    }

    // Get seller's banking details
    const { data: sellerData, error: sellerError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        subaccount_code,
        banking_details(*)
      `,
      )
      .eq("id", sellerId)
      .single();

    if (sellerError || !sellerData) {
      return errorResponse("Seller not found", 404, "SELLER_NOT_FOUND", {
        sellerId,
      });
    }

    if (!sellerData.banking_details || !sellerData.subaccount_code) {
      return errorResponse(
        "Seller banking details not configured",
        400,
        "BANKING_DETAILS_MISSING",
        {
          message:
            "Seller must complete banking setup before receiving payouts",
        },
      );
    }

    // Calculate payout amount (subtract platform fee)
    const platformFeePercentage = 5; // 5% platform fee
    const grossAmount = amount || orderData.total_amount;
    const platformFee =
      Math.round(grossAmount * (platformFeePercentage / 100) * 100) / 100;
    const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

    // Generate payout reference
    const payoutReference = reference || `PAYOUT_${orderId}_${Date.now()}`;

    // Get Paystack configuration
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!PAYSTACK_SECRET_KEY) {
      // Test mode - simulate successful payout
      console.warn("PAYSTACK_SECRET_KEY not set - using test mode");

      const mockPayout = {
        order_id: orderId,
        seller_id: sellerId,
        amount: netAmount,
        gross_amount: grossAmount,
        platform_fee: platformFee,
        reference: payoutReference,
        status: "completed",
        paystack_response: {
          status: true,
          message: "Transfer completed (test mode)",
          data: {
            reference: payoutReference,
            amount: netAmount * 100, // kobo
            status: "success",
            transfer_code: `TRF_test_${Date.now()}`,
            recipient_code: sellerData.subaccount_code,
          },
        },
        processed_at: new Date().toISOString(),
      };

      // Save the mock payout record
      const { data: savedPayout, error: saveError } = await supabase
        .from("payout_transactions")
        .upsert(mockPayout, { onConflict: "reference" })
        .select()
        .single();

      return successResponse(
        {
          payout: savedPayout || mockPayout,
          testMode: true,
          breakdown: {
            grossAmount,
            platformFee,
            netAmount,
            platformFeePercentage,
          },
        },
        "Payout processed successfully (test mode)",
      );
    }

    // Real Paystack integration
    try {
      // Create transfer to seller's bank account
      const transferRequest: PaystackTransferRequest = {
        source: "balance",
        amount: Math.round(netAmount * 100), // Convert to kobo
        recipient: sellerData.subaccount_code,
        reason:
          reason ||
          `Payout for order ${orderId} - ${orderData.books?.title || "Book sale"}`,
        currency: "ZAR",
        reference: payoutReference,
      };

      const initiateTransfer = async () => {
        const response = await fetch("https://api.paystack.co/transfer", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transferRequest),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Paystack API error: ${response.status} - ${errorText}`,
          );
        }

        return await response.json();
      };

      // Execute transfer with timeout and retry
      const transferResult = await withTimeout(
        withRetry(initiateTransfer, 3, 2000),
        15000,
        "Paystack transfer timed out",
      );

      if (!transferResult.status) {
        return errorResponse(
          "Payout failed with Paystack",
          400,
          "PAYSTACK_TRANSFER_FAILED",
          {
            message: transferResult.message,
            reference: payoutReference,
          },
        );
      }

      // Save successful payout record
      const payoutRecord = {
        order_id: orderId,
        seller_id: sellerId,
        amount: netAmount,
        gross_amount: grossAmount,
        platform_fee: platformFee,
        reference: payoutReference,
        status: "completed",
        paystack_response: transferResult.data,
        processed_at: new Date().toISOString(),
      };

      const { data: savedPayout, error: saveError } = await supabase
        .from("payout_transactions")
        .upsert(payoutRecord, { onConflict: "reference" })
        .select()
        .single();

      if (saveError) {
        console.error("Failed to save payout record:", saveError);
        // Don't fail the response since the transfer was successful
      }

      // Update order status
      await supabase
        .from("orders")
        .update({ status: "payout_completed" })
        .eq("id", orderId);

      // Send notification to seller (non-blocking)
      supabase.functions
        .invoke("send-email-notification", {
          body: {
            to: sellerData.email,
            template: "payment_received",
            data: {
              sellerName: sellerData.full_name,
              bookTitle: orderData.books?.title || "Book",
              saleAmount: grossAmount,
              payoutAmount: netAmount,
              transactionId: payoutReference,
            },
          },
        })
        .catch((error) =>
          console.warn("Failed to send payout notification:", error),
        );

      return successResponse(
        {
          payout: savedPayout || payoutRecord,
          breakdown: {
            grossAmount,
            platformFee,
            netAmount,
            platformFeePercentage,
          },
          paystack: transferResult.data,
        },
        "Payout processed successfully",
      );
    } catch (error) {
      console.error("Payout processing error:", error);

      // Save failed payout record
      const failedPayoutRecord = {
        order_id: orderId,
        seller_id: sellerId,
        amount: netAmount,
        gross_amount: grossAmount,
        platform_fee: platformFee,
        reference: payoutReference,
        status: "failed",
        error_message: error.message,
        attempted_at: new Date().toISOString(),
      };

      await supabase
        .from("payout_transactions")
        .upsert(failedPayoutRecord, { onConflict: "reference" })
        .catch((dbError) =>
          console.error("Failed to save failed payout record:", dbError),
        );

      // Handle different types of errors
      if (error.message?.includes("Paystack API error")) {
        return errorResponse(
          "Payout failed due to payment provider error",
          400,
          "PAYSTACK_ERROR",
          {
            error: error.message,
            reference: payoutReference,
          },
        );
      }

      if (error.message?.includes("timed out")) {
        return errorResponse(
          "Payout request timed out",
          408,
          "PAYOUT_TIMEOUT",
          { reference: payoutReference },
        );
      }

      return errorResponse("Payout processing failed", 500, "PAYOUT_FAILED", {
        error: error.message,
        reference: payoutReference,
      });
    }
  } catch (error) {
    console.error("Unexpected error in pay-seller:", error);
    return errorResponse(
      "An unexpected error occurred during payout processing",
      500,
      "UNEXPECTED_ERROR",
      { error: error.message },
    );
  }
};

serve(wrapFunction(handler, requiredEnvVars, allowedMethods));
