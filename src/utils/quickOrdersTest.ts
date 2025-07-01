import { supabase } from "@/integrations/supabase/client";

export async function testOrdersTable() {
  try {
    console.log("🔍 Testing orders table...");

    // Test basic table access without triggering foreign key checks
    const { data, error } = await supabase
      .from("orders")
      .select("id, buyer_email, amount, status")
      .limit(0); // Just test table existence, don't fetch data

    if (error) {
      console.error("❌ Orders table error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        success: false,
        error: error.message || error.details || JSON.stringify(error),
        message: "Orders table not accessible",
      };
    }

    console.log("✅ Orders table exists and is accessible");
    console.log("📊 Sample data:", data);

    return {
      success: true,
      message: "Orders table is working correctly",
      data: data,
    };
  } catch (error) {
    console.error("❌ Exception testing orders table:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: "Exception while testing orders table",
    };
  }
}

// Auto-run the test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testOrdersTable().then((result) => {
      if (result.success) {
        console.log("🎉 Orders table test passed!");
      } else {
        console.error("❌ Orders table test failed:", result.error);
      }
    });
  }, 2000);
}
