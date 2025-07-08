import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  createGenericErrorHandler,
} from "../_shared/cors.ts";
import {
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // Validate required environment variables
    const missingEnvVars = validateRequiredEnvVars(["PAYSTACK_SECRET_KEY"]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    const {
      email,
      amount,
      bookId,
      sellerId,
      sellerSubaccountCode,
      bookPrice,
      deliveryFee = 0,
      callback_url,
      metadata,
      splitAmounts,
    } = await req.json();

    if (!email || !amount || !bookId || !sellerSubaccountCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Ensure amount is in kobo (smallest currency unit)
    const amountInKobo = Math.round(amount);
    const bookPriceInKobo = Math.round(bookPrice * 100);
    const deliveryFeeInKobo = Math.round(deliveryFee * 100);

    // Calculate split percentages more precisely
    const totalAmount = bookPrice + deliveryFee;
    const platformFee = Math.round((bookPrice * 10) / 100); // 10% of book price only
    const sellerAmount = bookPrice - platformFee;
    const sellerPercentage = Math.round((sellerAmount / totalAmount) * 100);

    const reference = `book_${bookId}_${Date.now()}`;

    const payload = {
      email,
      amount: amountInKobo, // Already in kobo from frontend
      currency: "ZAR",
      reference,
      callback_url,
      metadata: {
        ...metadata,
        book_price: bookPrice,
        book_price_kobo: bookPriceInKobo,
        delivery_fee: deliveryFee,
        delivery_fee_kobo: deliveryFeeInKobo,
        total_amount_kobo: amountInKobo,
        seller_id: sellerId,
        book_id: bookId,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        seller_percentage: sellerPercentage,
      },
      // Split payment configuration
      // Seller receives their percentage of total (book price - platform fee + proportional delivery)
      // Platform receives 10% of book price
      // Delivery fee proportionally distributed
      split: {
        type: "percentage",
        bearer_type: "subaccount",
        subaccounts: [
          {
            subaccount: sellerSubaccountCode,
            share: sellerPercentage,
          },
        ],
      },
      subaccount: sellerSubaccountCode,
      transaction_charge: 0, // Platform takes percentage, not fixed charge
    };

    console.log("Initializing Paystack payment:", {
      reference,
      email,
      amount,
      sellerSubaccountCode,
    });

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack payment initialization failed:", data);
      return new Response(
        JSON.stringify({
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "Paystack payment initialized successfully:",
      data.data.reference,
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in initialize-paystack-payment function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
