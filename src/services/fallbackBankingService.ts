/**
 * Fallback banking details service for when Edge Functions are unavailable
 * This allows users to save banking details even if Paystack integration is down
 */

import { supabase } from "@/integrations/supabase/client";
import { BankingDetails } from "@/types/banking";
import { toast } from "sonner";

export class FallbackBankingService {
  /**
   * Save banking details without Paystack integration (fallback mode)
   */
  static async saveBankingDetailsFallback(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
  ): Promise<BankingDetails> {
    try {
      console.log("Using fallback banking details service...");

      // Simple encryption for sensitive fields (in production, use proper encryption)
      const encrypt = (data: string): string => {
        return btoa(unescape(encodeURIComponent(data)));
      };

      const fallbackDetails = {
        ...bankingDetails,
        bank_account_number: encrypt(bankingDetails.bank_account_number),
        full_name: encrypt(bankingDetails.full_name),
        paystack_subaccount_code: null, // Will be created later when service is available
        paystack_subaccount_id: null,
        subaccount_status: "pending_setup", // Special status for fallback mode
        account_verified: false, // Will be verified when Paystack account is created
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to get existing record
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
          .update(fallbackDetails)
          .eq("user_id", bankingDetails.user_id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("banking_details")
          .insert([fallbackDetails])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      toast.success(
        "Banking details saved! Payment account will be set up automatically when the service is available.",
      );

      return result as BankingDetails;
    } catch (error) {
      console.error("Fallback banking service error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.includes("relation") &&
        errorMessage.includes("does not exist")
      ) {
        throw new Error(
          "Banking details feature is being set up. Please try again later.",
        );
      }

      throw new Error(`Failed to save banking details: ${errorMessage}`);
    }
  }

  /**
   * Check if banking details table exists and is accessible
   */
  static async checkServiceAvailability(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("banking_details")
        .select("id")
        .limit(1);

      return !error;
    } catch (error) {
      console.log("Banking details service not available:", error);
      return false;
    }
  }

  /**
   * Get banking details with decryption
   */
  static async getBankingDetailsFallback(
    userId: string,
  ): Promise<BankingDetails | null> {
    try {
      const { data, error } = await supabase
        .from("banking_details")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No banking details found
        }
        throw error;
      }

      // Simple decryption (match the encryption method)
      const decrypt = (encryptedData: string): string => {
        try {
          return decodeURIComponent(escape(atob(encryptedData)));
        } catch {
          return encryptedData; // Return as-is if decryption fails
        }
      };

      // Decrypt sensitive fields
      return {
        ...data,
        bank_account_number: decrypt(data.bank_account_number),
        full_name: decrypt(data.full_name),
      } as BankingDetails;
    } catch (error) {
      console.error("Error fetching banking details:", error);
      return null;
    }
  }
}

export default FallbackBankingService;
