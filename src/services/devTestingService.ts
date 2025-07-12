import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TestResult {
  id: string;
  test: string;
  status: "running" | "success" | "failed" | "pending";
  message: string;
  timestamp: string;
  duration?: number;
  details?: any;
}

export interface DatabaseTableInfo {
  table_name: string;
  table_schema: string;
  table_type: string;
  row_count?: number;
  columns?: string[];
}

export interface EdgeFunctionInfo {
  name: string;
  status: "deployed" | "not_found" | "error";
  lastTested?: string;
  response?: any;
  error?: string;
}

export class DevTestingService {
  private static testResults: TestResult[] = [];

  /**
   * Add a test result to the collection
   */
  static addTestResult(
    test: string,
    status: "success" | "failed",
    message: string,
    details?: any,
  ): TestResult {
    const result: TestResult = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      test,
      status,
      message,
      timestamp: new Date().toISOString(),
      details,
    };

    this.testResults.unshift(result);
    // Keep only last 100 results
    if (this.testResults.length > 100) {
      this.testResults = this.testResults.slice(0, 100);
    }

    return result;
  }

  /**
   * Get all test results
   */
  static getTestResults(): TestResult[] {
    return this.testResults;
  }

  /**
   * Clear all test results
   */
  static clearTestResults(): void {
    this.testResults = [];
  }

  /**
   * Test database connection and basic functionality
   */
  static async testDatabaseConnection(): Promise<TestResult> {
    try {
      const startTime = Date.now();

      // Test basic connection
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      const duration = Date.now() - startTime;

      if (error) {
        return this.addTestResult(
          "Database Connection",
          "failed",
          `Connection failed: ${error.message}`,
          { error, duration },
        );
      }

      return this.addTestResult(
        "Database Connection",
        "success",
        `Database connected successfully (${duration}ms)`,
        { duration },
      );
    } catch (error) {
      return this.addTestResult(
        "Database Connection",
        "failed",
        `Connection error: ${error}`,
        { error },
      );
    }
  }

  /**
   * Get detailed information about database tables
   */
  static async getDatabaseTables(): Promise<DatabaseTableInfo[]> {
    const commonTables = [
      "profiles",
      "books",
      "orders",
      "transactions",
      "order_notifications",
      "banking_details",
      "reports",
      "notifications",
      "user_submitted_programs",
      "paystack_payment_intents",
      "payout_transactions",
    ];

    const tableInfo: DatabaseTableInfo[] = [];

    for (const tableName of commonTables) {
      try {
        // Test if table exists and get row count
        const { data, error, count } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (!error) {
          // Get column information
          const { data: sampleData } = await supabase
            .from(tableName)
            .select("*")
            .limit(1);

          const columns =
            sampleData && sampleData.length > 0
              ? Object.keys(sampleData[0])
              : [];

          tableInfo.push({
            table_name: tableName,
            table_schema: "public",
            table_type: "BASE TABLE",
            row_count: count || 0,
            columns,
          });
        }
      } catch (error) {
        // Table doesn't exist or access denied
        console.warn(`Table ${tableName} not accessible:`, error);
      }
    }

    return tableInfo;
  }

  /**
   * Test Edge Functions availability and functionality
   */
  static async testEdgeFunctions(): Promise<EdgeFunctionInfo[]> {
    const functions = [
      "commit-to-sale",
      "decline-commit",
      "auto-expire-commits",
      "verify-paystack-payment",
      "create-order",
      "paystack-webhook",
      "get-delivery-quotes",
    ];

    const functionInfo: EdgeFunctionInfo[] = [];

    for (const functionName of functions) {
      try {
        const startTime = Date.now();

        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { test: true, timestamp: Date.now() },
        });

        const duration = Date.now() - startTime;

        if (error) {
          if (
            error.message?.includes("not found") ||
            error.message?.includes("Failed to send a request")
          ) {
            functionInfo.push({
              name: functionName,
              status: "not_found",
              lastTested: new Date().toISOString(),
              error: "Function not deployed or not accessible",
            });

            this.addTestResult(
              `Edge Function: ${functionName}`,
              "failed",
              "Function not deployed or not accessible",
            );
          } else {
            functionInfo.push({
              name: functionName,
              status: "error",
              lastTested: new Date().toISOString(),
              error: error.message,
            });

            this.addTestResult(
              `Edge Function: ${functionName}`,
              "failed",
              error.message,
            );
          }
        } else {
          functionInfo.push({
            name: functionName,
            status: "deployed",
            lastTested: new Date().toISOString(),
            response: data,
          });

          this.addTestResult(
            `Edge Function: ${functionName}`,
            "success",
            `Function accessible (${duration}ms)`,
          );
        }
      } catch (error) {
        functionInfo.push({
          name: functionName,
          status: "error",
          lastTested: new Date().toISOString(),
          error: String(error),
        });

        this.addTestResult(
          `Edge Function: ${functionName}`,
          "failed",
          `Error: ${error}`,
        );
      }
    }

    return functionInfo;
  }

  /**
   * Test authentication system
   */
  static async testAuthentication(): Promise<TestResult> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return this.addTestResult(
          "Authentication",
          "failed",
          `Auth error: ${error.message}`,
          error,
        );
      }

      if (user) {
        return this.addTestResult(
          "Authentication",
          "success",
          `Authenticated as: ${user.email}`,
          { userId: user.id, email: user.email },
        );
      } else {
        return this.addTestResult(
          "Authentication",
          "failed",
          "No authenticated user found",
        );
      }
    } catch (error) {
      return this.addTestResult(
        "Authentication",
        "failed",
        `Auth test error: ${error}`,
        error,
      );
    }
  }

  /**
   * Test notification system
   */
  static async testNotificationSystem(): Promise<TestResult> {
    try {
      // Test notification table access
      const { data, error } = await supabase
        .from("order_notifications")
        .select("*")
        .limit(1);

      if (error) {
        return this.addTestResult(
          "Notification System",
          "failed",
          `Notifications table error: ${error.message}`,
          error,
        );
      }

      return this.addTestResult(
        "Notification System",
        "success",
        "Notifications system accessible",
      );
    } catch (error) {
      return this.addTestResult(
        "Notification System",
        "failed",
        `Notifications error: ${error}`,
        error,
      );
    }
  }

  /**
   * Create a demo order for testing
   */
  static async createDemoOrder(userId: string): Promise<any> {
    const demoOrder = {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyer_id: userId,
      seller_id: userId,
      book_id: `demo_book_${Math.random().toString(36).substr(2, 9)}`,
      amount: 5000, // R50.00 in kobo
      status: "paid",
      commit_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        book_title: "Demo Test Book",
        book_author: "Test Author",
        test_order: true,
        created_by: "dev_dashboard",
      },
    };

    // Try inserting into transactions table first
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([demoOrder])
        .select()
        .single();

      if (error) {
        // Fallback to orders table
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([demoOrder])
          .select()
          .single();

        if (orderError) {
          throw new Error(`Failed to create demo order: ${orderError.message}`);
        }

        this.addTestResult(
          "Demo Order Creation",
          "success",
          `Demo order created in orders table: ${orderData.id}`,
        );

        return orderData;
      } else {
        this.addTestResult(
          "Demo Order Creation",
          "success",
          `Demo order created in transactions table: ${data.id}`,
        );

        return data;
      }
    } catch (error) {
      this.addTestResult(
        "Demo Order Creation",
        "failed",
        `Failed to create demo order: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Test environment configuration
   */
  static testEnvironmentConfig(): TestResult {
    const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

    const optionalVars = [
      "VITE_PAYSTACK_PUBLIC_KEY",
      "VITE_GOOGLE_MAPS_API_KEY",
    ];

    const missing = requiredVars.filter((varName) => !import.meta.env[varName]);
    const missingOptional = optionalVars.filter(
      (varName) => !import.meta.env[varName],
    );

    if (missing.length > 0) {
      return this.addTestResult(
        "Environment Config",
        "failed",
        `Missing required variables: ${missing.join(", ")}`,
        { missing, missingOptional },
      );
    }

    return this.addTestResult(
      "Environment Config",
      "success",
      `All required environment variables are set${missingOptional.length > 0 ? `. Optional missing: ${missingOptional.join(", ")}` : ""}`,
      { missing: [], missingOptional },
    );
  }

  /**
   * Run comprehensive system health check
   */
  static async runHealthCheck(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      // Run all tests
      const tests = [
        () => this.testDatabaseConnection(),
        () => this.testAuthentication(),
        () => this.testNotificationSystem(),
        () => Promise.resolve(this.testEnvironmentConfig()),
      ];

      for (const test of tests) {
        try {
          const result = await test();
          results.push(result);
        } catch (error) {
          results.push(
            this.addTestResult(
              "Health Check",
              "failed",
              `Test failed: ${error}`,
            ),
          );
        }
      }

      // Test Edge Functions
      await this.testEdgeFunctions();

      return results;
    } catch (error) {
      results.push(
        this.addTestResult(
          "Health Check",
          "failed",
          `Health check failed: ${error}`,
        ),
      );
      return results;
    }
  }

  /**
   * Export test results as CSV
   */
  static exportTestResults(): string {
    const headers = ["Test", "Status", "Message", "Timestamp", "Duration"];
    const rows = this.testResults.map((result) => [
      result.test,
      result.status,
      result.message,
      result.timestamp,
      result.duration?.toString() || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Download test results as CSV file
   */
  static downloadTestResults(): void {
    const csv = this.exportTestResults();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dev_test_results_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Test results exported!");
  }

  /**
   * Get system information for debugging
   */
  static getSystemInfo(): any {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      environment: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasPaystackKey: !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      hasGoogleMapsKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      testResultsCount: this.testResults.length,
    };
  }
}

export default DevTestingService;
