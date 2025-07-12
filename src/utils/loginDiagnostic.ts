import { supabase } from "@/integrations/supabase/client";
import { ENV } from "@/config/environment";

export interface LoginDiagnosticResult {
  step: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: unknown;
}

export const runLoginDiagnostic = async (): Promise<
  LoginDiagnosticResult[]
> => {
  const results: LoginDiagnosticResult[] = [];

  // Step 1: Check environment variables
  results.push({
    step: "Environment Configuration",
    status:
      ENV.VITE_SUPABASE_URL && ENV.VITE_SUPABASE_ANON_KEY ? "pass" : "fail",
    message:
      ENV.VITE_SUPABASE_URL && ENV.VITE_SUPABASE_ANON_KEY
        ? "Supabase credentials configured"
        : "Missing Supabase credentials",
    details: {
      hasUrl: !!ENV.VITE_SUPABASE_URL,
      hasKey: !!ENV.VITE_SUPABASE_ANON_KEY,
      urlPrefix: ENV.VITE_SUPABASE_URL?.substring(0, 20) + "...",
      keyPrefix: ENV.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    },
  });

  // Step 2: Check Supabase URL format
  if (ENV.VITE_SUPABASE_URL) {
    try {
      new URL(ENV.VITE_SUPABASE_URL);
      results.push({
        step: "Supabase URL Format",
        status: "pass",
        message: "Valid URL format",
        details: { url: ENV.VITE_SUPABASE_URL },
      });
    } catch {
      results.push({
        step: "Supabase URL Format",
        status: "fail",
        message: "Invalid URL format",
        details: { url: ENV.VITE_SUPABASE_URL },
      });
    }
  }

  // Step 3: Check API key format
  if (ENV.VITE_SUPABASE_ANON_KEY) {
    const isValidJWT = ENV.VITE_SUPABASE_ANON_KEY.startsWith("eyJ");
    results.push({
      step: "API Key Format",
      status: isValidJWT ? "pass" : "fail",
      message: isValidJWT
        ? "Valid JWT format"
        : "Invalid JWT format (should start with 'eyJ')",
      details: {
        prefix: ENV.VITE_SUPABASE_ANON_KEY.substring(0, 10),
        isJWT: isValidJWT,
      },
    });
  }

  // Step 4: Test network connectivity
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch("https://httpbin.org/get", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    results.push({
      step: "Network Connectivity",
      status: "pass",
      message: "Internet connection working",
    });
  } catch (error) {
    results.push({
      step: "Network Connectivity",
      status: "fail",
      message: "Network connection failed",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Step 5: Test Supabase connection
  try {
    const { data, error } = await Promise.race([
      supabase.from("profiles").select("id").limit(1),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 10000),
      ),
    ]);

    if (error) {
      let status: "fail" | "warning" = "fail";
      let message = `Supabase error: ${error.message}`;

      // Check for specific error types
      if (
        error.message.includes("JWT") ||
        error.message.includes("Invalid API key")
      ) {
        message = "Invalid API key - check your VITE_SUPABASE_ANON_KEY";
      } else if (error.message.includes("relation") || error.code === "42P01") {
        message = "Database table missing - profiles table doesn't exist";
        status = "warning";
      } else if (
        error.message.includes("permission") ||
        error.message.includes("RLS")
      ) {
        message = "Database permissions issue - check RLS policies";
        status = "warning";
      }

      results.push({
        step: "Supabase Connection",
        status,
        message,
        details: { error: error.message, code: error.code },
      });
    } else {
      results.push({
        step: "Supabase Connection",
        status: "pass",
        message: "Successfully connected to Supabase",
        details: { recordCount: data?.length || 0 },
      });
    }
  } catch (error) {
    results.push({
      step: "Supabase Connection",
      status: "fail",
      message: "Failed to connect to Supabase",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Step 6: Test authentication endpoints
  try {
    const { data, error } = await supabase.auth.getSession();

    results.push({
      step: "Auth Service",
      status: error ? "fail" : "pass",
      message: error
        ? `Auth error: ${error.message}`
        : "Auth service accessible",
      details: {
        hasSession: !!data.session,
        error: error?.message,
      },
    });
  } catch (error) {
    results.push({
      step: "Auth Service",
      status: "fail",
      message: "Auth service failed",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  return results;
};

// Quick test login function for diagnostics
export const testLogin = async (
  email: string,
  password: string,
): Promise<LoginDiagnosticResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      let message = `Login failed: ${error.message}`;

      // Provide specific guidance based on error type
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Check your credentials.";
      } else if (error.message.includes("Email not confirmed")) {
        message =
          "Email not verified. Check your inbox for verification email.";
      } else if (
        error.message.includes("JWT") ||
        error.message.includes("API key")
      ) {
        message = "Configuration error. Check your Supabase API key.";
      } else if (error.message.includes("Failed to fetch")) {
        message = "Network error. Check your internet connection.";
      }

      return {
        step: "Test Login",
        status: "fail",
        message,
        details: {
          error: error.message,
          code: error.name,
          hint: error.hint || error.details,
        },
      };
    }

    return {
      step: "Test Login",
      status: "pass",
      message: "Login successful!",
      details: {
        userId: data.user?.id,
        email: data.user?.email,
      },
    };
  } catch (error) {
    return {
      step: "Test Login",
      status: "fail",
      message: "Login attempt failed",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
};
