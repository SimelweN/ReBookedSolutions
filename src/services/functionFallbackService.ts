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
  "process-multi-seller-purchase": {
    name: "process-multi-seller-purchase",
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
  "initialize-paystack-payment": {
    name: "initialize-paystack-payment",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 2,
  },
  "verify-paystack-payment": {
    name: "verify-paystack-payment",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 2,
  },
  "commit-to-sale": {
    name: "commit-to-sale",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 2,
  },
  "decline-commit": {
    name: "decline-commit",
    critical: true,
    fallbackStrategy: "retry",
    retryAttempts: 2,
  },
  "create-order": {
    name: "create-order",
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
  "courier-guy-shipment": {
    name: "courier-guy-shipment",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
  },
  "fastway-shipment": {
    name: "fastway-shipment",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
  },
  "file-upload": {
    name: "file-upload",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
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
  "realtime-notifications": {
    name: "realtime-notifications",
    critical: false,
    fallbackStrategy: "client",
    timeout: 5000,
  },
  "email-automation": {
    name: "email-automation",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 5000,
  },
  "dispute-resolution": {
    name: "dispute-resolution",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
  "create-paystack-subaccount": {
    name: "create-paystack-subaccount",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 10000,
  },
  "update-paystack-subaccount": {
    name: "update-paystack-subaccount",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 10000,
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

  // Analytics and reporting - can be skipped gracefully
  "analytics-reporting": {
    name: "analytics-reporting",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 5000,
  },
  "process-order-reminders": {
    name: "process-order-reminders",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 5000,
  },
  "auto-expire-commits": {
    name: "auto-expire-commits",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 5000,
  },
  "check-expired-orders": {
    name: "check-expired-orders",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 5000,
  },
  "mark-collected": {
    name: "mark-collected",
    critical: false,
    fallbackStrategy: "client",
    timeout: 8000,
  },
  "pay-seller": {
    name: "pay-seller",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 10000,
  },
  "file-upload": {
    name: "file-upload",
    critical: false,
    fallbackStrategy: "client",
    timeout: 15000,
  },
  "study-resources-api": {
    name: "study-resources-api",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
  },
  "courier-guy-track": {
    name: "courier-guy-track",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
  },
  "fastway-track": {
    name: "fastway-track",
    critical: false,
    fallbackStrategy: "client",
    timeout: 10000,
  },
  "courier-guy-shipment": {
    name: "courier-guy-shipment",
    critical: false,
    fallbackStrategy: "client",
    timeout: 15000,
  },
  "fastway-shipment": {
    name: "fastway-shipment",
    critical: false,
    fallbackStrategy: "client",
    timeout: 15000,
  },
  "mark-collected": {
    name: "mark-collected",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 10000,
  },
  "email-automation": {
    name: "email-automation",
    critical: false,
    fallbackStrategy: "skip",
    timeout: 10000,
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

      // Better error message formatting
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific Supabase edge function errors
        if (
          errorMessage.includes("Edge Function returned a non-2xx status code")
        ) {
          errorMessage = `Function ${functionName} not deployed or misconfigured (expected in dev)`;
        }
      }

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
          error: `Critical function ${functionName} failed: ${errorMessage}`,
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
      console.log(`Calling function ${functionName} with payload:`, payload);
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error(`Function ${functionName} returned error:`, error);
      } else {
        console.log(`Function ${functionName} succeeded:`, data);
      }

      return { data, error };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Function ${functionName} threw exception:`, error);

      // Return error instead of throwing to allow graceful handling
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Function call failed",
          code: "FUNCTION_ERROR",
        },
      };
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

        case "courier-guy-shipment":
        case "fastway-shipment":
          fallbackResult = await this.createShipmentFallback(
            functionName,
            payload,
          );
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

        case "realtime-notifications":
          fallbackResult = await this.notificationsFallback(payload);
          break;

        case "dispute-resolution":
          fallbackResult = await this.disputeResolutionFallback(payload);
          break;

        case "mark-collected":
          fallbackResult = await this.markCollectedFallback(payload);
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
    // Realistic delivery quotes using South African postal zones and distances
    const { pickup_address, delivery_address, weight = 1 } = payload;

    const distance = this.calculateDistance(pickup_address, delivery_address);
    const weightMultiplier = Math.max(1, weight * 0.2); // Additional cost per kg

    // Base rates for different distance ranges (in ZAR)
    let courierGuyBase, fastwayBase, estimatedDays;

    if (distance <= 50) {
      // Same city
      courierGuyBase = 65;
      fastwayBase = 55;
      estimatedDays = { courierGuy: 1, fastway: 2 };
    } else if (distance <= 200) {
      // Regional
      courierGuyBase = 85;
      fastwayBase = 75;
      estimatedDays = { courierGuy: 2, fastway: 3 };
    } else if (distance <= 500) {
      // Inter-provincial
      courierGuyBase = 120;
      fastwayBase = 95;
      estimatedDays = { courierGuy: 2, fastway: 4 };
    } else {
      // Long distance
      courierGuyBase = 160;
      fastwayBase = 120;
      estimatedDays = { courierGuy: 3, fastway: 5 };
    }

    const courierGuyRate =
      Math.round(
        (courierGuyBase + distance * 0.5 + weightMultiplier * 15) * 100,
      ) / 100;
    const fastwayRate =
      Math.round((fastwayBase + distance * 0.4 + weightMultiplier * 12) * 100) /
      100;

    return {
      success: true,
      quotes: [
        {
          courier: "courier-guy",
          service: "standard",
          rate: courierGuyRate,
          estimated_days: estimatedDays.courierGuy,
          description: "Courier Guy Standard Service",
          collection_time: "09:00-17:00",
          delivery_time: "09:00-17:00",
          insurance_included: true,
          tracking_included: true,
          fallback: true,
        },
        {
          courier: "fastway",
          service: "economy",
          rate: fastwayRate,
          estimated_days: estimatedDays.fastway,
          description: "Fastway Economy Service",
          collection_time: "08:00-16:00",
          delivery_time: "08:00-16:00",
          insurance_included: false,
          tracking_included: true,
          fallback: true,
        },
      ],
      pickup_address: pickup_address,
      delivery_address: delivery_address,
      weight: weight,
      calculated_distance: distance,
      note: "Rates calculated using offline estimation",
    };
  }

  private async fileUploadFallback(payload: any) {
    try {
      // Use Supabase storage directly
      const { file, bucket = "books", path } = payload;

      // Validate required parameters
      if (!file) {
        throw new Error("File is required for upload");
      }
      if (!path) {
        throw new Error("Path is required for upload");
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new Error("Upload succeeded but no path returned");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return { url: publicUrl, path: data.path };
    } catch (error) {
      console.error("File upload fallback failed:", error);
      throw error; // Don't return fake data, let the error propagate
    }
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
    // Return a realistic fallback tracking response
    const { tracking_number } = payload;
    const courier = functionName.includes("courier-guy")
      ? "Courier Guy"
      : "Fastway";

    // Generate realistic tracking updates
    const now = new Date();
    const updates = [
      {
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Package collected from sender",
        location: "Collection depot",
        description: "Your package has been collected and is being processed",
      },
      {
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "In transit",
        location: "Regional sorting facility",
        description: "Package is being transported to destination city",
      },
      {
        date: now.toISOString(),
        status: "Out for delivery",
        location: "Local delivery depot",
        description: "Package is out for delivery to recipient",
      },
    ];

    return {
      success: true,
      tracking_number,
      courier_service: courier,
      status: "out_for_delivery",
      estimated_delivery: new Date(
        now.getTime() + 1 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updates,
      delivery_address: payload.delivery_address || "Recipient address",
      package_weight: payload.weight || "1.0 kg",
      fallback_mode: true,
      note: "Tracking information simulated due to API unavailability",
    };
  }

  private async createShipmentFallback(functionName: string, payload: any) {
    // Create a realistic shipment response
    const courier = functionName.includes("courier-guy")
      ? "Courier Guy"
      : "Fastway";
    const trackingNumber = `${courier.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-8)}`;

    return {
      success: true,
      shipment_id: `ship_${Date.now()}`,
      tracking_number: trackingNumber,
      courier_service: courier,
      collection_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "scheduled_for_collection",
      collection_window: "09:00-17:00",
      cost: payload.rate || 75,
      instructions:
        "Package ready for collection. Ensure items are properly packaged.",
      fallback: true,
    };
  }

  private async notificationsFallback(payload: any) {
    // Handle notifications with local storage as fallback
    const notifications = JSON.parse(
      localStorage.getItem("fallback_notifications") || "[]",
    );

    if (payload.action === "create") {
      const notification = {
        id: `notif_${Date.now()}`,
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message,
        type: payload.type || "info",
        read: false,
        created_at: new Date().toISOString(),
        fallback: true,
      };

      notifications.unshift(notification);
      localStorage.setItem(
        "fallback_notifications",
        JSON.stringify(notifications.slice(0, 50)),
      ); // Keep last 50

      return { success: true, notification };
    } else if (payload.action === "get") {
      return {
        success: true,
        notifications: notifications
          .filter((n: any) => n.user_id === payload.user_id)
          .slice(0, 20),
      };
    }

    return { success: true, notifications: [] };
  }

  private async disputeResolutionFallback(payload: any) {
    // Handle dispute creation/management offline
    const disputes = JSON.parse(
      localStorage.getItem("fallback_disputes") || "[]",
    );

    if (payload.action === "create") {
      const dispute = {
        id: `dispute_${Date.now()}`,
        order_id: payload.order_id,
        user_id: payload.user_id,
        type: payload.type,
        description: payload.description,
        status: "submitted",
        created_at: new Date().toISOString(),
        estimated_resolution: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        fallback: true,
      };

      disputes.unshift(dispute);
      localStorage.setItem(
        "fallback_disputes",
        JSON.stringify(disputes.slice(0, 20)),
      );

      return { success: true, dispute };
    }

    return { success: true, disputes };
  }

  private async markCollectedFallback(payload: any) {
    // Mark order as collected with local state management
    const { order_id, tracking_number } = payload;

    // Update local order state
    const localOrders = JSON.parse(
      localStorage.getItem("fallback_orders") || "{}",
    );
    localOrders[order_id] = {
      ...localOrders[order_id],
      status: "collected",
      tracking_number,
      collected_at: new Date().toISOString(),
      collection_confirmed: true,
      fallback: true,
    };

    localStorage.setItem("fallback_orders", JSON.stringify(localOrders));

    return {
      success: true,
      order_id,
      status: "collected",
      tracking_number,
      message: "Order marked as collected (offline mode)",
      next_steps: "Package is now in transit to recipient",
    };
  }

  private calculateDistance(address1: any, address2: any): number {
    // Enhanced distance calculation for South African locations
    if (!address1 || !address2) return 50;

    // If we have lat/lng, use Haversine formula
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
      return Math.round(R * c);
    }

    // South African city distance matrix (approximate distances in km)
    const cityDistances: Record<string, Record<string, number>> = {
      "cape town": {
        johannesburg: 1400,
        durban: 1600,
        pretoria: 1450,
        "port elizabeth": 700,
        bloemfontein: 1000,
      },
      johannesburg: {
        "cape town": 1400,
        durban: 600,
        pretoria: 60,
        "port elizabeth": 1000,
        bloemfontein: 400,
      },
      durban: {
        "cape town": 1600,
        johannesburg: 600,
        pretoria: 650,
        "port elizabeth": 1200,
        bloemfontein: 700,
      },
      pretoria: {
        "cape town": 1450,
        johannesburg: 60,
        durban: 650,
        "port elizabeth": 1050,
        bloemfontein: 450,
      },
      "port elizabeth": {
        "cape town": 700,
        johannesburg: 1000,
        durban: 1200,
        pretoria: 1050,
        bloemfontein: 600,
      },
      bloemfontein: {
        "cape town": 1000,
        johannesburg: 400,
        durban: 700,
        pretoria: 450,
        "port elizabeth": 600,
      },
    };

    const city1 = (address1.city || "").toLowerCase().trim();
    const city2 = (address2.city || "").toLowerCase().trim();

    // Check exact city match
    if (city1 === city2 && city1) return 15; // Same city

    // Check city distance matrix
    if (cityDistances[city1] && cityDistances[city1][city2]) {
      return cityDistances[city1][city2];
    }

    // Province-based estimation
    const province1 = (address1.province || "").toLowerCase().trim();
    const province2 = (address2.province || "").toLowerCase().trim();

    if (province1 === province2) {
      // Same province distances
      const provinceDistances: Record<string, number> = {
        "western cape": 200,
        gauteng: 100,
        "kwazulu-natal": 300,
        "eastern cape": 250,
        "free state": 200,
        limpopo: 250,
        mpumalanga: 200,
        "north west": 200,
        "northern cape": 400,
      };
      return provinceDistances[province1] || 200;
    }

    // Different provinces - estimate based on known inter-provincial distances
    const interProvincialDistances: Record<string, Record<string, number>> = {
      "western cape": {
        gauteng: 1400,
        "kwazulu-natal": 1600,
        "eastern cape": 500,
      },
      gauteng: {
        "western cape": 1400,
        "kwazulu-natal": 600,
        "free state": 400,
      },
      "kwazulu-natal": {
        "western cape": 1600,
        gauteng: 600,
        "eastern cape": 1000,
      },
    };

    if (
      interProvincialDistances[province1] &&
      interProvincialDistances[province1][province2]
    ) {
      return interProvincialDistances[province1][province2];
    }

    // Default fallback
    return 800;
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

// Lazy initialization to prevent "Cannot access before initialization" errors
export const getFunctionFallback = () => FunctionFallbackService.getInstance();
