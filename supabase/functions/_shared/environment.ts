import { corsHeaders, createErrorResponse } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  paystackSecretKey?: string;
  courierGuyApiKey?: string;
  fastwayApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    paystackSecretKey: Deno.env.get("PAYSTACK_SECRET_KEY"),
    courierGuyApiKey: Deno.env.get("COURIER_GUY_API_KEY"),
    fastwayApiKey: Deno.env.get("FASTWAY_API_KEY"),
    smtpHost: Deno.env.get("SMTP_HOST"),
    smtpPort: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    smtpUser: Deno.env.get("SMTP_USER"),
    smtpPass: Deno.env.get("SMTP_PASS"),
  };
}

export function validateRequiredEnvVars(requiredVars: string[]): string[] {
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!Deno.env.get(varName)) {
      missing.push(varName);
    }
  }

  return missing;
}

export function createEnvironmentError(missingVars: string[]): Response {
  return createErrorResponse(
    `Missing required environment variables: ${missingVars.join(", ")}`,
    500,
    { missingVariables: missingVars },
  );
}

export function createSupabaseClient() {
  try {
    const config = getEnvironmentConfig();
    return createClient(config.supabaseUrl, config.supabaseServiceKey);
  } catch (error) {
    throw new Error(`Failed to create Supabase client: ${error.message}`);
  }
}

export function validateAndCreateSupabaseClient() {
  const missing = validateRequiredEnvVars([
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
  return createSupabaseClient();
}
