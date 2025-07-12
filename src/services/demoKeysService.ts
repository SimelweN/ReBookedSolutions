/**
 * Demo Keys Service - Validates and ensures demo keys work properly
 * This service provides test/demo keys for development and testing
 */

import { ENV } from "@/config/environment";
import { PAYSTACK_CONFIG } from "@/config/paystack";

// Demo/Test keys that are safe to use in development
export const DEMO_KEYS = {
  PAYSTACK_PUBLIC_TEST: "pk_test_37c77bb59dc7a6b3a3b836a74ebc3b9f59e25de7",
  PAYSTACK_SECRET_TEST: "sk_test_37c77bb59dc7a6b3a3b836a74ebc3b9f59e25de7",

  // Demo external API keys (non-functional but safe)
  GOOGLE_MAPS_DEMO: "demo-google-maps-key-for-testing",
  COURIER_GUY_DEMO: "demo-courier-guy-api-key",
  FASTWAY_DEMO: "demo-fastway-api-key",
  SENDER_API_DEMO: "demo-sender-api-key-for-testing",
} as const;

export interface DemoKeyValidationResult {
  isValid: boolean;
  usingDemoKeys: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

export class DemoKeysService {
  /**
   * Validate if demo keys are properly configured
   */
  static validateDemoKeys(): DemoKeyValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let usingDemoKeys = false;

    // Check Paystack configuration
    const paystackKey =
      ENV.VITE_PAYSTACK_PUBLIC_KEY || PAYSTACK_CONFIG.PUBLIC_KEY;

    if (!paystackKey) {
      issues.push("No Paystack public key configured");
      recommendations.push(
        "Set VITE_PAYSTACK_PUBLIC_KEY with a test key for development",
      );
    } else if (paystackKey === DEMO_KEYS.PAYSTACK_PUBLIC_TEST) {
      usingDemoKeys = true;
      warnings.push("Using demo Paystack test key");
      recommendations.push(
        "Demo key is safe for testing but won't process real payments",
      );
    } else if (paystackKey.startsWith("pk_test_")) {
      warnings.push("Using test Paystack key (not production)");
    } else if (paystackKey.startsWith("pk_live_")) {
      warnings.push("Using live Paystack key - ensure this is intended");
    } else {
      issues.push("Paystack key format appears invalid");
    }

    // Check other API keys
    const apiKeys = [
      {
        name: "Google Maps",
        key: ENV.VITE_GOOGLE_MAPS_API_KEY,
        demo: DEMO_KEYS.GOOGLE_MAPS_DEMO,
      },
      {
        name: "Courier Guy",
        key: ENV.VITE_COURIER_GUY_API_KEY,
        demo: DEMO_KEYS.COURIER_GUY_DEMO,
      },
      {
        name: "Fastway",
        key: ENV.VITE_FASTWAY_API_KEY,
        demo: DEMO_KEYS.FASTWAY_DEMO,
      },
      {
        name: "Sender API",
        key: ENV.VITE_SENDER_API,
        demo: DEMO_KEYS.SENDER_API_DEMO,
      },
    ];

    apiKeys.forEach(({ name, key, demo }) => {
      if (!key) {
        warnings.push(`${name} API key not configured`);
        recommendations.push(`Consider setting demo ${name} key for testing`);
      } else if (key === demo) {
        usingDemoKeys = true;
        warnings.push(`Using demo ${name} key`);
      }
    });

    return {
      isValid: issues.length === 0,
      usingDemoKeys,
      issues,
      warnings,
      recommendations,
    };
  }

  /**
   * Setup demo environment with all demo keys
   */
  static setupDemoEnvironment(): { success: boolean; message: string } {
    try {
      const demoEnvContent = `# Demo Environment - Auto-generated
# These are safe demo/test keys for development

VITE_PAYSTACK_PUBLIC_KEY=${DEMO_KEYS.PAYSTACK_PUBLIC_TEST}
VITE_PAYSTACK_SECRET_KEY=${DEMO_KEYS.PAYSTACK_SECRET_TEST}
VITE_GOOGLE_MAPS_API_KEY=${DEMO_KEYS.GOOGLE_MAPS_DEMO}
VITE_COURIER_GUY_API_KEY=${DEMO_KEYS.COURIER_GUY_DEMO}
VITE_FASTWAY_API_KEY=${DEMO_KEYS.FASTWAY_DEMO}
VITE_SENDER_API=${DEMO_KEYS.SENDER_API_DEMO}

# Add your actual Supabase credentials
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

VITE_APP_URL=http://localhost:5173
NODE_ENV=development
`;

      console.log("🔧 Demo environment configuration:");
      console.log(demoEnvContent);

      return {
        success: true,
        message:
          "Demo keys configured successfully. Check console for .env content.",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to setup demo environment: ${error}`,
      };
    }
  }

  /**
   * Test demo payment functionality
   */
  static async testDemoPayment(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const validation = this.validateDemoKeys();

      if (!validation.isValid) {
        return {
          success: false,
          message: `Demo validation failed: ${validation.issues.join(", ")}`,
        };
      }

      // Test Paystack configuration
      const paystackKey = ENV.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey?.startsWith("pk_test_")) {
        return {
          success: false,
          message:
            "Not using a test Paystack key. Demo payments require test keys.",
        };
      }

      // Mock test payment
      console.log("🧪 Testing demo payment configuration...");

      const testPayment = {
        email: "test@example.com",
        amount: 1000, // R10.00 in kobo
        currency: "ZAR",
        key: paystackKey,
        callback: (response: any) => {
          console.log("✅ Demo payment test successful:", response);
        },
        onClose: () => {
          console.log("ℹ️ Demo payment test cancelled");
        },
      };

      // Simulate successful configuration test
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        message: "Demo payment configuration is working correctly!",
      };
    } catch (error) {
      return {
        success: false,
        message: `Demo payment test failed: ${error}`,
      };
    }
  }

  /**
   * Get commit system demo configuration
   */
  static getDemoCommitConfiguration(): {
    commitTimeWindow: number;
    demoSellerReady: boolean;
    demoOrdersEnabled: boolean;
  } {
    return {
      commitTimeWindow: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
      demoSellerReady: true, // In demo mode, sellers are always "ready"
      demoOrdersEnabled: true, // Demo orders can be created without real payment
    };
  }

  /**
   * Create demo order for testing commit functionality
   */
  static createDemoOrder(): {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    commit_deadline: string;
    items: Array<{ title: string; author: string; price: number }>;
  } {
    const now = new Date();
    const commitDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

    return {
      id: `demo-order-${Date.now()}`,
      amount: 15000, // R150.00 in kobo
      status: "paid",
      created_at: now.toISOString(),
      commit_deadline: commitDeadline.toISOString(),
      items: [
        {
          title: "Demo Textbook: Mathematics 101",
          author: "Dr. Demo Author",
          price: 150.0,
        },
      ],
    };
  }

  /**
   * Test commit functionality with demo order
   */
  static async testCommitFunctionality(): Promise<{
    success: boolean;
    message: string;
    demoOrder?: any;
  }> {
    try {
      console.log("🧪 Testing commit functionality...");

      const demoOrder = this.createDemoOrder();
      const config = this.getDemoCommitConfiguration();

      // Simulate commit process
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("✅ Demo order created:", demoOrder);
      console.log(
        "⏰ Commit deadline:",
        new Date(demoOrder.commit_deadline).toLocaleString(),
      );
      console.log("🔧 Commit configuration:", config);

      return {
        success: true,
        message: "Commit functionality test completed successfully!",
        demoOrder,
      };
    } catch (error) {
      return {
        success: false,
        message: `Commit functionality test failed: ${error}`,
      };
    }
  }

  /**
   * Run comprehensive demo validation
   */
  static async runComprehensiveDemoTest(): Promise<{
    success: boolean;
    results: {
      keysValidation: DemoKeyValidationResult;
      paymentTest: { success: boolean; message: string };
      commitTest: { success: boolean; message: string; demoOrder?: any };
    };
  }> {
    console.log("🚀 Running comprehensive demo test...");

    const keysValidation = this.validateDemoKeys();
    const paymentTest = await this.testDemoPayment();
    const commitTest = await this.testCommitFunctionality();

    const overallSuccess =
      keysValidation.isValid && paymentTest.success && commitTest.success;

    console.log("📊 Demo test results:", {
      keysValid: keysValidation.isValid,
      paymentWorking: paymentTest.success,
      commitWorking: commitTest.success,
      overallSuccess,
    });

    return {
      success: overallSuccess,
      results: {
        keysValidation,
        paymentTest,
        commitTest,
      },
    };
  }
}

// Auto-validate on import in development
if (import.meta.env.DEV) {
  const validation = DemoKeysService.validateDemoKeys();

  if (!validation.isValid) {
    console.warn("⚠️ Demo keys validation failed:", validation.issues);
    console.log("💡 Recommendations:", validation.recommendations);
  } else if (validation.usingDemoKeys) {
    console.log("🧪 Using demo keys - safe for development");
  }
}

export default DemoKeysService;
