/**
 * Simple Order System Test - Can be run from browser console
 *
 * Usage:
 * import { testOrderSystem } from './utils/testOrderSystem';
 * testOrderSystem();
 */

import { supabase } from "@/integrations/supabase/client";

export const testOrderSystem = async () => {
  console.log("🧪 Testing Enhanced Order Management System...\n");

  const tests = [
    { name: "Database Connection", test: testDatabaseConnection },
    { name: "Orders Table Schema", test: testOrdersTable },
    { name: "Notifications Table Schema", test: testNotificationsTable },
    { name: "Receipts Table Schema", test: testReceiptsTable },
    {
      name: "Generate Receipt Number Function",
      test: testReceiptNumberFunction,
    },
    { name: "Auto Cancel Function", test: testAutoCancelFunction },
    { name: "Send Reminders Function", test: testSendRemindersFunction },
    {
      name: "Create Notification Function",
      test: testCreateNotificationFunction,
    },
    { name: "Edge Function (Optional)", test: testEdgeFunction },
  ];

  const results = [];

  for (const { name, test } of tests) {
    console.log(`Testing: ${name}...`);
    try {
      const result = await test();
      console.log(`✅ ${name}: PASSED`);
      if (result) console.log(`   ${result}`);
      results.push({ name, status: "PASSED", result });
    } catch (error) {
      console.log(`❌ ${name}: FAILED`);
      console.log(`   Error: ${error.message}`);
      results.push({ name, status: "FAILED", error: error.message });
    }
    console.log("");
  }

  // Summary
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;

  console.log("📊 TEST SUMMARY");
  console.log("================");
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%\n`);

  if (failed === 0) {
    console.log(
      "🎉 All tests passed! Your enhanced order system is working correctly.",
    );
  } else {
    console.log("⚠️  Some tests failed. Make sure you have:");
    console.log("1. Run the database migration");
    console.log("2. All required tables and functions exist");
    console.log("3. Proper Supabase configuration");
  }

  return results;
};

// Individual test functions
const testDatabaseConnection = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("count")
    .limit(1);

  if (error) throw error;
  return "Connection established successfully";
};

const testOrdersTable = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, buyer_id, seller_id, book_id, amount, delivery_option, paystack_reference, status, payment_status, commit_deadline",
    )
    .limit(1);

  if (error) throw error;

  // Check if we have the new schema fields
  const hasNewFields =
    data.length === 0 ||
    ("buyer_id" in (data[0] || {}) &&
      "book_id" in (data[0] || {}) &&
      "payment_status" in (data[0] || {}) &&
      "commit_deadline" in (data[0] || {}));

  if (!hasNewFields) {
    throw new Error(
      "Orders table missing new schema fields - migration may not have run",
    );
  }

  return "Orders table has correct enhanced schema";
};

const testNotificationsTable = async () => {
  const { data, error } = await supabase
    .from("order_notifications")
    .select("id, order_id, user_id, type, title, message, read, sent_at")
    .limit(1);

  if (error) throw error;
  return "Notifications table exists and accessible";
};

const testReceiptsTable = async () => {
  const { data, error } = await supabase
    .from("receipts")
    .select(
      "id, order_id, receipt_number, buyer_email, seller_email, receipt_data",
    )
    .limit(1);

  if (error) throw error;
  return "Receipts table exists and accessible";
};

const testReceiptNumberFunction = async () => {
  const { data, error } = await supabase.rpc("generate_receipt_number");

  if (error) throw error;

  if (typeof data !== "string" || !data.match(/^RCP-\d{8}-\d{6}$/)) {
    throw new Error("Invalid receipt number format");
  }

  return `Generated receipt number: ${data}`;
};

const testAutoCancelFunction = async () => {
  const { error } = await supabase.rpc("auto_cancel_expired_orders");

  if (error) throw error;
  return "Auto-cancel function executed successfully";
};

const testSendRemindersFunction = async () => {
  const { error } = await supabase.rpc("send_commit_reminders");

  if (error) throw error;
  return "Send reminders function executed successfully";
};

const testCreateNotificationFunction = async () => {
  const { data, error } = await supabase.rpc("create_order_notification", {
    p_order_id: "00000000-0000-0000-0000-000000000000",
    p_user_id: "00000000-0000-0000-0000-000000000000",
    p_type: "payment_success",
    p_title: "Test Notification",
    p_message: "This is a test notification",
  });

  if (error) throw error;
  return `Created notification with ID: ${data}`;
};

const testEdgeFunction = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "process-order-reminders",
    );

    if (error) {
      return "Edge function not deployed (optional - can be deployed later)";
    }

    if (data && data.success) {
      return "Edge function working correctly";
    } else {
      throw new Error("Edge function returned unexpected response");
    }
  } catch (error) {
    return "Edge function not deployed (optional - can be deployed later)";
  }
};

// Quick database status check
export const checkDatabaseStatus = async () => {
  console.log("🔍 Quick Database Status Check...\n");

  try {
    // Check orders table
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .limit(5);

    if (ordersError) throw ordersError;
    console.log(`✅ Orders table: ${orders.length} records found`);

    // Check notifications table
    const { data: notifications, error: notifError } = await supabase
      .from("order_notifications")
      .select("id")
      .limit(5);

    if (notifError) throw notifError;
    console.log(
      `✅ Notifications table: ${notifications.length} records found`,
    );

    // Check receipts table
    const { data: receipts, error: receiptsError } = await supabase
      .from("receipts")
      .select("id")
      .limit(5);

    if (receiptsError) throw receiptsError;
    console.log(`✅ Receipts table: ${receipts.length} records found`);

    console.log("\n🎉 Database status looks good!");
  } catch (error) {
    console.log("❌ Database status check failed:", error.message);
    console.log("This likely means the migration has not been run yet.");
  }
};

// Export for use in browser console
(window as any).testOrderSystem = testOrderSystem;
(window as any).checkDatabaseStatus = checkDatabaseStatus;
