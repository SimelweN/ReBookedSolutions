/**
 * Banking details error debugging utility
 */

import { supabase } from "@/integrations/supabase/client";
import { ImprovedBankingService } from "@/services/improvedBankingService";

export const debugBankingDetails = async () => {
  console.log("🔍 Debugging Banking Details Issues...");

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ No authenticated user found");
      return;
    }

    console.log(`👤 Testing for user: ${user.email} (ID: ${user.id})`);

    // Test 1: Check if banking_details table exists
    console.log("1️⃣ Checking if banking_details table exists...");
    try {
      const { data, error } = await supabase
        .from("banking_details")
        .select("id")
        .limit(1);

      if (error) {
        console.error("❌ Banking details table access failed:");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);

        if (error.code === "42P01") {
          console.error(
            "🚨 TABLE NOT FOUND - The banking_details table does not exist!",
          );
          console.log(
            "💡 Solution: Run the database_setup.sql script in Supabase SQL editor",
          );
        }
      } else {
        console.log("✅ Banking details table exists and is accessible");
      }
    } catch (tableError) {
      console.error("❌ Table check failed:", tableError);
    }

    // Test 2: Test ImprovedBankingService directly
    console.log("2️⃣ Testing ImprovedBankingService...");
    try {
      const details = await ImprovedBankingService.getBankingDetails(user.id);
      if (details) {
        console.log("✅ Banking details retrieved successfully");
        console.log("Details:", {
          recipient_type: details.recipient_type,
          bank_name: details.bank_name,
          account_verified: details.account_verified,
          subaccount_status: details.subaccount_status,
        });
      } else {
        console.log(
          "ℹ️ No banking details found for this user (this is normal for new users)",
        );
      }
    } catch (serviceError) {
      console.error("❌ ImprovedBankingService failed:");
      const errorMessage =
        serviceError instanceof Error
          ? serviceError.message
          : String(serviceError);
      const errorCode = (serviceError as any)?.code || "NO_CODE";
      console.error("Error message:", errorMessage);
      console.error("Error code:", errorCode);
    }

    // Test 3: Test database connectivity
    console.log("3️⃣ Testing general database connectivity...");
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Database connectivity issue:", profileError.message);
      } else {
        console.log("✅ Database connectivity is working");
      }
    } catch (connectError) {
      console.error("❌ Database connection test failed:", connectError);
    }

    // Test 4: Check service availability
    console.log("4️⃣ Checking service availability...");
    try {
      const availability =
        await ImprovedBankingService.checkServiceAvailability();
      console.log("Service availability:", availability);
    } catch (availError) {
      console.error("❌ Service availability check failed:", availError);
    }

    console.log("🎯 Banking details debugging completed!");
  } catch (error) {
    console.error("💥 Banking details debugging crashed:", error);
  }
};

// Make available globally in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).debugBankingDetails = debugBankingDetails;
  console.log("🛠️ Banking details debugger available: debugBankingDetails()");
}

export default debugBankingDetails;
