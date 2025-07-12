import { PAYSTACK_CONFIG } from "@/config/paystack";
import { PaystackPaymentService } from "@/services/paystackPaymentService";

export interface PaymentSystemStatus {
  configuration: {
    isConfigured: boolean;
    isTestMode: boolean;
    isLiveMode: boolean;
    publicKeyFormat: string;
    status: string;
  };
  libraryLoading: {
    scriptLoaded: boolean;
    paystackPopAvailable: boolean;
    loadingMethod: string;
  };
  services: {
    paymentServiceInitialized: boolean;
    canGenerateReference: boolean;
    referenceFormat: string;
  };
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Comprehensive payment system tester
 */
export class PaymentSystemTester {
  static async runFullDiagnostic(): Promise<PaymentSystemStatus> {
    const result: PaymentSystemStatus = {
      configuration: {
        isConfigured: false,
        isTestMode: false,
        isLiveMode: false,
        publicKeyFormat: "Not set",
        status: "Unknown",
      },
      libraryLoading: {
        scriptLoaded: false,
        paystackPopAvailable: false,
        loadingMethod: "None",
      },
      services: {
        paymentServiceInitialized: false,
        canGenerateReference: false,
        referenceFormat: "Unknown",
      },
      errors: [],
      warnings: [],
      recommendations: [],
    };

    // Test 1: Configuration
    await this.testConfiguration(result);

    // Test 2: Library Loading
    await this.testLibraryLoading(result);

    // Test 3: Service Functions
    await this.testServiceFunctions(result);

    // Generate recommendations
    this.generateRecommendations(result);

    return result;
  }

  private static async testConfiguration(
    result: PaymentSystemStatus,
  ): Promise<void> {
    try {
      const config = PAYSTACK_CONFIG;

      // Check if configured
      result.configuration.isConfigured = config.isConfigured();
      result.configuration.isTestMode = config.isTestMode();
      result.configuration.isLiveMode = config.isLiveMode();

      // Check public key format
      const publicKey = config.PUBLIC_KEY;
      if (publicKey) {
        result.configuration.publicKeyFormat = `${publicKey.slice(0, 12)}...`;

        if (publicKey.startsWith("pk_test_")) {
          result.configuration.status = "Test Mode";
          result.warnings.push(
            "Running in test mode - real payments will not be processed",
          );
        } else if (publicKey.startsWith("pk_live_")) {
          result.configuration.status = "Live Mode";
          if (import.meta.env.DEV) {
            result.warnings.push(
              "Live keys detected in development environment",
            );
          }
        } else {
          result.errors.push(
            "Invalid public key format - must start with pk_test_ or pk_live_",
          );
        }
      } else {
        result.configuration.publicKeyFormat = "Not set";
        result.configuration.status = "Not configured";
        result.errors.push(
          "VITE_PAYSTACK_PUBLIC_KEY environment variable not set",
        );
      }
    } catch (error) {
      result.errors.push(`Configuration test failed: ${error}`);
    }
  }

  private static async testLibraryLoading(
    result: PaymentSystemStatus,
  ): Promise<void> {
    try {
      // Check if Paystack script is loaded
      const hasScript = document.querySelector('script[src*="paystack"]');
      result.libraryLoading.scriptLoaded = !!hasScript;

      // Check if PaystackPop is available
      const paystackPop = (window as any).PaystackPop;
      result.libraryLoading.paystackPopAvailable = !!paystackPop;

      if (paystackPop) {
        result.libraryLoading.loadingMethod = "Global PaystackPop available";
      } else if (hasScript) {
        result.libraryLoading.loadingMethod =
          "Script loaded but PaystackPop not available";
        result.warnings.push(
          "Paystack script found but PaystackPop object not accessible",
        );
      } else {
        result.libraryLoading.loadingMethod = "No Paystack script detected";

        // Try loading the script
        try {
          const loaded = await PaystackPaymentService.ensurePaystackLoaded();
          if (loaded) {
            result.libraryLoading.scriptLoaded = true;
            result.libraryLoading.paystackPopAvailable = !!(window as any)
              .PaystackPop;
            result.libraryLoading.loadingMethod = "Dynamically loaded";
          } else {
            result.errors.push("Failed to load Paystack script dynamically");
          }
        } catch (error) {
          result.errors.push(`Failed to load Paystack: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Library loading test failed: ${error}`);
    }
  }

  private static async testServiceFunctions(
    result: PaymentSystemStatus,
  ): Promise<void> {
    try {
      // Test service initialization
      result.services.paymentServiceInitialized = !!PaystackPaymentService;

      // Test reference generation
      try {
        const reference = PaystackPaymentService.generateReference();
        result.services.canGenerateReference = !!reference;
        result.services.referenceFormat = reference
          ? `${reference.slice(0, 15)}...`
          : "Failed";

        // Validate reference format
        if (reference && reference.startsWith("PSK_")) {
          // Good format
        } else {
          result.warnings.push("Generated reference has unexpected format");
        }
      } catch (error) {
        result.errors.push(`Reference generation failed: ${error}`);
      }

      // Test payment initialization (without actually processing)
      try {
        const testParams = {
          reference: "TEST_REF",
          email: "test@example.com",
          amount: 100,
          onSuccess: () => {},
          onCancel: () => {},
          onClose: () => {},
        };

        // This will fail if configuration is wrong
        // PaystackPaymentService.initializePayment(testParams);
      } catch (error) {
        result.warnings.push(`Payment initialization test skipped: ${error}`);
      }
    } catch (error) {
      result.errors.push(`Service function test failed: ${error}`);
    }
  }

  private static generateRecommendations(result: PaymentSystemStatus): void {
    // Configuration recommendations
    if (!result.configuration.isConfigured) {
      result.recommendations.push(
        "Set VITE_PAYSTACK_PUBLIC_KEY environment variable with your Paystack public key",
      );
    }

    if (result.configuration.isTestMode && import.meta.env.PROD) {
      result.recommendations.push(
        "Switch to live Paystack keys for production environment",
      );
    }

    if (result.configuration.isLiveMode && import.meta.env.DEV) {
      result.recommendations.push(
        "Consider using test keys in development environment",
      );
    }

    // Library loading recommendations
    if (!result.libraryLoading.paystackPopAvailable) {
      result.recommendations.push(
        "Ensure Paystack script loads before attempting payments",
      );
    }

    // Service recommendations
    if (!result.services.canGenerateReference) {
      result.recommendations.push(
        "Fix reference generation to ensure unique payment identifiers",
      );
    }

    // General recommendations
    if (result.errors.length === 0 && result.warnings.length === 0) {
      result.recommendations.push(
        "Payment system configuration looks good! Test with small amounts first.",
      );
    }
  }

  /**
   * Quick health check for payment system
   */
  static async quickHealthCheck(): Promise<{
    healthy: boolean;
    status: string;
    issues: string[];
  }> {
    const diagnostic = await this.runFullDiagnostic();

    const healthy = diagnostic.errors.length === 0;
    const issues = [...diagnostic.errors, ...diagnostic.warnings];

    let status = "Unknown";
    if (healthy) {
      if (diagnostic.configuration.isTestMode) {
        status = "Healthy (Test Mode)";
      } else if (diagnostic.configuration.isLiveMode) {
        status = "Healthy (Live Mode)";
      } else {
        status = "Healthy (Not Configured)";
      }
    } else {
      status = `${diagnostic.errors.length} Errors Found`;
    }

    return { healthy, status, issues };
  }
}

// Export convenience function
export const testPaymentSystem = () => PaymentSystemTester.runFullDiagnostic();
export const quickPaymentCheck = () => PaymentSystemTester.quickHealthCheck();
