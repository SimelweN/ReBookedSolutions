/**
 * Debugging utility to test connection and error handling
 */

import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "./errorHandling";
import { checkConnectionHealth } from "./connectionHealthCheck";

export const debugConnection = async () => {
  console.log("🔍 Starting connection debug session...");

  // First check environment configuration
  console.log("🔧 Checking environment configuration...");
  console.log(
    "Supabase URL:",
    import.meta.env.VITE_SUPABASE_URL || "Using fallback",
  );
  console.log("API Key present:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log(
    "API Key starts with:",
    import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
  );

  try {
    // Test 1: Basic Supabase connection
    console.log("📡 Testing basic Supabase connection...");
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Basic connection test failed:");
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);

      if (
        error.message?.includes("Invalid API key") ||
        error.message?.includes("JWT")
      ) {
        console.error("🚨 API KEY ISSUE DETECTED:");
        console.error(
          "- The Supabase API key appears to be invalid or expired",
        );
        console.error("- Please check your environment variables");
        console.error("- Make sure VITE_SUPABASE_ANON_KEY is correct");
      }

      safeLogError("Basic Connection Test", error);
    } else {
      console.log("✅ Basic connection test passed");
    }

    // Test 2: Connection health check
    console.log("🏥 Testing connection health check...");
    const health = await checkConnectionHealth(true); // Force fresh check
    console.log("Connection health result:", health);

    // Test 3: Books table access
    console.log("📚 Testing books table access...");
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("id, title")
      .limit(5);

    if (booksError) {
      console.error("❌ Books table access failed:");
      safeLogError("Books Table Test", booksError);
    } else {
      console.log(
        `✅ Books table access passed - found ${booksData?.length || 0} books`,
      );
    }

    // Test 4: Auth status
    console.log("🔐 Testing auth status...");
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      console.error("❌ Auth status check failed:");
      safeLogError("Auth Status Test", authError);
    } else {
      console.log(
        `✅ Auth status check passed - ${session ? "authenticated" : "not authenticated"}`,
      );
    }

    console.log("🎯 Connection debug session completed");
  } catch (error) {
    console.error("💥 Connection debug session crashed:");
    safeLogError("Connection Debug Session", error);
  }
};

// Auto-run debug in development mode if query param is present
if (import.meta.env.DEV && typeof window !== "undefined") {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("debug-connection")) {
    setTimeout(debugConnection, 1000); // Give app time to initialize
  }
}

export default debugConnection;
