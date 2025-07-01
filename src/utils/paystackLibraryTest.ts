/**
 * Utility to test and debug Paystack library loading
 */

export interface PaystackTestResult {
  method: string;
  success: boolean;
  error?: string;
  details?: any;
}

export class PaystackLibraryTest {
  /**
   * Test all available methods to load Paystack
   */
  static async testAllMethods(): Promise<PaystackTestResult[]> {
    const results: PaystackTestResult[] = [];

    // Test 1: NPM package import
    try {
      const paystackModule = await import("@paystack/inline-js");
      let PaystackPop = null;

      if (paystackModule.PaystackPop) {
        PaystackPop = paystackModule.PaystackPop;
      } else if (paystackModule.default) {
        PaystackPop = paystackModule.default;
      } else if (typeof paystackModule === "function") {
        PaystackPop = paystackModule;
      }

      results.push({
        method: "NPM Package Import",
        success: !!PaystackPop,
        details: {
          module: paystackModule,
          PaystackPop: PaystackPop,
          moduleKeys: Object.keys(paystackModule),
          moduleType: typeof paystackModule,
        },
      });
    } catch (error) {
      results.push({
        method: "NPM Package Import",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 2: Global window.PaystackPop
    try {
      const windowPaystackPop = (window as any).PaystackPop;
      results.push({
        method: "Global window.PaystackPop",
        success: !!windowPaystackPop,
        details: {
          available: !!windowPaystackPop,
          type: typeof windowPaystackPop,
          constructor: windowPaystackPop?.constructor?.name,
        },
      });
    } catch (error) {
      results.push({
        method: "Global window.PaystackPop",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 3: Global window.Paystack
    try {
      const windowPaystack = (window as any).Paystack;
      results.push({
        method: "Global window.Paystack",
        success: !!windowPaystack,
        details: {
          available: !!windowPaystack,
          type: typeof windowPaystack,
          hasSetup: typeof windowPaystack?.setup === "function",
          methods: windowPaystack ? Object.keys(windowPaystack) : [],
        },
      });
    } catch (error) {
      results.push({
        method: "Global window.Paystack",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 4: Check all Paystack-related objects on window
    try {
      const paystackKeys = Object.keys(window).filter((key) =>
        key.toLowerCase().includes("paystack"),
      );

      results.push({
        method: "Window Paystack Objects Scan",
        success: paystackKeys.length > 0,
        details: {
          foundKeys: paystackKeys,
          objects: paystackKeys.reduce((acc, key) => {
            acc[key] = {
              type: typeof (window as any)[key],
              value: (window as any)[key],
            };
            return acc;
          }, {} as any),
        },
      });
    } catch (error) {
      results.push({
        method: "Window Paystack Objects Scan",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 5: Dynamic script loading
    try {
      const scriptLoaded = await this.loadPaystackScript();
      const windowPaystackPop = (window as any).PaystackPop;

      results.push({
        method: "Dynamic Script Loading",
        success: scriptLoaded && !!windowPaystackPop,
        details: {
          scriptLoaded,
          paystackPopAvailable: !!windowPaystackPop,
          paystackPopType: typeof windowPaystackPop,
        },
      });
    } catch (error) {
      results.push({
        method: "Dynamic Script Loading",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return results;
  }

  /**
   * Load Paystack script if not already loaded
   */
  private static async loadPaystackScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="paystack"]');
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => {
        setTimeout(() => resolve(!!(window as any).PaystackPop), 100);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  /**
   * Print test results to console
   */
  static logResults(results: PaystackTestResult[]): void {
    console.log("=== Paystack Library Test Results ===");
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.method}`);
      console.log(`   Success: ${result.success}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
    });
    console.log("\n=== End Test Results ===");
  }
}
