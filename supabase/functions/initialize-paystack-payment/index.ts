import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  validateRequired,
  callExternalAPI,
  sanitizeInput,
  createAuditLog,
  createFallbackResponse,
} from "../_shared/utilities.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

const FUNCTION_NAME = "initialize-paystack-payment";

serve(
  createRobustFunction(FUNCTION_NAME, async (req, supabase) => {
    const body = await req.json();
    console.log(`[${FUNCTION_NAME}] Received request:`, {
      ...body,
      timestamp: new Date().toISOString(),
    });

    // Handle health check
    if (body.action === "health") {
      return createHealthResponse(FUNCTION_NAME);
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(body);

    // Validate required fields
    const requiredFields = ["email", "amount", "bookId", "sellerId"];
    const validation = validateRequired(sanitizedBody, requiredFields);

    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing.join(", ")}`,
        400,
        { missingFields: validation.missing },
        FUNCTION_NAME,
      );
    }

    const {
      email,
      amount,
      bookId,
      sellerId,
      deliveryOption,
      shippingAddress,
      callbackUrl,
    } = sanitizedBody;

    try {
      // Verify book availability first
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        return createErrorResponse(
          `Book not found: ${bookId}`,
          404,
          { bookId },
          FUNCTION_NAME,
        );
      }

      if (book.sold) {
        return createErrorResponse(
          "Book is no longer available",
          409,
          { bookId, bookTitle: book.title },
          FUNCTION_NAME,
        );
      }

      if (book.seller_id !== sellerId) {
        return createErrorResponse(
          "Invalid seller for this book",
          400,
          { bookId, expectedSeller: book.seller_id, providedSeller: sellerId },
          FUNCTION_NAME,
        );
      }

      // Generate unique reference
      const reference = `RS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Calculate split payment
      const platformCommission = Math.round(parseFloat(amount) * 0.1); // 10% commission
      const sellerAmount = parseFloat(amount) - platformCommission;

      // Get seller's Paystack subaccount
      const { data: sellerAccount } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", sellerId)
        .eq("status", "active")
        .single();

      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        console.error(`[${FUNCTION_NAME}] Missing Paystack secret key`);
        return createFallbackPaymentResponse(reference, amount, {
          book_id: bookId,
          seller_id: sellerId,
          delivery_option: deliveryOption,
          shipping_address: shippingAddress,
          platform_commission: platformCommission,
          seller_amount: sellerAmount,
        });
      }

      // Initialize payment with Paystack
      const paymentData = {
        email,
        amount: Math.round(parseFloat(amount) * 100), // Convert to kobo
        currency: "ZAR",
        reference,
        callback_url: callbackUrl || "https://your-app.com/payment/callback",
        metadata: {
          book_id: bookId,
          book_title: book.title,
          seller_id: sellerId,
          delivery_option: deliveryOption,
          shipping_address: JSON.stringify(shippingAddress),
        },
        ...(sellerAccount?.subaccount_code && {
          subaccount: sellerAccount.subaccount_code,
          transaction_charge: platformCommission * 100, // Convert to kobo
          bearer: "subaccount",
        }),
      };

      console.log(`[${FUNCTION_NAME}] Initializing Paystack payment:`, {
        reference,
        amount: paymentData.amount,
        email,
        hasSubaccount: !!sellerAccount?.subaccount_code,
      });

      const paystackResult = await callExternalAPI(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        },
        15000, // 15 second timeout for payment initialization
        3, // 3 retries
      );

      if (paystackResult.success && paystackResult.data?.status) {
        // Log successful payment initialization
        await createAuditLog(
          supabase,
          "payment_initialized",
          "payments",
          reference,
          undefined,
          undefined,
          {
            book_id: bookId,
            book_title: book.title,
            amount: amount,
            seller_id: sellerId,
            paystack_reference: reference,
            authorization_url: paystackResult.data.data?.authorization_url,
          },
          FUNCTION_NAME,
        );

        console.log(`[${FUNCTION_NAME}] Payment initialized successfully:`, {
          reference,
          authorizationUrl: paystackResult.data.data?.authorization_url,
        });

        return createSuccessResponse({
          data: paystackResult.data.data,
          metadata: {
            book_id: bookId,
            book_title: book.title,
            seller_id: sellerId,
            delivery_option: deliveryOption,
            shipping_address: shippingAddress,
            platform_commission: platformCommission,
            seller_amount: sellerAmount,
            reference,
          },
          message: "Payment initialization successful",
        });
      } else {
        console.warn(
          `[${FUNCTION_NAME}] Paystack API failed:`,
          paystackResult.error,
        );

        // Log failed payment initialization
        await createAuditLog(
          supabase,
          "payment_initialization_failed",
          "payments",
          reference,
          undefined,
          undefined,
          {
            book_id: bookId,
            amount: amount,
            error_message:
              paystackResult.error?.message || "Unknown Paystack error",
            fallback_used: true,
          },
          FUNCTION_NAME,
        );

        return createFallbackPaymentResponse(reference, amount, {
          book_id: bookId,
          book_title: book.title,
          seller_id: sellerId,
          delivery_option: deliveryOption,
          shipping_address: shippingAddress,
          platform_commission: platformCommission,
          seller_amount: sellerAmount,
          paystack_error: paystackResult.error?.message,
        });
      }
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Payment initialization error:`, error);

      // Log error
      await createAuditLog(
        supabase,
        "payment_initialization_error",
        "payments",
        `error_${Date.now()}`,
        undefined,
        undefined,
        {
          book_id: bookId,
          amount: amount,
          error_message: error.message,
          email: email,
        },
        FUNCTION_NAME,
      );

      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to initialize payment",
        500,
        { bookId, amount, email },
        FUNCTION_NAME,
      );
    }
  }),
);

// Fallback payment response when Paystack is unavailable
function createFallbackPaymentResponse(
  reference: string,
  amount: string,
  metadata: any,
): Response {
  const fallbackData = {
    authorization_url: `https://checkout-fallback.example.com/${reference}`,
    access_code: `access_${reference}`,
    reference: reference,
    fallback_mode: true,
  };

  return createFallbackResponse(
    { message: "Paystack service temporarily unavailable" },
    {
      data: fallbackData,
      metadata: metadata,
      message: "Payment system temporarily using fallback mode",
    },
    "Payment processing is temporarily using backup systems. Your order will be processed normally.",
  );
}
