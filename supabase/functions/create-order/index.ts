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

serve(async (req) => {
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

    const supabase = validateAndCreateSupabaseClient();
    // Parse and validate request body
    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (error) {
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    const {
      buyer_email,
      seller_id,
      items, // Array of { book_id, title, price, quantity }
      paystack_reference,
      total_amount,
      delivery_fee,
      delivery_service,
      delivery_quote_info,
      shipping_address,
      seller_subaccount_code,
      metadata = {},
    } = requestBody;

    // Validate required fields
    const requiredFields = {
      buyer_email,
      seller_id,
      paystack_reference,
      total_amount,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (
      missingFields.length > 0 ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      const allMissing = [...missingFields];
      if (!items || !Array.isArray(items) || items.length === 0) {
        allMissing.push("items (must be non-empty array)");
      }
      return createErrorResponse(
        `Missing required fields: ${allMissing.join(", ")}`,
        400,
        { missingFields: allMissing },
      );
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          buyer_email,
          seller_id,
          amount: total_amount,
          paystack_ref: paystack_reference,
          status: "paid", // Payment already confirmed by Paystack
          items: items,
          shipping_address: shipping_address || {},
          delivery_data: {
            service: delivery_service,
            fee: delivery_fee || 0,
            quote_info: delivery_quote_info,
          },
          metadata: {
            ...metadata,
            created_via: "checkout",
            payment_confirmed_at: new Date().toISOString(),
            seller_subaccount_code,
          },
          paid_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to create order",
          error: orderError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mark books as sold
    for (const item of items) {
      if (item.book_id) {
        await supabase
          .from("books")
          .update({
            sold: true,
            available: false,
            status: "sold",
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.book_id);
      }
    }

    // TODO: Send notification to seller about new order
    // TODO: Send confirmation email to buyer
    // TODO: Notify delivery service for collection

    console.log("Order created successfully:", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order_id: order.id,
          status: order.status,
          amount: order.amount,
          paystack_ref: order.paystack_ref,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return createGenericErrorHandler("create-order")(error);
  }
});
