import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set");
      return new Response("Configuration error", { status: 500 });
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature");
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify Paystack signature
    const crypto = await import("node:crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid Paystack signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("Webhook event received:", event.event);

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

    return new Response("OK", {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function handleChargeSuccess(data: any) {
  try {
    const reference = data.reference;
    const amount = data.amount / 100; // Convert from kobo to rands
    const metadata = data.metadata;

    console.log("Processing successful charge:", reference);

    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "paid_pending_seller",
        updated_at: new Date().toISOString(),
      })
      .eq("paystack_reference", reference);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      return;
    }

    // Mark book as sold and pending commit
    if (metadata.bookId) {
      const { error: bookError } = await supabase
        .from("books")
        .update({
          sold: true,
          status: "pending_commit",
        })
        .eq("id", metadata.bookId);

      if (bookError) {
        console.error("Error updating book status:", bookError);
      }
    }

    console.log("Charge success processed for reference:", reference);
  } catch (error) {
    console.error("Error processing charge success:", error);
  }
}

async function handleTransferSuccess(data: any) {
  try {
    const reference = data.reference;
    console.log("Transfer successful:", reference);

    // Update any relevant records
    // Implementation depends on your transfer tracking needs
  } catch (error) {
    console.error("Error processing transfer success:", error);
  }
}

async function handleTransferFailed(data: any) {
  try {
    const reference = data.reference;
    console.log("Transfer failed:", reference);

    // Handle failed transfers - may need to retry or alert admin
  } catch (error) {
    console.error("Error processing transfer failure:", error);
  }
}
