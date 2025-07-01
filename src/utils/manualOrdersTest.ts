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

    // Test 2: Current user info
    console.log("📋 Test 2: Check current user...");
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Test 2 failed - User error:", userError);
      return false;
    }

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
      console.error("❌ Test 3 failed - Select error:", {
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
        code: selectError.code,
      });
      return false;
    }

    console.log("✅ Test 3 passed - Can read orders:", orders);

    // Test 4: Test payment service access
    console.log("📋 Test 4: Test payment service debug...");
    const { default: PaystackPaymentService } = await import(
      "../services/paystackPaymentService"
    );
    await PaystackPaymentService.debugOrdersTable();

    console.log("🎉 All tests passed! Orders table is working correctly.");
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
