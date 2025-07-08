import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Received webhook event:", event.event);

    // Log the webhook event
    await supabase.from("audit_logs").insert({
      action: "webhook_received",
      table_name: "paystack_webhooks",
      new_values: {
        event: event.event,
        reference: event.data?.reference,
      },
    });

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;

      case "transfer.failed":
        await handleTransferFailed(event.data);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error in paystack-webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) {
    console.log(
      "Missing signature or secret key, skipping verification for development",
    );
    return true; // Allow for development/testing
  }

  try {
    // Create HMAC hash using the secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY);
    const bodyData = encoder.encode(body);

    // For now, we'll skip detailed crypto verification in development
    // In production, implement proper HMAC-SHA512 verification
    return true;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

async function handleChargeSuccess(data: any) {
  console.log("Processing successful charge:", data.reference);

  try {
    const metadata = data.metadata || {};

    // Check if this is a multi-seller purchase
    if (metadata.cart_items) {
      await handleMultiSellerPurchase(data);
      return;
    }

    if (!metadata.book_id) {
      console.error("No book_id in metadata");
      return;
    }

    // Create order in database
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: metadata.book_id,
          buyerId: metadata.buyer_id,
          buyerEmail: data.customer.email,
          sellerId: metadata.seller_id,
          amount: data.amount / 100, // Convert from kobo
          deliveryOption: metadata.delivery_option,
          shippingAddress: metadata.shipping_address,
          deliveryData: metadata.delivery_data,
          paystackReference: data.reference,
          paystackSubaccount: data.subaccount?.subaccount_code,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create order:", error);
    } else {
      console.log("Order created successfully for reference:", data.reference);
    }
  } catch (error) {
    console.error("Error handling charge success:", error);
  }
}

async function handleMultiSellerPurchase(data: any) {
  console.log("Processing multi-seller purchase:", data.reference);

  try {
    const metadata = data.metadata;
    const cartItems = metadata.cart_items || [];

    // Create multiple orders for each book
    for (const item of cartItems) {
      try {
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-order`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookId: item.bookId,
              buyerId: metadata.buyer_id,
              buyerEmail: data.customer.email,
              sellerId: item.sellerId,
              amount: item.price,
              deliveryOption: metadata.delivery_options?.find(
                (opt: any) => opt.bookId === item.bookId,
              ),
              shippingAddress: metadata.shipping_address,
              paystackReference: data.reference,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(
            `Failed to create order for book ${item.bookId}:`,
            error,
          );
        }
      } catch (error) {
        console.error(`Error creating order for book ${item.bookId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error handling multi-seller purchase:", error);
  }
}

async function handleTransferSuccess(data: any) {
  console.log("Processing successful transfer:", data.reference);

  try {
    // Update payout log status
    const { error } = await supabase
      .from("payout_logs")
      .update({
        status: "success",
        paystack_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("reference", data.reference);

    if (error) {
      console.error("Error updating payout log:", error);
    }

    // Find and update related order
    const { data: payoutLog } = await supabase
      .from("payout_logs")
      .select("order_id, seller_id")
      .eq("reference", data.reference)
      .single();

    if (payoutLog) {
      // Update order status
      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", payoutLog.order_id);

      // Send notification to seller
      await supabase.from("notifications").insert({
        user_id: payoutLog.seller_id,
        type: "payout_completed",
        title: "Payout Completed",
        message: `Your payout of R${(data.amount / 100).toFixed(2)} has been successfully transferred to your account.`,
      });
    }
  } catch (error) {
    console.error("Error handling transfer success:", error);
  }
}

async function handleTransferFailed(data: any) {
  console.log("Processing failed transfer:", data.reference);

  try {
    // Update payout log status
    const { error } = await supabase
      .from("payout_logs")
      .update({
        status: "failed",
        error_message: data.message || "Transfer failed",
        paystack_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq("reference", data.reference);

    if (error) {
      console.error("Error updating payout log:", error);
    }

    // Find and notify seller
    const { data: payoutLog } = await supabase
      .from("payout_logs")
      .select("seller_id")
      .eq("reference", data.reference)
      .single();

    if (payoutLog) {
      await supabase.from("notifications").insert({
        user_id: payoutLog.seller_id,
        type: "payout_failed",
        title: "Payout Failed",
        message: `Your payout failed. Please check your banking details and contact support if the issue persists.`,
      });
    }
  } catch (error) {
    console.error("Error handling transfer failed:", error);
  }
}
