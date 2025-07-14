import { supabase } from "@/integrations/supabase/client";
import { ENV, validateEnvironment } from "@/config/environment";
import { toast } from "sonner";

export interface SystemStatus {
  overall: "healthy" | "warning" | "error";
  components: ComponentStatus[];
  lastChecked: string;
  recommendations: string[];
}

export interface ComponentStatus {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  details?: string;
  critical: boolean;
}

/**
 * Comprehensive system validation
 */
export const validateSystemHealth = async (): Promise<SystemStatus> => {
  const components: ComponentStatus[] = [];
  const recommendations: string[] = [];

  // 1. Environment Configuration
  try {
    const hasValidEnv = validateEnvironment();
    components.push({
      name: "Environment Configuration",
      status: hasValidEnv ? "healthy" : "warning",
      message: hasValidEnv
        ? "All required environment variables configured"
        : "Some environment variables missing",
      critical: true,
    });

    if (!hasValidEnv) {
      recommendations.push(
        "Configure missing environment variables (check console for details)",
      );
    }
  } catch (error) {
    components.push({
      name: "Environment Configuration",
      status: "error",
      message: "Environment validation failed",
      details: error instanceof Error ? error.message : String(error),
      critical: true,
    });
  }

  // 2. Database Connectivity
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const duration = Date.now() - start;

    if (error) {
      components.push({
        name: "Database Connection",
        status: "error",
        message: "Database connection failed",
        details: error.message,
        critical: true,
      });
      recommendations.push("Check Supabase URL and API key configuration");
    } else {
      components.push({
        name: "Database Connection",
        status: duration > 2000 ? "warning" : "healthy",
        message:
          duration > 2000
            ? `Database connection slow (${duration}ms)`
            : `Database connection healthy (${duration}ms)`,
        critical: true,
      });

      if (duration > 2000) {
        recommendations.push(
          "Database queries are slow - check network connectivity or Supabase performance",
        );
      }
    }
  } catch (error) {
    components.push({
      name: "Database Connection",
      status: "error",
      message: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
      critical: true,
    });
  }

  // 3. Authentication System
  try {
    const { data: session, error } = await supabase.auth.getSession();

    if (error) {
      components.push({
        name: "Authentication System",
        status: "warning",
        message: "Authentication system has issues",
        details: error.message,
        critical: true,
      });
    } else {
      components.push({
        name: "Authentication System",
        status: "healthy",
        message: "Authentication system operational",
        critical: true,
      });
    }
  } catch (error) {
    components.push({
      name: "Authentication System",
      status: "error",
      message: "Authentication system failed",
      details: error instanceof Error ? error.message : String(error),
      critical: true,
    });
  }

  // 4. Required Database Tables
  const requiredTables = [
    "profiles",
    "books",
    "orders",
    "payment_intentions",
    "banking_details",
    "notifications",
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        components.push({
          name: `Database Table: ${table}`,
          status: "error",
          message: `Table '${table}' not accessible`,
          details: error.message,
          critical: table === "profiles" || table === "books",
        });

        if (table === "profiles" || table === "books") {
          recommendations.push(
            `Critical table '${table}' is missing or inaccessible - run database migrations`,
          );
        }
      } else {
        components.push({
          name: `Database Table: ${table}`,
          status: "healthy",
          message: `Table '${table}' accessible`,
          critical: false,
        });
      }
    } catch (error) {
      components.push({
        name: `Database Table: ${table}`,
        status: "error",
        message: `Failed to check table '${table}'`,
        details: error instanceof Error ? error.message : String(error),
        critical: table === "profiles" || table === "books",
      });
    }
  }

  // 5. Payment System
  if (ENV.VITE_PAYSTACK_PUBLIC_KEY) {
    const paystackAvailable =
      !!(window as any).PaystackPop || !!(window as any).Paystack;

    components.push({
      name: "Payment System",
      status: paystackAvailable ? "healthy" : "warning",
      message: paystackAvailable
        ? "Payment system ready"
        : "Payment script not loaded",
      details: paystackAvailable
        ? undefined
        : "Paystack library may not be loaded",
      critical: false,
    });

    if (!paystackAvailable) {
      recommendations.push(
        "Payment script (Paystack) not loaded - check if script is properly included",
      );
    }
  } else {
    components.push({
      name: "Payment System",
      status: "warning",
      message: "Payment system not configured",
      details: "VITE_PAYSTACK_PUBLIC_KEY not set",
      critical: false,
    });
    recommendations.push(
      "Configure Paystack public key for payment functionality",
    );
  }

  // 6. Edge Functions (Serverless) - Optional
  try {
    const { error } = await supabase.functions.invoke("check-expired-orders", {
      body: { test: true },
    });

    if (error) {
      components.push({
        name: "Serverless Functions",
        status: "healthy",
        message: "Edge functions not deployed (optional feature)",
        details:
          "Core functionality works without Edge Functions. Deploy them for enhanced payment processing.",
        critical: false,
      });
    } else {
      components.push({
        name: "Serverless Functions",
        status: "healthy",
        message: "Edge functions deployed and accessible",
        critical: false,
      });
    }
  } catch (error) {
    components.push({
      name: "Serverless Functions",
      status: "healthy",
      message: "Edge functions not deployed (optional feature)",
      details: "System works normally without Edge Functions deployed",
      critical: false,
    });
  }

  // 7. Admin Functionality
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("is_admin", true)
      .limit(1);

    if (error) {
      components.push({
        name: "Admin System",
        status: "warning",
        message: "Cannot verify admin accounts",
        details: error.message,
        critical: false,
      });
    } else if (!data || data.length === 0) {
      components.push({
        name: "Admin System",
        status: "warning",
        message: "No admin accounts found",
        details: "No users with admin privileges exist",
        critical: false,
      });
      recommendations.push(
        "Create at least one admin account for system management",
      );
    } else {
      components.push({
        name: "Admin System",
        status: "healthy",
        message: `Admin system functional (${data.length} admin account${data.length === 1 ? "" : "s"})`,
        critical: false,
      });
    }
  } catch (error) {
    components.push({
      name: "Admin System",
      status: "error",
      message: "Admin system check failed",
      details: error instanceof Error ? error.message : String(error),
      critical: false,
    });
  }

  // Determine overall status
  const hasErrors = components.some((c) => c.status === "error" && c.critical);
  const hasWarnings = components.some(
    (c) => c.status === "warning" && c.critical,
  );
  const overallStatus: "healthy" | "warning" | "error" = hasErrors
    ? "error"
    : hasWarnings
      ? "warning"
      : "healthy";

  return {
    overall: overallStatus,
    components,
    lastChecked: new Date().toISOString(),
    recommendations,
  };
};

/**
 * Quick health check for dashboard
 */
export const quickHealthCheck = async (): Promise<{
  status: "healthy" | "warning" | "error";
  message: string;
}> => {
  try {
    // Test only critical components
    const [envValid, dbTest] = await Promise.allSettled([
      Promise.resolve(validateEnvironment()),
      supabase.from("profiles").select("id").limit(1),
    ]);

    const envStatus = envValid.status === "fulfilled" && envValid.value;
    const dbStatus = dbTest.status === "fulfilled" && !dbTest.value.error;

    if (!envStatus && !dbStatus) {
      return {
        status: "error",
        message: "Critical systems offline (environment & database)",
      };
    } else if (!envStatus) {
      return {
        status: "error",
        message: "Environment configuration issues",
      };
    } else if (!dbStatus) {
      return {
        status: "error",
        message: "Database connectivity issues",
      };
    } else {
      return {
        status: "healthy",
        message: "Core systems operational",
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "Health check failed",
    };
  }
};

/**
 * Automated system repair suggestions
 */
export const getRepairSuggestions = (status: SystemStatus): string[] => {
  const suggestions: string[] = [];

  // Environment issues
  const envComponent = status.components.find(
    (c) => c.name === "Environment Configuration",
  );
  if (envComponent?.status === "error" || envComponent?.status === "warning") {
    suggestions.push(
      "Run the following commands to fix environment issues:",
      "1. Copy .env.example to .env",
      "2. Fill in your Supabase credentials",
      "3. Add your Paystack public key",
      "4. Restart the development server",
    );
  }

  // Database issues
  const dbComponent = status.components.find(
    (c) => c.name === "Database Connection",
  );
  if (dbComponent?.status === "error") {
    suggestions.push(
      "Database connection issues can be fixed by:",
      "1. Checking your Supabase URL and API key",
      "2. Ensuring your Supabase project is active",
      "3. Running database migrations if tables are missing",
      "4. Checking your internet connection",
    );
  }

  // Missing tables
  const missingTables = status.components
    .filter((c) => c.name.startsWith("Database Table:") && c.status === "error")
    .map((c) => c.name.replace("Database Table: ", ""));

  if (missingTables.length > 0) {
    suggestions.push(
      `Missing database tables: ${missingTables.join(", ")}`,
      "Run: supabase db reset",
      "Or apply migrations manually",
    );
  }

  return suggestions;
};
