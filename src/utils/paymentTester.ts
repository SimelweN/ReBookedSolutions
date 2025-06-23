/**
 * Payment system testing and monitoring utility
 */

import { supabase } from "@/integrations/supabase/client";
import { TransactionService } from "@/services/transactionService";
import { PaystackService } from "@/services/paystackService";
import { PAYSTACK_CONFIG } from "@/config/paystack";

export class PaymentTester {
  /**
   * Test the complete payment system
   */
  static async testPaymentSystem() {
    console.log("🧪 Testing Payment System...");

    try {
      // Test 1: Check Paystack configuration
      console.log("1️⃣ Checking Paystack configuration...");
      const isConfigured = PAYSTACK_CONFIG.isConfigured();
      console.log(`   Paystack configured: ${isConfigured ? "✅" : "❌"}`);
      console.log(`   Public key present: ${!!PAYSTACK_CONFIG.PUBLIC_KEY}`);
      console.log(
        `   Environment: ${PAYSTACK_CONFIG.isDevelopment ? "Development" : "Production"}`,
      );

      // Test 2: Check database connection for transactions
      console.log("2️⃣ Checking transactions table access...");
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("id, status")
        .limit(1);

      if (transactionsError) {
        console.error(
          "❌ Transactions table access failed:",
          transactionsError.message,
        );
      } else {
        console.log("✅ Transactions table accessible");
      }

      // Test 3: Check banking details integration
      console.log("3️⃣ Checking banking details integration...");
      const { data: bankingDetails, error: bankingError } = await supabase
        .from("banking_details")
        .select("user_id, paystack_subaccount_code")
        .limit(1);

      if (bankingError) {
        console.error(
          "❌ Banking details access failed:",
          bankingError.message,
        );
      } else {
        console.log("✅ Banking details table accessible");
        console.log(`   Found ${bankingDetails?.length || 0} banking records`);
      }

      // Test 4: Check books table for payment integration
      console.log("4️⃣ Checking books table integration...");
      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("id, title, price, seller_id")
        .eq("sold", false)
        .limit(1);

      if (booksError) {
        console.error("❌ Books table access failed:", booksError.message);
      } else {
        console.log("✅ Books table accessible");
        console.log(`   Found ${books?.length || 0} available books`);
      }

      // Test 5: Validate Paystack webhook endpoint
      console.log("5️⃣ Checking Paystack webhook configuration...");
      const webhookUrl = `${window.location.origin}/api/paystack-webhook`;
      console.log(`   Webhook URL: ${webhookUrl}`);
      console.log(
        "   Note: Ensure this URL is configured in your Paystack dashboard",
      );

      console.log("🎯 Payment system test completed!");

      return {
        configured: isConfigured,
        databaseConnected: !transactionsError && !bankingError && !booksError,
        errors: [transactionsError, bankingError, booksError].filter(Boolean),
      };
    } catch (error) {
      console.error("💥 Payment system test failed:", error);
      return {
        configured: false,
        databaseConnected: false,
        errors: [error],
      };
    }
  }

  /**
   * Monitor payment transactions in real-time
   */
  static async monitorTransactions(duration: number = 30000) {
    console.log(`📊 Monitoring transactions for ${duration / 1000} seconds...`);

    const startTime = Date.now();
    let transactionCount = 0;

    const checkTransactions = async () => {
      try {
        const { data: recentTransactions } = await supabase
          .from("transactions")
          .select("id, status, created_at, book_title, price")
          .gte("created_at", new Date(startTime).toISOString())
          .order("created_at", { ascending: false });

        if (
          recentTransactions &&
          recentTransactions.length > transactionCount
        ) {
          const newTransactions = recentTransactions.slice(
            0,
            recentTransactions.length - transactionCount,
          );
          newTransactions.forEach((transaction) => {
            console.log(
              `💰 New transaction: ${transaction.book_title} - R${transaction.price} (${transaction.status})`,
            );
          });
          transactionCount = recentTransactions.length;
        }
      } catch (error) {
        console.error("Error monitoring transactions:", error);
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkTransactions, 5000);

    // Stop monitoring after duration
    setTimeout(() => {
      clearInterval(interval);
      console.log("📊 Transaction monitoring stopped");
    }, duration);

    console.log("🔍 Transaction monitoring started...");
  }

  /**
   * Test a mock payment flow
   */
  static async testMockPayment(bookId: string) {
    console.log("🎭 Testing mock payment flow...");

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ No authenticated user for payment test");
        return;
      }

      // Get book details
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("id, title, price, seller_id")
        .eq("id", bookId)
        .single();

      if (bookError || !book) {
        console.error(
          "❌ Could not fetch book for payment test:",
          bookError?.message,
        );
        return;
      }

      console.log(`📚 Testing payment for: ${book.title} (R${book.price})`);

      // In a real test, we would initialize a payment
      // For now, just validate the flow would work
      console.log("✅ Mock payment flow validation complete");
      console.log("   Book found and accessible");
      console.log("   User authenticated");
      console.log("   Ready for payment initialization");
    } catch (error) {
      console.error("💥 Mock payment test failed:", error);
    }
  }
}

// Make available globally in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).PaymentTester = PaymentTester;
  console.log("🧪 Payment testing utilities available:");
  console.log(
    "  - PaymentTester.testPaymentSystem() - Test complete payment setup",
  );
  console.log(
    "  - PaymentTester.monitorTransactions() - Monitor live transactions",
  );
  console.log(
    "  - PaymentTester.testMockPayment(bookId) - Test payment for specific book",
  );
}

export default PaymentTester;
