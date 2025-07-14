// Shared utilities for consistent edge function responses
// This file provides standardized error handling, CORS, and response formatting

// Environment variable validation
export const validateRequiredEnvVars = (
  requiredVars: string[],
): { valid: boolean; missing: string[] } => {
  const missing = requiredVars.filter((varName) => !Deno.env.get(varName));
  return {
    valid: missing.length === 0,
    missing,
  };
};

// Standard CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

// Standard response wrapper
export const createResponse = (
  data: any,
  status = 200,
  additionalHeaders: Record<string, string> = {},
): Response => {
  const headers = {
    ...corsHeaders,
    ...additionalHeaders,
    "Content-Type": "application/json",
  };

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
};

// Standard success response
export const successResponse = (data: any, message = "Success"): Response => {
  return createResponse({
    success: true,
    message,
    data,
  });
};

// Standard error response
export const errorResponse = (
  message: string,
  status = 400,
  code?: string,
  details?: any,
): Response => {
  console.error(`[ERROR] ${code || "FUNCTION_ERROR"}: ${message}`, details);

  return createResponse(
    {
      success: false,
      error: {
        message,
        code: code || "FUNCTION_ERROR",
        details,
      },
    },
    status,
  );
};

// Environment error response
export const envErrorResponse = (missing: string[]): Response => {
  return errorResponse(
    `Missing required environment variables: ${missing.join(", ")}`,
    500,
    "ENV_VARS_MISSING",
    { missing },
  );
};

// Method not allowed response
export const methodNotAllowedResponse = (
  method: string,
  allowed: string[],
): Response => {
  return errorResponse(
    `Method ${method} not allowed. Allowed methods: ${allowed.join(", ")}`,
    405,
    "METHOD_NOT_ALLOWED",
    { method, allowed },
  );
};

// Handle preflight OPTIONS request
export const handleCORS = (req: Request): Response | null => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
};

// Validate HTTP method
export const validateMethod = (
  req: Request,
  allowedMethods: string[],
): boolean => {
  return allowedMethods.includes(req.method);
};

// Safe JSON parsing with error handling
export const safeJsonParse = async (
  req: Request,
): Promise<{ data: any; error?: string }> => {
  try {
    const text = await req.text();
    if (!text) {
      return { data: {} };
    }
    const data = JSON.parse(text);
    return { data };
  } catch (error) {
    return {
      data: null,
      error: `Invalid JSON: ${error.message}`,
    };
  }
};

// Timeout wrapper for external API calls
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs = 10000,
  timeoutMessage = "Operation timed out",
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

// Retry wrapper for external API calls
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError!;
};

// Standard function wrapper with error handling
export const wrapFunction = (
  handler: (req: Request) => Promise<Response>,
  requiredEnvVars: string[] = [],
  allowedMethods: string[] = ["POST"],
) => {
  return async (req: Request): Promise<Response> => {
    try {
      // Handle CORS preflight
      const corsResponse = handleCORS(req);
      if (corsResponse) return corsResponse;

      // Validate method
      if (!validateMethod(req, allowedMethods)) {
        return methodNotAllowedResponse(req.method, allowedMethods);
      }

      // Validate environment variables
      const envValidation = validateRequiredEnvVars(requiredEnvVars);
      if (!envValidation.valid) {
        return envErrorResponse(envValidation.missing);
      }

      // Call the actual handler
      return await handler(req);
    } catch (error) {
      console.error("Unhandled error in function:", error);
      return errorResponse("Internal server error", 500, "INTERNAL_ERROR", {
        error: error.message,
      });
    }
  };
};

// Health check utility
export const healthCheck = (
  serviceName: string,
  additionalChecks: Record<string, boolean> = {},
): Response => {
  const checks = {
    service: true,
    timestamp: new Date().toISOString(),
    ...additionalChecks,
  };

  const isHealthy = Object.values(checks).every(
    (check) => check === true || typeof check === "string",
  );

  return createResponse(
    {
      service: serviceName,
      healthy: isHealthy,
      checks,
    },
    isHealthy ? 200 : 503,
  );
};
