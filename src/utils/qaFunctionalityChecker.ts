/**
 * Comprehensive QA Functionality Checker
 * Tests all critical functionality without modifying UI
 */

import { supabase } from "@/integrations/supabase/client";
import { ENV } from "@/config/environment";
import { runAPSVerification } from "./apsVerificationTest";

export interface QATestResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: any;
  timestamp: string;
}

export class QAFunctionalityChecker {
  private results: QATestResult[] = [];

  private addResult(result: Omit<QATestResult, 'timestamp'>) {
    this.results.push({
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  // SECTION 1: USER AUTHENTICATION & PROFILE MANAGEMENT
  async testAuthenticationSystem() {
    console.log('🔐 Testing Authentication System...');

    // Test 1.1: Database Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        this.addResult({
          name: 'Database Connection',
          category: 'Authentication',
          status: 'fail',
          message: `Database connection failed: ${error.message}`,
          details: error
        });
      } else {
        this.addResult({
          name: 'Database Connection',
          category: 'Authentication',
          status: 'pass',
          message: 'Database connection successful'
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Database Connection',
        category: 'Authentication',
        status: 'fail',
        message: `Database connection error: ${error}`,
        details: error
      });
    }

    // Test 1.2: Environment Variables
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      const value = ENV[envVar as keyof typeof ENV];
      if (!value || value.trim() === '') {
        this.addResult({
          name: `Environment Variable: ${envVar}`,
          category: 'Authentication',
          status: 'fail',
          message: `Missing required environment variable: ${envVar}`
        });
      } else {
        this.addResult({
          name: `Environment Variable: ${envVar}`,
          category: 'Authentication',
          status: 'pass',
          message: `Environment variable configured: ${envVar}`
        });
      }
    }

    // Test 1.3: Auth Session Check
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      this.addResult({
        name: 'Auth Session Check',
        category: 'Authentication',
        status: 'pass',
        message: session ? 'User is authenticated' : 'No active session (normal for logged out user)',
        details: { hasSession: !!session }
      });
    } catch (error) {
      this.addResult({
        name: 'Auth Session Check',
        category: 'Authentication',
        status: 'fail',
        message: `Auth session check failed: ${error}`,
        details: error
      });
    }
  }

  // SECTION 5: APS CALCULATOR FUNCTIONALITY
  async testAPSCalculator() {
    console.log('🧮 Testing APS Calculator...');

    // Test 5.1: Run comprehensive APS verification
    try {
      const verificationResult = await runAPSVerification();

      this.addResult({
        name: 'APS System Verification',
        category: 'APS Calculator',
        status: verificationResult.passRate >= 80 ? 'pass' : verificationResult.passRate >= 60 ? 'warning' : 'fail',
        message: verificationResult.summary,
        details: {
          passRate: verificationResult.passRate,
          results: verificationResult.results
        }
      });

      // Add individual test results
      verificationResult.results.forEach(result => {
        this.addResult({
          name: result.testName,
          category: 'APS Calculator',
          status: result.passed ? 'pass' : 'fail',
          message: result.details,
          details: result.error ? { error: result.error } : undefined
        });
      });
    } catch (error) {
      this.addResult({
        name: 'APS System Verification',
        category: 'APS Calculator',
        status: 'fail',
        message: `APS verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }
        status: 'fail',
        message: `localStorage error: ${error}`,
        details: error
      });
    }

    // Test 2.2: Check for existing APS profile
    try {
      const apsProfile = localStorage.getItem('userAPSProfile');
      if (apsProfile) {
        const parsed = JSON.parse(apsProfile);
        this.addResult({
          name: 'Existing APS Profile',
          category: 'APS Calculator',
          status: 'pass',
          message: `Found existing APS profile with ${parsed.subjects?.length || 0} subjects`,
          details: { subjectCount: parsed.subjects?.length || 0, totalAPS: parsed.totalAPS }
        });
      } else {
        this.addResult({
          name: 'Existing APS Profile',
          category: 'APS Calculator',
          status: 'warning',
          message: 'No existing APS profile found (normal for new users)'
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Existing APS Profile',
        category: 'APS Calculator',
        status: 'fail',
        message: `Error checking APS profile: ${error}`,
        details: error
      });
    }
  }

  // SECTION 3: GOOGLE MAPS FUNCTIONALITY
  async testGoogleMapsIntegration() {
    console.log('🗺️ Testing Google Maps Integration...');

    // Test 3.1: Google Maps API Key
    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!mapsApiKey || mapsApiKey.trim() === '') {
      this.addResult({
        name: 'Google Maps API Key',
        category: 'Google Maps',
        status: 'warning',
        message: 'Google Maps API key not configured - address autocomplete will not work'
      });
    } else {
      this.addResult({
        name: 'Google Maps API Key',
        category: 'Google Maps',
        status: 'pass',
        message: 'Google Maps API key configured'
      });
    }

    // Test 3.2: Google Maps Script Loading
    try {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        this.addResult({
          name: 'Google Maps Script Loading',
          category: 'Google Maps',
          status: 'pass',
          message: 'Google Maps API loaded successfully'
        });
      } else {
        this.addResult({
          name: 'Google Maps Script Loading',
          category: 'Google Maps',
          status: 'warning',
          message: 'Google Maps API not loaded (normal if no API key configured)'
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Google Maps Script Loading',
        category: 'Google Maps',
        status: 'fail',
        message: `Google Maps API error: ${error}`,
        details: error
      });
    }
  }

  // SECTION 4: PAYMENT SYSTEM
  async testPaymentSystem() {
    console.log('💳 Testing Payment System...');

    // Test 4.1: Paystack Configuration
    const paystackKey = ENV.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey || paystackKey.trim() === '') {
      this.addResult({
        name: 'Paystack Configuration',
        category: 'Payment System',
        status: 'warning',
        message: 'Paystack public key not configured - payments will not work'
      });
    } else {
      this.addResult({
        name: 'Paystack Configuration',
        category: 'Payment System',
        status: 'pass',
        message: 'Paystack public key configured'
      });
    }

    // Test 4.2: Banking Details Table
    try {
      const { data, error } = await supabase.from('banking_details').select('count').limit(1);
      if (error) {
        this.addResult({
          name: 'Banking Details Table',
          category: 'Payment System',
          status: 'fail',
          message: `Banking details table access failed: ${error.message}`,
          details: error
        });
      } else {
        this.addResult({
          name: 'Banking Details Table',
          category: 'Payment System',
          status: 'pass',
          message: 'Banking details table accessible'
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Banking Details Table',
        category: 'Payment System',
        status: 'fail',
        message: `Banking details table error: ${error}`,
        details: error
      });
    }
  }

  // SECTION 5: COURIER INTEGRATION
  async testCourierIntegration() {
    console.log('🚚 Testing Courier Integration...');

    const courierApiKeys = [
      { name: 'Courier Guy', key: ENV.VITE_COURIER_GUY_API_KEY },
      { name: 'Fastway', key: ENV.VITE_FASTWAY_API_KEY }
    ];

    for (const courier of courierApiKeys) {
      if (!courier.key || courier.key.trim() === '') {
        this.addResult({
          name: `${courier.name} API Key`,
          category: 'Courier Integration',
          status: 'warning',
          message: `${courier.name} API key not configured`
        });
      } else {
        this.addResult({
          name: `${courier.name} API Key`,
          category: 'Courier Integration',
          status: 'pass',
          message: `${courier.name} API key configured`
        });
      }
    }
  }

  // SECTION 6: DATABASE TABLES AND STRUCTURE
  async testDatabaseStructure() {
    console.log('🗄️ Testing Database Structure...');

    const criticalTables = [
      'profiles',
      'books',
      'orders',
      'transactions',
      'banking_details'
    ];

    for (const table of criticalTables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          this.addResult({
            name: `Table: ${table}`,
            category: 'Database Structure',
            status: 'fail',
            message: `Table ${table} access failed: ${error.message}`,
            details: error
          });
        } else {
          this.addResult({
            name: `Table: ${table}`,
            category: 'Database Structure',
            status: 'pass',
            message: `Table ${table} accessible`
          });
        }
      } catch (error) {
        this.addResult({
          name: `Table: ${table}`,
          category: 'Database Structure',
          status: 'fail',
          message: `Table ${table} error: ${error}`,
          details: error
        });
      }
    }
  }

  // SECTION 7: CART FUNCTIONALITY
  async testCartFunctionality() {
    console.log('🛒 Testing Cart Functionality...');

    try {
      // Test cart localStorage operations
      const testCartItem = {
        id: 'test-book-' + Date.now(),
        title: 'Test Book',
        price: 50,
        seller: 'Test Seller'
      };

      // Save test item to cart
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const testCart = [...existingCart, testCartItem];
      localStorage.setItem('cart', JSON.stringify(testCart));

      // Verify cart persistence
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const testItemExists = savedCart.some(item => item.id === testCartItem.id);

      if (testItemExists) {
        this.addResult({
          name: 'Cart Persistence',
          category: 'Cart Functionality',
          status: 'pass',
          message: 'Cart data persists correctly in localStorage'
        });

        // Clean up test item
        const cleanedCart = savedCart.filter(item => item.id !== testCartItem.id);
        localStorage.setItem('cart', JSON.stringify(cleanedCart));
      } else {
        this.addResult({
          name: 'Cart Persistence',
          category: 'Cart Functionality',
          status: 'fail',
          message: 'Cart data persistence failed'
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Cart Persistence',
        category: 'Cart Functionality',
        status: 'fail',
        message: `Cart functionality error: ${error}`,
        details: error
      });
    }
  }

  // Run all tests
  async runAllTests(): Promise<QATestResult[]> {
    this.results = [];

    console.log('🔍 Starting Comprehensive QA Functionality Check...');
    console.log('===============================================');

    try {
      await this.testAuthenticationSystem();
      await this.testAPSCalculator();
      await this.testGoogleMapsIntegration();
      await this.testPaymentSystem();
      await this.testCourierIntegration();
      await this.testDatabaseStructure();
      await this.testCartFunctionality();
    } catch (error) {
      console.error('QA Test Suite Error:', error);
      this.addResult({
        name: 'QA Test Suite',
        category: 'System',
        status: 'fail',
        message: `QA test suite encountered an error: ${error}`,
        details: error
      });
    }

    console.log('✅ QA Functionality Check Complete');
    console.log('===============================================');

    return this.results;
  }

  // Generate summary report
  generateSummaryReport(): {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    overallStatus: 'healthy' | 'issues' | 'critical';
    categories: Record<string, { pass: number; fail: number; warning: number; skip: number }>;
  } {
    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'pass').length,
      failed: this.results.filter(r => r.status === 'fail').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      skipped: this.results.filter(r => r.status === 'skip').length,
      overallStatus: 'healthy' as const,
      categories: {} as Record<string, { pass: number; fail: number; warning: number; skip: number }>
    };

    // Categorize results
    this.results.forEach(result => {
      if (!summary.categories[result.category]) {
        summary.categories[result.category] = { pass: 0, fail: 0, warning: 0, skip: 0 };
      }
      summary.categories[result.category][result.status]++;
    });

    // Determine overall status
    if (summary.failed > 0) {
      summary.overallStatus = summary.failed > 3 ? 'critical' : 'issues';
    }

    return summary;
  }

  // Get results by category
  getResultsByCategory(category: string): QATestResult[] {
    return this.results.filter(result => result.category === category);
  }

  // Get failed tests
  getFailedTests(): QATestResult[] {
    return this.results.filter(result => result.status === 'fail');
  }

  // Get all results
  getAllResults(): QATestResult[] {
    return this.results;
  }
}

// Export singleton instance
export const qaChecker = new QAFunctionalityChecker();