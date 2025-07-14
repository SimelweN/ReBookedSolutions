import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Environment variable validation
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingRequiredVars = requiredEnvVars.filter(
  (varName) => !Deno.env.get(varName),
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Health check handler
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "process-book-purchase",
          timestamp: new Date().toISOString(),
          environment: {
            hasRequiredVars: missingRequiredVars.length === 0,
            missingVars: missingRequiredVars,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Environment validation
    if (missingRequiredVars.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error",
          details: `Missing environment variables: ${missingRequiredVars.join(", ")}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Health check via JSON
    if (requestBody.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "process-book-purchase",
          timestamp: new Date().toISOString(),
          environment: {
            hasRequiredVars: missingRequiredVars.length === 0,
            missingVars: missingRequiredVars,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Test mode handler
    if (requestBody.test === true) {
      const orderId = `test-order-${Date.now()}`;
      return new Response(
        JSON.stringify({
          success: true,
          message: "Book purchase processed successfully (test mode)",
          order: {
            id: orderId,
            book_id: requestBody.bookId || "test-book-id",
            buyer_id: requestBody.buyerId || "test-buyer-id",
            seller_id: requestBody.sellerId || "test-seller-id",
            amount: requestBody.amount || 100,
            status: "paid",
            payment_status: "paid",
            created_at: new Date().toISOString(),
          },
          test: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const {
      bookId,
      buyerId,
      buyerEmail,
      sellerId,
      amount,
      paystackReference,
      deliveryOption,
      shippingAddress,
    } = requestBody;

    // Validate required fields
    if (!bookId || !buyerEmail || !sellerId || !amount || !paystackReference) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: bookId, buyerEmail, sellerId, amount, paystackReference",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get book details
    try {
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Book not found",
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (book.sold) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Book is no longer available",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Calculate commit deadline (48 hours)
      const commitDeadline = new Date();
      commitDeadline.setHours(commitDeadline.getHours() + 48);

      // Create order
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
          paystack_reference: paystackReference,
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
        console.error("Order creation error:", orderError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to create order",
            details: orderError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Mark book as sold
      await supabase.from("books").update({ sold: true }).eq("id", bookId);

      // Create notifications
      const notifications = [
        {
          user_id: buyerId,
          type: "order_created",
          title: "Purchase Confirmed",
          message: `Your purchase of "${book.title}" has been confirmed. The seller has 48 hours to commit.`,
        },
        {
          user_id: sellerId,
          type: "new_order",
          title: "New Order",
          message: `You have a new order for "${book.title}". Please confirm within 48 hours.`,
        },
      ];

      await supabase.from("notifications").insert(notifications);

      // Log the purchase
      await supabase.from("audit_logs").insert({
        action: "book_purchase_processed",
        table_name: "orders",
        record_id: order.id,
        user_id: buyerId,
        new_values: {
          book_title: book.title,
          amount: amount,
          paystack_reference: paystackReference,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          order: order,
          message: "Book purchase processed successfully",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Database operation error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database operation failed",
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error in process-book-purchase:", error);
    return new Response(
      JSON.stringify({
        success: false,
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
