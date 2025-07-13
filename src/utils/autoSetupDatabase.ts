/**
 * Automated database setup utility
 * Attempts to create missing tables automatically
 */

import { supabase } from "@/integrations/supabase/client";

export interface SetupResult {
  success: boolean;
  message: string;
  tablesCreated: string[];
  errors: string[];
}

/**
 * Check if database tables exist
 */
export const checkDatabaseTables = async (): Promise<{
  missing: string[];
  existing: string[];
}> => {
  const requiredTables = [
    "profiles",
    "books",
    "orders",
    "payments",
    "notifications",
  ];
  const missing: string[] = [];
  const existing: string[] = [];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (error) {
        missing.push(table);
      } else {
        existing.push(table);
      }
    } catch {
      missing.push(table);
    }
  }

  return { missing, existing };
};

/**
 * Attempt to create missing tables
 * Note: This requires elevated permissions and may not work with anon key
 */
export const createMissingTables = async (): Promise<SetupResult> => {
  const result: SetupResult = {
    success: false,
    message: "",
    tablesCreated: [],
    errors: [],
  };

  try {
    // Check current status
    const { missing } = await checkDatabaseTables();

    if (missing.length === 0) {
      result.success = true;
      result.message = "All required tables already exist!";
      return result;
    }

    // For security reasons, we can't auto-create tables with anon key
    // Instead, provide clear instructions
    result.success = false;
    result.message = `Missing tables: ${missing.join(", ")}. Manual setup required.`;
    result.errors.push(
      "Automatic table creation requires admin privileges. Please run the SQL script manually.",
    );

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error during setup",
    );
    result.message = "Database setup failed. Please check your configuration.";
    return result;
  }
};

/**
 * Get setup instructions for manual database creation
 */
export const getSetupInstructions = () => {
  return {
    title: "Database Setup Required",
    steps: [
      "Open your Supabase dashboard",
      "Navigate to the SQL Editor",
      "Copy the content from scripts/setup-database.sql",
      "Paste and run the SQL script",
      "Refresh this page to verify setup",
    ],
    dashboardUrl:
      "https://supabase.com/dashboard/project/kbpjqzaqbqukutflwixf/editor",
    sqlScriptPath: "scripts/setup-database.sql",
  };
};

/**
 * Comprehensive database health check
 */
export const performDatabaseHealthCheck = async () => {
  try {
    const { missing, existing } = await checkDatabaseTables();

    return {
      isHealthy: missing.length === 0,
      status: missing.length === 0 ? "ready" : "setup_required",
      details: {
        existingTables: existing,
        missingTables: missing,
        totalRequired: 5,
        progress: `${existing.length}/5 tables ready`,
      },
      instructions: missing.length > 0 ? getSetupInstructions() : null,
    };
  } catch (error) {
    return {
      isHealthy: false,
      status: "error",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        existingTables: [],
        missingTables: ["unknown"],
        totalRequired: 5,
        progress: "0/5 tables ready",
      },
      instructions: getSetupInstructions(),
    };
  }
};
