/**
 * Utility to validate Supabase API key and connection
 */

import { supabase } from "@/integrations/supabase/client";

export const validateApiKey = async () => {
  console.log("🔑 Validating Supabase API key...");

  // Check environment variables
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("Environment check:");
  console.log("- URL:", url || "❌ Missing");
  console.log("- Key present:", !!key);
  console.log(
    "- Key format:",
    key?.startsWith("eyJ") ? "✅ Valid JWT format" : "❌ Invalid format",
  );

  if (!url || !key) {
    console.error("❌ Missing required environment variables");
    return { valid: false, error: "Missing environment variables" };
  }

  if (!key.startsWith("eyJ")) {
    console.error("❌ API key doesn't appear to be a valid JWT token");
    return { valid: false, error: "Invalid API key format" };
  }

  // Test the connection
  try {
    console.log("🧪 Testing API key with simple query...");

    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ API key test failed:");
      console.error("Error:", error.message);
      console.error("Code:", error.code);

      if (
        error.message?.includes("Invalid API key") ||
        error.message?.includes("JWT") ||
        error.message?.includes("unauthorized")
      ) {
        return {
          valid: false,
          error: "Invalid or expired API key",
          details: error.message,
        };
      }

      return {
        valid: false,
        error: "Connection failed",
        details: error.message,
      };
    }

    console.log("✅ API key is valid and working");
    return { valid: true, error: null };
  } catch (err) {
    console.error("❌ Connection test crashed:", err);
    return {
      valid: false,
      error: "Connection crashed",
      details: err instanceof Error ? err.message : String(err),
    };
  }
};

// Make available globally in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).validateApiKey = validateApiKey;
}

export default validateApiKey;
