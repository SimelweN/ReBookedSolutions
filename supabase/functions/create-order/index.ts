import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      buyer_id,
      seller_id,
      book_id,
      paystack_reference,
      total_amount,
      book_price,
      delivery_fee,
      delivery_service,
      delivery_quote_info,
      shipping_address,
      seller_subaccount_code,
      metadata = {},
    } = await req.json();

    // Validate required fields
    if (
      !buyer_id ||
      !seller_id ||
      !book_id ||
      !paystack_reference ||
      !total_amount ||
      !book_price
    ) {
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

    // Calculate platform fee (10% of book price)
    const platform_fee = Math.round(book_price * 0.1);
    const seller_amount = book_price - platform_fee;

    // Set collection deadline (48 hours from now)
    const collection_deadline = new Date();
    collection_deadline.setHours(collection_deadline.getHours() + 48);

    // Set estimated delivery deadline (7 days from collection)
    const delivery_deadline = new Date();
    delivery_deadline.setDate(delivery_deadline.getDate() + 7);

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          buyer_id,
          seller_id,
          book_id,
          paystack_reference,
          total_amount,
          book_price,
          delivery_fee: delivery_fee || 0,
          platform_fee,
          seller_amount,
          status: "paid", // Payment already confirmed by Paystack
          collection_deadline: collection_deadline.toISOString(),
          delivery_deadline: delivery_deadline.toISOString(),
          shipping_address,
          delivery_service,
          delivery_quote_info,
          seller_subaccount_code,
          metadata: {
            ...metadata,
            created_via: "checkout",
            payment_confirmed_at: new Date().toISOString(),
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

    // Also create a transaction record for backward compatibility
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          buyer_id,
          seller_id,
          book_id,
          transaction_reference: paystack_reference,
          paystack_reference,
          amount: total_amount,
          status: "paid_pending_seller",
          payment_method: "paystack",
          shipping_info: shipping_address,
          metadata: {
            order_id: order.id,
            delivery_service,
            delivery_fee,
            platform_fee,
            ...metadata,
          },
          paid_at: new Date().toISOString(),
        },
      ]);

    if (transactionError) {
      console.warn("Failed to create transaction record:", transactionError);
      // Don't fail the order creation for this
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
          collection_deadline: order.collection_deadline,
          delivery_deadline: order.delivery_deadline,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in create-order function:", error);
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
