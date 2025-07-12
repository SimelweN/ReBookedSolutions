import { executeFunction } from "./functionExecutor";
import { FunctionResult } from "@/types/functionFallback";
import { supabase } from "@/integrations/supabase/client";

/**
 * AI Fallback Wrapper
 * Provides easy integration with existing services
 */
export class AIFallbackWrapper {
  /**
   * Wrap a Supabase Edge Function call with AI fallback
   */
  static async wrapSupabaseFunction<T = any>(
    functionName: string,
    payload: any,
    context?: {
      userId?: string;
      priority?: "high" | "normal" | "low";
      timeout?: number;
    },
  ): Promise<{ data: T | null; error: any }> {
    try {
      const result = await executeFunction<T>(functionName, payload, context);

      if (result.success) {
        return { data: result.data || null, error: null };
      } else {
        return {
          data: null,
          error: {
            message: result.error,
            fallbackUsed: result.fallbackUsed,
            source: result.source,
          },
        };
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: `AI Fallback Error: ${error}`,
          source: "wrapper",
        },
      };
    }
  }

  /**
   * Wrap a fetch request with AI fallback
   */
  static async wrapFetchRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    context?: {
      userId?: string;
      priority?: "high" | "normal" | "low";
      fallbackData?: T;
    },
  ): Promise<{ data: T | null; error: any; response?: Response }> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(context?.userId && { "x-user-id": context.userId }),
          ...(context?.priority && { "x-priority": context.priority }),
        },
      });

      if (!response.ok) {
        // If primary request fails, try fallback mechanism
        if (context?.fallbackData) {
          return {
            data: context.fallbackData,
            error: null,
            response,
          };
        }

        const errorText = await response.text();
        return {
          data: null,
          error: {
            message: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
          },
          response,
        };
      }

      const data = await response.json();
      return { data, error: null, response };
    } catch (error) {
      // Network error - try fallback
      if (context?.fallbackData) {
        return {
          data: context.fallbackData,
          error: null,
        };
      }

      return {
        data: null,
        error: {
          message: `Network Error: ${error}`,
          fallback: "unavailable",
        },
      };
    }
  }

  /**
   * Smart payment initialization with fallback
   */
  static async initializePayment(paymentData: {
    email: string;
    amount: number;
    metadata?: Record<string, any>;
    subaccount?: string;
    callback_url?: string;
  }): Promise<{ data: any; error: any }> {
    return this.wrapSupabaseFunction(
      "initialize-paystack-payment",
      paymentData,
      {
        priority: "high",
        timeout: 30000,
      },
    );
  }

  /**
   * Smart payment verification with fallback
   */
  static async verifyPayment(
    reference: string,
    orderId?: string,
  ): Promise<{ data: any; error: any }> {
    return this.wrapSupabaseFunction(
      "verify-paystack-payment",
      {
        reference,
        orderId,
      },
      {
        priority: "high",
        timeout: 30000,
      },
    );
  }

  /**
   * Smart email sending with fallback
   */
  static async sendEmail(emailData: {
    to: string;
    subject: string;
    template?: string;
    data?: Record<string, any>;
    htmlContent?: string;
    textContent?: string;
  }): Promise<{ data: any; error: any }> {
    return this.wrapSupabaseFunction("send-email-notification", emailData, {
      priority: "normal",
      timeout: 15000,
    });
  }

  /**
   * Smart file upload with fallback
   */
  static async uploadFile(fileData: {
    fileData?: string; // base64
    fileName: string;
    contentType: string;
    fileSize: number;
    bucket?: string;
    folder?: string;
    userId: string;
  }): Promise<{ data: any; error: any }> {
    return this.wrapSupabaseFunction("file-upload", fileData, {
      userId: fileData.userId,
      priority: "normal",
      timeout: 60000,
    });
  }

  /**
   * Smart shipping quotes with caching fallback
   */
  static async getShippingQuotes(quoteData: {
    pickup_address: any;
    delivery_address: any;
    package_details?: any;
  }): Promise<{ data: any; error: any }> {
    return this.wrapSupabaseFunction("get-delivery-quotes", quoteData, {
      priority: "normal",
      timeout: 10000,
    });
  }

  /**
   * Smart order creation with queue fallback
   */
  static async createOrder(orderData: {
    bookId: string;
    buyerId: string;
    sellerId: string;
    price: number;
    shippingAddress: any;
    paymentReference?: string;
  }): Promise<{ data: any; error: any }> {
    return this.wrapSupabaseFunction("create-order", orderData, {
      userId: orderData.buyerId,
      priority: "high",
      timeout: 15000,
    });
  }

  /**
   * Replace standard Supabase function calls
   * Usage: Replace `supabase.functions.invoke()` with `AIFallbackWrapper.invokeFunction()`
   */
  static async invokeFunction<T = any>(
    functionName: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
    } = {},
    context?: {
      userId?: string;
      priority?: "high" | "normal" | "low";
      timeout?: number;
    },
  ): Promise<{ data: T | null; error: any }> {
    return this.wrapSupabaseFunction<T>(functionName, options.body, context);
  }

  /**
   * Batch function execution with smart prioritization
   */
  static async executeBatch<T = any>(
    functions: Array<{
      name: string;
      payload: any;
      priority?: "high" | "normal" | "low";
      userId?: string;
    }>,
  ): Promise<Array<{ name: string; result: FunctionResult<T> }>> {
    // Sort by priority
    const sortedFunctions = functions.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const aPriority = priorityOrder[a.priority || "normal"];
      const bPriority = priorityOrder[b.priority || "normal"];
      return aPriority - bPriority;
    });

    const results: Array<{ name: string; result: FunctionResult<T> }> = [];

    // Execute high priority functions first, then batch the rest
    const highPriorityFunctions = sortedFunctions.filter(
      (f) => f.priority === "high",
    );
    const otherFunctions = sortedFunctions.filter((f) => f.priority !== "high");

    // Execute high priority sequentially
    for (const func of highPriorityFunctions) {
      const result = await executeFunction<T>(func.name, func.payload, {
        userId: func.userId,
        priority: func.priority,
      });
      results.push({ name: func.name, result });
    }

    // Execute others in parallel
    const batchPromises = otherFunctions.map(async (func) => {
      const result = await executeFunction<T>(func.name, func.payload, {
        userId: func.userId,
        priority: func.priority,
      });
      return { name: func.name, result };
    });

    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach((settled) => {
      if (settled.status === "fulfilled") {
        results.push(settled.value);
      } else {
        results.push({
          name: "unknown",
          result: {
            success: false,
            error: `Batch execution failed: ${settled.reason}`,
            source: "fallback",
            timestamp: Date.now(),
            fallbackUsed: true,
          },
        });
      }
    });

    return results;
  }

  /**
   * Retry a failed function with exponential backoff
   */
  static async retryFunction<T = any>(
    functionName: string,
    payload: any,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      userId?: string;
      priority?: "high" | "normal" | "low";
    } = {},
  ): Promise<FunctionResult<T>> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      userId,
      priority = "normal",
    } = options;

    let lastError = "";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await executeFunction<T>(functionName, payload, {
          userId,
          priority,
          requestId: `retry_${attempt}_${Date.now()}`,
        });

        if (result.success) {
          return result;
        }

        lastError = result.error || "Unknown error";

        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = String(error);

        if (attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries + 1} attempts. Last error: ${lastError}`,
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };
  }
}

// Export convenience functions
export const {
  wrapSupabaseFunction,
  wrapFetchRequest,
  initializePayment,
  verifyPayment,
  sendEmail,
  uploadFile,
  getShippingQuotes,
  createOrder,
  invokeFunction,
  executeBatch,
  retryFunction,
} = AIFallbackWrapper;

// Backward compatibility wrapper for existing code
export const compatibilityWrapper = {
  // Replace supabase.functions.invoke calls
  async invoke<T = any>(
    functionName: string,
    options: { body?: any; headers?: Record<string, string> } = {},
  ): Promise<{ data: T | null; error: any }> {
    return AIFallbackWrapper.invokeFunction<T>(functionName, options);
  },

  // Replace fetch calls
  async fetch<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: any; response?: Response }> {
    return AIFallbackWrapper.wrapFetchRequest<T>(endpoint, options);
  },
};

// Export as default for easy imports
export default AIFallbackWrapper;
