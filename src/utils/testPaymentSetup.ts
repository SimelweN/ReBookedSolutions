/**
 * Testing utility for payment setup and requirements
 */

import { supabase } from "@/integrations/supabase/client";
import { ImprovedBankingService } from "@/services/improvedBankingService";
import { canUserListBooks } from "@/services/addressValidationService";

export const testPaymentSetup = async () => {
  console.log("🧪 Testing Payment Setup Requirements...");

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

    console.log(`👤 Testing for user: ${user.email}`);

    // Test 1: Check if user can list books
    console.log("1️⃣ Checking book listing requirements...");
    const canList = await canUserListBooks(user.id);
    console.log(`   Can list books: ${canList ? "✅" : "❌"}`);

    // Test 2: Check address setup
    console.log("2️⃣ Checking address setup...");
    const { data: profileData } = await supabase
      .from("profiles")
      .select("addresses_same, pickup_address, shipping_address")
      .eq("id", user.id)
      .single();

    if (profileData) {
      console.log(
        `   Addresses configured: ${profileData.addresses_same !== null ? "✅" : "❌"}`,
      );
      console.log(
        `   Pickup address: ${profileData.pickup_address ? "✅" : "❌"}`,
      );
      console.log(
        `   Shipping address: ${profileData.shipping_address ? "✅" : "❌"}`,
      );
    } else {
      console.log("   ❌ No profile data found");
    }

    // Test 3: Check banking details
    console.log("3️⃣ Checking banking details...");
    const { data: bankingData } = await supabase
      .from("banking_details")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (bankingData) {
      console.log(`   Banking details exist: ✅`);
      console.log(
        `   Account verified: ${bankingData.account_verified ? "✅" : "❌"}`,
      );
      console.log(
        `   Paystack subaccount: ${bankingData.paystack_subaccount_code ? "✅" : "❌"}`,
      );
      console.log(`   Bank: ${bankingData.bank_name || "Not set"}`);
    } else {
      console.log("   ❌ No banking details found");
    }

    // Test 4: Test Edge Function availability
    console.log("4️⃣ Testing Edge Function connectivity...");
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-paystack-subaccount",
        {
          body: {
            business_name: "Test Business",
            bank_name: "Test Bank",
            account_number: "1234567890",
            primary_contact_email: "test@example.com",
            primary_contact_name: "Test User",
          },
        },
      );

      if (error) {
        console.log(
          `   Edge Function accessible but returned error: ${error.message}`,
        );
        if (error.message.includes("PAYSTACK_SECRET_KEY")) {
          console.log("   ⚠️ Paystack secret key not configured on server");
        }
      } else {
        console.log("   ✅ Edge Function accessible and responding");
      }
    } catch (funcError) {
      console.log(`   ❌ Edge Function not accessible: ${funcError}`);
    }

    // Summary
    console.log("\n📊 Summary:");
    if (canList) {
      console.log("✅ User meets all requirements to list books");
    } else {
      console.log("❌ User does not meet requirements to list books");
      console.log(
        "   Required: Complete address setup AND verified banking details",
      );
    }
  } catch (error) {
    console.error("💥 Test failed:", error);
  }
};

// Make available globally in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).testPaymentSetup = testPaymentSetup;
  console.log("🧪 Payment setup test available: testPaymentSetup()");
}

export default testPaymentSetup;
