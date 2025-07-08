import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      bookId,
      buyerId,
      buyerEmail,
      sellerId,
      amount,
      deliveryOption,
      shippingAddress,
      deliveryData,
      paystackReference,
      paystackSubaccount,
    } = await req.json();

    // Validate required fields
    if (!bookId || !buyerEmail || !sellerId || !amount || !paystackReference) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get book details
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (book.sold) {
      return new Response(
        JSON.stringify({ error: "Book is no longer available" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Calculate commit deadline (48 hours from now)
    const commitDeadline = new Date();
    commitDeadline.setHours(commitDeadline.getHours() + 48);

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        book_id: bookId,
        buyer_id: buyerId,
        buyer_email: buyerEmail,
        seller_id: sellerId,
        amount: amount,
        status: "paid",
        payment_status: "paid",
        delivery_option: deliveryOption,
        shipping_address: shippingAddress,
        delivery_data: deliveryData,
        paystack_ref: paystackReference,
        paystack_reference: paystackReference,
        paystack_subaccount: paystackSubaccount,
        commit_deadline: commitDeadline.toISOString(),
        paid_at: new Date().toISOString(),
        items: [
          {
            book_id: bookId,
            title: book.title,
            author: book.author,
            price: book.price,
            image_url: book.image_url,
          },
        ],
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Mark book as sold
    await supabase.from("books").update({ sold: true }).eq("id", bookId);

    // Create notifications
    const notifications = [
      {
        user_id: buyerId,
        type: "order_created",
        title: "Order Confirmation",
        message: `Your order for "${book.title}" has been confirmed. The seller has 48 hours to commit to the sale.`,
      },
      {
        user_id: sellerId,
        type: "new_order",
        title: "New Order Received",
        message: `You have received a new order for "${book.title}". Please confirm within 48 hours.`,
      },
    ];

    await supabase.from("notifications").insert(notifications);

    // Log the order creation
    await supabase.from("audit_logs").insert({
      action: "order_created",
      table_name: "orders",
      record_id: order.id,
      user_id: buyerId,
      new_values: {
        book_title: book.title,
        amount: amount,
        delivery_option: deliveryOption,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        message: "Order created successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in create-order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
