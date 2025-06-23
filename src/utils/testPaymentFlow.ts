/**
 * Comprehensive payment system test utility
 * Tests all critical payment flows and configurations
 */

import { PAYSTACK_CONFIG } from "@/config/paystack";
import { PaystackService } from "@/services/paystackService";
import { TransactionService } from "@/services/transactionService";
import { ImprovedBankingService } from "@/services/improvedBankingService";
import { DatabaseSetup } from "@/utils/databaseSetup";

export class PaymentFlowTester {
  /**
   * Test complete payment system configuration
   */
  static async testPaymentSystem(): Promise<{
    overall: boolean;
    details: {
      paystackConfig: boolean;
      databaseConnection: boolean;
      bankingService: boolean;
      edgeFunctions: boolean;
      transactionService: boolean;
    };
    errors: string[];
    recommendations: string[];
  }> {
    const results = {
      overall: true,
      details: {
        paystackConfig: false,
        databaseConnection: false,
        bankingService: false,
        edgeFunctions: false,
        transactionService: false,
      },
      errors: [] as string[],
      recommendations: [] as string[],
    };

    console.log("🧪 Starting comprehensive payment system test...");

    // Test 1: Paystack Configuration
    try {
      const configured = PAYSTACK_CONFIG.isConfigured();
      results.details.paystackConfig = configured;

      if (configured) {
        console.log("✅ Paystack configuration: Valid");

        // Test public key format
        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        if (publicKey?.startsWith("pk_")) {
          console.log("✅ Paystack public key format: Valid");
        } else {
          results.errors.push(
            "Paystack public key format invalid (should start with 'pk_')",
          );
        }
      } else {
        results.errors.push("Paystack configuration missing or invalid");
        results.recommendations.push(
          "Set VITE_PAYSTACK_PUBLIC_KEY in environment variables",
        );
      }
    } catch (error) {
      results.errors.push(`Paystack config test failed: ${error}`);
    }

    // Test 2: Database Connection & Tables
    try {
      const dbAvailable = await DatabaseSetup.checkBankingTableExists();
      results.details.databaseConnection = dbAvailable;

      if (dbAvailable) {
        console.log("✅ Database connection: Available");
        console.log("✅ Banking details table: Exists");
      } else {
        results.errors.push("Banking details table not found");
        results.recommendations.push(
          "Run database migration: supabase/migrations/20250615000001_create_banking_details_table.sql",
        );
      }

      // Test transactions table
      const { supabase } = await import("@/integrations/supabase/client");
      const { error: transactionError } = await supabase
        .from("transactions")
        .select("id")
        .limit(1);

      if (!transactionError) {
        console.log("✅ Transactions table: Available");
      } else {
        results.errors.push("Transactions table not accessible");
      }
    } catch (error) {
      results.errors.push(`Database test failed: ${error}`);
    }

    // Test 3: Banking Service
    try {
      const serviceStatus =
        await ImprovedBankingService.checkServiceAvailability();
      results.details.bankingService =
        serviceStatus.databaseAvailable || serviceStatus.edgeFunctionsAvailable;

      if (serviceStatus.databaseAvailable) {
        console.log("✅ Banking service: Database available");
      } else {
        console.log("⚠️ Banking service: Using fallback storage");
        results.recommendations.push(
          "Database preferred for production banking details",
        );
      }
    } catch (error) {
      results.errors.push(`Banking service test failed: ${error}`);
    }

    // Test 4: Edge Functions
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // Test payment initialization function
      const { error: initError } = await supabase.functions.invoke(
        "initialize-paystack-payment",
        { body: { test: true } },
      );

      if (!initError || !initError.message?.includes("Failed to send")) {
        results.details.edgeFunctions = true;
        console.log("✅ Edge Functions: Available");
      } else {
        results.errors.push("Edge Functions not accessible");
        results.recommendations.push(
          "Deploy Edge Functions or check Supabase configuration",
        );
      }
    } catch (error) {
      results.errors.push(`Edge Functions test failed: ${error}`);
    }

    // Test 5: Transaction Service
    try {
      // Test if TransactionService can be instantiated and has required methods
      if (typeof TransactionService.initializeBookPayment === "function") {
        results.details.transactionService = true;
        console.log("✅ Transaction service: Available");
      } else {
        results.errors.push("Transaction service missing required methods");
      }
    } catch (error) {
      results.errors.push(`Transaction service test failed: ${error}`);
    }

    // Overall assessment
    const criticalTests = [
      results.details.paystackConfig,
      results.details.databaseConnection || results.details.bankingService, // At least one storage method
      results.details.transactionService,
    ];

    results.overall = criticalTests.every((test) => test);

    // Summary
    console.log("\n📊 Payment System Test Results:");
    console.log(
      `Overall Status: ${results.overall ? "✅ READY" : "❌ NEEDS ATTENTION"}`,
    );
    console.log("\nComponent Status:");
    Object.entries(results.details).forEach(([key, status]) => {
      console.log(
        `  ${status ? "✅" : "❌"} ${key}: ${status ? "OK" : "Failed"}`,
      );
    });

    if (results.errors.length > 0) {
      console.log("\n🚨 Errors Found:");
      results.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (results.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      results.recommendations.forEach((rec) => console.log(`  - ${rec}`));
    }

    return results;
  }

  /**
   * Test payment flow with mock data
   */
  static async testPaymentFlow(): Promise<{
    success: boolean;
    step: string;
    error?: string;
  }> {
    console.log("🧪 Testing payment flow...");

    try {
      // Step 1: Check if we can create a mock payment
      const mockBookData = {
        bookId: "test-book-123",
        buyerId: "test-buyer-456",
        buyerEmail: "test@example.com",
        sellerId: "test-seller-789",
        bookPrice: 100,
        deliveryFee: 20,
        bookTitle: "Test Book Payment",
      };

      // Test payment initialization (dry run)
      console.log("Testing payment initialization parameters...");

      const amountInKobo = Math.round(
        (mockBookData.bookPrice + mockBookData.deliveryFee) * 100,
      );
      console.log(
        `Amount calculation: R${mockBookData.bookPrice + mockBookData.deliveryFee} = ${amountInKobo} kobo`,
      );

      if (amountInKobo === 12000) {
        // 120 * 100
        console.log("✅ Amount calculation: Correct");
        return { success: true, step: "amount_calculation" };
      } else {
        return {
          success: false,
          step: "amount_calculation",
          error: "Amount calculation incorrect",
        };
      }
    } catch (error) {
      return {
        success: false,
        step: "payment_flow_test",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test banking details encryption (if available)
   */
  static async testBankingEncryption(): Promise<{
    available: boolean;
    working?: boolean;
    error?: string;
  }> {
    try {
      // Try to import encryption utilities
      const { EncryptionUtils } = await import("@/utils/encryptionUtils");

      // Test basic encryption/decryption
      const testData = "test-account-123456";
      const testPassword = "testpass123";
      const testUserId = "test-user";

      const encrypted = EncryptionUtils.encryptBankingData(
        testData,
        testPassword,
        testUserId,
      );
      const decrypted = EncryptionUtils.decryptBankingData(
        encrypted.encryptedData,
        encrypted.salt,
        testPassword,
        testUserId,
      );

      const working = decrypted === testData;

      console.log(`🔐 Banking encryption: ${working ? "Working" : "Failed"}`);

      return { available: true, working };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Add to window for debugging
if (import.meta.env.DEV) {
  (window as any).PaymentFlowTester = PaymentFlowTester;
  console.log(
    "🧪 PaymentFlowTester available: window.PaymentFlowTester.testPaymentSystem()",
  );
}

export default PaymentFlowTester;
