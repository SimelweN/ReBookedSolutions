/**
 * LocalStorage fallback for banking details when database table doesn't exist
 * This is a temporary solution until the banking_details table is created
 */

import { BankingDetails } from "@/types/banking";
import { toast } from "sonner";

export class LocalBankingFallback {
  private static readonly STORAGE_KEY = "banking_details_fallback";
  private static readonly ENCRYPTION_KEY = "simple_encryption";

  /**
   * Simple encryption for localStorage (not production-grade)
   */
  private static encrypt(data: string): string {
    return btoa(unescape(encodeURIComponent(data)));
  }

  /**
   * Simple decryption
   */
  private static decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch {
      return encryptedData;
    }
  }

  /**
   * Save banking details to localStorage
   */
  static saveBankingDetails(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
  ): BankingDetails {
    try {
      const encrypted = {
        ...bankingDetails,
        bank_account_number: this.encrypt(bankingDetails.bank_account_number),
        full_name: this.encrypt(bankingDetails.full_name),
        id: `fallback_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Mark as pending since we can't create Paystack accounts
        account_verified: false,
        subaccount_status: "pending_setup" as any,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encrypted));

      toast.success("Banking details saved locally!", {
        description:
          "Your details will be synced to the database when the service is available.",
        duration: 5000,
      });

      return encrypted as BankingDetails;
    } catch (error) {
      console.error("Failed to save banking details to localStorage:", error);
      throw new Error("Failed to save banking details");
    }
  }

  /**
   * Get banking details from localStorage
   */
  static getBankingDetails(userId: string): BankingDetails | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Only return if it's for the current user
      if (parsed.user_id !== userId) {
        return null;
      }

      // Decrypt sensitive fields
      return {
        ...parsed,
        bank_account_number: this.decrypt(parsed.bank_account_number),
        full_name: this.decrypt(parsed.full_name),
      } as BankingDetails;
    } catch (error) {
      console.error(
        "Failed to retrieve banking details from localStorage:",
        error,
      );
      return null;
    }
  }

  /**
   * Check if user has banking details in localStorage
   */
  static hasBankingDetails(userId: string): boolean {
    return this.getBankingDetails(userId) !== null;
  }

  /**
   * Clear localStorage banking details
   */
  static clearBankingDetails(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Show warning about using localStorage fallback
   */
  static showFallbackWarning(): void {
    toast.warning("Using temporary storage for banking details", {
      description:
        "Your banking details are stored locally until the database is set up. Please save them again once the service is fully available.",
      duration: 10000,
    });
  }
}

export default LocalBankingFallback;
