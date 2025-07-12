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
          function: "commit-to-sale",
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

    console.log("Received body:", requestBody);

    // Health check via JSON
    if (requestBody.action === "health") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "healthy",
          function: "commit-to-sale",
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
      return new Response(
        JSON.stringify({
          success: true,
          message: "Commit to sale processed successfully (test mode)",
          order: {
            id: requestBody.order_id || "test-order",
            seller_id: requestBody.seller_id || "test-seller",
            status: "committed",
            committed_at: new Date().toISOString(),
          },
          test: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { order_id, seller_id } = requestBody;

    // Validate required fields
    if (!order_id || !seller_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order ID and Seller ID are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .eq("seller_id", seller_id)
        .single();

      if (orderError || !order) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Order not found or unauthorized access",
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (order.status === "committed") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Order is already committed",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (order.status === "declined" || order.status === "expired") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Order cannot be committed - already declined or expired",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Check if still within commit deadline
      const commitDeadline = new Date(order.commit_deadline);
      const now = new Date();

      if (now > commitDeadline) {
        // Update order status to expired
        await supabase
          .from("orders")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order_id);

        return new Response(
          JSON.stringify({
            success: false,
            error: "Commit deadline has passed - order expired",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Update order status to committed
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          status: "committed",
          committed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to commit to sale",
            details: updateError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Create notifications
      const notifications = [
        {
          user_id: order.buyer_id,
          type: "order_committed",
          title: "Sale Confirmed",
          message: `The seller has confirmed your order. Your book will be prepared for delivery.`,
        },
        {
          user_id: seller_id,
          type: "commit_confirmed",
          title: "Commitment Confirmed",
          message: `You have successfully committed to the sale. Prepare the book for delivery.`,
        },
      ];

      await supabase.from("notifications").insert(notifications);

      // Log the commitment
      await supabase.from("audit_logs").insert({
        action: "order_committed",
        table_name: "orders",
        record_id: order_id,
        user_id: seller_id,
        new_values: {
          committed_at: new Date().toISOString(),
          status: "committed",
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          order: updatedOrder,
          message: "Successfully committed to sale",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
