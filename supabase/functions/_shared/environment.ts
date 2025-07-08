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

import { corsHeaders } from "./cors.ts";

export function createEnvironmentError(missingVars: string[]): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Environment configuration error",
      message: `Missing required environment variables: ${missingVars.join(", ")}`,
      missingVariables: missingVars,
    }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
