/**
 * Secure banking details service with password-based encryption
 * Encrypts sensitive banking data using user's login password
 */

import { supabase } from "@/integrations/supabase/client";
import { BankingDetails } from "@/types/banking";
import { PaystackService } from "@/services/paystackService";
import { DatabaseSetup } from "@/utils/databaseSetup";
import { EncryptionUtils } from "@/utils/encryptionUtils";
import { toast } from "sonner";

export interface EncryptedBankingDetails
  extends Omit<
    BankingDetails,
    "bank_account_number" | "full_name" | "id_number" | "phone_number"
  > {
  encrypted_data: string;
  encryption_salt: string;
  fields_encrypted: string[];
  password_hash?: string; // For verification
}

export class SecureBankingService {
  /**
   * Save banking details with password-based encryption
   */
  static async saveBankingDetails(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
    userPassword: string,
  ): Promise<BankingDetails> {
    try {
      // Check if database is available
      const dbAvailable = await DatabaseSetup.checkBankingTableExists();

      if (!dbAvailable) {
        // Use encrypted localStorage fallback
        return this.saveToLocalStorageEncrypted(bankingDetails, userPassword);
      }

      // Encrypt sensitive banking details
      const encrypted = EncryptionUtils.encryptBankingDetails(
        bankingDetails,
        userPassword,
        bankingDetails.user_id,
      );

      // Prepare database record
      const dbRecord: Partial<EncryptedBankingDetails> = {
        user_id: bankingDetails.user_id,
        bank_name: bankingDetails.bank_name,
        recipient_type: bankingDetails.recipient_type,
        account_type: bankingDetails.account_type,
        encrypted_data: encrypted.encryptedData,
        encryption_salt: encrypted.salt,
        fields_encrypted: encrypted.fieldsEncrypted,
        password_hash: EncryptionUtils.hashPassword(userPassword),
        account_verified: false,
      };

      // Save to database
      const { data, error } = await supabase
        .from("banking_details")
        .upsert(dbRecord)
        .select()
        .single();

      if (error) {
        console.error("Database save failed:", error);
        // Fallback to localStorage if database save fails
        return this.saveToLocalStorageEncrypted(bankingDetails, userPassword);
      }

      // Try to create Paystack subaccount if possible
      try {
        const { user } = await supabase.auth.getUser();
        if (user.data.user?.email) {
          const paystackResult = await PaystackService.createSubaccount(
            bankingDetails,
            user.data.user.email,
          );

          // Update record with Paystack details
          await supabase
            .from("banking_details")
            .update({
              subaccount_code: paystackResult.subaccount_code,
              paystack_subaccount_id: paystackResult.subaccount_id,
              account_verified: true,
            })
            .eq("id", data.id);

          toast.success("Banking details saved and payment account created!");
        }
      } catch (paystackError) {
        console.warn(
          "Paystack setup failed, but banking details saved:",
          paystackError,
        );
        toast.success(
          "Banking details saved! Payment account will be set up automatically when needed.",
        );
      }

      // Return decrypted details for immediate use
      return this.decryptBankingDetails(
        data as EncryptedBankingDetails,
        userPassword,
      );
    } catch (error) {
      console.error("Error saving banking details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save banking details";
      toast.error(`Failed to save banking details: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get banking details with password-based decryption
   */
  static async getBankingDetails(
    userId: string,
    userPassword: string,
  ): Promise<BankingDetails | null> {
    try {
      // Check database first
      const dbAvailable = await DatabaseSetup.checkBankingTableExists();

      if (dbAvailable) {
        const { data, error } = await supabase
          .from("banking_details")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (!error && data) {
          // Verify password
          if (
            data.password_hash &&
            !EncryptionUtils.verifyPassword(userPassword, data.password_hash)
          ) {
            throw new Error("Invalid password for banking details access");
          }

          return this.decryptBankingDetails(
            data as EncryptedBankingDetails,
            userPassword,
          );
        }
      }

      // Check localStorage fallback
      return this.getFromLocalStorageEncrypted(userId, userPassword);
    } catch (error) {
      console.error("Error retrieving banking details:", error);
      if (
        error instanceof Error &&
        error.message.includes("Invalid password")
      ) {
        toast.error("Invalid password for accessing banking details");
      }
      return null;
    }
  }

  /**
   * Check if user has banking details
   */
  static async hasBankingDetails(userId: string): Promise<boolean> {
    try {
      // Check database
      const dbAvailable = await DatabaseSetup.checkBankingTableExists();

      if (dbAvailable) {
        const { data, error } = await supabase
          .from("banking_details")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!error && data) {
          return true;
        }
      }

      // Check localStorage
      return this.hasLocalStorageEncrypted(userId);
    } catch (error) {
      console.error("Error checking banking details:", error);
      return false;
    }
  }

  /**
   * Delete banking details
   */
  static async deleteBankingDetails(
    userId: string,
    userPassword: string,
  ): Promise<void> {
    try {
      // Verify password first by trying to decrypt
      const existing = await this.getBankingDetails(userId, userPassword);
      if (!existing) {
        throw new Error("No banking details found or invalid password");
      }

      // Delete from database
      const dbAvailable = await DatabaseSetup.checkBankingTableExists();

      if (dbAvailable) {
        await supabase.from("banking_details").delete().eq("user_id", userId);
      }

      // Delete from localStorage
      this.clearLocalStorageEncrypted(userId);

      toast.success("Banking details deleted successfully");
    } catch (error) {
      console.error("Error deleting banking details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete banking details";
      toast.error(`Failed to delete banking details: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update password for existing banking details
   */
  static async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // First, get the current details with old password
      const currentDetails = await this.getBankingDetails(userId, oldPassword);
      if (!currentDetails) {
        throw new Error("Banking details not found or invalid old password");
      }

      // Re-encrypt with new password
      const encrypted = EncryptionUtils.encryptBankingDetails(
        currentDetails,
        newPassword,
        userId,
      );

      // Update in database
      const dbAvailable = await DatabaseSetup.checkBankingTableExists();

      if (dbAvailable) {
        await supabase
          .from("banking_details")
          .update({
            encrypted_data: encrypted.encryptedData,
            encryption_salt: encrypted.salt,
            password_hash: EncryptionUtils.hashPassword(newPassword),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }

      // Update localStorage
      this.saveToLocalStorageEncrypted(currentDetails, newPassword);

      toast.success("Banking details password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update password";
      toast.error(`Failed to update password: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Decrypt banking details from database record
   */
  private static decryptBankingDetails(
    encryptedRecord: EncryptedBankingDetails,
    userPassword: string,
  ): BankingDetails {
    const decryptedData = EncryptionUtils.decryptBankingDetails(
      encryptedRecord.encrypted_data,
      encryptedRecord.encryption_salt,
      userPassword,
      encryptedRecord.user_id,
      encryptedRecord.fields_encrypted,
    );

    return {
      id: encryptedRecord.id!,
      user_id: encryptedRecord.user_id,
      bank_name: encryptedRecord.bank_name,
      recipient_type: encryptedRecord.recipient_type,
      account_type: encryptedRecord.account_type,
      account_verified: encryptedRecord.account_verified,
      subaccount_code: encryptedRecord.subaccount_code,
      paystack_subaccount_id: encryptedRecord.paystack_subaccount_id,
      created_at: encryptedRecord.created_at!,
      updated_at: encryptedRecord.updated_at!,
      ...decryptedData,
    };
  }

  /**
   * Save to encrypted localStorage
   */
  private static saveToLocalStorageEncrypted(
    bankingDetails: Omit<BankingDetails, "id" | "created_at" | "updated_at">,
    userPassword: string,
  ): BankingDetails {
    const storageKey = `secure_banking_${bankingDetails.user_id}`;

    const encrypted = EncryptionUtils.encryptBankingDetails(
      bankingDetails,
      userPassword,
      bankingDetails.user_id,
    );

    const record = {
      id: `fallback_${Date.now()}`,
      ...bankingDetails,
      encrypted_data: encrypted.encryptedData,
      encryption_salt: encrypted.salt,
      fields_encrypted: encrypted.fieldsEncrypted,
      password_hash: EncryptionUtils.hashPassword(userPassword),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      account_verified: false,
    };

    localStorage.setItem(storageKey, JSON.stringify(record));

    toast.success("Banking details saved securely!", {
      description:
        "Details are encrypted and will sync when the database is available.",
      duration: 5000,
    });

    return record as BankingDetails;
  }

  /**
   * Get from encrypted localStorage
   */
  private static getFromLocalStorageEncrypted(
    userId: string,
    userPassword: string,
  ): BankingDetails | null {
    try {
      const storageKey = `secure_banking_${userId}`;
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const record = JSON.parse(stored) as EncryptedBankingDetails &
        BankingDetails;

      // Verify password
      if (
        record.password_hash &&
        !EncryptionUtils.verifyPassword(userPassword, record.password_hash)
      ) {
        throw new Error("Invalid password for banking details access");
      }

      // If it has encrypted data, decrypt it
      if (record.encrypted_data) {
        return this.decryptBankingDetails(record, userPassword);
      }

      // Return legacy record if no encryption
      return record;
    } catch (error) {
      console.error("Error retrieving from localStorage:", error);
      return null;
    }
  }

  /**
   * Check if localStorage has encrypted banking details
   */
  private static hasLocalStorageEncrypted(userId: string): boolean {
    const storageKey = `secure_banking_${userId}`;
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Clear encrypted localStorage
   */
  private static clearLocalStorageEncrypted(userId: string): void {
    const storageKey = `secure_banking_${userId}`;
    localStorage.removeItem(storageKey);
  }
}

export default SecureBankingService;
