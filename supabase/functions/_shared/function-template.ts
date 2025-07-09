/**
 * High-Success Edge Function Template
 *
 * This template implements all the patterns for achieving high success rates:
 * - Standardized error handling
 * - Graceful degradation
 * - Comprehensive audit logging
 * - Atomic database operations
 * - External service resilience
 * - Rate limiting
 * - Input validation and sanitization
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  validateRequired,
  executeTransaction,
  callExternalAPI,
  createFallbackResponse,
  sanitizeInput,
  createAuditLog,
  generateIdempotencyKey,
} from "./utilities.ts";
import { createSuccessResponse, createErrorResponse } from "./cors.ts";

const FUNCTION_NAME = "your-function-name";

serve(
  createRobustFunction(FUNCTION_NAME, async (req, supabase) => {
    const body = await req.json();
    console.log(`[${FUNCTION_NAME}] Received request:`, {
      ...body,
      timestamp: new Date().toISOString(),
    });

    // Handle health check
    if (body.action === "health") {
      return createHealthResponse(FUNCTION_NAME);
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(body);

    // Validate required fields
    const requiredFields = ["field1", "field2"]; // Specify your required fields
    const validation = validateRequired(sanitizedBody, requiredFields);

    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing.join(", ")}`,
        400,
        { missingFields: validation.missing },
        FUNCTION_NAME,
      );
    }

    const { field1, field2, optionalField } = sanitizedBody;

    try {
      // Generate idempotency key if needed
      const idempotencyKey = generateIdempotencyKey({ field1, field2 });

      // Check for existing operation (if idempotent)
      // const { data: existing } = await supabase
      //   .from('your_table')
      //   .select('*')
      //   .eq('idempotency_key', idempotencyKey)
      //   .single();

      // if (existing) {
      //   return createSuccessResponse({
      //     data: existing,
      //     message: "Operation already completed",
      //     duplicate: true,
      //   });
      // }

      // Execute main business logic with transaction
      const result = await executeTransaction(
        supabase,
        async () => {
          // Step 1: Validation and data preparation
          // const { data: validationData, error: validationError } = await supabase...

          // Step 2: Main operation
          // const { data: operationResult, error: operationError } = await supabase...

          // Step 3: Related operations
          // const { error: relatedError } = await supabase...

          // Step 4: Create notifications if needed
          // const { error: notificationError } = await supabase...

          return {
            /* your result data */
          };
        },

        // Rollback operations if transaction fails
        async () => {
          console.log(
            `[${FUNCTION_NAME}] Rolling back operation for: ${field1}`,
          );
          // Implement rollback logic here
        },
      );

      if (!result.success) {
        throw result.error;
      }

      // Log successful operation
      await createAuditLog(
        supabase,
        "operation_completed",
        "your_table",
        "record_id",
        "user_id",
        undefined, // old values
        result.data, // new values
        FUNCTION_NAME,
      );

      console.log(`[${FUNCTION_NAME}] Operation completed successfully:`, {
        field1,
        resultId: result.data?.id,
      });

      return createSuccessResponse({
        data: result.data,
        message: "Operation completed successfully",
      });
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Operation failed:`, error);

      // Log failed attempt
      await createAuditLog(
        supabase,
        "operation_failed",
        "your_table",
        field1,
        undefined,
        undefined,
        {
          error_message: error.message,
          input_data: { field1, field2 },
        },
        FUNCTION_NAME,
      );

      return createErrorResponse(
        error instanceof Error ? error.message : "Operation failed",
        500,
        { field1, field2 },
        FUNCTION_NAME,
      );
    }
  }),
);

// Example external service integration with fallback
async function callExternalServiceWithFallback(data: any): Promise<any> {
  try {
    const result = await callExternalAPI(
      "https://api.external-service.com/endpoint",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("EXTERNAL_API_KEY")}`,
        },
        body: JSON.stringify(data),
      },
      10000, // 10 second timeout
      3, // 3 retries
    );

    if (result.success) {
      return result.data;
    }

    // Fallback to local processing
    return createFallbackData(data);
  } catch (error) {
    console.warn("External service failed, using fallback:", error.message);
    return createFallbackData(data);
  }
}

function createFallbackData(data: any): any {
  // Implement your fallback logic here
  return {
    fallback: true,
    data: data,
    timestamp: new Date().toISOString(),
  };
}
