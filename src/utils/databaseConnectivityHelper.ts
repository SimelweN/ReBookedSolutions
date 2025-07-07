import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorUtils";

interface DatabaseStatus {
  isConnected: boolean;
  tablesExist: {
    profiles: boolean;
    books: boolean;
    transactions: boolean;
    banking_details: boolean;
    notifications: boolean;
  };
  errors: string[];
  setupInstructions?: string;
}

/**
 * Check database connectivity and table existence
 * This helps diagnose loading spinner issues
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    isConnected: false,
    tablesExist: {
      profiles: false,
      books: false,
      transactions: false,
      banking_details: false,
      notifications: false,
    },
    errors: [],
  };

  try {
    // Test basic connection - handle both real and mock Supabase client
    try {
      const { error: connectionError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (connectionError) {
        if (connectionError.message?.includes("Supabase not configured")) {
          status.errors.push(
            "Supabase client not properly configured - check environment variables",
          );
          status.setupInstructions =
            "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables";
        } else if (
          connectionError.message?.includes("relation") &&
          connectionError.message?.includes("does not exist")
        ) {
          status.errors.push(
            "Profiles table does not exist - this is the main cause of loading spinner",
          );
          status.setupInstructions =
            "Run the complete_database_setup.sql script in your Supabase SQL editor";
        } else if (connectionError.message?.includes("permission denied")) {
          status.errors.push("Permission denied accessing profiles table");
          status.setupInstructions = "Check RLS policies in Supabase dashboard";
        } else {
          status.errors.push(
            `Database connection error: ${connectionError.message}`,
          );
        }
      } else {
        status.isConnected = true;
        status.tablesExist.profiles = true;
      }
    } catch (queryError: any) {
      if (queryError.message?.includes("Supabase not configured")) {
        status.errors.push(
          "Supabase client not properly configured - check environment variables",
        );
        status.setupInstructions =
          "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables";
      } else {
        status.errors.push(
          `Failed to execute database query: ${queryError.message}`,
        );
      }
    }

    // Check other critical tables
    const tablesToCheck = [
      "books",
      "transactions",
      "banking_details",
      "notifications",
    ];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1);

        if (!error) {
          status.tablesExist[table as keyof typeof status.tablesExist] = true;
        } else if (
          error.message?.includes("relation") &&
          error.message?.includes("does not exist")
        ) {
          status.errors.push(`${table} table does not exist`);
        }
      } catch (error) {
        status.errors.push(`Error checking ${table} table: ${error}`);
      }
    }
  } catch (error) {
    status.errors.push(`Critical database error: ${error}`);
    logError("Database status check failed", error);
  }

  return status;
}

/**
 * Create a fallback user profile when database is unavailable
 */
export function createFallbackProfile(user: any) {
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    isAdmin: ["AdminSimnLi@gmail.com", "adminsimnli@gmail.com"].includes(
      user.email?.toLowerCase() || "",
    ),
    status: "active",
    profile_picture_url: user.user_metadata?.avatar_url,
    bio: undefined,
  };
}

/**
 * Log database status to console in development
 */
export async function logDatabaseStatus() {
  if (import.meta.env.DEV) {
    const status = await checkDatabaseStatus();

    console.group("🗄️ Database Status Check");
    console.log("Connected:", status.isConnected);
    console.log("Tables exist:", status.tablesExist);

    if (status.errors.length > 0) {
      console.warn("Errors found:");
      status.errors.forEach((error) => console.warn("  -", error));
    }

    if (status.setupInstructions) {
      console.info("Setup instructions:", status.setupInstructions);
    }

    console.groupEnd();
  }
}

// Auto-run status check in development
if (import.meta.env.DEV) {
  setTimeout(logDatabaseStatus, 2000);
}
