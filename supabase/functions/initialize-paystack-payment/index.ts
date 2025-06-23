import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment service configuration error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

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

    const reference = `book_${bookId}_${Date.now()}`;
    const sellerShare = 90; // 90% to seller, 10% to platform

    const payload = {
      email,
      amount,
      currency: "ZAR",
      reference,
      callback_url,
      metadata,
      // Split payment - 90% of book price to seller, platform keeps 10% + all delivery fees
      split: {
        type: "percentage",
        bearer_type: "subaccount",
        subaccounts: [
          {
            subaccount: sellerSubaccountCode,
            share: sellerShare,
          },
        ],
      },
      subaccount: sellerSubaccountCode,
      transaction_charge: 0,
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
