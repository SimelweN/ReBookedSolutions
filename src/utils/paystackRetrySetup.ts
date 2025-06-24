/**
 * Utility to retry Paystack subaccount creation for banking details
 * that were saved without Paystack integration due to Edge Function unavailability
 */

import { supabase } from "@/integrations/supabase/client";
import { PaystackService } from "@/services/paystackService";
import { toast } from "sonner";

export class PaystackRetrySetup {
  /**
   * Retry Paystack setup for banking details that are pending setup
   */
  static async retryPendingSetup(
    userId: string,
    userEmail: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log("🔄 Checking for banking details needing Paystack setup...");

      // Get banking details that need Paystack setup
      const { data: bankingDetails, error } = await supabase
        .from("banking_details")
        .select("*")
        .eq("user_id", userId)
        .or(
          "subaccount_status.eq.pending_setup,paystack_subaccount_code.is.null",
        )
        .single();

      if (error || !bankingDetails) {
        return {
          success: false,
          message: "No banking details found that need Paystack setup",
        };
      }

      console.log(
        "📋 Found banking details needing setup, attempting Paystack integration...",
      );

      // Try to create Paystack subaccount
      const paystackResult = await PaystackService.createSubaccount(
        bankingDetails,
        userEmail,
      );

      // Update banking details with Paystack information
      const { error: updateError } = await supabase
        .from("banking_details")
        .update({
          paystack_subaccount_code: paystackResult.subaccount_code,
          paystack_subaccount_id: paystackResult.subaccount_id,
          account_verified: true,
          subaccount_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bankingDetails.id);

      if (updateError) {
        throw new Error(
          `Failed to update banking details: ${updateError.message}`,
        );
      }

      console.log("✅ Paystack setup completed successfully");

      toast.success("Payment account setup completed!", {
        description: "Your banking details are now ready for payments.",
      });

      return {
        success: true,
        message: "Paystack integration completed successfully",
      };
    } catch (error) {
      console.error("❌ Paystack retry setup failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Don't show error toast if Edge Functions are still unavailable
      if (
        !errorMessage.includes("Edge Functions") &&
        !errorMessage.includes("Failed to send")
      ) {
        toast.error("Payment account setup failed", {
          description: "Will retry automatically later.",
        });
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Check if Paystack setup can be retried (Edge Functions available)
   */
  static async canRetrySetup(): Promise<boolean> {
    try {
      // Test if Edge Functions are accessible
      const { error } = await supabase.functions.invoke(
        "create-paystack-subaccount",
        {
          body: { test: true },
        },
      );

      // If no network error, Edge Functions are available
      return !error || !error.message?.includes("Failed to send");
    } catch (error) {
      return false;
    }
  }

  /**
   * Get banking details that need Paystack setup
   */
  static async getPendingSetupCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("banking_details")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .or(
          "subaccount_status.eq.pending_setup,paystack_subaccount_code.is.null",
        );

      return error ? 0 : count || 0;
    } catch (error) {
      return 0;
    }
  }
}

// Add to window for debugging
if (import.meta.env.DEV) {
  (window as any).PaystackRetrySetup = PaystackRetrySetup;
  console.log(
    "🔄 Paystack retry utility available: PaystackRetrySetup.retryPendingSetup()",
  );
}

export default PaystackRetrySetup;
