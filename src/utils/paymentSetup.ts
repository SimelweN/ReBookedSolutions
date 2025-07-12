/**
 * Payment System Setup and Validation
 * Handles Paystack configuration and validation
 */

import { ENV } from "@/config/environment";

export interface PaymentConfig {
  isConfigured: boolean;
  isTestMode: boolean;
  publicKey: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Paystack configuration
 */
export function validatePaymentConfig(): PaymentConfig {
  const config: PaymentConfig = {
    isConfigured: false,
    isTestMode: false,
    publicKey: "",
    errors: [],
    warnings: [],
  };

  const publicKey = ENV.VITE_PAYSTACK_PUBLIC_KEY;

  // Check if key exists
  if (!publicKey || publicKey.trim() === "") {
    config.errors.push("Paystack public key is missing");
    return config;
  }

  // Check if it's a demo/placeholder key
  if (
    publicKey.includes("demo") ||
    publicKey.includes("your-") ||
    publicKey.includes("placeholder")
  ) {
    config.errors.push("Paystack public key appears to be a placeholder");
    return config;
  }

  // Validate key format
  if (!publicKey.startsWith("pk_")) {
    config.errors.push(
      "Invalid Paystack public key format (should start with 'pk_')",
    );
    return config;
  }

  // Determine if test or live key
  if (publicKey.startsWith("pk_test_")) {
    config.isTestMode = true;
    config.warnings.push(
      "Using Paystack test mode - real payments will not be processed",
    );
  } else if (publicKey.startsWith("pk_live_")) {
    config.isTestMode = false;
    if (ENV.NODE_ENV === "development") {
      config.warnings.push(
        "Using live Paystack key in development environment",
      );
    }
  } else {
    config.errors.push("Unknown Paystack key type");
    return config;
  }

  // Validate key length (Paystack keys are typically around 50+ characters)
  if (publicKey.length < 40) {
    config.errors.push(
      "Paystack public key appears to be truncated or invalid",
    );
    return config;
  }

  config.isConfigured = true;
  config.publicKey = publicKey;

  return config;
}

/**
 * Test Paystack connection
 */
export async function testPaystackConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const config = validatePaymentConfig();

    if (!config.isConfigured) {
      return {
        success: false,
        message: config.errors.join(", "),
      };
    }

    // Try to initialize Paystack (basic test)
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.publicKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: `Paystack connection successful (${config.isTestMode ? "test" : "live"} mode)`,
      };
    } else {
      return {
        success: false,
        message: "Paystack API responded with error - check your keys",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error}`,
    };
  }
}

/**
 * Get Paystack setup instructions
 */
export function getPaystackSetupInstructions(): string {
  return `
💳 PAYSTACK SETUP INSTRUCTIONS

1. Create Paystack Account:
   - Visit: https://dashboard.paystack.com
   - Sign up or log in

2. Get API Keys:
   - Go to Settings > API Keys & Webhooks
   - Copy your Public Key (starts with pk_test_ or pk_live_)

3. For Development:
   - Use test keys (pk_test_...)
   - Test payments with: 4084084084084081 (Visa test card)

4. For Production:
   - Complete business verification
   - Use live keys (pk_live_...)
   - Set up webhooks for payment notifications

5. Add to .env file:
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

⚠️ Security Notes:
- Never commit secret keys to version control
- Use test keys for development
- Live keys only in production environment
  `;
}

/**
 * Initialize payment system with validation
 */
export function initializePaymentSystem(): {
  success: boolean;
  config: PaymentConfig;
  instructions?: string;
} {
  const config = validatePaymentConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      config,
      instructions: getPaystackSetupInstructions(),
    };
  }

  // Additional warnings based on environment
  if (ENV.NODE_ENV === "production" && config.isTestMode) {
    config.warnings.push(
      "Using test keys in production - real payments will fail",
    );
  }

  return {
    success: true,
    config,
  };
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(
  amount: number,
  currency: string = "ZAR",
): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (amount <= 0) {
    return { valid: false, error: "Amount must be greater than zero" };
  }

  if (amount < 1) {
    return { valid: false, error: "Minimum amount is R1.00" };
  }

  if (amount > 1000000) {
    return { valid: false, error: "Maximum amount is R1,000,000.00" };
  }

  return { valid: true };
}

/**
 * Get payment status color for UI
 */
export function getPaymentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "success":
    case "paid":
      return "text-green-600 bg-green-50";
    case "pending":
    case "processing":
      return "text-yellow-600 bg-yellow-50";
    case "failed":
    case "error":
    case "cancelled":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}
