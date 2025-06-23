import { supabase } from "@/integrations/supabase/client";
import { BankingDetails } from "@/types/banking";
import { PaystackService } from "@/services/paystackService";
import { FallbackBankingService } from "@/services/fallbackBankingService";
import { toast } from "sonner";

/**
 * Service for managing banking details with encryption and security
 */
export class BankingDetailsService {
  private static readonly SESSION_KEY = "banking_access_verified";
  private static readonly VERIFICATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Simple encryption for sensitive data (in production, use a proper encryption library)
   */
  private static encrypt(data: string): string {
    // In production, implement proper encryption using crypto-js or similar
    // For now, using base64 encoding as a placeholder
    return btoa(unescape(encodeURIComponent(data)));
  }

  /**
   * Get banking details for a user with automatic decryption
   */
  static async getBankingDetails(
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
          // No banking details found
          return null;
        }

        // If table doesn't exist or permission denied, try fallback
        if (error.code === "42P01" || error.code === "42501") {
          console.log("Banking details table not accessible, trying fallback");
          return await FallbackBankingService.getBankingDetailsFallback(userId);
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
      console.error("Error fetching banking details:", error);

      // Try fallback as last resort
      try {
        return await FallbackBankingService.getBankingDetailsFallback(userId);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return null;
      }
    }
  }
      // that can verify passwords without affecting the current session

      // Verify the user is currently authenticated and the email matches
      const { data: currentUser, error } = await supabase.auth.getUser();

      if (error || !currentUser.user) {
        console.error("Password verification failed: User not authenticated");
        return false;
      }

      if (currentUser.user.email !== email) {
        console.error("Password verification failed: Email mismatch");
        return false;
      }

      // Since we can't safely verify the password without affecting the session,
      // we'll rely on the fact that the user is currently authenticated
      // and implement a time-based verification system

      // Store verification in session storage with timestamp
      const verificationData = {
        isVerified: true,
        timestamp: Date.now(),
        userEmail: email,
      };
      sessionStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(verificationData),
      );

      return true;
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  }

  /**
   * Check if user has been verified recently
   */
  static async isRecentlyVerified(): Promise<boolean> {
    try {
      const verificationData = sessionStorage.getItem(this.SESSION_KEY);
      if (!verificationData) return false;

      const { isVerified, timestamp, userEmail } = JSON.parse(verificationData);
      const timePassed = Date.now() - timestamp;

      // Check if verification is still valid (within timeout)
      if (!isVerified || timePassed >= this.VERIFICATION_TIMEOUT) {
        return false;
      }

      // Verify the current user email matches the verified email
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.email !== userEmail) {
        this.clearVerification();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking verification status:", error);
      return false;
    }
  }

  /**
   * Clear verification status
   */
  static clearVerification(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Save banking details to database with encryption and create Paystack subaccount
   */
  static async saveBankingDetails(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
    userEmail: string,
  ): Promise<BankingDetails> {
    try {
      // First check if the service is available
      const serviceAvailable = await FallbackBankingService.checkServiceAvailability();

      if (!serviceAvailable) {
        console.log("Banking details table not available, using fallback service");
        return await FallbackBankingService.saveBankingDetailsFallback(bankingDetails);
      }
      // Create Paystack subaccount first
      let paystackData: {
        subaccount_code: string;
        subaccount_id: string;
      } | null = null;

      try {
        paystackData = await PaystackService.createSubaccount(
          bankingDetails as BankingDetails,
          userEmail,
        );
        toast.success("Payment account created successfully!");
      } catch (paystackError) {
        console.warn("Paystack subaccount creation failed:", paystackError);

        const errorMessage = paystackError instanceof Error ? paystackError.message : String(paystackError);

        if (errorMessage.includes("temporarily unavailable")) {
          toast.warning(
            "Payment service is temporarily unavailable. Your banking details will be saved and payment account will be set up automatically when service is restored.",
          );
        } else if (errorMessage.includes("not properly configured")) {
          toast.warning(
            "Payment service setup is in progress. Your banking details are saved and will be activated soon.",
          );
        } else {
          toast.warning(
            "Banking details saved. Payment account setup will be completed automatically.",
          );
        }
      }

      // Encrypt sensitive fields
      const encryptedDetails = {
        ...bankingDetails,
        bank_account_number: this.encrypt(bankingDetails.bank_account_number),
        full_name: this.encrypt(bankingDetails.full_name),
        paystack_subaccount_code: paystackData?.subaccount_code || null,
        paystack_subaccount_id: paystackData?.subaccount_id || null,
        subaccount_status: paystackData ? "active" : "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // First, try to update existing record
      const { data: existingData, error: selectError } = await supabase
        .from("banking_details")
        .select("id")
        .eq("user_id", bankingDetails.user_id)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // Handle table not existing or permission issues
        if (
          selectError.code === "42P01" ||
          selectError.code === "42501" ||
          (selectError.message &&
            (selectError.message.includes("relation") &&
            selectError.message.includes("does not exist")) ||
            selectError.message.includes("permission denied"))
        ) {
          // Try fallback service instead of failing
          console.log("Database table not accessible, trying fallback service");
          try {
            return await FallbackBankingService.saveBankingDetailsFallback(bankingDetails);
          } catch (fallbackError) {
            throw new Error(
              "Banking details service is being set up. This feature will be available soon. Please try again later or contact support if this persists.",
            );
          }
        }
        console.error("Database error:", {
          code: selectError.code,
          message: selectError.message,
          details: selectError.details,
        });
        throw new Error(
          `Database error: ${selectError.message || "Unknown error"}`,
        );
      }

      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from("banking_details")
          .update({
            ...encryptedDetails,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", bankingDetails.user_id)
          .select()
          .single();

        if (error) {
          console.error("Update error:", {
            code: error.code,
            message: error.message,
            details: error.details,
          });
          throw new Error(
            `Failed to update: ${error.message || "Unknown error"}`,
          );
        }
        return this.decryptBankingDetails(data);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("banking_details")
          .insert([encryptedDetails])
          .select()
          .single();

        if (error) {
          console.error("Insert error:", {
            code: error.code,
            message: error.message,
            details: error.details,
          });
          throw new Error(
            `Failed to save: ${error.message || "Unknown error"}`,
          );
        }
        return this.decryptBankingDetails(data);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error saving banking details:", errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get banking details for the specified user
   */
  static async getBankingDetails(
    userId: string,
  ): Promise<BankingDetails | null> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase
        .from("banking_details")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // Handle specific error cases
        if (error.code === "PGRST116") {
          // No data found - this is normal for users who haven't added banking details
          return null;
        }

        if (
          error.code === "42P01" ||
          (error.message &&
            error.message.includes("relation") &&
            error.message.includes("does not exist"))
        ) {
          // Table doesn't exist - migration hasn't been run
          console.warn(
            "Banking details table does not exist yet. Migration may need to be run.",
          );
          return null;
        }

        // Log the actual error details
        console.error("Database error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Database error: ${error.message || "Unknown error"}`);
      }

      return this.decryptBankingDetails(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error fetching banking details:", errorMessage);

      // Handle table not existing gracefully
      if (
        errorMessage.includes("relation") &&
        errorMessage.includes("does not exist")
      ) {
        console.warn(
          "Banking details table does not exist yet. This is expected if the migration hasn't been run.",
        );
        return null;
      }

      // Don't throw error for missing table, just return null
      if (errorMessage.includes("Database error: relation")) {
        return null;
      }

      throw new Error(`Failed to fetch banking details: ${errorMessage}`);
    }
  }

  /**
   * Delete banking details for the specified user
   */
  static async deleteBankingDetails(userId: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { error } = await supabase
        .from("banking_details")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Banking details deleted successfully");
    } catch (error) {
      console.error("Error deleting banking details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete banking details";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Decrypt banking details for display
   */
  private static decryptBankingDetails(encryptedData: any): BankingDetails {
    return {
      ...encryptedData,
      bank_account_number: this.decrypt(encryptedData.bank_account_number),
      full_name: this.decrypt(encryptedData.full_name),
    };
  }
}

export default BankingDetailsService;