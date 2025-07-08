import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  createGenericErrorHandler,
} from "../_shared/cors.ts";
import {
  validateAndCreateSupabaseClient,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";

interface CheckoutData {
  sellerId: string;
  sellerName: string;
  subaccountCode: string;
  items: Array<{
    id: string;
    bookId: string;
    title: string;
    author: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  courierFee: number;
  total: number;
  courierQuote: {
    courier: string;
    serviceName: string;
    price: number;
    estimatedDays: number;
  };
  buyerAddress: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  sellerAddress: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // Validate environment variables
    const missingEnvVars = validateRequiredEnvVars([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    if (missingEnvVars.length > 0) {
      return createEnvironmentError(missingEnvVars);
    }

    const supabaseClient = validateAndCreateSupabaseClient();

    // Get the authorization header
    const authHeader = req.headers.get("authorization")!;
    const token = authHeader.replace("Bearer ", "");

    // Verify the user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { checkout, books } = await req.json();
    const checkoutData = checkout as CheckoutData;

    console.log("Processing multi-seller purchase:", {
      userId: user.id,
      sellerId: checkoutData.sellerId,
      total: checkoutData.total,
      itemCount: checkoutData.items.length,
    });

    // Validate that all books exist and are available
    const bookIds = checkoutData.items.map((item) => item.bookId);
    const { data: bookRecords, error: bookError } = await supabaseClient
      .from("books")
      .select("id, title, price, sold, seller_id")
      .in("id", bookIds);

    if (bookError) {
      console.error("Error fetching books:", bookError);
      return new Response(
        JSON.stringify({ error: "Failed to validate books" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate books
    for (const book of bookRecords || []) {
      if (book.sold) {
        return new Response(
          JSON.stringify({
            error: `Book "${book.title}" has already been sold`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (book.seller_id !== checkoutData.sellerId) {
        return new Response(
          JSON.stringify({ error: "All books must be from the same seller" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Verify seller has valid subaccount
    if (!checkoutData.subaccountCode) {
      return new Response(
        JSON.stringify({ error: "Seller has not completed banking setup" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create order record
    const orderData = {
      buyer_id: user.id,
      buyer_email: user.email,
      seller_id: checkoutData.sellerId,
      amount: Math.round(checkoutData.total * 100), // Convert to kobo/cents
      status: "pending",
      paystack_ref: `MS_${Date.now()}_${user.id.slice(-6)}`,
      items: checkoutData.items,
      shipping_address: checkoutData.buyerAddress,
      metadata: {
        seller_name: checkoutData.sellerName,
        subaccount_code: checkoutData.subaccountCode,
        courier_info: checkoutData.courierQuote,
        courier_fee: checkoutData.courierFee,
        subtotal: checkoutData.subtotal,
        platform_commission: checkoutData.subtotal * 0.1,
        seller_receives: checkoutData.subtotal * 0.9,
        seller_address: checkoutData.sellerAddress,
      },
      payment_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Order created successfully:", order.id);

    // Initialize Paystack payment with split payment
    const paystackData = {
      email: user.email,
      amount: Math.round(checkoutData.total * 100), // Amount in kobo
      reference: order.paystack_ref,
      callback_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/payment-callback`,
      metadata: {
        order_id: order.id,
        buyer_id: user.id,
        seller_id: checkoutData.sellerId,
        split_type: "multi_seller",
      },
      split: {
        type: "percentage",
        bearer_type: "account",
        subaccounts: [
          {
            subaccount: checkoutData.subaccountCode,
            share: 90, // 90% to seller
          },
        ],
      },
    };

    // Call Paystack API to initialize transaction
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackData),
      },
    );

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackResult.status) {
      console.error("Paystack initialization failed:", paystackResult);
      return new Response(
        JSON.stringify({ error: "Payment initialization failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update order with Paystack data
    await supabaseClient
      .from("orders")
      .update({
        payment_data: paystackResult.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Mark books as temporarily unavailable
    await supabaseClient
      .from("books")
      .update({
        availability: "unavailable",
        updated_at: new Date().toISOString(),
      })
      .in("id", bookIds);

    console.log(
      "Payment initialized successfully:",
      paystackResult.data.reference,
    );

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        payment_url: paystackResult.data.authorization_url,
        reference: paystackResult.data.reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
