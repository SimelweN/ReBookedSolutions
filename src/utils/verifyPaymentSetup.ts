/**
 * Quick payment system verification
 * Checks critical components needed for payments to work
 */

export const verifyPaymentSetup = async () => {
  const results = {
    paystackKey: false,
    supabaseConnection: false,
    transactionTable: false,
    bankingTable: false,
    edgeFunctions: false,
    errors: [] as string[],
    warnings: [] as string[],
  };

  console.log("🔍 Verifying payment system setup...");

  // Check 1: Paystack Public Key
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (publicKey) {
    if (publicKey.startsWith("pk_")) {
      results.paystackKey = true;
      console.log("✅ Paystack public key: Configured");
    } else {
      results.errors.push("Paystack public key format invalid");
    }
  } else {
    results.errors.push("VITE_PAYSTACK_PUBLIC_KEY not set");
  }

  // Check 2: Supabase Connection
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.getSession();

    if (!error) {
      results.supabaseConnection = true;
      console.log("✅ Supabase connection: Working");
    } else {
      results.errors.push(`Supabase connection error: ${error.message}`);
    }
  } catch (error) {
    results.errors.push(`Supabase import error: ${error}`);
  }

  // Check 3: Database Tables
  try {
    const { supabase } = await import("@/integrations/supabase/client");

    // Test transactions table
    const { error: transError } = await supabase
      .from("transactions")
      .select("id")
      .limit(1);

    if (!transError) {
      results.transactionTable = true;
      console.log("✅ Transactions table: Available");
    } else {
      results.errors.push(`Transactions table error: ${transError.message}`);
    }

    // Test banking_details table
    const { error: bankError } = await supabase
      .from("banking_details")
      .select("id")
      .limit(1);

    if (!bankError) {
      results.bankingTable = true;
      console.log("✅ Banking details table: Available");
    } else {
      results.warnings.push(
        `Banking details table error: ${bankError.message}`,
      );
      console.log(
        "⚠️ Banking details table: Not available (will use fallback)",
      );
    }
  } catch (error) {
    results.errors.push(`Database table check error: ${error}`);
  }

  // Check 4: Edge Functions (basic test)
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.functions.invoke(
      "initialize-paystack-payment",
      {
        body: { test: true },
      },
    );

    if (!error || !error.message?.includes("Failed to send")) {
      results.edgeFunctions = true;
      console.log("✅ Edge Functions: Available");
    } else {
      results.warnings.push(
        "Edge Functions not accessible (payment features limited)",
      );
    }
  } catch (error) {
    results.warnings.push(`Edge Functions test error: ${error}`);
  }

  // Summary
  const criticalPassed =
    results.paystackKey &&
    results.supabaseConnection &&
    results.transactionTable;

  console.log("\n📊 Payment System Verification Results:");
  console.log(
    `Status: ${criticalPassed ? "✅ READY FOR PAYMENTS" : "❌ SETUP INCOMPLETE"}`,
  );

  if (results.errors.length > 0) {
    console.log("\n🚨 Critical Issues:");
    results.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (results.warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    results.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (criticalPassed) {
    console.log("\n🎉 Payment system is ready! You can:");
    console.log("  - List books for sale");
    console.log("  - Process payments through Paystack");
    console.log("  - Handle transactions");
    console.log("  - Manage banking details");
  } else {
    console.log("\n🔧 To fix critical issues:");
    if (!results.paystackKey) {
      console.log("  1. Set VITE_PAYSTACK_PUBLIC_KEY environment variable");
    }
    if (!results.supabaseConnection) {
      console.log("  2. Check Supabase configuration and API key");
    }
    if (!results.transactionTable) {
      console.log("  3. Run database migrations for transactions table");
    }
  }

  return {
    ready: criticalPassed,
    details: results,
  };
};

// Export for console testing
if (import.meta.env.DEV) {
  (window as any).verifyPaymentSetup = verifyPaymentSetup;
  console.log("🔍 Payment verification available: window.verifyPaymentSetup()");
}
