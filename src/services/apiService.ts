// API Service for handling Supabase Edge Functions
import { supabase } from "@/integrations/supabase/client";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  /**
   * Generic method to call Supabase Edge Function
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

    return await this.callSupabaseFunction<T>(functionName, payload, {
      method,
      headers,
      timeout,
    });
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
   * Upload File to Supabase
   */
  async uploadFile(file: File, bucket: string = "files"): Promise<ApiResponse> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        success: true,
        data: {
          url: publicUrl,
          path: filePath,
          bucket: bucket,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `File upload failed: ${error.message}`,
      };
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
  async healthCheck(): Promise<{ supabase: boolean }> {
    const results = { supabase: false };

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

    return results;
  }

  /**
   * Get current API mode (always Supabase now)
   */
  getCurrentMode(): "supabase" {
    return "supabase";
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
const apiService = getApiService();
export const {
  verifyPaystackPayment,
  initializePaystackPayment,
  uploadFile,
  sendEmailNotification,
  getDeliveryQuotes,
  healthCheck,
  getCurrentMode,
} = apiService;
