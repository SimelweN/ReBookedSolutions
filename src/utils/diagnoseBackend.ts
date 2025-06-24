/**
 * Backend diagnostic utility to check what's missing
 */

import { supabase } from "@/integrations/supabase/client";

export const diagnoseBackend = async () => {
  console.log("🔍 BACKEND DIAGNOSTIC STARTING...\n");

  const results = {
    database: {
      connection: false,
      tables: {
        profiles: false,
        books: false,
        transactions: false,
        banking_details: false,
        notifications: false,
        reports: false,
        contact_messages: false,
      },
    },
    auth: {
      userLoggedIn: false,
      hasProfile: false,
    },
    edgeFunctions: {
      available: false,
      paymentFunctions: false,
    },
    environment: {
      paystackKey: false,
      supabaseUrl: false,
    },
  };

  // 1. Check Database Connection
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    results.database.connection = !error;
    console.log(
      `${results.database.connection ? "✅" : "❌"} Database Connection`,
    );
  } catch (error) {
    console.log("❌ Database Connection - Error:", error);
  }

  // 2. Check Tables
  const tables = [
    "profiles",
    "books",
    "transactions",
    "banking_details",
    "notifications",
    "reports",
    "contact_messages",
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("*").limit(1);
      results.database.tables[table as keyof typeof results.database.tables] =
        !error;
      console.log(
        `${!error ? "✅" : "❌"} Table: ${table}${error ? ` - ${error.message}` : ""}`,
      );
    } catch (error) {
      console.log(`❌ Table: ${table} - Error:`, error);
    }
  }

  // 3. Check Authentication
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    results.auth.userLoggedIn = !!user && !error;
    console.log(
      `${results.auth.userLoggedIn ? "✅" : "❌"} User Authentication${user ? ` - ${user.email}` : ""}`,
    );

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      results.auth.hasProfile = !!profile && !profileError;
      console.log(
        `${results.auth.hasProfile ? "✅" : "❌"} User Profile${profileError ? ` - ${profileError.message}` : ""}`,
      );
    }
  } catch (error) {
    console.log("❌ Authentication check failed:", error);
  }

  // 4. Check Edge Functions
  try {
    const { error } = await supabase.functions.invoke(
      "create-paystack-subaccount",
      {
        body: { test: true },
      },
    );

    results.edgeFunctions.available =
      !error || !error.message?.includes("Failed to send");
    results.edgeFunctions.paymentFunctions = results.edgeFunctions.available;

    console.log(
      `${results.edgeFunctions.available ? "✅" : "❌"} Edge Functions${error ? ` - ${error.message}` : ""}`,
    );
  } catch (error) {
    console.log("❌ Edge Functions check failed:", error);
  }

  // 5. Check Environment Variables
  results.environment.paystackKey = !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  results.environment.supabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;

  console.log(
    `${results.environment.paystackKey ? "✅" : "❌"} Paystack Public Key`,
  );
  console.log(`${results.environment.supabaseUrl ? "✅" : "❌"} Supabase URL`);

  // 6. Overall Assessment
  console.log("\n📊 DIAGNOSTIC SUMMARY:");

  const criticalIssues = [];
  if (!results.database.connection)
    criticalIssues.push("Database connection failed");
  if (!results.database.tables.profiles)
    criticalIssues.push("Profiles table missing/inaccessible");
  if (!results.environment.paystackKey)
    criticalIssues.push("Paystack public key missing");
  if (!results.environment.supabaseUrl)
    criticalIssues.push("Supabase URL missing");

  const warnings = [];
  if (!results.edgeFunctions.available)
    warnings.push("Edge Functions not deployed");
  if (!results.database.tables.banking_details)
    warnings.push("Banking details table missing");
  if (!results.database.tables.transactions)
    warnings.push("Transactions table missing");

  if (criticalIssues.length === 0) {
    console.log("🎉 BACKEND STATUS: OPERATIONAL");
  } else {
    console.log("🚨 BACKEND STATUS: CRITICAL ISSUES FOUND");
    criticalIssues.forEach((issue) => console.log(`   - ${issue}`));
  }

  if (warnings.length > 0) {
    console.log("⚠️ WARNINGS:");
    warnings.forEach((warning) => console.log(`   - ${warning}`));
  }

  // 7. Next Steps
  console.log("\n🔧 NEXT STEPS:");

  if (!results.database.tables.profiles) {
    console.log(
      "1. CREATE PROFILES TABLE - This is causing the loading spinner!",
    );
    console.log(
      "   Run the profiles table SQL from MISSING_BACKEND_COMPONENTS.md",
    );
  }

  if (!results.edgeFunctions.available) {
    console.log("2. DEPLOY EDGE FUNCTIONS for payment processing");
    console.log("   Run: supabase functions deploy create-paystack-subaccount");
  }

  if (!results.environment.paystackKey) {
    console.log("3. SET PAYSTACK_PUBLIC_KEY environment variable");
  }

  return results;
};

// Make available globally
if (import.meta.env.DEV) {
  (window as any).diagnoseBackend = diagnoseBackend;
  console.log("🔍 Backend diagnostic available: diagnoseBackend()");
}
