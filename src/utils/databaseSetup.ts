/**
 * Database Setup and Health Check Utility
 * Automatically sets up missing tables and checks database health
 */

import { supabase } from "@/integrations/supabase/client";
import { validateEnvironment } from "@/config/environment";

interface DatabaseHealth {
  connected: boolean;
  tablesExist: boolean;
  rlsEnabled: boolean;
  missingTables: string[];
  errors: string[];
}

const REQUIRED_TABLES = [
  "profiles",
  "books",
  "orders",
  "payments",
  "notifications",
  "audit_logs",
  "banking_subaccounts",
  "study_resources",
  "study_resource_categories",
  "institutions",
];

/**
 * Check if all required tables exist
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const health: DatabaseHealth = {
    connected: false,
    tablesExist: false,
    rlsEnabled: false,
    missingTables: [],
    errors: [],
  };

  try {
    // First validate environment
    if (!validateEnvironment()) {
      health.errors.push("Environment variables not properly configured");
      return health;
    }

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (connectionError) {
      if (
        connectionError.message.includes('relation "profiles" does not exist')
      ) {
        health.errors.push("Database tables not created");
        health.missingTables = REQUIRED_TABLES;
      } else {
        health.errors.push(`Connection error: ${connectionError.message}`);
      }
      return health;
    }

    health.connected = true;

    // Check which tables exist
    for (const table of REQUIRED_TABLES) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);

        if (error && error.message.includes("does not exist")) {
          health.missingTables.push(table);
        }
      } catch (err) {
        health.missingTables.push(table);
      }
    }

    health.tablesExist = health.missingTables.length === 0;

    // Check RLS (basic test)
    try {
      const { error } = await supabase.rpc("has_table_privilege", {
        table_name: "profiles",
        privilege: "SELECT",
      });
      health.rlsEnabled = !error;
    } catch {
      health.rlsEnabled = false;
    }
  } catch (error) {
    health.errors.push(`Health check failed: ${error}`);
  }

  return health;
}

/**
 * Create the profiles table with basic structure
 */
async function createProfilesTable() {
  const { error } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        profile_picture_url TEXT,
        bio TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'active',
        subaccount_code TEXT,
        phone TEXT,
        address JSONB
      );
      
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own profile" ON profiles 
        FOR SELECT USING (auth.uid() = id);
      CREATE POLICY "Users can update own profile" ON profiles 
        FOR UPDATE USING (auth.uid() = id);
    `,
  });

  return !error;
}

/**
 * Create essential tables for basic functionality
 */
export async function createEssentialTables(): Promise<boolean> {
  try {
    console.log("Creating essential database tables...");

    // Check if we can create tables (this requires proper permissions)
    const { data, error } = await supabase.rpc("version");

    if (error) {
      console.error("Cannot access database functions. Manual setup required.");
      return false;
    }

    // Try to create profiles table first
    const profilesCreated = await createProfilesTable();

    if (!profilesCreated) {
      console.error(
        "Failed to create profiles table. Please run the SQL setup script manually.",
      );
      return false;
    }

    console.log("✅ Essential tables created successfully");
    return true;
  } catch (error) {
    console.error("Failed to create tables:", error);
    return false;
  }
}

/**
 * Initialize user profile after signup
 */
export async function initializeUserProfile(user: any): Promise<boolean> {
  try {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

    if (error) {
      console.error("Failed to initialize user profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Profile initialization error:", error);
    return false;
  }
}

/**
 * Get database setup instructions
 */
export function getDatabaseSetupInstructions(): string {
  return `
🗄️ DATABASE SETUP REQUIRED

Your database needs to be set up. Please follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from 'scripts/setup-database.sql'
4. Execute the script
5. Refresh this page

OR

1. Use the Supabase CLI:
   supabase db reset
   supabase db push

For more help, visit: https://supabase.com/docs/guides/database
  `;
}

/**
 * Auto-setup database if possible
 */
export async function autoSetupDatabase(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const health = await checkDatabaseHealth();

    if (health.connected && health.tablesExist) {
      return { success: true, message: "Database is properly configured" };
    }

    if (!health.connected) {
      return {
        success: false,
        message: "Cannot connect to database. Check your Supabase credentials.",
      };
    }

    // Try to create essential tables
    const created = await createEssentialTables();

    if (created) {
      return {
        success: true,
        message: "Database tables created successfully",
      };
    } else {
      return {
        success: false,
        message: getDatabaseSetupInstructions(),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Database setup failed: ${error}`,
    };
  }
}

/**
 * Create admin user (should be run once)
 */
export async function createAdminUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", userId);

    return !error;
  } catch (error) {
    console.error("Failed to create admin user:", error);
    return false;
  }
}
