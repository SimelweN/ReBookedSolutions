// API Service for handling both Supabase Edge Functions and Vercel API routes
import { supabase } from "@/integrations/supabase/client";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;
  private useVercelApi: boolean;

  constructor() {
    // Determine if we should use Vercel API routes or Supabase Edge Functions
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    this.useVercelApi = import.meta.env.VITE_USE_VERCEL_API === "true" || false;
  }

  /**
   * Generic method to call either Supabase Edge Function or Vercel API route
   */
  private async callFunction<T = any>(
    functionName: string,
    payload: any,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      headers?: Record<string, string>;
      timeout?: number;
    } = {},
  ): Promise<ApiResponse<T>> {
    const { method = "POST", headers = {}, timeout = 15000 } = options;

    try {
      if (this.useVercelApi) {
        // Use Vercel API routes
        return await this.callVercelApi<T>(functionName, payload, {
          method,
          headers,
          timeout,
        });
      } else {
        // Try Supabase Edge Functions first, fallback to Vercel on failure
        return await this.callSupabaseFunction<T>(functionName, payload, {
          method,
          headers,
          timeout,
        });
      }
    } catch (error) {
      console.error(`API call failed for ${functionName}:`, error);

      if (!this.useVercelApi) {
        // Fallback to Vercel API if Supabase failed
        console.log(`Falling back to Vercel API for ${functionName}`);
        try {
          return await this.callVercelApi<T>(functionName, payload, {
            method,
            headers,
            timeout,
          });
        } catch (fallbackError) {
          console.error(
            `Vercel API fallback also failed for ${functionName}:`,
            fallbackError,
          );
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Call Supabase Edge Function
   */
  private async callSupabaseFunction<T = any>(
    functionName: string,
    payload: any,
    options: {
      method?: string;
      headers?: Record<string, string>;
      timeout?: number;
    },
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || 15000,
    );

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: options.headers,
      });

      clearTimeout(timeoutId);

      if (error) {
        throw new Error(error.message || "Supabase function error");
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error(`Supabase function ${functionName} timed out`);
      }

      throw new Error(
        `Supabase function ${functionName} failed: ${error.message}`,
      );
    }
  }

  /**
   * Call Vercel API route
   */
  private async callVercelApi<T = any>(
    functionName: string,
    payload: any,
    options: {
      method?: string;
      headers?: Record<string, string>;
      timeout?: number;
    },
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || 15000,
    );

    try {
      const url = `${this.baseUrl}/api/${functionName}`;
      const response = await fetch(url, {
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.method === "GET" ? undefined : JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "API request failed" }));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error(`Vercel API ${functionName} timed out`);
      }

      throw new Error(`Vercel API ${functionName} failed: ${error.message}`);
    }
  }

  /**
   * Verify Paystack Payment
   */
  async verifyPaystackPayment(
    reference: string,
    orderId?: string,
  ): Promise<ApiResponse> {
    return this.callFunction("verify-paystack-payment", { reference, orderId });
  }

  /**
   * Initialize Paystack Payment
   */
  async initializePaystackPayment(data: {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: Record<string, any>;
    subaccount?: string;
    order_id?: string;
  }): Promise<ApiResponse> {
    return this.callFunction("initialize-paystack-payment", data);
  }

  /**
   * Upload File
   */
  async uploadFile(formData: FormData): Promise<ApiResponse> {
    // For file uploads, we need to handle differently
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for uploads

    try {
      const url = `${this.baseUrl}/api/file-upload`;
      const response = await fetch(url, {
        method: "POST",
        body: formData, // Don't set Content-Type for FormData
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "File upload failed" }));
        throw new Error(
          errorData.error || `Upload failed: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Send Email Notification
   */
  async sendEmailNotification(data: {
    to: string;
    subject: string;
    template?: string;
    data?: Record<string, any>;
    htmlContent?: string;
    textContent?: string;
    priority?: "high" | "normal" | "low";
  }): Promise<ApiResponse> {
    return this.callFunction("send-email-notification", data);
  }

  /**
   * Get Delivery Quotes
   */
  async getDeliveryQuotes(data: {
    pickup_address: any;
    delivery_address: any;
    package_details?: any;
    test?: boolean;
  }): Promise<ApiResponse> {
    return this.callFunction("get-delivery-quotes", data);
  }

  /**
   * Health check for API availability
   */
  async healthCheck(): Promise<{ supabase: boolean; vercel: boolean }> {
    const results = { supabase: false, vercel: false };

    // Test Supabase Edge Functions
    try {
      await this.callSupabaseFunction(
        "get-delivery-quotes",
        { test: true },
        { timeout: 5000 },
      );
      results.supabase = true;
    } catch (error) {
      console.warn("Supabase Edge Functions health check failed:", error);
    }

    // Test Vercel API
    try {
      await this.callVercelApi(
        "get-delivery-quotes",
        { test: true },
        { timeout: 5000 },
      );
      results.vercel = true;
    } catch (error) {
      console.warn("Vercel API health check failed:", error);
    }

    return results;
  }

  /**
   * Switch to Vercel API mode
   */
  switchToVercelApi() {
    this.useVercelApi = true;
    localStorage.setItem("useVercelApi", "true");
  }

  /**
   * Switch to Supabase Edge Functions mode
   */
  switchToSupabase() {
    this.useVercelApi = false;
    localStorage.setItem("useVercelApi", "false");
  }

  /**
   * Get current API mode
   */
  getCurrentMode(): "vercel" | "supabase" {
    return this.useVercelApi ? "vercel" : "supabase";
  }
}

// Lazy initialization to prevent "Cannot access before initialization" errors
let apiServiceInstance: ApiService | null = null;
export const getApiService = () => {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService();
  }
  return apiServiceInstance;
};

// Export individual methods for convenience
export const {
  verifyPaystackPayment,
  initializePaystackPayment,
  uploadFile,
  sendEmailNotification,
  getDeliveryQuotes,
  healthCheck,
  switchToVercelApi,
  switchToSupabase,
  getCurrentMode,
} = apiService;
