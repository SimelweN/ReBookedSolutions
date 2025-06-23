import { supabase } from "@/integrations/supabase/client";
import { BankingDetails } from "@/types/banking";
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
   * Simple decryption for sensitive data
   */
  private static decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      return "";
    }
  }

  /**
   * Verify user password before accessing banking details
   */
  static async verifyPassword(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      // Store original session
      const originalSession = await supabase.auth.getSession();

      // Attempt to sign in with provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Password verification failed:", error.message);
        return false;
      }

      // Password is correct, but we need to restore the original session
      if (originalSession.data.session) {
        // Restore the original session
        await supabase.auth.setSession(originalSession.data.session);
      }

      // Store verification in session storage with timestamp
      const verificationData = {
        isVerified: true,
        timestamp: Date.now(),
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
  static isRecentlyVerified(): boolean {
    try {
      const verificationData = sessionStorage.getItem(this.SESSION_KEY);
      if (!verificationData) return false;

      const { isVerified, timestamp } = JSON.parse(verificationData);
      const timePassed = Date.now() - timestamp;

      return isVerified && timePassed < this.VERIFICATION_TIMEOUT;
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
   * Save banking details to database with encryption
   */
  static async saveBankingDetails(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
  ): Promise<BankingDetails> {
    try {
      // Encrypt sensitive fields
      const encryptedDetails = {
        ...bankingDetails,
        bank_account_number: this.encrypt(bankingDetails.bank_account_number),
        full_name: this.encrypt(bankingDetails.full_name),
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
        // Handle table not existing
        if (
          selectError.code === "42P01" ||
          (selectError.message &&
            selectError.message.includes("relation") &&
            selectError.message.includes("does not exist"))
        ) {
          throw new Error(
            "Banking details feature is not available yet. Please contact support.",
          );
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
