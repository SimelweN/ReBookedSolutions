// Environment configuration for production readiness
// Workers-compatible environment access
const getEnvVar = (key: string, fallback = ""): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
    // Fallback for Workers environment
    if (typeof globalThis !== "undefined" && globalThis.process?.env) {
      return globalThis.process.env[key] || fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

export const ENV = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  // Remove the hardcoded fallback URLs that are returning 404
  VITE_SUPABASE_URL: getEnvVar("VITE_SUPABASE_URL"),
  VITE_SUPABASE_ANON_KEY:
    getEnvVar("VITE_SUPABASE_ANON_KEY")?.replace(/^=+/, "") || "",
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

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
  const critical = ["VITE_PAYSTACK_PUBLIC_KEY"]; // Critical for payments
  const optional = [
    "VITE_COURIER_GUY_API_KEY",
    "VITE_FASTWAY_API_KEY",
    "VITE_GOOGLE_MAPS_API_KEY",
    "VITE_SENDER_API",
    "VITE_RESEND_API_KEY",
  ];

  const missing = required.filter((key) => {
    const value = ENV[key as keyof typeof ENV];
    return (
      !value ||
      value.trim() === "" ||
      value.includes("demo-") ||
      value.includes("your-")
    );
  });

  const missingCritical = critical.filter((key) => {
    const value = ENV[key as keyof typeof ENV];
    return (
      !value ||
      value.trim() === "" ||
      (IS_PRODUCTION && (value.includes("demo-") || value.includes("test_")))
    );
  });

  // Validate Supabase key format (should be a JWT token starting with eyJ)
  if (
    ENV.VITE_SUPABASE_ANON_KEY &&
    !ENV.VITE_SUPABASE_ANON_KEY.startsWith("eyJ")
  ) {
    console.error(
      "❌ VITE_SUPABASE_ANON_KEY appears to be invalid - should start with 'eyJ'",
    );
    console.error(
      "Current key starts with:",
      ENV.VITE_SUPABASE_ANON_KEY.substring(0, 10) + "...",
    );
  }

  // Validate Supabase URL format
  if (
    ENV.VITE_SUPABASE_URL &&
    !ENV.VITE_SUPABASE_URL.includes(".supabase.co")
  ) {
    console.warn(
      "⚠️ VITE_SUPABASE_URL doesn't appear to be a valid Supabase URL",
    );
  }

  const missingOptional = optional.filter((key) => {
    const value = ENV[key as keyof typeof ENV];
    return !value || value.trim() === "" || value.includes("demo-");
  });

  // Check for demo/placeholder values (only warn in production)
  const hasPlaceholders =
    IS_PRODUCTION &&
    Object.entries(ENV).some(
      ([key, value]) =>
        typeof value === "string" &&
        (value.includes("demo-") ||
          value.includes("your-") ||
          value.includes("placeholder") ||
          (key.includes("API_KEY") && value.length < 10)),
    );

  if ((missing.length > 0 && IS_PRODUCTION) || hasPlaceholders) {
    const errorMessage = `
🚨 CONFIGURATION REQUIRED 🚨

${missing.length > 0 ? `Missing required variables: ${missing.join(", ")}` : ""}
${hasPlaceholders ? "⚠️ Demo/placeholder values detected" : ""}
${missingCritical.length > 0 ? `⚠️ Critical for payments: ${missingCritical.join(", ")}` : ""}

🔧 QUICK SETUP OPTIONS:

OPTION 1: Run the setup script
   node setup-environment.js

OPTION 2: Manual setup
   1. Create .env file with real credentials:

   # Required (Database & Auth)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ... (from Supabase Dashboard > Settings > API)

   # Critical (Payments)
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_... (from Paystack Dashboard)

   # Optional (Enhanced Features)
   VITE_GOOGLE_MAPS_API_KEY=AIza... (Google Cloud Console)
   VITE_SENDER_API=... (Email service)
   VITE_COURIER_GUY_API_KEY=... (Shipping)

📋 SERVICE SETUP CHECKLIST:

✅ Supabase Project: https://supabase.com/dashboard
   - Create new project
   - Copy URL and anon key
   - Run database setup script

✅ Paystack Account: https://dashboard.paystack.com
   - Get test keys for development
   - Get live keys for production

✅ Google Maps API: https://console.developers.google.com
   - Enable Places API, Geocoding API, Maps JavaScript API
   - Create API key with restrictions

🔍 Current status: ${ENV.NODE_ENV} environment
    `;

    console.error(errorMessage);

    if (IS_PRODUCTION) {
      console.error(
        `❌ Missing required environment variables: ${missing.join(", ")}`,
      );
      console.error(
        "⚠️ Application may not function correctly without proper configuration",
      );
    }
  } else if (missing.length > 0 && IS_DEVELOPMENT) {
    console.warn(
      "ℹ️ Development mode: Some environment variables are using demo values",
    );
    console.warn(
      "📋 To set up real credentials, run: node setup-environment.js",
    );
  }

  if (missing.length === 0) {
    console.log("✅ Environment variables validated successfully");

    // Warn about missing optional API keys
    if (missingOptional.length > 0) {
      console.warn(
        `⚠️ Optional API keys not set (some features may be limited): ${missingOptional.join(", ")}`,
      );
    }
  }

  // In development, we're more lenient to allow development without full setup
  if (IS_DEVELOPMENT) {
    console.log("🔧 Development mode: Environment validation lenient");
    if (missing.length > 0) {
      console.warn("⚠️ Missing environment variables:", missing);
      console.warn("📝 App will continue with mock/fallback services");
    }
    return true; // Allow development to continue
  }

  return missing.length === 0;
};

// Production-specific configurations
export const PRODUCTION_CONFIG = {
  // Rate limiting (requests per minute)
  RATE_LIMIT: {
    auth: 5,
    booking: 10,
    general: 60,
  },

  // Cache durations (in milliseconds)
  CACHE_DURATION: {
    books: 5 * 60 * 1000, // 5 minutes
    profile: 10 * 60 * 1000, // 10 minutes
    static: 60 * 60 * 1000, // 1 hour
  },

  // Security headers
  SECURITY_HEADERS: {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
};
