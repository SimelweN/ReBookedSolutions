/**
 * Test utility to verify payment flow works correctly
 */
import { BankingDetailsService } from "@/services/bankingDetailsService";
import { TransactionService } from "@/services/transactionService";

export class PaymentFlowTest {
  /**
   * Test the complete payment flow for a given seller
   */
  static async testPaymentFlow(
    sellerId: string,
    bookId: string = "test-book",
  ): Promise<
    {
      step: string;
      success: boolean;
      message: string;
      details?: any;
    }[]
  > {
    const results: Array<{
      step: string;
      success: boolean;
      message: string;
      details?: any;
    }> = [];

    // Step 1: Check seller banking details
    try {
      console.log("🧪 Testing: Seller banking details check");
      const bankingDetails =
        await BankingDetailsService.getBankingDetails(sellerId);

      if (!bankingDetails) {
        results.push({
          step: "Banking Details Check",
          success: false,
          message: "No banking details found - will use fallback payment",
          details: { sellerId },
        });
      } else if (!bankingDetails.paystack_subaccount_code) {
        results.push({
          step: "Banking Details Check",
          success: false,
          message:
            "Banking details exist but no subaccount - will use fallback payment",
          details: {
            sellerId,
            hasDetails: true,
            subaccountCode: bankingDetails.paystack_subaccount_code,
            status: bankingDetails.subaccount_status,
          },
        });
      } else {
        results.push({
          step: "Banking Details Check",
          success: true,
          message: "Seller has complete Paystack setup",
          details: {
            sellerId,
            subaccountCode: bankingDetails.paystack_subaccount_code,
            status: bankingDetails.subaccount_status,
          },
        });
      }
    } catch (error) {
      results.push({
        step: "Banking Details Check",
        success: false,
        message: `Error checking banking details: ${error instanceof Error ? error.message : String(error)}`,
        details: { sellerId, error },
      });
    }

    // Step 2: Test transaction initialization (if seller has setup)
    const lastResult = results[results.length - 1];
    if (lastResult.success) {
      try {
        console.log("🧪 Testing: Transaction initialization");

        // This should work if seller has proper setup
        await TransactionService.initializeBookPayment({
          bookId: bookId,
          buyerId: "test-buyer",
          buyerEmail: "test@example.com",
          sellerId: sellerId,
          bookPrice: 100,
          bookTitle: "Test Book",
          deliveryFee: 0,
        });

        results.push({
          step: "Transaction Initialization",
          success: true,
          message: "Transaction initialized successfully",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          step: "Transaction Initialization",
          success: false,
          message: `Transaction failed: ${errorMessage}`,
          details: { error: errorMessage },
        });
      }
    }

    return results;
  }

  /**
   * Quick test for developers - logs results to console
   */
  static async quickTest(sellerId: string): Promise<void> {
    console.group(`🧪 Payment Flow Test - Seller ${sellerId}`);

    const results = await this.testPaymentFlow(sellerId);

    results.forEach((result) => {
      const icon = result.success ? "✅" : "❌";
      console.log(`${icon} ${result.step}: ${result.message}`);
      if (result.details) {
        console.log("  Details:", result.details);
      }
    });

    const allSuccess = results.every((r) => r.success);
    console.log(
      `\n🎯 Overall: ${allSuccess ? "✅ Ready for Paystack" : "⚠️ Will use fallback payment"}`,
    );

    console.groupEnd();
  }
}

export default PaymentFlowTest;
