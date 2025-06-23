import { BankingDetailsService } from "@/services/bankingDetailsService";
import { toast } from "sonner";

/**
 * Debug utility for payment setup issues
 */
export class PaymentDebugger {
  /**
   * Check seller payment setup status
   */
  static async checkSellerSetup(sellerId: string): Promise<{
    hasAccount: boolean;
    hasSubaccount: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      console.group(`🔍 Payment Setup Debug - Seller ${sellerId}`);

      // Check if seller has banking details
      const bankingDetails =
        await BankingDetailsService.getBankingDetails(sellerId);
      const hasAccount = !!bankingDetails;
      const hasSubaccount = !!bankingDetails?.paystack_subaccount_code;

      console.log(
        "Banking Details:",
        bankingDetails ? "✅ Found" : "❌ Missing",
      );
      console.log(
        "Subaccount Code:",
        hasSubaccount ? "✅ Present" : "❌ Missing",
      );

      if (!hasAccount) {
        issues.push("Seller has not added banking details");
        recommendations.push(
          "Seller needs to go to Profile > Banking tab and add their bank information",
        );
      }

      if (hasAccount && !hasSubaccount) {
        issues.push("Banking details exist but no Paystack subaccount");
        recommendations.push(
          "Subaccount creation may have failed - seller should re-save banking details",
        );
      }

      if (bankingDetails) {
        console.log(
          "Account Status:",
          bankingDetails.subaccount_status || "unknown",
        );
        console.log("Bank Name:", bankingDetails.bank_name);
        console.log("Recipient Type:", bankingDetails.recipient_type);

        if (bankingDetails.subaccount_status !== "active") {
          issues.push(
            `Subaccount status is ${bankingDetails.subaccount_status || "unknown"}`,
          );
          recommendations.push(
            "Seller should contact support to activate their payment account",
          );
        }
      }

      console.groupEnd();

      return {
        hasAccount,
        hasSubaccount,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error("Error checking seller setup:", error);
      issues.push("Error checking seller payment setup");
      recommendations.push("Contact technical support");

      return {
        hasAccount: false,
        hasSubaccount: false,
        issues,
        recommendations,
      };
    }
  }

  /**
   * Show debug info to user (development only)
   */
  static async debugForUser(sellerId: string): Promise<void> {
    if (import.meta.env.PROD) return; // Only in development

    const result = await this.checkSellerSetup(sellerId);

    console.group("💡 Payment Debug Summary");
    console.log("Has Account:", result.hasAccount ? "✅" : "❌");
    console.log("Has Subaccount:", result.hasSubaccount ? "✅" : "❌");

    if (result.issues.length > 0) {
      console.log("Issues:", result.issues);
    }

    if (result.recommendations.length > 0) {
      console.log("Recommendations:", result.recommendations);
    }
    console.groupEnd();

    // Show user-friendly message
    if (result.issues.length > 0) {
      const message = result.recommendations[0] || "Please contact support";
      toast.warning(`Payment Setup Issue: ${message}`);
    }
  }

  /**
   * Quick seller setup check for developers
   */
  static async quickCheck(sellerId: string): Promise<string> {
    const result = await this.checkSellerSetup(sellerId);

    if (result.hasSubaccount) return "✅ Ready";
    if (result.hasAccount) return "⚠️ Account exists, no subaccount";
    return "❌ No banking details";
  }
}

export default PaymentDebugger;
