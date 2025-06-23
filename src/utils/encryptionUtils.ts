import CryptoJS from "crypto-js";

/**
 * Secure encryption utilities for banking details
 * Uses AES encryption with user password as key
 */
export class EncryptionUtils {
  private static readonly SALT_PREFIX = "banking_salt_";
  private static readonly IV_LENGTH = 16; // 128-bit IV for AES

  /**
   * Generate a random salt for key derivation
   */
  private static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Derive encryption key from user password using PBKDF2
   */
  private static deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  /**
   * Encrypt banking details using user password
   */
  static encryptBankingData(
    data: string,
    userPassword: string,
    userId: string,
  ): {
    encryptedData: string;
    salt: string;
  } {
    try {
      // Generate a unique salt for this user
      const salt = this.generateSalt();

      // Derive encryption key from password and salt
      const key = this.deriveKey(userPassword, salt);

      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combine IV and encrypted data
      const combined = iv.concat(encrypted.ciphertext);

      return {
        encryptedData: combined.toString(CryptoJS.enc.Base64),
        salt: salt,
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to encrypt banking details");
    }
  }

  /**
   * Decrypt banking details using user password
   */
  static decryptBankingData(
    encryptedData: string,
    salt: string,
    userPassword: string,
    userId: string,
  ): string {
    try {
      // Derive the same key from password and salt
      const key = this.deriveKey(userPassword, salt);

      // Parse the encrypted data
      const combined = CryptoJS.enc.Base64.parse(encryptedData);

      // Extract IV and ciphertext
      const iv = CryptoJS.lib.WordArray.create(
        combined.words.slice(0, this.IV_LENGTH / 4),
      );
      const ciphertext = CryptoJS.lib.WordArray.create(
        combined.words.slice(this.IV_LENGTH / 4),
      );

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        },
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error(
        "Failed to decrypt banking details - invalid password or corrupted data",
      );
    }
  }

  /**
   * Generate a secure hash of the password for verification
   */
  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Verify password matches stored hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Store user's salt securely (can be stored in database)
   */
  static getSaltStorageKey(userId: string): string {
    return `${this.SALT_PREFIX}${userId}`;
  }

  /**
   * Encrypt entire banking details object
   */
  static encryptBankingDetails(
    bankingDetails: any,
    userPassword: string,
    userId: string,
  ): {
    encryptedData: string;
    salt: string;
    fieldsEncrypted: string[];
  } {
    const sensitiveFields = [
      "bank_account_number",
      "full_name",
      "id_number",
      "phone_number",
    ];

    const dataToEncrypt = JSON.stringify(
      Object.fromEntries(
        sensitiveFields
          .filter((field) => bankingDetails[field])
          .map((field) => [field, bankingDetails[field]]),
      ),
    );

    const encrypted = this.encryptBankingData(
      dataToEncrypt,
      userPassword,
      userId,
    );

    return {
      ...encrypted,
      fieldsEncrypted: sensitiveFields.filter((field) => bankingDetails[field]),
    };
  }

  /**
   * Decrypt entire banking details object
   */
  static decryptBankingDetails(
    encryptedData: string,
    salt: string,
    userPassword: string,
    userId: string,
    fieldsEncrypted: string[],
  ): any {
    const decryptedJson = this.decryptBankingData(
      encryptedData,
      salt,
      userPassword,
      userId,
    );

    return JSON.parse(decryptedJson);
  }
}

export default EncryptionUtils;
