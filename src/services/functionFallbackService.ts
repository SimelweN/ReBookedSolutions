import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
}

export interface FunctionConfig {
  name: string;
  critical: boolean;
  fallbackStrategy: "client" | "skip" | "retry";
  retryAttempts?: number;
  timeout?: number;
}

const FUNCTION_CONFIGS: Record<string, FunctionConfig> = {
  // Critical functions - no fallback, must work
  "paystack-webhook": {
    name: "paystack-webhook",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 3,
  },
  "process-book-purchase": {
    name: "process-book-purchase",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 2,
  },
  "send-email-notification": {
    name: "send-email-notification",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 2,
  },

  // Non-critical with client fallbacks
  "get-delivery-quotes": {
    name: "get-delivery-quotes",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
  "courier-guy-quote": {
    name: "courier-guy-quote",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
  "fastway-quote": {
    name: "fastway-quote",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
  "file-upload": {
    name: "file-upload",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
  },
  "analytics-reporting": {
    name: "analytics-reporting",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 5000,
  },
  "study-resources-api": {
    name: "study-resources-api",
    critical: false,
    fallbackStrategy: "client",
    timeout: 5000,
  },
  "advanced-search": {
    name: "advanced-search",
    critical: false,
    fallbackStrategy: "client",
    timeout: 5000,
  },

  // Tracking - can use client fallbacks
  "courier-guy-track": {
    name: "courier-guy-track",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
  "fastway-track": {
    name: "fastway-track",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
};

export class FunctionFallbackService {
  private static instance: FunctionFallbackService;
  private functionStats: Record<
    string,
    { failures: number; lastFailure?: Date; totalCalls: number }
  > = {};

  static getInstance(): FunctionFallbackService {
    if (!this.instance) {
      this.instance = new FunctionFallbackService();
    }
    return this.instance;
  }

  async callFunction<T = any>(
    functionName: string,
    payload: any = {},
    options: { silent?: boolean; customTimeout?: number } = {},
  ): Promise<FunctionResponse<T>> {
    const config = FUNCTION_CONFIGS[functionName];

    if (!config) {
      console.warn(`No configuration found for function: ${functionName}`);
      return this.callFunctionDirect(functionName, payload, options);
    }

    // Update stats
    this.updateStats(functionName, "call");

    try {
      // Try the function with timeout
      const result = await this.callWithTimeout(
        functionName,
        payload,
        config.timeout || 10000,
      );

      if (result.error) {
        throw new Error(result.error.message || "Function failed");
      }

      return {
        success: true,
        data: result.data,
        fallbackUsed: false,
      };
    } catch (error) {
      console.error(`Function ${functionName} failed:`, error);
      this.updateStats(functionName, "failure");

      if (config.critical) {
        // For critical functions, try retries
        if (config.retryAttempts && config.retryAttempts > 0) {
          return this.retryFunction(
            functionName,
            payload,
            config.retryAttempts,
            options,
          );
        }

        return {
          success: false,
          error: `Critical function ${functionName} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          fallbackUsed: false,
        };
      }

      // For non-critical functions, use fallback strategies
      return this.useFallbackStrategy(
        functionName,
        payload,
        config,
        error as Error,
        options,
      );
    }
  }

  private async callWithTimeout(
    functionName: string,
    payload: any,
    timeout: number,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return { data, error };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryFunction<T>(
    functionName: string,
    payload: any,
    retries: number,
    options: { silent?: boolean } = {},
  ): Promise<FunctionResponse<T>> {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000),
        ); // Exponential backoff

        const result = await this.callWithTimeout(functionName, payload, 15000);

        if (!result.error) {
          if (!options.silent) {
            toast.success(
              `Function ${functionName} succeeded after ${i + 1} retries`,
            );
          }
          return { success: true, data: result.data, fallbackUsed: false };
        }
      } catch (error) {
        console.warn(`Retry ${i + 1} for ${functionName} failed:`, error);
      }
    }

    return {
      success: false,
      error: `Function ${functionName} failed after ${retries} retries`,
      fallbackUsed: false,
    };
  }

  private async useFallbackStrategy<T>(
    functionName: string,
    payload: any,
    config: FunctionConfig,
    error: Error,
    options: { silent?: boolean } = {},
  ): Promise<FunctionResponse<T>> {
    switch (config.fallbackStrategy) {
      case "client":
        return this.useClientFallback(functionName, payload, options);

      case "skip":
        if (!options.silent) {
          toast.warning(
            `${functionName} is temporarily unavailable, continuing without it`,
          );
        }
        return {
          success: true,
          data: null as T,
          fallbackUsed: true,
          error: `Function skipped due to error: ${error.message}`,
        };

      case "retry":
        return this.retryFunction(
          functionName,
          payload,
          config.retryAttempts || 1,
          options,
        );

      default:
        return {
          success: false,
          error: `No fallback strategy for ${functionName}: ${error.message}`,
          fallbackUsed: false,
        };
    }
  }

  private async useClientFallback<T>(
    functionName: string,
    payload: any,
    options: { silent?: boolean } = {},
  ): Promise<FunctionResponse<T>> {
    try {
      let fallbackResult: any = null;

      switch (functionName) {
        case "get-delivery-quotes":
        case "courier-guy-quote":
        case "fastway-quote":
          fallbackResult = await this.getDeliveryQuotesFallback(payload);
          break;

        case "file-upload":
          fallbackResult = await this.fileUploadFallback(payload);
          break;

        case "study-resources-api":
          fallbackResult = await this.studyResourcesFallback(payload);
          break;

        case "advanced-search":
          fallbackResult = await this.advancedSearchFallback(payload);
          break;

        case "courier-guy-track":
        case "fastway-track":
          fallbackResult = await this.trackingFallback(functionName, payload);
          break;

        default:
          throw new Error(`No client fallback implemented for ${functionName}`);
      }

      if (!options.silent) {
        toast.info(`Using offline mode for ${functionName}`);
      }

      return {
        success: true,
        data: fallbackResult,
        fallbackUsed: true,
      };
    } catch (fallbackError) {
      console.error(
        `Client fallback failed for ${functionName}:`,
        fallbackError,
      );

      return {
        success: false,
        error: `Both function and fallback failed for ${functionName}`,
        fallbackUsed: true,
      };
    }
  }

  // Client fallback implementations
  private async getDeliveryQuotesFallback(payload: any) {
    // Simplified delivery quotes using fixed rates
    const { pickup_address, delivery_address } = payload;

    const baseDistance = this.calculateDistance(
      pickup_address,
      delivery_address,
    );
    const courierGuyRate = Math.max(50, baseDistance * 0.8);
    const fastwayRate = Math.max(45, baseDistance * 0.75);

    return {
      quotes: [
        {
          courier: "courier-guy",
          service: "standard",
          rate: courierGuyRate,
          estimated_days: 2,
          fallback: true,
        },
        {
          courier: "fastway",
          service: "economy",
          rate: fastwayRate,
          estimated_days: 3,
          fallback: true,
        },
      ],
    };
  }

  private async fileUploadFallback(payload: any) {
    // Use Supabase storage directly
    const { file, bucket = "books", path } = payload;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { url: publicUrl, path: data.path };
  }

  private async studyResourcesFallback(payload: any) {
    // Use direct database queries
    const { action, ...params } = payload;

    switch (action) {
      case "get_resources":
        const { data } = await supabase
          .from("study_resources")
          .select("*")
          .limit(params.limit || 20);

        return { resources: data || [] };

      case "search_resources":
        const { data: searchData } = await supabase
          .from("study_resources")
          .select("*")
          .ilike("title", `%${params.query}%`)
          .limit(params.limit || 20);

        return { resources: searchData || [] };

      default:
        return { resources: [] };
    }
  }

  private async advancedSearchFallback(payload: any) {
    // Use simple Supabase queries instead of advanced search
    const { query, filters = {} } = payload;

    let queryBuilder = supabase.from("books").select("*");

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,author.ilike.%${query}%`,
      );
    }

    if (filters.price_min) {
      queryBuilder = queryBuilder.gte("price", filters.price_min);
    }

    if (filters.price_max) {
      queryBuilder = queryBuilder.lte("price", filters.price_max);
    }

    const { data } = await queryBuilder.limit(50);

    return { books: data || [] };
  }

  private async trackingFallback(functionName: string, payload: any) {
    // Return a fallback tracking response
    return {
      tracking_number: payload.tracking_number,
      status: "in_transit",
      updates: [
        {
          date: new Date().toISOString(),
          status: "Package information received",
          location: "Sorting facility",
          fallback: true,
        },
      ],
      estimated_delivery: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      fallback_mode: true,
    };
  }

  private calculateDistance(address1: any, address2: any): number {
    // Simple distance calculation fallback
    if (!address1 || !address2) return 50;

    // If we have lat/lng, use Haversine formula (simplified)
    if (address1.lat && address1.lng && address2.lat && address2.lng) {
      const R = 6371; // Earth's radius in km
      const dLat = ((address2.lat - address1.lat) * Math.PI) / 180;
      const dLon = ((address2.lng - address1.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((address1.lat * Math.PI) / 180) *
          Math.cos((address2.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    // Otherwise estimate based on city/province
    if (address1.city === address2.city) return 10;
    if (address1.province === address2.province) return 150;
    return 500;
  }

  private async callFunctionDirect<T>(
    functionName: string,
    payload: any,
    options: { silent?: boolean } = {},
  ): Promise<FunctionResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) {
        throw new Error(error.message || "Function failed");
      }

      return { success: true, data, fallbackUsed: false };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fallbackUsed: false,
      };
    }
  }

  private updateStats(functionName: string, type: "call" | "failure") {
    if (!this.functionStats[functionName]) {
      this.functionStats[functionName] = { failures: 0, totalCalls: 0 };
    }

    if (type === "call") {
      this.functionStats[functionName].totalCalls++;
    } else if (type === "failure") {
      this.functionStats[functionName].failures++;
      this.functionStats[functionName].lastFailure = new Date();
    }
  }

  // Public methods for testing and monitoring
  getFunctionStats() {
    return { ...this.functionStats };
  }

  getFunctionConfig(functionName: string) {
    return FUNCTION_CONFIGS[functionName] || null;
  }

  getAllFunctionConfigs() {
    return { ...FUNCTION_CONFIGS };
  }

  resetStats() {
    this.functionStats = {};
  }

  // Test a specific function
  async testFunction(functionName: string, payload: any = {}) {
    const startTime = Date.now();
    const result = await this.callFunction(functionName, payload, {
      silent: true,
    });
    const endTime = Date.now();

    return {
      ...result,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export const functionFallback = FunctionFallbackService.getInstance();
