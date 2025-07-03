// Environment configuration for production readiness
export const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  // Remove the hardcoded fallback URLs that are returning 404
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  VITE_SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^=+/, "") || "",
  VITE_PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  VITE_APP_URL:
    import.meta.env.VITE_APP_URL || "https://rebookedsolutions.co.za",
  VITE_COURIER_GUY_API_KEY: import.meta.env.VITE_COURIER_GUY_API_KEY || "",
  VITE_FASTWAY_API_KEY: import.meta.env.VITE_FASTWAY_API_KEY || "",
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  VITE_SENDER_API: import.meta.env.VITE_SENDER_API || "",
} as const;

export const IS_PRODUCTION = ENV.NODE_ENV === "production";
export const IS_DEVELOPMENT = ENV.NODE_ENV === "development";

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
  const optional = [
    "VITE_PAYSTACK_PUBLIC_KEY",
    "VITE_COURIER_GUY_API_KEY",
    "VITE_FASTWAY_API_KEY",
    "VITE_GOOGLE_MAPS_API_KEY",
    "VITE_SENDER_API",
  ];

  const missing = required.filter((key) => {
    const value = ENV[key as keyof typeof ENV];
    return !value || value.trim() === "";
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
    return !value || value.trim() === "";
  });

  if (missing.length > 0) {
    const errorMessage = `
🚨 MISSING ENVIRONMENT VARIABLES 🚨

The following required environment variables are not set:
${missing.map((key) => `  - ${key}`).join("\n")}

To fix this issue:

1. For local development, create a .env file in the project root:
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   VITE_SENDER_API=your_sender_api_key

2. For production deployment, set these environment variables in your hosting platform:

   VERCEL:
   - Go to your project settings in Vercel dashboard
   - Add environment variables in the "Environment Variables" section

   NETLIFY:
   - Go to your site settings in Netlify dashboard
   - Add environment variables in "Environment variables" section

3. Get your Supabase credentials from:
   - https://supabase.com/dashboard
   - Go to your project > Settings > API

4. Get your Paystack credentials from:
   - https://dashboard.paystack.com/#/settings/developer

Current environment: ${ENV.NODE_ENV}
    `;

    console.error(errorMessage);

    if (import.meta.env.PROD) {
      console.error(
        `❌ Missing required environment variables: ${missing.join(", ")}`,
      );
      console.error(
        "⚠️ Application may not function correctly without proper configuration",
      );
    } else {
      console.warn("⚠️ Environment variables needed for full functionality");
    }
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
