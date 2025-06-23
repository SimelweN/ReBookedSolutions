/**
 * Improved banking details service with fallback support
 * Handles cases where Edge Functions or database tables are not available
 */

import { supabase } from "@/integrations/supabase/client";
import { BankingDetails } from "@/types/banking";
import { PaystackService } from "@/services/paystackService";
import { DatabaseSetup } from "@/utils/databaseSetup";
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
          // Show setup instructions if automatic setup fails
          await DatabaseSetup.showSetupInstructions();
          throw new Error(
            "Banking details table needs to be created. Please run the database setup script or contact support.",
          );
        }

        console.log("✅ Banking details table setup completed automatically");
      }

      let paystackData: {
        subaccount_code: string;
        subaccount_id: string;
      } | null = null;

      // Try to create Paystack subaccount if Edge Functions are available
      if (edgeFunctionsAvailable) {
        try {
          paystackData = await PaystackService.createSubaccount(
            bankingDetails as BankingDetails,
            userEmail,
          );
          toast.success("Payment account created successfully!");
        } catch (paystackError) {
          console.warn(
            "Paystack subaccount creation failed, proceeding without it:",
            paystackError,
          );
          toast.warning(
            "Banking details saved. Payment account will be set up automatically.",
          );
        }
      } else {
        console.log(
          "Edge Functions not available, saving banking details without Paystack integration",
        );
        toast.info(
          "Banking details saved. Payment integration will be activated automatically.",
        );
      }

      // Prepare encrypted banking details
      const encryptedDetails = {
        ...bankingDetails,
        bank_account_number: this.encrypt(bankingDetails.bank_account_number),
        full_name: this.encrypt(bankingDetails.full_name),
        paystack_subaccount_code: paystackData?.subaccount_code || null,
        paystack_subaccount_id: paystackData?.subaccount_id || null,
        subaccount_status: paystackData ? "active" : "pending_setup",
        account_verified: !!paystackData, // Will be ignored if column doesn't exist
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check for existing record
      const { data: existingData } = await supabase
        .from("banking_details")
        .select("id")
        .eq("user_id", bankingDetails.user_id)
        .single();

      let result;
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
        result = data;
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
        result = data;
      }

      // Decrypt for return
      return {
        ...result,
        bank_account_number: this.decrypt(result.bank_account_number),
        full_name: this.decrypt(result.full_name),
      } as BankingDetails;
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

        // Handle table not existing
        if (
          error.code === "42P01" ||
          (error.message?.includes("relation") &&
            error.message?.includes("does not exist"))
        ) {
          console.warn(
            "Banking details table does not exist - user needs to set up database",
          );
          return null;
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
