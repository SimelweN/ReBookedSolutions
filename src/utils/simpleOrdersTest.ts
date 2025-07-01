import { supabase } from "@/integrations/supabase/client";

export async function testOrdersTableSimple() {
  try {
    console.log("🔍 Testing orders table (simple test)...");

    // Very basic test - just check if table exists
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Orders table error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      });
      return {
        success: false,
        error: error.message || "Unknown error",
        message: "Orders table not accessible",
      };
    }

    console.log("✅ Orders table exists and is accessible");
    console.log("📊 Table has", count, "rows");

    return {
      success: true,
      message: "Orders table is working correctly",
      count: count,
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

// Test user permissions
export async function testUserPermissions() {
  try {
    console.log("🔍 Testing user permissions...");

    // Test current user
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ User auth error:", userError);
      return { success: false, error: userError.message };
    }

    console.log("👤 Current user:", user.user?.email, user.user?.id);

    // Test profile access
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", user.user?.id)
      .single();

    if (profileError) {
      console.error("❌ Profile access error:", profileError);
      return { success: false, error: profileError.message };
    }

    console.log("✅ User profile accessible:", profile);

    return { success: true, user: user.user, profile };
  } catch (error) {
    console.error("❌ Exception testing permissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Auto-run tests in development
if (import.meta.env.DEV) {
  setTimeout(async () => {
    console.log("🧪 Running database tests...");

    const permTest = await testUserPermissions();
    if (permTest.success) {
      console.log("✅ User permissions OK");
    } else {
      console.error("❌ User permission test failed:", permTest.error);
    }

    const ordersTest = await testOrdersTableSimple();
    if (ordersTest.success) {
      console.log("🎉 Orders table test passed!");
    } else {
      console.error("❌ Orders table test failed:", ordersTest.error);
    }
  }, 3000);
}
