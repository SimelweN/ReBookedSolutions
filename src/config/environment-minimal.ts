// Minimal environment configuration for Workers build compatibility

// Safe environment variable access for Workers
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  try {
    // Check if we're in a Workers environment
    if (typeof window !== "undefined" && import.meta && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

export const ENV = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  VITE_SUPABASE_URL: getEnvVar("VITE_SUPABASE_URL"),
  VITE_SUPABASE_ANON_KEY: getEnvVar("VITE_SUPABASE_ANON_KEY").replace(
    /^=+/,
    "",
  ),
  VITE_PAYSTACK_PUBLIC_KEY: getEnvVar("VITE_PAYSTACK_PUBLIC_KEY"),
  VITE_APP_URL: getEnvVar("VITE_APP_URL", "https://rebookedsolutions.co.za"),
  VITE_COURIER_GUY_API_KEY: getEnvVar("VITE_COURIER_GUY_API_KEY"),
  VITE_FASTWAY_API_KEY: getEnvVar("VITE_FASTWAY_API_KEY"),
  VITE_GOOGLE_MAPS_API_KEY: getEnvVar("VITE_GOOGLE_MAPS_API_KEY"),
  VITE_SENDER_API: getEnvVar("VITE_SENDER_API"),
  VITE_RESEND_API_KEY: getEnvVar("VITE_RESEND_API_KEY"),
  VITE_BANKING_VAULT_URL: getEnvVar(
    "VITE_BANKING_VAULT_URL",
    "https://paystack-vault-south-africa.lovable.app",
  ),
} as const;

export const IS_PRODUCTION = ENV.NODE_ENV === "production";
export const IS_DEVELOPMENT = ENV.NODE_ENV === "development";

// Minimal validation without complex logic
export const validateEnvironment = () => {
  const hasSupabase = ENV.VITE_SUPABASE_URL && ENV.VITE_SUPABASE_ANON_KEY;
  return {
    isValid: !!hasSupabase,
    errors: hasSupabase ? [] : ["Missing Supabase configuration"],
  };
};
