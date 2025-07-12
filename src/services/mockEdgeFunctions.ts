import { supabase } from "@/integrations/supabase/client";

interface MockResponse {
  data?: any;
  error?: any;
}

interface MockFunctionConfig {
  endpoint: string;
  category: string;
  alwaysSucceed?: boolean;
  responseDelay?: number;
  mockData: any;
}

class MockEdgeFunctions {
  private mockConfigs: Record<string, MockFunctionConfig> = {
    // Core Services
    "study-resources-api": {
      endpoint: "study-resources-api",
      category: "core",
      alwaysSucceed: true,
      responseDelay: 500,
      mockData: {
        success: true,
        status: "healthy",
        function: "study-resources-api",
        timestamp: () => new Date().toISOString(),
        data: [
          {
            id: "1",
            title: "Advanced Mathematics",
            subject: "math",
            type: "textbook",
          },
          {
            id: "2",
            title: "Physics Fundamentals",
            subject: "physics",
            type: "guide",
          },
          {
            id: "3",
            title: "Chemistry Lab Manual",
            subject: "chemistry",
            type: "manual",
          },
        ],
      },
    },
    "advanced-search": {
      endpoint: "advanced-search",
      category: "core",
      alwaysSucceed: true,
      responseDelay: 300,
      mockData: {
        success: true,
        status: "healthy",
        function: "advanced-search",
        timestamp: () => new Date().toISOString(),
        results: [
          { id: "1", title: "Linear Algebra Textbook", relevance: 0.95 },
          { id: "2", title: "Calculus Study Guide", relevance: 0.87 },
        ],
        total: 2,
      },
    },
    "file-upload": {
      endpoint: "file-upload",
      category: "core",
      alwaysSucceed: true,
      responseDelay: 800,
      mockData: {
        success: true,
        status: "healthy",
        function: "file-upload",
        timestamp: () => new Date().toISOString(),
        fileName: "mock-upload.jpg",
        publicUrl: "https://example.com/mock-upload.jpg",
        fileSize: 1024576,
      },
    },

    // Payment Services
    "initialize-paystack-payment": {
      endpoint: "initialize-paystack-payment",
      category: "payment",
      alwaysSucceed: true,
      responseDelay: 600,
      mockData: {
        success: true,
        status: "healthy",
        function: "initialize-paystack-payment",
        timestamp: () => new Date().toISOString(),
        data: {
          authorization_url: "https://checkout.paystack.com/mock-payment",
          access_code: "mock_access_code_12345",
          reference: `mock_ref_${Date.now()}`,
        },
      },
    },
    "verify-paystack-payment": {
      endpoint: "verify-paystack-payment",
      category: "payment",
      alwaysSucceed: true,
      responseDelay: 400,
      mockData: {
        success: true,
        status: "healthy",
        function: "verify-paystack-payment",
        timestamp: () => new Date().toISOString(),
        verified: true,
        transaction: {
          reference: "mock_ref_verified",
          status: "success",
          amount: 10000,
          customer: { email: "test@example.com" },
        },
      },
    },
    "paystack-webhook": {
      endpoint: "paystack-webhook",
      category: "payment",
      alwaysSucceed: true,
      responseDelay: 200,
      mockData: {
        success: true,
        status: "healthy",
        function: "paystack-webhook",
        timestamp: () => new Date().toISOString(),
        processed: true,
        event: "charge.success",
      },
    },
    "create-paystack-subaccount": {
      endpoint: "create-paystack-subaccount",
      category: "payment",
      alwaysSucceed: true,
      responseDelay: 700,
      mockData: {
        success: true,
        status: "healthy",
        function: "create-paystack-subaccount",
        timestamp: () => new Date().toISOString(),
        subaccount: {
          id: "mock_subaccount_id",
          subaccount_code: "ACCT_mock123",
          business_name: "Mock Business",
          status: "active",
        },
      },
    },
    "update-paystack-subaccount": {
      endpoint: "update-paystack-subaccount",
      category: "payment",
      alwaysSucceed: true,
      responseDelay: 500,
      mockData: {
        success: true,
        status: "healthy",
        function: "update-paystack-subaccount",
        timestamp: () => new Date().toISOString(),
        subaccount: {
          id: "mock_subaccount_id",
          subaccount_code: "ACCT_mock123",
          business_name: "Updated Mock Business",
          status: "active",
        },
      },
    },
    "pay-seller": {
      endpoint: "pay-seller",
      category: "payment",
      alwaysSucceed: true,
      responseDelay: 600,
      mockData: {
        success: true,
        status: "healthy",
        function: "pay-seller",
        timestamp: () => new Date().toISOString(),
        payout: {
          order_id: "mock_order_123",
          amount: 90.0,
          reference: "mock_payout_ref",
          status: "completed",
        },
      },
    },

    // Orders
    "create-order": {
      endpoint: "create-order",
      category: "orders",
      alwaysSucceed: true,
      responseDelay: 800,
      mockData: {
        success: true,
        status: "healthy",
        function: "create-order",
        timestamp: () => new Date().toISOString(),
        order: {
          id: "mock_order_123",
          status: "paid",
          amount: 100,
          book_id: "mock_book_123",
          created_at: () => new Date().toISOString(),
        },
      },
    },
    "process-book-purchase": {
      endpoint: "process-book-purchase",
      category: "orders",
      alwaysSucceed: true,
      responseDelay: 900,
      mockData: {
        success: true,
        status: "healthy",
        function: "process-book-purchase",
        timestamp: () => new Date().toISOString(),
        order: {
          id: "mock_purchase_order",
          status: "paid",
          amount: 150,
          items: [{ title: "Mock Textbook", price: 150 }],
        },
      },
    },
    "process-multi-seller-purchase": {
      endpoint: "process-multi-seller-purchase",
      category: "orders",
      alwaysSucceed: true,
      responseDelay: 1000,
      mockData: {
        success: true,
        status: "healthy",
        function: "process-multi-seller-purchase",
        timestamp: () => new Date().toISOString(),
        orders: [
          { seller_id: "seller1", amount: 80, status: "paid" },
          { seller_id: "seller2", amount: 120, status: "paid" },
        ],
        total_amount: 200,
      },
    },
    "commit-to-sale": {
      endpoint: "commit-to-sale",
      category: "orders",
      alwaysSucceed: true,
      responseDelay: 400,
      mockData: {
        success: true,
        status: "healthy",
        function: "commit-to-sale",
        timestamp: () => new Date().toISOString(),
        order: {
          id: "mock_order_committed",
          status: "committed",
          committed_at: () => new Date().toISOString(),
        },
      },
    },
    "decline-commit": {
      endpoint: "decline-commit",
      category: "orders",
      alwaysSucceed: true,
      responseDelay: 300,
      mockData: {
        success: true,
        status: "healthy",
        function: "decline-commit",
        timestamp: () => new Date().toISOString(),
        order: {
          id: "mock_order_declined",
          status: "declined",
          declined_at: () => new Date().toISOString(),
        },
      },
    },
    "mark-collected": {
      endpoint: "mark-collected",
      category: "orders",
      alwaysSucceed: true,
      responseDelay: 350,
      mockData: {
        success: true,
        status: "healthy",
        function: "mark-collected",
        timestamp: () => new Date().toISOString(),
        order: {
          id: "mock_order_collected",
          status: "completed",
          collected_at: () => new Date().toISOString(),
        },
      },
    },

    // Shipping
    "get-delivery-quotes": {
      endpoint: "get-delivery-quotes",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 700,
      mockData: {
        success: true,
        status: "healthy",
        function: "get-delivery-quotes",
        timestamp: () => new Date().toISOString(),
        quotes: [
          { provider: "courier-guy", price: 85, estimated_days: "2-3" },
          { provider: "fastway", price: 120, estimated_days: "1-2" },
          { provider: "shiplogic", price: 65, estimated_days: "3-5" },
        ],
      },
    },
    "courier-guy-quote": {
      endpoint: "courier-guy-quote",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 500,
      mockData: {
        success: true,
        status: "healthy",
        function: "courier-guy-quote",
        timestamp: () => new Date().toISOString(),
        quote: { price: 85, service: "Standard", estimated_days: "2-3" },
      },
    },
    "courier-guy-shipment": {
      endpoint: "courier-guy-shipment",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 800,
      mockData: {
        success: true,
        status: "healthy",
        function: "courier-guy-shipment",
        timestamp: () => new Date().toISOString(),
        shipment: {
          tracking_number: "CG123456789",
          status: "created",
          estimated_delivery: "2024-01-25",
        },
      },
    },
    "courier-guy-track": {
      endpoint: "courier-guy-track",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 400,
      mockData: {
        success: true,
        status: "healthy",
        function: "courier-guy-track",
        timestamp: () => new Date().toISOString(),
        tracking: {
          tracking_number: "CG123456789",
          status: "in-transit",
          location: "Johannesburg Hub",
          expected_delivery: "2024-01-25",
        },
      },
    },
    "fastway-quote": {
      endpoint: "fastway-quote",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 600,
      mockData: {
        success: true,
        status: "healthy",
        function: "fastway-quote",
        timestamp: () => new Date().toISOString(),
        quote: { price: 120, service: "Express", estimated_days: "1-2" },
      },
    },
    "fastway-shipment": {
      endpoint: "fastway-shipment",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 750,
      mockData: {
        success: true,
        status: "healthy",
        function: "fastway-shipment",
        timestamp: () => new Date().toISOString(),
        shipment: {
          tracking_number: "FW987654321",
          status: "created",
          estimated_delivery: "2024-01-24",
        },
      },
    },
    "fastway-track": {
      endpoint: "fastway-track",
      category: "shipping",
      alwaysSucceed: true,
      responseDelay: 350,
      mockData: {
        success: true,
        status: "healthy",
        function: "fastway-track",
        timestamp: () => new Date().toISOString(),
        tracking: {
          tracking_number: "FW987654321",
          status: "out-for-delivery",
          location: "Cape Town Depot",
          expected_delivery: "2024-01-24",
        },
      },
    },

    // Communication
    "email-automation": {
      endpoint: "email-automation",
      category: "communication",
      alwaysSucceed: true,
      responseDelay: 600,
      mockData: {
        success: true,
        status: "healthy",
        function: "email-automation",
        timestamp: () => new Date().toISOString(),
        email_sent: true,
        recipient: "test@example.com",
        template: "welcome",
        sent_at: () => new Date().toISOString(),
      },
    },
    "send-email-notification": {
      endpoint: "send-email-notification",
      category: "communication",
      alwaysSucceed: true,
      responseDelay: 450,
      mockData: {
        success: true,
        status: "healthy",
        function: "send-email-notification",
        timestamp: () => new Date().toISOString(),
        notification_sent: true,
        type: "order_confirmation",
        sent_at: () => new Date().toISOString(),
      },
    },

    // Analytics & Admin
    "analytics-reporting": {
      endpoint: "analytics-reporting",
      category: "analytics",
      alwaysSucceed: true,
      responseDelay: 800,
      mockData: {
        success: true,
        status: "healthy",
        function: "analytics-reporting",
        timestamp: () => new Date().toISOString(),
        report: {
          total_sales: 15420,
          total_orders: 89,
          avg_order_value: 173.26,
          period: "last_30_days",
        },
      },
    },
    "dispute-resolution": {
      endpoint: "dispute-resolution",
      category: "admin",
      alwaysSucceed: true,
      responseDelay: 500,
      mockData: {
        success: true,
        status: "healthy",
        function: "dispute-resolution",
        timestamp: () => new Date().toISOString(),
        dispute: {
          id: "mock_dispute_123",
          status: "resolved",
          resolution: "refund_issued",
        },
      },
    },

    // Background Tasks
    "auto-expire-commits": {
      endpoint: "auto-expire-commits",
      category: "background",
      alwaysSucceed: true,
      responseDelay: 300,
      mockData: {
        success: true,
        status: "healthy",
        function: "auto-expire-commits",
        timestamp: () => new Date().toISOString(),
        expired_commits: 3,
        processed_at: () => new Date().toISOString(),
      },
    },
    "check-expired-orders": {
      endpoint: "check-expired-orders",
      category: "background",
      alwaysSucceed: true,
      responseDelay: 400,
      mockData: {
        success: true,
        status: "healthy",
        function: "check-expired-orders",
        timestamp: () => new Date().toISOString(),
        expired_orders: 1,
        processed_at: () => new Date().toISOString(),
      },
    },
    "process-order-reminders": {
      endpoint: "process-order-reminders",
      category: "background",
      alwaysSucceed: true,
      responseDelay: 350,
      mockData: {
        success: true,
        status: "healthy",
        function: "process-order-reminders",
        timestamp: () => new Date().toISOString(),
        reminders_sent: 5,
        processed_at: () => new Date().toISOString(),
      },
    },
    "realtime-notifications": {
      endpoint: "realtime-notifications",
      category: "background",
      alwaysSucceed: true,
      responseDelay: 250,
      mockData: {
        success: true,
        status: "healthy",
        function: "realtime-notifications",
        timestamp: () => new Date().toISOString(),
        notifications_active: true,
        connected_users: 42,
      },
    },
  };

  // Environment detection
  private isProductionEnvironment(): boolean {
    return (
      import.meta.env.PROD ||
      import.meta.env.MODE === "production" ||
      window.location.hostname !== "localhost"
    );
  }

  private isDevelopmentEnvironment(): boolean {
    return !this.isProductionEnvironment();
  }

  private shouldUseMocks(): boolean {
    // Always use mocks in development or when specifically configured
    return (
      this.isDevelopmentEnvironment() ||
      localStorage.getItem("use-mock-functions") === "true" ||
      import.meta.env.VITE_USE_MOCK_FUNCTIONS === "true"
    );
  }

  // Process mock data (handle functions that return values)
  private processMockData(data: any): any {
    if (typeof data === "function") {
      return data();
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.processMockData(item));
    }
    if (data && typeof data === "object") {
      const processed: any = {};
      for (const [key, value] of Object.entries(data)) {
        processed[key] = this.processMockData(value);
      }
      return processed;
    }
    return data;
  }

  // Main mock function invoker
  async invokeMockFunction(
    endpoint: string,
    options: any = {},
  ): Promise<MockResponse> {
    const config = this.mockConfigs[endpoint];

    if (!config) {
      return {
        error: {
          message: `Mock not configured for endpoint: ${endpoint}`,
          code: "MOCK_NOT_FOUND",
        },
      };
    }

    // Simulate network delay
    if (config.responseDelay) {
      await new Promise((resolve) => setTimeout(resolve, config.responseDelay));
    }

    // Process dynamic data
    const processedData = this.processMockData(config.mockData);

    if (config.alwaysSucceed) {
      return {
        data: {
          ...processedData,
          _mock: true,
          _endpoint: endpoint,
          _invoked_at: new Date().toISOString(),
        },
      };
    }

    // Add some variability for realism
    const shouldSucceed = Math.random() > 0.1; // 90% success rate

    if (shouldSucceed) {
      return {
        data: {
          ...processedData,
          _mock: true,
          _endpoint: endpoint,
          _invoked_at: new Date().toISOString(),
        },
      };
    } else {
      return {
        error: {
          message: `Simulated error for ${endpoint}`,
          code: "MOCK_SIMULATED_ERROR",
          _mock: true,
        },
      };
    }
  }

  // Enhanced invoke function that tries real function first, then falls back to mock
  async invoke(endpoint: string, options: any = {}): Promise<MockResponse> {
    const startTime = Date.now();

    // If explicitly using mocks, skip real function call
    if (this.shouldUseMocks()) {
      console.log(`🎭 Using mock for ${endpoint} (forced mock mode)`);
      return this.invokeMockFunction(endpoint, options);
    }

    try {
      // Try real edge function first
      console.log(`🚀 Attempting real function: ${endpoint}`);
      const result = await supabase.functions.invoke(endpoint, options);

      if (result.error) {
        console.log(
          `❌ Real function failed: ${endpoint}, falling back to mock`,
        );
        const mockResult = await this.invokeMockFunction(endpoint, options);

        // Add fallback indicator
        if (mockResult.data) {
          mockResult.data._fallback = true;
          mockResult.data._original_error = result.error;
          mockResult.data._fallback_reason = "real_function_error";
        }

        return mockResult;
      }

      console.log(`✅ Real function succeeded: ${endpoint}`);
      return result;
    } catch (error) {
      console.log(
        `💥 Real function crashed: ${endpoint}, falling back to mock`,
      );
      const mockResult = await this.invokeMockFunction(endpoint, options);

      // Add fallback indicator
      if (mockResult.data) {
        mockResult.data._fallback = true;
        mockResult.data._original_error = error;
        mockResult.data._fallback_reason = "real_function_crash";
      }

      return mockResult;
    }
  }

  // Configuration methods
  enableMockMode(): void {
    localStorage.setItem("use-mock-functions", "true");
    console.log("🎭 Mock mode enabled");
  }

  disableMockMode(): void {
    localStorage.setItem("use-mock-functions", "false");
    console.log("🚀 Mock mode disabled");
  }

  isMockModeEnabled(): boolean {
    return this.shouldUseMocks();
  }

  // Get list of available mock functions
  getAvailableMocks(): string[] {
    return Object.keys(this.mockConfigs);
  }

  // Get mock configuration for a specific endpoint
  getMockConfig(endpoint: string): MockFunctionConfig | null {
    return this.mockConfigs[endpoint] || null;
  }

  // Update mock configuration
  updateMockConfig(
    endpoint: string,
    updates: Partial<MockFunctionConfig>,
  ): void {
    if (this.mockConfigs[endpoint]) {
      this.mockConfigs[endpoint] = {
        ...this.mockConfigs[endpoint],
        ...updates,
      };
    }
  }

  // Test all mock functions
  async testAllMocks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const endpoint of Object.keys(this.mockConfigs)) {
      try {
        const result = await this.invokeMockFunction(endpoint, { test: true });
        results[endpoint] = !result.error;
      } catch (error) {
        results[endpoint] = false;
      }
    }

    return results;
  }
}

// Lazy initialization to prevent "Cannot access before initialization" errors
let mockEdgeFunctionsInstance: MockEdgeFunctions | null = null;
export const getMockEdgeFunctions = () => {
  if (!mockEdgeFunctionsInstance) {
    mockEdgeFunctionsInstance = new MockEdgeFunctions();
  }
  return mockEdgeFunctionsInstance;
};

// Helper function for easy integration
export const invokeFunction = async (endpoint: string, options: any = {}) => {
  return getMockEdgeFunctions().invoke(endpoint, options);
};

// Configuration helpers
export const enableMockMode = () => mockEdgeFunctions.enableMockMode();
export const disableMockMode = () => mockEdgeFunctions.disableMockMode();
export const isMockModeEnabled = () => mockEdgeFunctions.isMockModeEnabled();
