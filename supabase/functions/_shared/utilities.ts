import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.50.3";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  createGenericErrorHandler,
} from "./cors.ts";

// Initialize Supabase client with proper error handling
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Comprehensive audit logging
export async function createAuditLog(
  supabase: SupabaseClient,
  action: string,
  tableName: string,
  recordId: string,
  userId?: string,
  oldValues?: any,
  newValues?: any,
  functionName?: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      action,
      table_name: tableName,
      record_id: recordId,
      user_id: userId,
      old_values: oldValues,
      new_values: newValues,
      function_name: functionName,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to create audit log:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Audit logging error:", error);
    return false;
  }
}

// Database transaction wrapper with rollback support
export async function executeTransaction<T>(
  supabase: SupabaseClient,
  operations: () => Promise<T>,
  rollbackOperations?: () => Promise<void>,
): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const data = await operations();
    return { success: true, data };
  } catch (error) {
    console.error("Transaction failed, attempting rollback:", error);

    if (rollbackOperations) {
      try {
        await rollbackOperations();
        console.log("Rollback completed successfully");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    return { success: false, error };
  }
}

// Input validation with detailed error messages
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[],
): { isValid: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  return {
    isValid: missing.length === 0,
    missing,
  };
}

// External API call with timeout and retry logic
export async function callExternalAPI<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000,
  maxRetries: number = 3,
): Promise<{ success: boolean; data?: T; error?: any }> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      lastError = error;
      console.warn(
        `External API attempt ${attempt}/${maxRetries} failed:`,
        error.message,
      );

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, error: lastError };
}

// Graceful degradation helper
export function createFallbackResponse(
  originalError: any,
  fallbackData: any,
  message: string = "Using fallback data due to service unavailability",
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data: fallbackData,
      fallback: true,
      warning: message,
      originalError: originalError?.message,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

// Idempotency key generator
export function generateIdempotencyKey(data: any): string {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  const hashBuffer = crypto.subtle.digestSync(
    "SHA-256",
    encoder.encode(dataString),
  );
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Health check response
export function createHealthResponse(
  functionName: string,
  version: string = "1.0.0",
): Response {
  return createSuccessResponse({
    message: `${functionName} function is healthy`,
    status: "operational",
    version,
    timestamp: new Date().toISOString(),
    uptime: performance.now() / 1000,
  });
}

// Rate limiting helper (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
  }

  record.count++;

  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    resetTime: record.resetTime,
  };
}

// Data sanitization
export function sanitizeInput(data: any): any {
  if (typeof data === "string") {
    return data.trim().replace(/[<>"'&]/g, "");
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }

  if (data && typeof data === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

// Function wrapper with all best practices
export function createRobustFunction(
  functionName: string,
  handler: (req: Request, supabase: SupabaseClient) => Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    // CORS handling
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      // Initialize Supabase
      const supabase = createSupabaseClient();

      // Rate limiting (optional, based on function needs)
      const clientIP = req.headers.get("x-forwarded-for") || "unknown";
      const rateLimit = checkRateLimit(clientIP);

      if (!rateLimit.allowed) {
        return createErrorResponse(
          "Rate limit exceeded",
          429,
          { remaining: rateLimit.remaining, resetTime: rateLimit.resetTime },
          functionName,
        );
      }

      // Execute main handler
      return await handler(req, supabase);
    } catch (error) {
      return createGenericErrorHandler(functionName)(error);
    }
  };
}
