import { supabase } from "@/integrations/supabase/client";

/**
 * Quick verification script to check if the migration was successful
 * Run this in browser console: verifyMigration()
 */
export const verifyMigration = async () => {
  console.log("🔍 Verifying Enhanced Order System Migration...\n");

  const results = [];

  // Test 1: Check new columns in orders table
  try {
    console.log("1. Testing orders table schema...");
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, buyer_id, book_id, delivery_option, payment_status, commit_deadline, paystack_reference",
      )
      .limit(1);

    if (error) throw error;

    console.log("✅ Orders table has enhanced schema");
    results.push("✅ Orders table schema: PASSED");
  } catch (error) {
    console.log("❌ Orders table schema: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Orders table schema: FAILED");
  }

  // Test 2: Check order_notifications table
  try {
    console.log("\n2. Testing order_notifications table...");
    const { data, error } = await supabase
      .from("order_notifications")
      .select("id, order_id, user_id, type, title, message, read, sent_at")
      .limit(1);

    if (error) throw error;

    console.log("✅ Order notifications table exists");
    results.push("✅ Order notifications table: PASSED");
  } catch (error) {
    console.log("❌ Order notifications table: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Order notifications table: FAILED");
  }

  // Test 3: Check receipts table
  try {
    console.log("\n3. Testing receipts table...");
    const { data, error } = await supabase
      .from("receipts")
      .select("id, order_id, receipt_number, buyer_email, seller_email")
      .limit(1);

    if (error) throw error;

    console.log("✅ Receipts table exists");
    results.push("✅ Receipts table: PASSED");
  } catch (error) {
    console.log("❌ Receipts table: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Receipts table: FAILED");
  }

  // Test 4: Test generate_receipt_number function
  try {
    console.log("\n4. Testing receipt number generation...");
    const { data, error } = await supabase.rpc("generate_receipt_number");

    if (error) throw error;

    if (typeof data === "string" && data.startsWith("RCP-")) {
      console.log("✅ Receipt number generated:", data);
      results.push("✅ Receipt number function: PASSED");
    } else {
      throw new Error("Invalid receipt number format");
    }
  } catch (error) {
    console.log("❌ Receipt number function: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Receipt number function: FAILED");
  }

  // Test 5: Test auto_cancel_expired_orders function
  try {
    console.log("\n5. Testing auto-cancel function...");
    const { error } = await supabase.rpc("auto_cancel_expired_orders");

    if (error) throw error;

    console.log("✅ Auto-cancel function works");
    results.push("✅ Auto-cancel function: PASSED");
  } catch (error) {
    console.log("❌ Auto-cancel function: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Auto-cancel function: FAILED");
  }

  // Test 6: Test send_commit_reminders function
  try {
    console.log("\n6. Testing commit reminders function...");
    const { error } = await supabase.rpc("send_commit_reminders");

    if (error) throw error;

    console.log("✅ Send reminders function works");
    results.push("✅ Send reminders function: PASSED");
  } catch (error) {
    console.log("❌ Send reminders function: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Send reminders function: FAILED");
  }

  // Test 7: Test create_order_notification function
  try {
    console.log("\n7. Testing notification creation...");
    const { data, error } = await supabase.rpc("create_order_notification", {
      p_order_id: "00000000-0000-0000-0000-000000000000",
      p_user_id: "00000000-0000-0000-0000-000000000000",
      p_type: "test",
      p_title: "Test Notification",
      p_message: "This is a test notification",
    });

    if (error) throw error;

    console.log("✅ Notification creation works");
    results.push("✅ Create notification function: PASSED");
  } catch (error) {
    console.log("❌ Create notification function: FAILED");
    console.log("Error:", error.message);
    results.push("❌ Create notification function: FAILED");
  }

  // Summary
  const passed = results.filter((r) => r.includes("PASSED")).length;
  const failed = results.filter((r) => r.includes("FAILED")).length;

  console.log("\n📊 MIGRATION VERIFICATION SUMMARY");
  console.log("====================================");
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `Success Rate: ${Math.round((passed / results.length) * 100)}%\n`,
  );

  results.forEach((result) => console.log(result));

  if (failed === 0) {
    console.log(
      "\n🎉 MIGRATION SUCCESSFUL! All enhanced order system components are working.",
    );
    console.log("\nNext steps:");
    console.log("1. Deploy the Edge Function for automated processing");
    console.log("2. Update your order components to use the enhanced service");
    console.log("3. Set up cron job for hourly order reminders");
  } else {
    console.log("\n⚠️  Some components failed. Check the errors above.");
  }

  return { passed, failed, results };
};

// Make it available globally for console access
(window as any).verifyMigration = verifyMigration;

export default verifyMigration;
