import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  validateRequired,
  sanitizeInput,
  createAuditLog,
} from "../_shared/utilities.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

const FUNCTION_NAME = "paystack-webhook";

serve(
  createRobustFunction(FUNCTION_NAME, async (req, supabase) => {
    // Handle health check for GET requests
    if (req.method === "GET") {
      return createHealthResponse(FUNCTION_NAME);
    }

    try {
      // Read raw body for webhook signature verification
      const rawBody = await req.text();
      console.log(
        `[${FUNCTION_NAME}] Received webhook, body length: ${rawBody.length}`,
      );

      let body: any = {};

      // Parse JSON safely
      if (rawBody) {
        try {
          body = JSON.parse(rawBody);
        } catch (parseError) {
          console.warn(
            `[${FUNCTION_NAME}] Failed to parse JSON, treating as raw webhook:`,
            parseError.message,
          );
          body = { rawData: rawBody };
        }
      }

      // Handle health check in body
      if (body.action === "health") {
        return createHealthResponse(FUNCTION_NAME);
      }

      // Get webhook signature for verification
      const signature = req.headers.get("x-paystack-signature");
      const userAgent = req.headers.get("user-agent");

      // Verify webhook authenticity (optional - implement if you have webhook secret)
      const webhookSecret = Deno.env.get("PAYSTACK_WEBHOOK_SECRET");
      let signatureValid = true; // Default to true if no secret configured

      if (webhookSecret && signature) {
        try {
          // Verify webhook signature
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(webhookSecret),
            { name: "HMAC", hash: "SHA-512" },
            false,
            ["sign"],
          );

          const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(rawBody),
          );
          const computedSignature = Array.from(new Uint8Array(signatureBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          signatureValid = signature === computedSignature;

          if (!signatureValid) {
            console.warn(`[${FUNCTION_NAME}] Invalid webhook signature`);
          }
        } catch (verificationError) {
          console.warn(
            `[${FUNCTION_NAME}] Signature verification failed:`,
            verificationError.message,
          );
          signatureValid = false;
        }
      }

      // Extract webhook data
      const event = body.event || "unknown";
      const data = body.data || {};
      const reference = data.reference || data.tx_ref || "unknown";

      console.log(
        `[${FUNCTION_NAME}] Processing webhook event: ${event}, reference: ${reference}`,
      );

      // Process different webhook events
      let processedData: any = {
        event,
        reference,
        signature_valid: signatureValid,
        processed: true,
      };

      switch (event) {
        case "charge.success":
          processedData = await processPaymentSuccess(supabase, data);
          break;

        case "transfer.success":
          processedData = await processTransferSuccess(supabase, data);
          break;

        case "transfer.failed":
          processedData = await processTransferFailed(supabase, data);
          break;

        case "charge.dispute.create":
          processedData = await processDispute(supabase, data);
          break;

        default:
          console.log(`[${FUNCTION_NAME}] Unhandled event type: ${event}`);
          processedData = {
            event,
            reference,
            message: "Event received but not processed",
            unhandled: true,
          };
      }

      // Log webhook processing
      await createAuditLog(
        supabase,
        "webhook_processed",
        "webhooks",
        reference,
        undefined,
        undefined,
        {
          event,
          reference,
          signature_valid: signatureValid,
          user_agent: userAgent,
          body_length: rawBody.length,
          processed_data: processedData,
        },
        FUNCTION_NAME,
      );

      return createSuccessResponse({
        message: "Webhook processed successfully",
        event,
        reference,
        signature_valid: signatureValid,
        data: processedData,
        processed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Webhook processing error:`, error);

      // Even on error, return 200 to prevent webhook retries
      return createSuccessResponse({
        message: "Webhook received but processing failed",
        error: error.message,
        processed_at: new Date().toISOString(),
        success: false,
      });
    }
  }),
);

async function processPaymentSuccess(supabase: any, data: any): Promise<any> {
  try {
    const reference = data.reference;
    const amount = data.amount / 100; // Convert from kobo
    const customerEmail = data.customer?.email;

    console.log(
      `[${FUNCTION_NAME}] Processing successful payment: ${reference}, amount: ${amount}`,
    );

    // Update order status in database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        paystack_data: data,
        updated_at: new Date().toISOString(),
      })
      .eq("paystack_reference", reference);

    if (updateError) {
      console.error(`[${FUNCTION_NAME}] Failed to update order:`, updateError);
    }

    return {
      action: "payment_success",
      reference,
      amount,
      customer_email: customerEmail,
      order_updated: !updateError,
    };
  } catch (error) {
    console.error(
      `[${FUNCTION_NAME}] Error processing payment success:`,
      error,
    );
    return {
      action: "payment_success",
      error: error.message,
    };
  }
}

async function processTransferSuccess(supabase: any, data: any): Promise<any> {
  try {
    const reference = data.reference;
    const amount = data.amount / 100;
    const recipientCode = data.recipient?.recipient_code;

    console.log(
      `[${FUNCTION_NAME}] Processing successful transfer: ${reference}`,
    );

    return {
      action: "transfer_success",
      reference,
      amount,
      recipient_code: recipientCode,
    };
  } catch (error) {
    console.error(
      `[${FUNCTION_NAME}] Error processing transfer success:`,
      error,
    );
    return {
      action: "transfer_success",
      error: error.message,
    };
  }
}

async function processTransferFailed(supabase: any, data: any): Promise<any> {
  try {
    const reference = data.reference;
    const failureReason = data.reason;

    console.log(`[${FUNCTION_NAME}] Processing failed transfer: ${reference}`);

    return {
      action: "transfer_failed",
      reference,
      failure_reason: failureReason,
    };
  } catch (error) {
    console.error(
      `[${FUNCTION_NAME}] Error processing transfer failure:`,
      error,
    );
    return {
      action: "transfer_failed",
      error: error.message,
    };
  }
}

async function processDispute(supabase: any, data: any): Promise<any> {
  try {
    const reference = data.transaction?.reference;
    const reason = data.reason;

    console.log(`[${FUNCTION_NAME}] Processing dispute: ${reference}`);

    return {
      action: "dispute_created",
      reference,
      reason,
    };
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error processing dispute:`, error);
    return {
      action: "dispute_created",
      error: error.message,
    };
  }
}
