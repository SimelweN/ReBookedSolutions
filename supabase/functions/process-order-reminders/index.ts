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

    // Initialize Supabase client
    const supabaseClient = validateAndCreateSupabaseClient();

    console.log("Starting order reminders and auto-cancellation process...");

    // Send commit reminders for orders approaching deadline
    const { error: reminderError } = await supabaseClient.rpc(
      "send_commit_reminders",
    );

    if (reminderError) {
      console.error("Error sending reminders:", reminderError);
    } else {
      console.log("Commit reminders sent successfully");
    }

    // Auto-cancel expired orders that exceed 48-hour commitment deadline
    const { error: cancelError } = await supabaseClient.rpc(
      "auto_cancel_expired_orders",
    );

    if (cancelError) {
      console.error("Error auto-cancelling orders:", cancelError);
    } else {
      console.log("Expired orders auto-cancelled successfully");
    }

    // Optional: Generate receipts for newly paid orders
    const { data: paidOrders, error: fetchError } = await supabaseClient
      .from("orders")
      .select("id")
      .eq("payment_status", "paid")
      .eq("status", "paid")
      .is("paid_at", null)
      .limit(10);

    if (fetchError) {
      console.error("Error fetching paid orders:", fetchError);
    } else if (paidOrders && paidOrders.length > 0) {
      console.log(
        `Processing ${paidOrders.length} newly paid orders for receipt generation`,
      );

      for (const order of paidOrders) {
        try {
          const { error: receiptError } = await supabaseClient.rpc(
            "generate_receipt_for_order",
            { order_id: order.id },
          );

          if (receiptError) {
            console.error(
              `Error generating receipt for order ${order.id}:`,
              receiptError,
            );
          }
        } catch (receiptErr) {
          console.error(
            `Exception generating receipt for order ${order.id}:`,
            receiptErr,
          );
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Order reminders, auto-cancellation, and receipt generation completed",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Order processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
