import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders,
  errorResponse,
  successResponse,
  validateEnvironment,
  wrapFunction,
} from "../_shared/response-utils.ts";

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: any;
    customer: any;
    plan: any;
    order_id: number | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

async function verifyPaystackSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const keyData = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === computedSignature;
}

async function processPaystackWebhook(
  event: PaystackWebhookEvent,
  supabase: any,
) {
  console.log(
    `Processing webhook event: ${event.event} for reference: ${event.data.reference}`,
  );

  switch (event.event) {
    case "charge.success":
      await handleChargeSuccess(event.data, supabase);
      break;
    case "charge.failed":
      await handleChargeFailed(event.data, supabase);
      break;
    case "transfer.success":
      await handleTransferSuccess(event.data, supabase);
      break;
    case "transfer.failed":
      await handleTransferFailed(event.data, supabase);
      break;
    default:
      console.log(`Unhandled webhook event: ${event.event}`);
  }
}

async function handleChargeSuccess(data: any, supabase: any) {
  // Update order status to paid
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      paystack_reference: data.reference,
      payment_status: "completed",
    })
    .eq("paystack_reference", data.reference);

  if (orderError) {
    console.error("Error updating order:", orderError);
    throw new Error("Failed to update order status");
  }

  console.log(`Order updated successfully for reference: ${data.reference}`);
}

async function handleChargeFailed(data: any, supabase: any) {
  // Update order status to failed
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "failed",
      payment_status: "failed",
      paystack_reference: data.reference,
    })
    .eq("paystack_reference", data.reference);

  if (orderError) {
    console.error("Error updating failed order:", orderError);
    throw new Error("Failed to update order status");
  }

  console.log(`Order marked as failed for reference: ${data.reference}`);
}

async function handleTransferSuccess(data: any, supabase: any) {
  // Handle successful transfers to sellers
  console.log(`Transfer successful: ${data.reference}`);
}

async function handleTransferFailed(data: any, supabase: any) {
  // Handle failed transfers to sellers
  console.log(`Transfer failed: ${data.reference}`);
}

const handler = wrapFunction(async (req: Request) => {
  // Validate environment
  const requiredVars = [
    "PAYSTACK_SECRET_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const validation = validateEnvironment(requiredVars);
  if (!validation.valid) {
    return errorResponse(validation.message!, 500, "ENVIRONMENT_ERROR");
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405, "METHOD_NOT_ALLOWED");
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return errorResponse(
      "Missing Paystack signature",
      401,
      "MISSING_SIGNATURE",
    );
  }

  // Verify webhook signature
  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY")!;
  const isValidSignature = await verifyPaystackSignature(
    body,
    signature,
    paystackSecret,
  );

  if (!isValidSignature) {
    return errorResponse("Invalid webhook signature", 401, "INVALID_SIGNATURE");
  }

  let webhookEvent: PaystackWebhookEvent;
  try {
    webhookEvent = JSON.parse(body);
  } catch {
    return errorResponse("Invalid JSON payload", 400, "INVALID_JSON");
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Process the webhook
  await processPaystackWebhook(webhookEvent, supabase);

  return successResponse({
    processed: true,
    event: webhookEvent.event,
    reference: webhookEvent.data.reference,
    processed_at: new Date().toISOString(),
  });
});

serve(handler);
