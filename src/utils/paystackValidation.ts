/**
 * Utility to validate Paystack configuration and integration
 */
import { PAYSTACK_CONFIG } from "@/config/paystack";

export class PaystackValidation {
  /**
   * Validate amount conversion (must be in kobo)
   */
  static validateAmount(amount: number): {
    isValid: boolean;
    message?: string;
  } {
    if (!amount || amount <= 0) {
      return { isValid: false, message: "Amount must be greater than 0" };
    }

    if (amount < 100) {
      // Less than R1
      return {
        isValid: false,
        message: "Amount too small for payment processing",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate payment reference format
   */
  static validateReference(reference: string): {
    isValid: boolean;
    message?: string;
  } {
    if (!reference || reference.length < 10) {
      return { isValid: false, message: "Invalid payment reference format" };
    }

    // Check if reference follows expected pattern
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(reference);
    if (!isValidFormat) {
      return {
        isValid: false,
        message: "Reference contains invalid characters",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate metadata for payment
   */
  static validateMetadata(metadata: Record<string, any>): {
    isValid: boolean;
    message?: string;
  } {
    const requiredFields = ["bookId", "sellerId"];

    for (const field of requiredFields) {
      if (!metadata[field]) {
        return {
          isValid: false,
          message: `Missing required metadata field: ${field}`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate subaccount code format
   */
  static validateSubaccountCode(code: string): {
    isValid: boolean;
    message?: string;
  } {
    if (!code || !code.startsWith("ACCT_")) {
      return { isValid: false, message: "Invalid subaccount code format" };
    }

    return { isValid: true };
  }

  /**
   * Check environment configuration
   */
  static checkEnvironment(): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check public key
    if (!PAYSTACK_CONFIG.PUBLIC_KEY) {
      issues.push("VITE_PAYSTACK_PUBLIC_KEY is not set");
    } else if (!PAYSTACK_CONFIG.PUBLIC_KEY.startsWith("pk_")) {
      issues.push("VITE_PAYSTACK_PUBLIC_KEY format is invalid");
    }

    // Check test vs live keys
    if (PAYSTACK_CONFIG.PUBLIC_KEY?.startsWith("pk_test_")) {
      warnings.push(
        "Using test keys - remember to switch to live keys for production",
      );
    }

    // Check callback URL
    if (!PAYSTACK_CONFIG.CALLBACK_URL) {
      issues.push("Callback URL is not configured");
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Debug payment data
   */
  static debugPaymentData(data: {
    amount: number;
    reference: string;
    metadata: Record<string, any>;
    subaccount?: string;
  }): void {
    if (!PAYSTACK_CONFIG.isDevelopment) return;

    console.group("🔍 Paystack Payment Debug");
    console.log("Amount (Rands):", data.amount / 100);
    console.log("Amount (Kobo):", data.amount);
    console.log("Reference:", data.reference);
    console.log("Metadata:", data.metadata);
    if (data.subaccount) {
      console.log("Subaccount:", data.subaccount);
    }
    console.groupEnd();
  }
}

export default PaystackValidation;
