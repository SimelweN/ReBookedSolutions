import { supabase } from "@/integrations/supabase/client";

export async function basicOrdersTest() {
  console.log("🔍 Basic orders table existence test (no auth required)...");

  try {
    // Test table existence without authentication
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Orders table does not exist or is not accessible:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });

      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        console.log(
          "💡 Solution: You need to create the orders table in Supabase",
        );
        return { exists: false, needsCreation: true };
      }

      return { exists: false, error: error.message };
    }

    console.log("✅ Orders table exists and has", count, "rows");
    console.log("✅ The 'public.orders does not exist' error should be fixed!");

    return { exists: true, count };
  } catch (error) {
    console.error("❌ Exception testing orders table:", error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test authentication status
export async function checkAuthStatus() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log("ℹ️ Auth check error (not critical):", error.message);
      return { authenticated: false };
    }

    if (session?.user) {
      console.log("✅ User is authenticated:", session.user.email);
      return { authenticated: true, user: session.user };
    } else {
      console.log("ℹ️ User is not authenticated (logged out)");
      return { authenticated: false };
    }
  } catch (error) {
    console.log("ℹ️ Auth status unknown:", error);
    return { authenticated: false };
  }
}

// Run both tests
if (import.meta.env.DEV) {
  setTimeout(async () => {
    console.log("🧪 Running basic database tests...");

    const authStatus = await checkAuthStatus();
    const ordersTest = await basicOrdersTest();

    if (ordersTest.exists) {
      console.log(
        "🎉 SUCCESS: Orders table is working! The payment errors should be fixed.",
      );
      if (authStatus.authenticated) {
        console.log("✅ User is logged in - full functionality available");
      } else {
        console.log("ℹ️ User not logged in - log in to test payment features");
      }
    } else if (ordersTest.needsCreation) {
      console.log(
        "❌ Orders table still needs to be created in Supabase dashboard",
      );
    } else {
      console.log("❌ Orders table test failed:", ordersTest.error);
    }
  }, 1500);
}
