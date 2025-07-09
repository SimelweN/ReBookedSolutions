/**
 * Environment Configuration with Validation
 * Ensures all required environment variables are available with proper fallbacks
 */

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  paystackSecretKey?: string;
  paystackPublicKey?: string;
  courierGuyApiKey?: string;
  fastwayApiKey?: string;
  googleMapsApiKey?: string;
  senderApiKey?: string;
  nodeEnv: string;
  appUrl: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    supabaseUrl: Deno.env.get("SUPABASE_URL") || "",
    supabaseServiceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    paystackSecretKey: Deno.env.get("PAYSTACK_SECRET_KEY"),
    paystackPublicKey: Deno.env.get("VITE_PAYSTACK_PUBLIC_KEY"),
    courierGuyApiKey: Deno.env.get("VITE_COURIER_GUY_API_KEY"),
    fastwayApiKey: Deno.env.get("VITE_FASTWAY_API_KEY"),
    googleMapsApiKey: Deno.env.get("VITE_GOOGLE_MAPS_API_KEY"),
    senderApiKey: Deno.env.get("VITE_SENDER_API"),
    nodeEnv: Deno.env.get("NODE_ENV") || "development",
    appUrl: Deno.env.get("VITE_APP_URL") || "http://localhost:5173",
  };

  // Validate required environment variables
  const requiredVars = ["supabaseUrl", "supabaseServiceKey"];
  const missing = requiredVars.filter(
    (key) => !config[key as keyof EnvironmentConfig],
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return config;
}

export function validateEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const missing: string[] = [];

  // Required variables
  if (!Deno.env.get("SUPABASE_URL")) missing.push("SUPABASE_URL");
  if (!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
    missing.push("SUPABASE_SERVICE_ROLE_KEY");

  // Optional but recommended variables
  if (!Deno.env.get("PAYSTACK_SECRET_KEY"))
    warnings.push(
      "PAYSTACK_SECRET_KEY - Payment processing will use fallback mode",
    );
  if (!Deno.env.get("VITE_COURIER_GUY_API_KEY"))
    warnings.push(
      "VITE_COURIER_GUY_API_KEY - Courier Guy delivery quotes unavailable",
    );
  if (!Deno.env.get("VITE_FASTWAY_API_KEY"))
    warnings.push("VITE_FASTWAY_API_KEY - Fastway delivery quotes unavailable");
  if (!Deno.env.get("VITE_SENDER_API"))
    warnings.push("VITE_SENDER_API - Email notifications may be limited");

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

export function isDevelopment(): boolean {
  return Deno.env.get("NODE_ENV") === "development";
}

export function isProduction(): boolean {
  return Deno.env.get("NODE_ENV") === "production";
}

export function getLogLevel(): "debug" | "info" | "warn" | "error" {
  const level =
    Deno.env.get("LOG_LEVEL") || (isDevelopment() ? "debug" : "info");
  return level as "debug" | "info" | "warn" | "error";
}

// Rate limiting configuration
export function getRateLimitConfig(): {
  enabled: boolean;
  limit: number;
  windowMs: number;
} {
  return {
    enabled: Deno.env.get("RATE_LIMIT_ENABLED") !== "false",
    limit: parseInt(Deno.env.get("RATE_LIMIT_PER_MINUTE") || "100"),
    windowMs: parseInt(Deno.env.get("RATE_LIMIT_WINDOW_MS") || "60000"),
  };
}

// External service timeouts
export function getServiceTimeouts(): {
  paystack: number;
  courier: number;
  email: number;
} {
  return {
    paystack: parseInt(Deno.env.get("PAYSTACK_TIMEOUT_MS") || "15000"),
    courier: parseInt(Deno.env.get("COURIER_TIMEOUT_MS") || "8000"),
    email: parseInt(Deno.env.get("EMAIL_TIMEOUT_MS") || "5000"),
  };
}
