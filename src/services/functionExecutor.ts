import {
  FunctionResult,
  FunctionCallContext,
  ServiceLayer,
  QueuedFunction,
  FallbackType,
} from "@/types/functionFallback";
import { getFunctionPolicy } from "@/config/functionPolicyRegistry";
import { getFallbackStorage } from "./fallbackStorage";
import { getHealthTracker } from "./healthTracker";
import { getAiMonitoringService } from "./aiMonitoringService";
import { supabase } from "@/integrations/supabase/client";

class AIFunctionExecutor {
  private requestId = 0;

  /**
   * Main entry point for function execution with 3-layer fallback
   */
  async executeFunction<T = any>(
    functionName: string,
    payload: any,
    context: Partial<FunctionCallContext> = {},
  ): Promise<FunctionResult<T>> {
    const startTime = Date.now();
    const requestId = `req_${++this.requestId}_${Date.now()}`;

    const fullContext: FunctionCallContext = {
      functionName,
      payload,
      priority: "normal",
      requestId,
      ...context,
    };

    const policy = getFunctionPolicy(functionName);

    console.log(`🚀 Executing function: ${functionName}`, {
      requestId,
      policy,
    });

    // Special handling for auth functions
    if (policy.useOnly === "Supabase Auth/Client") {
      return this.callSupabaseClient(functionName, payload, fullContext);
    }

    // Layer 1: Try Supabase Edge Function
    if (getHealthTracker().isServiceHealthy("supabase")) {
      try {
        const result = await this.callSupabaseEdgeFunction<T>(
          functionName,
          payload,
          fullContext,
        );
        if (result.success) {
          getHealthTracker().recordSuccess("supabase");
          getHealthTracker().recordPerformance("supabase", Date.now() - startTime);
          getAiMonitoringService().logFunctionExecution(
            functionName,
            result,
            Date.now() - startTime,
          );
          return result;
        }
        throw new Error(result.error || "Supabase function failed");
      } catch (error) {
        console.warn(`⚠️ Supabase function ${functionName} failed:`, error);
        getHealthTracker().recordFailure("supabase", String(error));
      }
    } else {
      console.log(`⚠️ Supabase service is unhealthy, skipping to layer 2`);
    }

    // Layer 2: Try Vercel API/Edge Function
    if (policy.vercelAllowed && getHealthTracker().isServiceHealthy("vercel")) {
      try {
        const result = await this.callVercelFunction<T>(
          functionName,
          payload,
          fullContext,
        );
        if (result.success) {
          getHealthTracker().recordSuccess("vercel");
          getHealthTracker().recordPerformance("vercel", Date.now() - startTime);
          getAiMonitoringService().logFunctionExecution(
            functionName,
            result,
            Date.now() - startTime,
          );
          return result;
        }
        throw new Error(result.error || "Vercel function failed");
      } catch (error) {
        console.warn(`⚠️ Vercel function ${functionName} failed:`, error);
        getHealthTracker().recordFailure("vercel", String(error));
      }
    } else if (!policy.vercelAllowed) {
      console.log(`⚠️ Vercel not allowed for function ${functionName}`);
    } else {
      console.log(`⚠️ Vercel service is unhealthy, skipping to layer 3`);
    }

    // Layer 3: Fallback Mechanism
    if (policy.fallback) {
      console.log(
        `🔄 Using fallback mechanism for ${functionName}: ${policy.fallbackType}`,
      );
      getAiMonitoringService().logFallbackUsage(
        functionName,
        policy.fallbackType,
        "All primary layers failed",
      );
      const result = await this.callFallbackMechanism<T>(
        functionName,
        payload,
        fullContext,
        policy.fallbackType,
      );
      getAiMonitoringService().logFunctionExecution(
        functionName,
        result,
        Date.now() - startTime,
      );
      return result;
    }

    // No fallback allowed or available
    const errorResult: FunctionResult<T> = {
      success: false,
      error: "All layers failed and no fallback allowed",
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };

    console.error(`❌ Function ${functionName} completely failed`, errorResult);
    return errorResult;
  }

  /**
   * Layer 1: Supabase Edge Function
   */
  private async callSupabaseEdgeFunction<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    const policy = getFunctionPolicy(functionName);
    const timeout = policy.timeout || 10000;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Supabase function timeout")),
          timeout,
        );
      });

      const functionPromise = supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          "x-request-id": context.requestId || "",
          "x-user-id": context.userId || "",
          "x-priority": context.priority || "normal",
        },
      });

      const { data, error } = await Promise.race([
        functionPromise,
        timeoutPromise,
      ]);

      if (error) {
        return {
          success: false,
          error: `Supabase function error: ${error.message}`,
          source: "supabase",
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: data as T,
        source: "supabase",
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Supabase function failed: ${error}`,
        source: "supabase",
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Layer 2: Vercel API/Edge Function
   */
  private async callVercelFunction<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    const policy = getFunctionPolicy(functionName);
    const timeout = policy.timeout || 10000;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Vercel function timeout")), timeout);
      });

      const functionPromise = fetch(`/api/${functionName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-id": context.requestId || "",
          "x-user-id": context.userId || "",
          "x-priority": context.priority || "normal",
        },
        body: JSON.stringify(payload),
      });

      const response = await Promise.race([functionPromise, timeoutPromise]);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Vercel function error: ${response.status} ${errorText}`,
          source: "vercel",
          timestamp: Date.now(),
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: data as T,
        source: "vercel",
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Vercel function failed: ${error}`,
        source: "vercel",
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Special handler for Supabase Auth/Client operations
   */
  private async callSupabaseClient<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    try {
      let result: any;

      switch (functionName) {
        case "auth-sign-in":
          result = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
          });
          break;

        case "auth-sign-up":
          result = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: payload.options,
          });
          break;

        case "auth-sign-out":
          result = await supabase.auth.signOut();
          break;

        default:
          throw new Error(`Unknown auth function: ${functionName}`);
      }

      if (result.error) {
        return {
          success: false,
          error: `Auth error: ${result.error.message}`,
          source: "supabase",
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: result.data as T,
        source: "supabase",
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Auth function failed: ${error}`,
        source: "supabase",
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Layer 3: Fallback Mechanisms
   */
  private async callFallbackMechanism<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
    fallbackType: FallbackType,
  ): Promise<FunctionResult<T>> {
    try {
      switch (fallbackType) {
        case "queue":
        case "queue-order":
        case "queue-email":
          return this.queueForLater<T>(functionName, payload, context);

        case "cached-rates":
          return this.getCachedResponse<T>(functionName, payload, context);

        case "store-locally":
          return this.storeLocally<T>(functionName, payload, context);

        case "deferred":
          return this.deferExecution<T>(functionName, payload, context);

        default:
          return this.genericFallback<T>(functionName, payload, context);
      }
    } catch (error) {
      return {
        success: false,
        error: `Fallback mechanism failed: ${error}`,
        source: "fallback",
        timestamp: Date.now(),
        fallbackUsed: true,
      };
    }
  }

  private async queueForLater<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    const policy = getFunctionPolicy(functionName);
    const queueItem: QueuedFunction = {
      id: `queue_${context.requestId}`,
      functionName,
      payload,
      context,
      attempts: 0,
      maxAttempts: policy.retryAttempts || 3,
      nextRetry: Date.now() + 5000, // Retry in 5 seconds
      priority: context.priority || "normal",
      created: Date.now(),
    };

    await getFallbackStorage().enqueue(queueItem);
    getAiMonitoringService().logQueueEvent("enqueue", functionName, {
      queueId: queueItem.id,
      priority: context.priority,
    });

    return {
      success: true,
      data: {
        queued: true,
        queueId: queueItem.id,
        message: "Function queued for retry when service is available",
      } as T,
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };
  }

  private async getCachedResponse<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    const cacheKey = `${functionName}_${JSON.stringify(payload)}`;
    const cached = await getFallbackStorage().getCache<T>(cacheKey);

    if (cached) {
      return {
        success: true,
        data: cached.data,
        source: "fallback",
        timestamp: Date.now(),
        cached: true,
        fallbackUsed: true,
      };
    }

    // No cache available - queue for later and return empty result
    await this.queueForLater(functionName, payload, context);

    return {
      success: false,
      error: "No cached data available and service is unavailable",
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };
  }

  private async storeLocally<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    const storageKey = `${functionName}_${context.requestId}`;
    await getFallbackStorage().storeLocally(storageKey, {
      functionName,
      payload,
      context,
      timestamp: Date.now(),
    });

    // For file uploads, we could generate a local URL
    let localResult: any = {
      stored: true,
      localKey: storageKey,
      message: "Data stored locally for sync when service is available",
    };

    if (functionName === "file-upload") {
      localResult = {
        ...localResult,
        fileName: payload.fileName || "temp_file",
        publicUrl: `local://${storageKey}`,
        pending: true,
      };
    }

    return {
      success: true,
      data: localResult as T,
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };
  }

  private async deferExecution<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    // For analytics and logs, we can defer execution
    const deferredItem: QueuedFunction = {
      id: `deferred_${context.requestId}`,
      functionName,
      payload,
      context,
      attempts: 0,
      maxAttempts: 1,
      nextRetry: Date.now() + 60000, // Defer for 1 minute
      priority: "low",
      created: Date.now(),
    };

    await getFallbackStorage().enqueue(deferredItem);

    return {
      success: true,
      data: {
        deferred: true,
        deferredId: deferredItem.id,
        message: "Execution deferred for batch processing",
      } as T,
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };
  }

  private async genericFallback<T>(
    functionName: string,
    payload: any,
    context: FunctionCallContext,
  ): Promise<FunctionResult<T>> {
    // Generic fallback - queue and provide basic response
    await this.queueForLater(functionName, payload, context);

    return {
      success: false,
      error: "Service temporarily unavailable, request queued for retry",
      source: "fallback",
      timestamp: Date.now(),
      fallbackUsed: true,
    };
  }

  /**
   * Process queued functions when services become available
   */
  async processQueue(): Promise<void> {
    const queueSize = await getFallbackStorage().getQueueSize();
    if (queueSize === 0) return;

    console.log(`📋 Processing queue with ${queueSize} items`);

    let processed = 0;
    const maxBatchSize = 10;

    while (processed < maxBatchSize) {
      const item = await getFallbackStorage().dequeue();
      if (!item) break;

      try {
        const result = await this.executeFunction(
          item.functionName,
          item.payload,
          item.context,
        );

        if (result.success) {
          console.log(
            `✅ Queued function ${item.functionName} processed successfully`,
          );
        } else {
          // Re-queue if not max attempts
          if (item.attempts < item.maxAttempts) {
            item.attempts++;
            item.nextRetry = Date.now() + Math.pow(2, item.attempts) * 1000; // Exponential backoff
            await getFallbackStorage().enqueue(item);
            console.log(
              `🔄 Re-queued function ${item.functionName}, attempt ${item.attempts}`,
            );
          } else {
            console.error(
              `❌ Function ${item.functionName} failed after max attempts`,
            );
          }
        }
      } catch (error) {
        console.error(
          `Error processing queued function ${item.functionName}:`,
          error,
        );
      }

      processed++;
    }
  }

  /**
   * Get executor statistics
   */
  getStats(): {
    queueSize: Promise<number>;
    healthSummary: any;
    storageStats: any;
  } {
    return {
      queueSize: getFallbackStorage().getQueueSize(),
      healthSummary: getHealthTracker().getHealthSummary(),
      storageStats: getFallbackStorage().getStorageStats(),
    };
  }

  /**
   * Reset all systems
   */
  async reset(): Promise<void> {
    await getFallbackStorage().clearQueue();
    await getFallbackStorage().clearCache();
    getHealthTracker().resetAllHealth();
    console.log("🔄 AI Function Executor reset complete");
  }
}

// Singleton instance
// Lazy initialization to prevent "Cannot access before initialization" errors
let aiFunctionExecutorInstance: AIFunctionExecutor | null = null;
let autoProcessingStarted = false;

export const getAiFunctionExecutor = () => {
  if (!aiFunctionExecutorInstance) {
    aiFunctionExecutorInstance = new AIFunctionExecutor();

    // Start auto-processing only once and only in browser environment
    if (!autoProcessingStarted && typeof window !== "undefined") {
      autoProcessingStarted = true;

      setInterval(() => {
        aiFunctionExecutorInstance?.processQueue();
      }, 30000); // Every 30 seconds

      // Process queue on first access
      setTimeout(() => {
        aiFunctionExecutorInstance?.processQueue();
      }, 5000); // After 5 seconds
    }
  }
  return aiFunctionExecutorInstance;
};

// Export convenience functions using lazy getter
export const executeFunction = (
  functionName: string,
  params: any,
  options?: any,
) => getAiFunctionExecutor().executeFunction(functionName, params, options);

export const processQueue = () => getAiFunctionExecutor().processQueue();

export const getFunctionStats = () => getAiFunctionExecutor().getStats();

export const resetExecutor = () => getAiFunctionExecutor().reset();
