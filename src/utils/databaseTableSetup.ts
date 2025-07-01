import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TableSetupResult {
  table: string;
  status: "exists" | "created" | "failed";
  message: string;
  error?: string;
}

export interface DatabaseSetupSummary {
  totalChecked: number;
  alreadyExists: number;
  created: number;
  failed: number;
  results: TableSetupResult[];
}

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("*").limit(0);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Test the orders table (should be created manually)
 */
async function testOrdersTable(): Promise<TableSetupResult> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, buyer_email, seller_id, amount, status")
      .limit(1);

    if (error) {
      return {
        table: "orders",
        status: "failed",
        message: "Orders table not accessible - needs to be created manually",
        error: error.message,
      };
    }

    return {
      table: "orders",
      status: "exists",
      message: "Orders table exists and is accessible ✅",
    };
  } catch (error) {
    return {
      table: "orders",
      status: "failed",
      message: "Exception while testing orders table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test the profiles table
 */
async function testProfilesTable(): Promise<TableSetupResult> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email")
      .limit(1);

    if (error) {
      return {
        table: "profiles",
        status: "failed",
        message: "Profiles table not accessible",
        error: error.message,
      };
    }

    return {
      table: "profiles",
      status: "exists",
      message: "Profiles table exists and is accessible ✅",
    };
  } catch (error) {
    return {
      table: "profiles",
      status: "failed",
      message: "Exception while testing profiles table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test the books table
 */
async function testBooksTable(): Promise<TableSetupResult> {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, price")
      .limit(1);

    if (error) {
      return {
        table: "books",
        status: "failed",
        message: "Books table not accessible",
        error: error.message,
      };
    }

    return {
      table: "books",
      status: "exists",
      message: "Books table exists and is accessible ✅",
    };
  } catch (error) {
    return {
      table: "books",
      status: "failed",
      message: "Exception while testing books table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test the banking_details table
 */
async function testBankingDetailsTable(): Promise<TableSetupResult> {
  try {
    const { data, error } = await supabase
      .from("banking_details")
      .select("id, user_id")
      .limit(1);

    if (error) {
      return {
        table: "banking_details",
        status: "failed",
        message: "Banking details table not accessible",
        error: error.message,
      };
    }

    return {
      table: "banking_details",
      status: "exists",
      message: "Banking details table exists and is accessible ✅",
    };
  } catch (error) {
    return {
      table: "banking_details",
      status: "failed",
      message: "Exception while testing banking details table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test payment-related service functionality
 */
async function testPaymentService(): Promise<TableSetupResult> {
  try {
    // Test if we can access the orders table for payment operations
    const { data, error } = await supabase
      .from("orders")
      .select("id, paystack_ref, status, amount")
      .eq("status", "paid")
      .limit(1);

    if (error) {
      return {
        table: "payment_service",
        status: "failed",
        message: "Cannot query orders for payment operations",
        error: error.message,
      };
    }

    return {
      table: "payment_service",
      status: "exists",
      message: "Payment service can access orders table ✅",
    };
  } catch (error) {
    return {
      table: "payment_service",
      status: "failed",
      message: "Payment service test failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main function to test all database tables
 */
export async function setupDatabaseTables(
  progressCallback?: (message: string) => void,
): Promise<DatabaseSetupSummary> {
  const results: TableSetupResult[] = [];

  const tables = [
    { name: "orders", testFn: testOrdersTable },
    { name: "profiles", testFn: testProfilesTable },
    { name: "books", testFn: testBooksTable },
    { name: "banking_details", testFn: testBankingDetailsTable },
    { name: "payment_service", testFn: testPaymentService },
  ];

  progressCallback?.("🔍 Testing database tables...");

  for (const table of tables) {
    try {
      progressCallback?.(`📋 Testing ${table.name}...`);

      const result = await table.testFn();
      results.push(result);

      if (result.status === "exists") {
        progressCallback?.(`✅ ${table.name} - ${result.message}`);
      } else {
        progressCallback?.(`❌ ${table.name} - ${result.message}`);
      }
    } catch (error) {
      const errorResult: TableSetupResult = {
        table: table.name,
        status: "failed",
        message: `Exception testing ${table.name}`,
        error: error instanceof Error ? error.message : String(error),
      };
      results.push(errorResult);
      progressCallback?.(`❌ Error with ${table.name}: ${errorResult.error}`);
    }
  }

  const summary: DatabaseSetupSummary = {
    totalChecked: results.length,
    alreadyExists: results.filter((r) => r.status === "exists").length,
    created: 0, // We don't create tables, just test them
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };

  // Show summary toast
  if (summary.failed > 0) {
    toast.error(
      `Database test completed with ${summary.failed} failures. Check details below.`,
    );
  } else {
    toast.success(
      `All ${summary.alreadyExists} database tables are working correctly!`,
    );
  }

  return summary;
}

/**
 * Quick check to see if orders table exists
 */
export async function checkOrdersTableExists(): Promise<boolean> {
  return await tableExists("orders");
}
