// Auth system diagnostics utility
import { supabase } from "@/integrations/supabase/client";

export interface AuthDiagnostics {
  supabaseConnectivity: boolean;
  currentSession: boolean;
  profilesTableExists: boolean;
  authInitialized: boolean;
  errors: string[];
  recommendations: string[];
}

export async function runAuthDiagnostics(): Promise<AuthDiagnostics> {
  const diagnostics: AuthDiagnostics = {
    supabaseConnectivity: false,
    currentSession: false,
    profilesTableExists: false,
    authInitialized: false,
    errors: [],
    recommendations: [],
  };

  try {
    // Test 1: Basic Supabase connectivity
    console.log("🔍 Testing Supabase connectivity...");
    const connectivityTest = await Promise.race([
      supabase.from("profiles").select("id").limit(1),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connectivity timeout")), 5000),
      ),
    ]);

    if ((connectivityTest as any).error) {
      const error = (connectivityTest as any).error;
      diagnostics.errors.push(`Supabase connectivity error: ${error.message}`);

      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        diagnostics.recommendations.push(
          "Run database setup script in Supabase SQL editor",
        );
        diagnostics.recommendations.push(
          "Check if all required tables are created",
        );
      } else if (error.message.includes("permission denied")) {
        diagnostics.recommendations.push(
          "Check RLS (Row Level Security) policies",
        );
        diagnostics.recommendations.push(
          "Ensure proper table permissions are set",
        );
      }
    } else {
      diagnostics.supabaseConnectivity = true;
      diagnostics.profilesTableExists = true;
      console.log("✅ Supabase connectivity test passed");
    }

    // Test 2: Current session
    console.log("🔍 Checking current session...");
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      diagnostics.errors.push(`Session check error: ${sessionError.message}`);
    } else if (sessionData.session) {
      diagnostics.currentSession = true;
      console.log("✅ Active session found");
    } else {
      console.log("ℹ️ No active session (user not logged in)");
    }

    // Test 3: Auth state listener
    console.log("🔍 Testing auth state listener...");
    const authStateTest = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 2000);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(true);
      });
    });

    diagnostics.authInitialized = await authStateTest;

    if (diagnostics.authInitialized) {
      console.log("✅ Auth state listener is working");
    } else {
      diagnostics.errors.push("Auth state listener failed to initialize");
      diagnostics.recommendations.push("Check Supabase client configuration");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    diagnostics.errors.push(`Diagnostic test failed: ${errorMessage}`);
    diagnostics.recommendations.push(
      "Check internet connection and Supabase project status",
    );
  }

  // Generate summary recommendations
  if (diagnostics.errors.length === 0) {
    diagnostics.recommendations.push(
      "All auth diagnostics passed - system is healthy",
    );
  } else {
    diagnostics.recommendations.push(
      "Review errors above and check Supabase project configuration",
    );
    diagnostics.recommendations.push(
      "Ensure environment variables are correctly set",
    );
  }

  return diagnostics;
}

export function logAuthDiagnostics(diagnostics: AuthDiagnostics) {
  console.group("🔍 Auth System Diagnostics");

  console.log("📊 Test Results:");
  console.log(
    `  Supabase Connectivity: ${diagnostics.supabaseConnectivity ? "✅" : "❌"}`,
  );
  console.log(
    `  Current Session: ${diagnostics.currentSession ? "✅" : "ℹ️ No session"}`,
  );
  console.log(
    `  Profiles Table: ${diagnostics.profilesTableExists ? "✅" : "❌"}`,
  );
  console.log(
    `  Auth Initialized: ${diagnostics.authInitialized ? "✅" : "❌"}`,
  );

  if (diagnostics.errors.length > 0) {
    console.error("❌ Errors:");
    diagnostics.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (diagnostics.recommendations.length > 0) {
    console.info("💡 Recommendations:");
    diagnostics.recommendations.forEach((rec) => console.info(`  - ${rec}`));
  }

  console.groupEnd();
}

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  // Run after a short delay to ensure everything is initialized
  setTimeout(async () => {
    try {
      const diagnostics = await runAuthDiagnostics();
      logAuthDiagnostics(diagnostics);
    } catch (error) {
      console.warn("Auth diagnostics failed to run:", error);
    }
  }, 3000);
}
