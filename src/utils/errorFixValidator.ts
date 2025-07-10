/**
 * Error Fix Validator
 * Tests all the implemented fixes to ensure errors are resolved
 */

export interface ValidationResult {
  category: string;
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

export class ErrorFixValidator {
  private results: ValidationResult[] = [];

  /**
   * Run all validation tests
   */
  async validateAllFixes(): Promise<ValidationResult[]> {
    this.results = [];

    console.log("🔍 Running error fix validation...");

    // Test CSP configuration
    await this.testCSPConfiguration();

    // Test React context availability
    this.testReactContextAvailability();

    // Test analytics removal
    this.testAnalyticsRemoval();

    // Test storage handling
    this.testStorageHandling();

    // Test third-party error handling
    this.testThirdPartyErrorHandling();

    // Test overall error prevention
    await this.testOverallErrorPrevention();

    return this.results;
  }

  /**
   * Test CSP configuration
   */
  private async testCSPConfiguration(): Promise<void> {
    try {
      // Check if CSP headers are properly configured
      const response = await fetch(window.location.href, { method: "HEAD" });
      const csp = response.headers.get("Content-Security-Policy");

      const requiredDomains = [
        "vercel.live",
        "vitals.vercel-analytics.com",
        "js.paystack.co",
        "maps.googleapis.com",
        "www.googletagmanager.com",
      ];

      let allDomainsAllowed = true;
      const missingDomains: string[] = [];

      for (const domain of requiredDomains) {
        if (!csp?.includes(domain)) {
          allDomainsAllowed = false;
          missingDomains.push(domain);
        }
      }

      this.addResult({
        category: "CSP",
        test: "Required domains allowed",
        passed: allDomainsAllowed,
        message: allDomainsAllowed
          ? "All required domains are allowed in CSP"
          : `Missing domains: ${missingDomains.join(", ")}`,
        details: { csp, missingDomains },
      });
    } catch (error: any) {
      this.addResult({
        category: "CSP",
        test: "CSP header check",
        passed: false,
        message: `Failed to check CSP: ${error.message}`,
      });
    }
  }

  /**
   * Test React context availability
   */
  private testReactContextAvailability(): void {
    try {
      // Test if React and createContext are available
      const reactAvailable = typeof React !== "undefined";
      const createContextAvailable =
        reactAvailable && typeof React.createContext === "function";

      this.addResult({
        category: "React",
        test: "React availability",
        passed: reactAvailable,
        message: reactAvailable
          ? "React is properly available"
          : "React is not available in global scope",
      });

      this.addResult({
        category: "React",
        test: "createContext availability",
        passed: createContextAvailable,
        message: createContextAvailable
          ? "React.createContext is available"
          : "React.createContext is not available",
      });

      // Test if window.React is available for third-party scripts
      const windowReactAvailable = typeof (window as any).React !== "undefined";
      this.addResult({
        category: "React",
        test: "Window React for third-party",
        passed: windowReactAvailable,
        message: windowReactAvailable
          ? "React is available on window for third-party scripts"
          : "React is not available on window (may cause third-party errors)",
      });
    } catch (error: any) {
      this.addResult({
        category: "React",
        test: "React context test",
        passed: false,
        message: `Error testing React: ${error.message}`,
      });
    }
  }

  /**
   * Test analytics removal
   */
  private testAnalyticsRemoval(): void {
    try {
      // Test gtag is removed
      const gtagExists = typeof (window as any).gtag === "function";
      this.addResult({
        category: "Analytics",
        test: "gtag removal",
        passed: !gtagExists,
        message: !gtagExists
          ? "gtag successfully removed"
          : "gtag still present",
      });

      // Test dataLayer is removed
      const dataLayerExists = Array.isArray((window as any).dataLayer);
      this.addResult({
        category: "Analytics",
        test: "dataLayer removal",
        passed: !dataLayerExists,
        message: !dataLayerExists
          ? "dataLayer successfully removed"
          : "dataLayer still present",
      });

      // Test no analytics scripts in DOM
      const analyticsScripts = document.querySelectorAll(
        'script[src*="google-analytics"], script[src*="googletagmanager"], script[src*="gtag"]',
      );
      this.addResult({
        category: "Analytics",
        test: "Analytics scripts removal",
        passed: analyticsScripts.length === 0,
        message:
          analyticsScripts.length === 0
            ? "All analytics scripts removed"
            : `${analyticsScripts.length} analytics scripts still present`,
      });
    } catch (error: any) {
      this.addResult({
        category: "Analytics",
        test: "Analytics removal test",
        passed: false,
        message: `Error testing analytics removal: ${error.message}`,
      });
    }
  }

  /**
   * Test storage handling
   */
  private testStorageHandling(): void {
    try {
      // Test localStorage availability
      const localStorageAvailable = typeof window.localStorage !== "undefined";
      this.addResult({
        category: "Storage",
        test: "localStorage availability",
        passed: localStorageAvailable,
        message: localStorageAvailable
          ? "localStorage is available"
          : "localStorage is not available",
      });

      // Test storage operations
      const testKey = "__error_fix_test__";
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });

      try {
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        this.addResult({
          category: "Storage",
          test: "Storage operations",
          passed: retrieved === testValue,
          message:
            retrieved === testValue
              ? "Storage operations work correctly"
              : "Storage operations failed",
        });
      } catch (storageError: any) {
        this.addResult({
          category: "Storage",
          test: "Storage operations",
          passed: false,
          message: `Storage operation failed: ${storageError.message}`,
        });
      }
    } catch (error: any) {
      this.addResult({
        category: "Storage",
        test: "Storage test",
        passed: false,
        message: `Error testing storage: ${error.message}`,
      });
    }
  }

  /**
   * Test third-party error handling
   */
  private testThirdPartyErrorHandling(): void {
    try {
      // Test if error handler is active
      const hasErrorHandler = window.addEventListener
        .toString()
        .includes("error");

      // Test if console.error is wrapped
      const consoleErrorWrapped =
        console.error.toString().includes("originalError") ||
        console.error.toString().length > 50;

      this.addResult({
        category: "Error Handling",
        test: "Global error handler",
        passed: hasErrorHandler,
        message: hasErrorHandler
          ? "Global error handler is installed"
          : "Global error handler may not be installed",
      });

      this.addResult({
        category: "Error Handling",
        test: "Console error filtering",
        passed: consoleErrorWrapped,
        message: consoleErrorWrapped
          ? "Console error filtering is active"
          : "Console error filtering may not be active",
      });
    } catch (error: any) {
      this.addResult({
        category: "Error Handling",
        test: "Error handling test",
        passed: false,
        message: `Error testing error handling: ${error.message}`,
      });
    }
  }

  /**
   * Test overall error prevention
   */
  private async testOverallErrorPrevention(): Promise<void> {
    try {
      // Simulate common error scenarios and check if they're handled

      // Test 1: Simulate createContext error
      try {
        if (typeof React !== "undefined" && React.createContext) {
          const testContext = React.createContext(null);
          this.addResult({
            category: "Prevention",
            test: "createContext simulation",
            passed: true,
            message: "createContext works without errors",
          });
        } else {
          this.addResult({
            category: "Prevention",
            test: "createContext simulation",
            passed: false,
            message: "createContext is not available",
          });
        }
      } catch (error: any) {
        this.addResult({
          category: "Prevention",
          test: "createContext simulation",
          passed: false,
          message: `createContext failed: ${error.message}`,
        });
      }

      // Test 2: Simulate gtag call
      try {
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "test_event", { test: true });
          this.addResult({
            category: "Prevention",
            test: "gtag call simulation",
            passed: true,
            message: "gtag calls work without errors",
          });
        } else {
          this.addResult({
            category: "Prevention",
            test: "gtag call simulation",
            passed: false,
            message: "gtag is not available",
          });
        }
      } catch (error: any) {
        this.addResult({
          category: "Prevention",
          test: "gtag call simulation",
          passed: false,
          message: `gtag call failed: ${error.message}`,
        });
      }
    } catch (error: any) {
      this.addResult({
        category: "Prevention",
        test: "Overall prevention test",
        passed: false,
        message: `Error in prevention test: ${error.message}`,
      });
    }
  }

  /**
   * Add a result to the results array
   */
  private addResult(result: ValidationResult): void {
    this.results.push(result);

    const icon = result.passed ? "✅" : "❌";
    const message = `${icon} [${result.category}] ${result.test}: ${result.message}`;

    if (result.passed) {
      console.log(message);
    } else {
      console.warn(message);
    }
  }

  /**
   * Get summary of results
   */
  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    categories: Record<string, { passed: number; total: number }>;
  } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    const categories: Record<string, { passed: number; total: number }> = {};

    for (const result of this.results) {
      if (!categories[result.category]) {
        categories[result.category] = { passed: 0, total: 0 };
      }
      categories[result.category].total++;
      if (result.passed) {
        categories[result.category].passed++;
      }
    }

    return { total, passed, failed, categories };
  }

  /**
   * Run validation and return summary
   */
  static async runValidation(): Promise<{
    results: ValidationResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      categories: Record<string, { passed: number; total: number }>;
    };
  }> {
    const validator = new ErrorFixValidator();
    const results = await validator.validateAllFixes();
    const summary = validator.getSummary();

    console.log("\n🔍 Error Fix Validation Summary:");
    console.log(`Total tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log("\nBy category:");

    for (const [category, stats] of Object.entries(summary.categories)) {
      console.log(`  ${category}: ${stats.passed}/${stats.total}`);
    }

    return { results, summary };
  }
}

export default ErrorFixValidator;
