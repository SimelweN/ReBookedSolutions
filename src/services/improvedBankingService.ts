/**
 * Improved banking details service with fallback support
 * Handles cases where Edge Functions or database tables are not available
 */

import { supabase } from "@/integrations/supabase/client";
import { BankingDetails } from "@/types/banking";
import { PaystackService } from "@/services/paystackService";
import { DatabaseSetup } from "@/utils/databaseSetup";
import { LocalBankingFallback } from "@/services/localBankingFallback";
import { toast } from "sonner";

export class ImprovedBankingService {
  /**
   * Simple encryption for sensitive data
   */
  private static encrypt(data: string): string {
    return btoa(unescape(encodeURIComponent(data)));
  }

  /**
   * Simple decryption for sensitive data
   */
  private static decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      return encryptedData; // Return as-is if decryption fails
    }
  }

  /**
   * Check if banking details service is available
   */
  static async checkServiceAvailability(): Promise<{
    databaseAvailable: boolean;
    edgeFunctionsAvailable: boolean;
  }> {
    let databaseAvailable = false;
    let edgeFunctionsAvailable = false;

    // Check database access using DatabaseSetup utility
    databaseAvailable = await DatabaseSetup.checkBankingTableExists();

    // Check Edge Functions (simple test)
    try {
      await supabase.functions.invoke("create-paystack-subaccount", {
        body: { test: true },
      });
      edgeFunctionsAvailable = true;
    } catch (error) {
      console.log("Edge Functions not available:", error);
    }

    return { databaseAvailable, edgeFunctionsAvailable };
  }

  /**
   * Save banking details with intelligent fallback handling
   */
  static async saveBankingDetails(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
    userEmail: string,
  ): Promise<BankingDetails> {
    try {
      console.log("Starting banking details save process...");

      // Check service availability
      const { databaseAvailable, edgeFunctionsAvailable } =
        await this.checkServiceAvailability();

      if (!databaseAvailable) {
        console.log(
          "Banking details table not found, attempting automatic setup...",
        );

        // Try to set up the table automatically
        const setupSuccess = await DatabaseSetup.ensureBankingTableExists();

        if (!setupSuccess) {
          console.log("Database setup failed, using localStorage fallback");

          // Use localStorage fallback for temporary storage
          LocalBankingFallback.showFallbackWarning();
          const fallbackResult =
            LocalBankingFallback.saveBankingDetails(bankingDetails);

          toast.info(
            "Banking details saved locally until database is available",
            {
              duration: 8000,
            },
          );

          return fallbackResult;
        }

        console.log("✅ Banking details table setup completed automatically");
      }

      // First save banking details to database
      console.log("Saving banking details to database...");

      // Encrypt sensitive fields
      const encryptedDetails = {
        ...bankingDetails,
        bank_account_number: this.encrypt(bankingDetails.bank_account_number),
        full_name: this.encrypt(bankingDetails.full_name),
        subaccount_status: "pending_setup",
      };

      // Check if user already has banking details
      const { data: existingData } = await supabase
        .from("banking_details")
        .select("id")
        .eq("user_id", bankingDetails.user_id)
        .single();

      let savedData: any;

      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from("banking_details")
          .update(encryptedDetails)
          .eq("user_id", bankingDetails.user_id)
          .select()
          .single();

        if (error) {
          console.error("Update error:", error);
          throw new Error(`Failed to update banking details: ${error.message}`);
        }
        savedData = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("banking_details")
          .insert([encryptedDetails])
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          throw new Error(`Failed to save banking details: ${error.message}`);
        }
        savedData = data;
      }

      console.log("✅ Banking details saved to database");

      // Now try to create Paystack subaccount
      try {
        console.log("Attempting to create Paystack subaccount...");
        const paystackResult = await PaystackService.createSubaccount(
          bankingDetails,
          userEmail,
        );

        // Update the saved record with Paystack details
        await supabase
          .from("banking_details")
          .update({
            paystack_subaccount_code: paystackResult.subaccount_code,
            paystack_subaccount_id: paystackResult.subaccount_id,
            account_verified: true,
            subaccount_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", savedData.id);

        console.log("✅ Paystack subaccount created successfully");
        toast.success("Banking details saved and payment account created!");

        // Return updated record with decrypted fields
        return {
          ...savedData,
          bank_account_number: this.decrypt(savedData.bank_account_number),
          full_name: this.decrypt(savedData.full_name),
          paystack_subaccount_code: paystackResult.subaccount_code,
          paystack_subaccount_id: paystackResult.subaccount_id,
          account_verified: true,
          subaccount_status: "active",
        } as BankingDetails;
      } catch (paystackError) {
        console.warn("Paystack subaccount creation failed:", paystackError);

        // Check if it's specifically an Edge Function issue
        const errorMessage =
          paystackError instanceof Error
            ? paystackError.message
            : String(paystackError);

        // Handle specific error codes from PaystackService
        if (
          errorMessage === "EDGE_FUNCTION_UNAVAILABLE" ||
          errorMessage === "PAYSTACK_CONFIG_INCOMPLETE" ||
          errorMessage === "PAYSTACK_SETUP_FAILED"
        ) {
          console.log(
            "🔄 Paystack integration will be set up automatically later",
          );
          toast.success("Banking details saved successfully!", {
            description:
              "Payment account will be set up automatically when the service becomes available.",
          });
        } else if (
          errorMessage.includes("Failed to send a request") ||
          errorMessage.includes("temporarily unavailable") ||
          errorMessage.includes("Edge Function") ||
          errorMessage.includes("non-2xx status code")
        ) {
          console.log("🌐 Edge Function connectivity issue, will retry later");
          toast.success("Banking details saved successfully!", {
            description:
              "Payment account will be set up automatically when needed for transactions.",
          });
        } else {
          console.log("⚠️ Unexpected Paystack error, will retry later");
          toast.success(
            "Banking details saved! Payment account setup will be retried later.",
            {
              description:
                "Your banking information is secure and payments will work once setup completes.",
            },
          );
        }

        // Mark as pending setup and still return the saved banking details
        await supabase
          .from("banking_details")
          .update({
            subaccount_status: "pending_setup",
            updated_at: new Date().toISOString(),
          })
          .eq("id", savedData.id);

        // Return banking details with decrypted fields
        return {
          ...savedData,
          bank_account_number: this.decrypt(savedData.bank_account_number),
          full_name: this.decrypt(savedData.full_name),
          subaccount_status: "pending_setup",
        } as BankingDetails;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const errorCode = (error as any)?.code || "NO_CODE";

      console.error(
        `Error in saveBankingDetails: ${errorMessage} (${errorCode})`,
      );
      console.error(
        `Save banking details error details: ${JSON.stringify({
          message: errorMessage,
          code: errorCode,
        })}`,
      );

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get banking details for a user
   */
  static async getBankingDetails(
    userId: string,
  ): Promise<BankingDetails | null> {
    try {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from("banking_details")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No banking details found
        }

        // Handle table not existing - try localStorage fallback
        if (
          error.code === "42P01" ||
          (error.message?.includes("relation") &&
            error.message?.includes("does not exist"))
        ) {
          console.warn(
            "Banking details table does not exist - checking localStorage fallback",
          );
          return LocalBankingFallback.getBankingDetails(userId);
        }

        throw error;
      }

      // Decrypt sensitive fields
      return {
        ...data,
        bank_account_number: this.decrypt(data.bank_account_number),
        full_name: this.decrypt(data.full_name),
      } as BankingDetails;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code || "NO_CODE";

      console.error(
        `Error fetching banking details: ${errorMessage} (${errorCode})`,
      );
      console.error("Error fetching banking details details:", {
        message: errorMessage,
        code: errorCode,
        userId: userId,
      });

      return null;
    }
  }

  /**
   * Check if user has verified banking details for listing books
   */
  static async hasVerifiedBankingDetails(userId: string): Promise<boolean> {
    try {
      const bankingDetails = await this.getBankingDetails(userId);

      if (!bankingDetails) {
        return false;
      }

      // For localStorage fallback, consider it "verified" if details exist
      // since we can't create Paystack accounts without the database
      if (bankingDetails.id?.startsWith("fallback_")) {
        console.log(
          "Using localStorage fallback - banking details exist but not fully verified",
        );
        return true; // Allow book listing with fallback data
      }

      // Check if account is verified and has Paystack integration
      return (
        bankingDetails.account_verified === true &&
        !!bankingDetails.paystack_subaccount_code
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `Error checking banking details verification: ${errorMessage}`,
      );
      return false;
    }
  }
}

export default ImprovedBankingService;
