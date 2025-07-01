import { supabase } from "@/integrations/supabase/client";

export async function testOrdersTable() {
  try {
    console.log("🔍 Testing orders table...");

    // Test basic table access
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, buyer_email, seller_id, amount, status, paystack_ref, created_at",
      )
      .limit(1);

    if (error) {
      console.error("❌ Orders table error:", error);
      return {
        success: false,
        error: error.message,
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
