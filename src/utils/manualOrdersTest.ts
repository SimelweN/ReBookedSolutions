import { supabase } from "@/integrations/supabase/client";

export async function manualOrdersTest() {
  console.log("🧪 Starting manual orders table test...");

  try {
    // Test 1: Basic table existence
    console.log("📋 Test 1: Check table existence...");
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Test 1 failed - Table access error:", {
        message: countError.message,
        details: countError.details,
        hint: countError.hint,
        code: countError.code,
      });
      return false;
    }

    console.log("✅ Test 1 passed - Orders table exists with", count, "rows");

    // Test 2: Current user info (optional)
    console.log("📋 Test 2: Check current user...");
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      console.log("ℹ️ Test 2 - No user session (not logged in)");
      console.log("📋 Test 3: Skip RLS test - requires authentication");

      // Skip RLS test since no user is logged in
      console.log("✅ Orders table exists but RLS test skipped (no auth)");
    } else {
      console.log(
        "✅ Test 2 passed - User:",
        user.user?.email,
        "ID:",
        user.user?.id,
      );

      // Test 3: Try to select from orders (should work with RLS)
      console.log("📋 Test 3: Try to read orders with RLS...");
      const { data: orders, error: selectError } = await supabase
        .from("orders")
        .select("id, buyer_email, status, amount")
        .limit(5);

      if (selectError) {
        console.log(
          "⚠️ Test 3 - RLS blocking access (expected if no orders for this user):",
          selectError.message,
        );
      } else {
        console.log("✅ Test 3 passed - Can read orders:", orders);
      }
    }

    // Test 4: Test payment service access
    console.log("📋 Test 4: Test payment service debug...");
    const { default: PaystackPaymentService } = await import(
      "../services/paystackPaymentService"
    );
    await PaystackPaymentService.debugOrdersTable();

    console.log(
      "🎉 Orders table basic tests passed! Table exists and is accessible.",
    );
    return true;
  } catch (error) {
    console.error("❌ Manual test exception:", error);
    return false;
  }
}

// Run the test
if (import.meta.env.DEV) {
  setTimeout(() => {
    manualOrdersTest().then((success) => {
      if (success) {
        console.log("🎉 ORDERS TABLE IS WORKING! ✅");
      } else {
        console.log("❌ ORDERS TABLE STILL HAS ISSUES");
      }
    });
  }, 2000);
}
