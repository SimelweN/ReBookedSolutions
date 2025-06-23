/**
 * Database setup utility for creating required tables
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class DatabaseSetup {
  /**
   * Check if banking_details table exists and is accessible
   */
  static async checkBankingTableExists(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("banking_details")
        .select("id")
        .limit(1);

      return !error;
    } catch (error) {
      console.log("Banking details table check failed:", error);
      return false;
    }
  }

  /**
   * Create banking_details table using SQL
   */
  static async createBankingDetailsTable(): Promise<boolean> {
    try {
      console.log("Creating banking_details table...");

      const createTableSQL = `
        -- Create banking_details table for secure storage of user banking information
        CREATE TABLE IF NOT EXISTS public.banking_details (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            recipient_type TEXT NOT NULL,
            full_name TEXT NOT NULL,
            bank_account_number TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            branch_code TEXT NOT NULL,
            account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current')),
            paystack_subaccount_code TEXT,
            paystack_subaccount_id TEXT,
            subaccount_status TEXT DEFAULT 'pending' CHECK (subaccount_status IN ('pending', 'active', 'inactive')),
            account_verified BOOLEAN DEFAULT false NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(user_id)
        );

        -- Enable Row Level Security (RLS)
        ALTER TABLE public.banking_details ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for banking_details
        CREATE POLICY IF NOT EXISTS "Users can view their own banking details" ON public.banking_details
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own banking details" ON public.banking_details
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own banking details" ON public.banking_details
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own banking details" ON public.banking_details
            FOR DELETE
            USING (auth.uid() = user_id);

        -- Grant necessary permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_details TO authenticated;
        GRANT USAGE ON SCHEMA public TO authenticated;
      `;

      const { error } = await supabase.rpc("exec_sql", { sql: createTableSQL });

      if (error) {
        console.error("Failed to create banking_details table:", error);
        return false;
      }

      console.log("✅ Banking details table created successfully");
      return true;
    } catch (error) {
      console.error("Error creating banking_details table:", error);
      return false;
    }
  }

  /**
   * Setup banking details table if it doesn't exist
   */
  static async ensureBankingTableExists(): Promise<boolean> {
    const exists = await this.checkBankingTableExists();

    if (exists) {
      console.log("✅ Banking details table already exists");
      return true;
    }

    console.log("⚠️ Banking details table not found, attempting to create...");

    // Try to create the table automatically using a simpler approach
    try {
      console.log("Attempting to create banking_details table...");

      // First try a simple create table statement
      const { error } = await supabase.rpc("exec_sql_if_exists", {
        sql_statement: `
          CREATE TABLE IF NOT EXISTS public.banking_details (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID NOT NULL,
              recipient_type TEXT NOT NULL,
              full_name TEXT NOT NULL,
              bank_account_number TEXT NOT NULL,
              bank_name TEXT NOT NULL,
              branch_code TEXT NOT NULL,
              account_type TEXT NOT NULL,
              paystack_subaccount_code TEXT,
              paystack_subaccount_id TEXT,
              subaccount_status TEXT DEFAULT 'pending',
              account_verified BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id)
          );
        `,
      });

      if (!error) {
        // Verify table was created
        const tableExists = await this.checkBankingTableExists();
        if (tableExists) {
          console.log("✅ Banking details table created successfully");
          toast.success("Banking details feature is now available!");
          return true;
        }
      }
    } catch (createError) {
      console.log("Automatic table creation failed:", createError);
    }

    // If automatic creation fails, show helpful instructions
    console.log(
      "⚠️ Automatic table creation not possible, showing setup instructions",
    );

    toast.error("Banking details table needs to be created manually.", {
      description:
        "Please run the database_setup.sql script in your Supabase SQL editor, or contact support for assistance.",
      duration: 15000,
    });

    return false;
  }

  /**
   * Test database connectivity and permissions
   */
  static async testDatabaseAccess(): Promise<{
    connected: boolean;
    canRead: boolean;
    canWrite: boolean;
    bankingTableExists: boolean;
  }> {
    try {
      // Test basic connectivity
      const { error: connectError } = await supabase.auth.getSession();
      const connected = !connectError;

      // Test read access
      const { error: readError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      const canRead = !readError;

      // Test banking table access
      const bankingTableExists = await this.checkBankingTableExists();

      // Test write access (try to query banking table if it exists)
      let canWrite = false;
      if (bankingTableExists) {
        const { error: writeError } = await supabase
          .from("banking_details")
          .select("id")
          .limit(1);
        canWrite = !writeError;
      }

      return {
        connected,
        canRead,
        canWrite,
        bankingTableExists,
      };
    } catch (error) {
      console.error("Database access test failed:", error);
      return {
        connected: false,
        canRead: false,
        canWrite: false,
        bankingTableExists: false,
      };
    }
  }

  /**
   * Show user-friendly setup instructions
   */
  static async showSetupInstructions(): Promise<void> {
    const status = await this.testDatabaseAccess();

    console.log("📊 Database Status:", status);

    if (!status.connected) {
      toast.error(
        "Database connection failed. Please check your internet connection.",
      );
      return;
    }

    if (!status.canRead) {
      toast.error(
        "Database read access denied. Please check your authentication.",
      );
      return;
    }

    if (!status.bankingTableExists) {
      toast.info(
        "Banking details feature is being set up. Please contact support if this persists.",
        {
          description:
            "The banking_details table needs to be created by a database administrator.",
          duration: 8000,
        },
      );
      return;
    }

    if (!status.canWrite) {
      toast.error(
        "Database write access denied. Please check your permissions.",
      );
      return;
    }

    toast.success("Database is properly configured for banking details!");
  }
}

// Make available globally in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).DatabaseSetup = DatabaseSetup;
  console.log(
    "🛠️ Database setup utility available: DatabaseSetup.showSetupInstructions()",
  );
}

export default DatabaseSetup;
