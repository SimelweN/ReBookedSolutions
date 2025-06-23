/**
 * Simple test for encryption utilities
 * Only for debugging - will be removed
 */

import { EncryptionUtils } from "./encryptionUtils";

export const testEncryption = () => {
  try {
    const testData = "test-account-number-123456";
    const testPassword = "testpassword123";
    const testUserId = "test-user-id";

    console.log("Testing encryption...");

    // Test basic encryption/decryption
    const encrypted = EncryptionUtils.encryptBankingData(
      testData,
      testPassword,
      testUserId,
    );
    console.log("Encryption result:", {
      hasEncryptedData: !!encrypted.encryptedData,
      hasSalt: !!encrypted.salt,
    });

    const decrypted = EncryptionUtils.decryptBankingData(
      encrypted.encryptedData,
      encrypted.salt,
      testPassword,
      testUserId,
    );

    const success = decrypted === testData;
    console.log("Decryption test:", {
      success,
      originalLength: testData.length,
      decryptedLength: decrypted.length,
    });

    // Test password hashing
    const hash1 = EncryptionUtils.hashPassword(testPassword);
    const hash2 = EncryptionUtils.hashPassword(testPassword);
    const verify = EncryptionUtils.verifyPassword(testPassword, hash1);

    console.log("Password test:", {
      hashesMatch: hash1 === hash2,
      verificationWorks: verify,
      hashLength: hash1.length,
    });

    return {
      encryptionWorks: success,
      passwordHashingWorks: verify && hash1 === hash2,
      overall: success && verify && hash1 === hash2,
    };
  } catch (error) {
    console.error("Encryption test failed:", error);
    return {
      encryptionWorks: false,
      passwordHashingWorks: false,
      overall: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
