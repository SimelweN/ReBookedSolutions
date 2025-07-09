import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./cors.ts";

// Initialize Supabase client with proper error handling
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required Supabase environment variables');
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
    const { error } = await supabase
      .from('audit_logs')
      .insert({
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
      console.error('Failed to create audit log:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Audit logging error:', error);
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
    console.error('Transaction failed, attempting rollback:', error);
    
    if (rollbackOperations) {
      try {
        await rollbackOperations();
        console.log('Rollback completed successfully');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
    
    return { success: false, error };
  }
}

// Input validation with detailed error messages
export function validateRequired(data: Record<string, any>, requiredFields: string[]): { isValid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
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
      console.warn(`External API attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }\n  }\n  \n  return { success: false, error: lastError };\n}\n\n// Graceful degradation helper\nexport function createFallbackResponse(originalError: any, fallbackData: any, message: string = \"Using fallback data due to service unavailability\"): Response {\n  return new Response(\n    JSON.stringify({\n      success: true,\n      data: fallbackData,\n      fallback: true,\n      warning: message,\n      originalError: originalError?.message,\n      timestamp: new Date().toISOString(),\n    }),\n    {\n      status: 200,\n      headers: { ...corsHeaders, \"Content-Type\": \"application/json\" },\n    },\n  );\n}\n\n// Idempotency key generator\nexport function generateIdempotencyKey(data: any): string {\n  const encoder = new TextEncoder();\n  const dataString = JSON.stringify(data, Object.keys(data).sort());\n  const hashBuffer = crypto.subtle.digestSync(\"SHA-256\", encoder.encode(dataString));\n  return Array.from(new Uint8Array(hashBuffer))\n    .map(b => b.toString(16).padStart(2, \"0\"))\n    .join(\"\");\n}\n\n// Health check response\nexport function createHealthResponse(functionName: string, version: string = \"1.0.0\"): Response {\n  return createSuccessResponse({\n    message: `${functionName} function is healthy`,\n    status: \"operational\",\n    version,\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime?.() || 0,\n  });\n}\n\n// Rate limiting helper (simple in-memory store)\nconst rateLimitStore = new Map<string, { count: number; resetTime: number }>();\n\nexport function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): { allowed: boolean; remaining: number; resetTime: number } {\n  const now = Date.now();\n  const key = identifier;\n  \n  let record = rateLimitStore.get(key);\n  \n  if (!record || now > record.resetTime) {\n    record = { count: 0, resetTime: now + windowMs };\n    rateLimitStore.set(key, record);\n  }\n  \n  record.count++;\n  \n  return {\n    allowed: record.count <= limit,\n    remaining: Math.max(0, limit - record.count),\n    resetTime: record.resetTime,\n  };\n}\n\n// Data sanitization\nexport function sanitizeInput(data: any): any {\n  if (typeof data === 'string') {\n    return data.trim().replace(/[<>\"'&]/g, '');\n  }\n  \n  if (Array.isArray(data)) {\n    return data.map(sanitizeInput);\n  }\n  \n  if (data && typeof data === 'object') {\n    const sanitized: any = {};\n    for (const [key, value] of Object.entries(data)) {\n      sanitized[key] = sanitizeInput(value);\n    }\n    return sanitized;\n  }\n  \n  return data;\n}\n\n// Function wrapper with all best practices\nexport function createRobustFunction(\n  functionName: string,\n  handler: (req: Request, supabase: SupabaseClient) => Promise<Response>,\n) {\n  return async (req: Request): Promise<Response> => {\n    // CORS handling\n    if (req.method === 'OPTIONS') {\n      return new Response('ok', { headers: corsHeaders });\n    }\n    \n    try {\n      // Initialize Supabase\n      const supabase = createSupabaseClient();\n      \n      // Rate limiting (optional, based on function needs)\n      const clientIP = req.headers.get('x-forwarded-for') || 'unknown';\n      const rateLimit = checkRateLimit(clientIP);\n      \n      if (!rateLimit.allowed) {\n        return createErrorResponse(\n          'Rate limit exceeded',\n          429,\n          { remaining: rateLimit.remaining, resetTime: rateLimit.resetTime },\n          functionName,\n        );\n      }\n      \n      // Execute main handler\n      return await handler(req, supabase);\n      \n    } catch (error) {\n      return createGenericErrorHandler(functionName)(error);\n    }\n  };\n}